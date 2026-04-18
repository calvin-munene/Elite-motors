import { AdminLayout } from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Calculator, Cloud, AlertCircle } from "lucide-react";

export default function AdminJapanAuctions() {
  const [status, setStatus] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const { toast } = useToast();

  // Duty calculator state
  const [calc, setCalc] = useState({ cifUsd: 8000, engineCC: 2500, isElectric: false });
  const [calcResult, setCalcResult] = useState<any>(null);
  const { formatPrice } = useCurrency();

  useEffect(() => { adminFetch("/admin/japan-auctions/status").then(setStatus); }, []);

  const sync = async () => {
    setSyncing(true);
    try {
      const r = await adminFetch("/admin/japan-auctions/sync", { method: "POST" });
      setSyncResult(r);
      toast({ title: `Sync OK — ${r.received} cars received` });
    } catch (e: any) {
      toast({ title: "Sync failed", description: e.message, variant: "destructive" });
    } finally { setSyncing(false); }
  };

  const calculate = async () => {
    const r = await adminFetch("/admin/japan-auctions/calculate-duty", { method: "POST", body: JSON.stringify(calc) });
    setCalcResult(r);
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Japan Auctions</h1>
        <p className="text-gray-400">Pre-import vehicle sourcing and KRA duty calculations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sync Status */}
        <div className="bg-card border border-white/5 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Cloud className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-serif text-white">Auction Feed</h2>
          </div>
          {status?.configured ? (
            <>
              <p className="text-sm text-emerald-400 mb-2">✓ Configured: {status.provider}</p>
              <p className="text-xs text-gray-500 mb-4">{status.feedUrl}</p>
              <Button onClick={sync} disabled={syncing} className="bg-primary hover:bg-primary/90">
                {syncing ? "Syncing..." : "Sync Now"}
              </Button>
              {syncResult && (
                <div className="mt-4 p-3 bg-background/50 rounded text-xs">
                  <p className="text-emerald-400 font-bold">Received: {syncResult.received} cars</p>
                  <pre className="text-gray-400 mt-2 overflow-x-auto">{JSON.stringify(syncResult.preview, null, 2)}</pre>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-amber-400 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">Not configured</p>
                  <p className="text-gray-400 text-xs mt-1">Configure these settings in Settings → Integrations to enable Japan auction sync:</p>
                  <ul className="text-gray-400 text-xs mt-2 list-disc pl-4 space-y-1">
                    <li><code>japanAuctionProvider</code> — e.g. "BeForward" or "SBT Japan"</li>
                    <li><code>japanAuctionFeedUrl</code> — partner API URL</li>
                    <li><code>japanAuctionApiKey</code> — your dealer API key</li>
                    <li><code>japanAuctionEnabled</code> — set to "true"</li>
                  </ul>
                  <p className="text-gray-500 text-xs mt-3">Recommended providers: BeForward Dealer API, SBT Japan dealer feed, JapanCarDirect partner program.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* KRA Duty Calculator */}
        <div className="bg-card border border-white/5 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-serif text-white">KRA Duty Calculator</h2>
          </div>
          <div className="space-y-3">
            <Field label="CIF Value (USD)"><input type="number" value={calc.cifUsd} onChange={e => setCalc({ ...calc, cifUsd: Number(e.target.value) })} className="w-full bg-background border border-white/10 rounded px-3 py-2 text-sm text-white" /></Field>
            <Field label="Engine Size (cc)"><input type="number" value={calc.engineCC} onChange={e => setCalc({ ...calc, engineCC: Number(e.target.value) })} className="w-full bg-background border border-white/10 rounded px-3 py-2 text-sm text-white" /></Field>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={calc.isElectric} onChange={e => setCalc({ ...calc, isElectric: e.target.checked })} /> Electric vehicle
            </label>
            <Button onClick={calculate} className="w-full bg-primary hover:bg-primary/90">Calculate</Button>

            {calcResult && (
              <div className="mt-4 space-y-2 bg-background/50 rounded p-4">
                <Row label="Import Duty (25%)" value={`$${calcResult.breakdown.importDuty.toLocaleString()}`} />
                <Row label="Excise Duty" value={`$${calcResult.breakdown.exciseDuty.toLocaleString()}`} />
                <Row label="VAT (16%)" value={`$${calcResult.breakdown.vat.toLocaleString()}`} />
                <Row label="IDF (3.5%)" value={`$${calcResult.breakdown.idf.toLocaleString()}`} />
                <Row label="RDL (2%)" value={`$${calcResult.breakdown.rdl.toLocaleString()}`} />
                <div className="border-t border-white/10 pt-2 mt-2">
                  <Row label="Total Tax" value={`$${calcResult.breakdown.totalTax.toLocaleString()}`} bold />
                  <Row label="Landed Cost (KES)" value={formatPrice(calcResult.landedCostUsd)} bold highlight />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function Field({ label, children }: any) {
  return <div><label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</label>{children}</div>;
}
function Row({ label, value, bold, highlight }: any) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className={`${bold ? "font-bold" : ""} ${highlight ? "text-primary text-base" : "text-white"}`}>{value}</span>
    </div>
  );
}
