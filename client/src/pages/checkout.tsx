import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  ShoppingBag,
  User,
  MapPin,
  CreditCard,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCart } from "@/lib/cart-context";
import { useCurrency } from "@/lib/currency-context";
import { CurrencySwitcher } from "@/components/currency-switcher";
import { apiRequest } from "@/lib/queryClient";
import { checkoutFormSchema, type CheckoutFormData } from "@shared/schema";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, name: "Contact", icon: User },
  { id: 2, name: "Shipping", icon: MapPin },
  { id: 3, name: "Billing", icon: CreditCard },
  { id: 4, name: "Review", icon: Check },
];

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const { items, getTotal, clearCart } = useCart();
  const { currency, formatPrice } = useCurrency();
  const total = getTotal();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      shippingAddress: "",
      billingAddress: "",
      sameAsBilling: true,
      currency: currency,
    },
  });

  const sameAsBilling = form.watch("sameAsBilling");
  const shippingAddress = form.watch("shippingAddress");

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      const orderData = {
        ...data,
        billingAddress: data.sameAsBilling ? data.shippingAddress : data.billingAddress,
        currency: currency,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };
      return apiRequest("POST", "/api/checkout/create", orderData);
    },
    onSuccess: async (result) => {
      const payuInit = await apiRequest("POST", "/api/checkout/payu-init", {
        orderId: result.order.id,
      });
      
      const form = document.createElement("form");
      form.method = "POST";
      form.action = payuInit.payuUrl;

      Object.entries(payuInit.payuParams).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    },
  });

  const handleNext = async () => {
    let fieldsToValidate: (keyof CheckoutFormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["name", "email", "phone"];
        break;
      case 2:
        fieldsToValidate = ["shippingAddress"];
        break;
      case 3:
        if (!sameAsBilling) {
          fieldsToValidate = ["billingAddress"];
        }
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleSubmit = (data: CheckoutFormData) => {
    createOrderMutation.mutate(data);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Add some products to your cart before checkout.
          </p>
          <Link href="/">
            <Button data-testid="button-shop-now">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Shop Now
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        data-testid="link-back-to-shop-checkout"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Continue Shopping
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <nav aria-label="Progress" className="mb-8">
            <ol className="flex items-center justify-between">
              {steps.map((step, index) => (
                <li key={step.id} className="flex items-center">
                  <button
                    onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                    disabled={step.id > currentStep}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium transition-colors",
                      step.id === currentStep
                        ? "text-primary"
                        : step.id < currentStep
                        ? "text-foreground hover:text-primary"
                        : "text-muted-foreground"
                    )}
                    data-testid={`button-step-${step.id}`}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                        step.id === currentStep
                          ? "bg-primary text-primary-foreground"
                          : step.id < currentStep
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {step.id < currentStep ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <step.icon className="h-4 w-4" />
                      )}
                    </div>
                    <span className="hidden sm:inline">{step.name}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "mx-2 sm:mx-4 h-0.5 w-8 sm:w-16",
                        step.id < currentStep ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Doe"
                              className="h-12"
                              data-testid="input-name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              className="h-12"
                              data-testid="input-email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+91 9876543210"
                              className="h-12"
                              data-testid="input-phone"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="shippingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complete Address *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your complete shipping address including street, city, state, and postal code"
                              className="min-h-[120px] resize-none"
                              data-testid="textarea-shipping-address"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {currentStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Billing Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="sameAsBilling"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-same-as-shipping"
                            />
                          </FormControl>
                          <FormLabel className="!mt-0 cursor-pointer">
                            Same as shipping address
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    {!sameAsBilling && (
                      <FormField
                        control={form.control}
                        name="billingAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Billing Address *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter your billing address"
                                className="min-h-[120px] resize-none"
                                data-testid="textarea-billing-address"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>
              )}

              {currentStep === 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Check className="h-5 w-5" />
                      Review Order
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                          Contact
                        </h4>
                        <p className="font-medium">{form.getValues("name")}</p>
                        <p className="text-muted-foreground">{form.getValues("email")}</p>
                        <p className="text-muted-foreground">{form.getValues("phone")}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                          Shipping Address
                        </h4>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {form.getValues("shippingAddress")}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-4 text-sm text-muted-foreground uppercase tracking-wide">
                        Order Items
                      </h4>
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div key={item.productId} className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ShoppingBag className="h-6 w-6 text-muted-foreground/50" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="font-medium tabular-nums">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-between mt-6 gap-4">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    data-testid="button-back"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <Button type="button" onClick={handleNext} data-testid="button-next">
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="lg"
                    disabled={createOrderMutation.isPending}
                    data-testid="button-place-order"
                  >
                    {createOrderMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay with PayU
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle>Order Summary</CardTitle>
                  <CurrencySwitcher />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="h-4 w-4 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} x {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="text-sm font-medium tabular-nums">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums">{formatPrice(total)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span
                    className="text-xl font-bold tabular-nums"
                    data-testid="text-checkout-total"
                  >
                    {formatPrice(total)}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Secure payment powered by PayU
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
