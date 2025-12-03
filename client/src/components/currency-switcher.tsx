import { useCurrency } from "@/lib/currency-context";
import { cn } from "@/lib/utils";

interface CurrencySwitcherProps {
  className?: string;
}

export function CurrencySwitcher({ className }: CurrencySwitcherProps) {
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      className={cn(
        "flex items-center rounded-lg border border-border bg-muted p-1 gap-1",
        className
      )}
      data-testid="currency-switcher"
    >
      <button
        onClick={() => setCurrency("INR")}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
          currency === "INR"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover-elevate"
        )}
        data-testid="button-currency-inr"
        aria-pressed={currency === "INR"}
      >
        ₹ INR
      </button>
      <button
        onClick={() => setCurrency("USD")}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
          currency === "USD"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover-elevate"
        )}
        data-testid="button-currency-usd"
        aria-pressed={currency === "USD"}
      >
        $ USD
      </button>
    </div>
  );
}
