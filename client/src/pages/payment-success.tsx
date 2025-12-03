import { useEffect } from "react";
import { Link, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ShoppingBag, ArrowRight, Package, CreditCard, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/lib/cart-context";
import { useCurrency } from "@/lib/currency-context";
import type { Order, OrderItem, PayuTransaction } from "@shared/schema";

interface OrderDetails extends Order {
  items: (OrderItem & { product?: { name: string; imageUrl?: string } })[];
  transactions: PayuTransaction[];
}

export default function PaymentSuccess() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const orderId = params.get("orderId");
  const { clearCart } = useCart();
  const { formatPrice, currency: displayCurrency } = useCurrency();

  useEffect(() => {
    clearCart();
  }, []);

  const { data: order, isLoading, error } = useQuery<OrderDetails>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-16">
        <div className="text-center mb-8">
          <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-5 w-48 mx-auto" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-4">
          <Package className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Order Details Unavailable</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't find the order details, but your payment may have been successful.
          Please check your email for confirmation.
        </p>
        <Link href="/">
          <Button>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  const transaction = order.transactions?.[0];
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-16">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4 animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-success-title">
          Payment Successful!
        </h1>
        <p className="text-muted-foreground">
          Thank you for your order. A confirmation email has been sent.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Order Number</p>
              <p className="font-mono font-semibold" data-testid="text-order-number">
                {order.orderNumber}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-semibold text-green-600 dark:text-green-400 capitalize">
                {order.status}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium">{formattedDate}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Amount</p>
              <p className="font-bold text-lg" data-testid="text-order-total">
                {order.currency === "USD" ? "$" : "₹"}
                {parseFloat(order.amountTotal).toLocaleString()}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
              Items Ordered
            </h4>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                    {item.product?.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product?.name || "Product"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {item.product?.name || `Product #${item.productId}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium tabular-nums">
                    {item.currency === "USD" ? "$" : "₹"}
                    {parseFloat(item.subtotal).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
              Shipping Address
            </h4>
            <p className="text-muted-foreground whitespace-pre-line">
              {order.shippingAddress}
            </p>
          </div>
        </CardContent>
      </Card>

      {transaction && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Transaction Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Transaction ID</p>
                <p className="font-mono text-xs" data-testid="text-transaction-id">
                  {transaction.payuTxnId}
                </p>
              </div>
              {transaction.payuPaymentId && (
                <div>
                  <p className="text-muted-foreground">Payment ID</p>
                  <p className="font-mono text-xs">{transaction.payuPaymentId}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Amount Paid</p>
                <p className="font-semibold">
                  {transaction.currency === "USD" ? "$" : "₹"}
                  {parseFloat(transaction.amount).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Payment Status</p>
                <p className="font-semibold text-green-600 dark:text-green-400 capitalize">
                  {transaction.status}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/">
          <Button size="lg" data-testid="button-continue-shopping-success">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
