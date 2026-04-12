import { createContext, useContext, useState, ReactNode } from "react";

export type Currency = "KES" | "USD";

const DEFAULT_RATE = 130;

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rate: number;
  formatPrice: (usdPrice: number) => string;
  formatPriceShort: (usdPrice: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children, kesRate = DEFAULT_RATE }: { children: ReactNode; kesRate?: number }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem("ae_currency") as Currency) || "KES";
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("ae_currency", c);
  };

  const formatPrice = (usdPrice: number): string => {
    if (currency === "KES") {
      const kes = usdPrice * kesRate;
      return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0,
      }).format(kes);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(usdPrice);
  };

  const formatPriceShort = (usdPrice: number): string => {
    if (currency === "KES") {
      const kes = usdPrice * kesRate;
      if (kes >= 1_000_000) return `KES ${(kes / 1_000_000).toFixed(1)}M`;
      if (kes >= 1_000) return `KES ${(kes / 1_000).toFixed(0)}K`;
      return `KES ${kes.toLocaleString()}`;
    }
    if (usdPrice >= 1_000_000) return `$${(usdPrice / 1_000_000).toFixed(1)}M`;
    if (usdPrice >= 1_000) return `$${(usdPrice / 1_000).toFixed(0)}K`;
    return `$${usdPrice.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rate: kesRate, formatPrice, formatPriceShort }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
