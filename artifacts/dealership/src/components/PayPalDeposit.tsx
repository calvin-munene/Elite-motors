import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    paypal?: any;
  }
}

interface Props {
  bookingId: number;
  amountUsd?: number;
  onSuccess: (data: { captureId: string }) => void;
  onCancel?: () => void;
  onError?: (msg: string) => void;
}

interface PayPalConfig {
  configured: boolean;
  clientId: string | null;
  mode: "sandbox" | "live";
  defaultDepositUsd: number;
  currency: string;
}

let sdkLoadPromise: Promise<void> | null = null;
function loadPayPalSdk(clientId: string, currency: string): Promise<void> {
  if (window.paypal) return Promise.resolve();
  if (sdkLoadPromise) return sdkLoadPromise;
  sdkLoadPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      clientId,
    )}&currency=${currency}&intent=capture&disable-funding=credit,paylater`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load PayPal SDK"));
    document.head.appendChild(s);
  });
  return sdkLoadPromise;
}

export function PayPalDeposit({ bookingId, amountUsd, onSuccess, onCancel, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<PayPalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const base = (import.meta as any).env?.BASE_URL || "/";

  useEffect(() => {
    fetch(`${base}api/paypal/config`)
      .then((r) => r.json())
      .then((c: PayPalConfig) => setConfig(c))
      .catch(() => setConfig({ configured: false } as any))
      .finally(() => setLoading(false));
  }, [base]);

  useEffect(() => {
    if (!config?.configured || !config.clientId || !containerRef.current) return;

    let cancelled = false;
    loadPayPalSdk(config.clientId, config.currency || "USD")
      .then(() => {
        if (cancelled || !window.paypal || !containerRef.current) return;
        containerRef.current.innerHTML = "";
        window.paypal
          .Buttons({
            style: { layout: "vertical", color: "gold", shape: "pill", label: "paypal", height: 50 },
            createOrder: async () => {
              const r = await fetch(`${base}api/paypal/create-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId, amountUsd }),
              });
              if (!r.ok) {
                const j = await r.json().catch(() => ({}));
                throw new Error(j.error || "Could not start PayPal order");
              }
              const { orderId } = await r.json();
              return orderId;
            },
            onApprove: async (data: any) => {
              const r = await fetch(`${base}api/paypal/capture-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: data.orderID, bookingId }),
              });
              const j = await r.json();
              if (!r.ok || !j.success) {
                onError?.(j.error || "Payment capture failed");
                window.location.href = `${base}booking/payment-cancelled?bookingId=${bookingId}`;
                return;
              }
              onSuccess({ captureId: j.captureId });
              window.location.href = `${base}booking/payment-success?bookingId=${bookingId}&captureId=${encodeURIComponent(j.captureId || "")}`;
            },
            onCancel: () => {
              fetch(`${base}api/paypal/cancel-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId }),
              }).catch(() => {});
              onCancel?.();
              window.location.href = `${base}booking/payment-cancelled?bookingId=${bookingId}`;
            },
            onError: (err: any) => {
              const msg = err?.message || "PayPal error";
              setRenderError(msg);
              onError?.(msg);
            },
          })
          .render(containerRef.current);
      })
      .catch((e) => setRenderError(e.message));

    return () => {
      cancelled = true;
    };
  }, [config, bookingId, amountUsd, base, onSuccess, onCancel, onError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading secure payment…
      </div>
    );
  }

  if (!config?.configured) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-lg p-4 text-sm">
        Online deposit is currently unavailable on this server. Your booking has been recorded — our
        team will reach out to confirm by phone or WhatsApp.
      </div>
    );
  }

  return (
    <div>
      {renderError && (
        <div className="mb-3 bg-red-500/10 border border-red-500/30 text-red-200 rounded-lg p-3 text-sm">
          {renderError}
        </div>
      )}
      <div ref={containerRef} />
      <p className="text-xs text-gray-500 mt-3 text-center">
        Secure checkout powered by PayPal · {config.mode === "sandbox" ? "Test mode" : "Live"}
      </p>
    </div>
  );
}
