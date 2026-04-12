import { createContext, useContext, ReactNode } from "react";

const DEFAULT_RATE = 130;

interface CurrencyContextType {
  rate: number;
  formatPrice: (usdPrice: number) => string;
  formatPriceShort: (usdPrice: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children, kesRate = DEFAULT_RATE }: { children: ReactNode; kesRate?: number }) {
  const formatPrice = (usdPrice: number): string => {
    const kes = usdPrice * kesRate;
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(kes);
  };

  const formatPriceShort = (usdPrice: number): string => {
    const kes = usdPrice * kesRate;
    if (kes >= 1_000_000) return `KES ${(kes / 1_000_000).toFixed(1)}M`;
    if (kes >= 1_000) return `KES ${(kes / 1_000).toFixed(0)}K`;
    return `KES ${kes.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ rate: kesRate, formatPrice, formatPriceShort }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
