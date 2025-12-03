import { Link, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { XCircle, RefreshCw, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order, PayuTransaction } from "@shared/schema";

interface OrderDetails extends Order {
  transactions: PayuTransaction[];
}

export default function PaymentFailure() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const orderId = params.get("orderId");
  const errorMessage = params.get("error") || "Payment was not completed";

  const { data: order } = useQuery<OrderDetails>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });

  const transaction = order?.transactions?.[0];

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-16">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4 animate-in zoom-in-50 duration-300">
          <XCircle className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-failure-title">
          Payment Failed
        </h1>
        <p className="text-muted-foreground">
          Unfortunately, your payment could not be processed.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            What Happened?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {errorMessage}
          </p>

          {order && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Number</span>
                <span className="font-mono">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">
                  {order.currency === "USD" ? "$" : "₹"}
                  {parseFloat(order.amountTotal).toLocaleString()}
                </span>
              </div>
              {transaction?.payuTxnId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-xs">{transaction.payuTxnId}</span>
                </div>
              )}
            </div>
          )}

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Common reasons for payment failure:
            </h4>
            <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>Insufficient funds in your account</li>
              <li>Card declined by your bank</li>
              <li>Incorrect card details entered</li>
              <li>Transaction cancelled by user</li>
              <li>Network or connectivity issues</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {orderId && (
          <Link href={`/checkout`}>
            <Button size="lg" data-testid="button-try-again">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </Link>
        )}
        <Link href="/">
          <Button variant="outline" size="lg" data-testid="button-back-to-shop">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Button>
        </Link>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Need help? Contact us at{" "}
        <a
          href="mailto:support@atlanticweizard.com"
          className="text-primary hover:underline"
        >
          support@atlanticweizard.com
        </a>
      </p>
    </div>
  );
}
