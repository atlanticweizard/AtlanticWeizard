import { createContext, useContext, useState, useEffect } from "react";
import { USD_TO_INR_RATE, INR_TO_USD_RATE } from "@shared/schema";

type Currency = "INR" | "USD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (priceInINR: number) => number;
  formatPrice: (priceInINR: number) => string;
  getCurrencySymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("currency");
      return (saved as Currency) || "INR";
    }
    return "INR";
  });

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  const convertPrice = (priceInINR: number): number => {
    if (currency === "USD") {
      return priceInINR * INR_TO_USD_RATE;
    }
    return priceInINR;
  };

  const getCurrencySymbol = (): string => {
    return currency === "USD" ? "$" : "₹";
  };

  const formatPrice = (priceInINR: number): string => {
    const converted = convertPrice(priceInINR);
    const symbol = getCurrencySymbol();
    
    if (currency === "USD") {
      return `${symbol}${converted.toFixed(2)}`;
    }
    return `${symbol}${converted.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertPrice,
        formatPrice,
        getCurrencySymbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
