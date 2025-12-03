import { Link } from "wouter";
import { ShoppingCart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrency } from "@/lib/currency-context";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { formatPrice } = useCurrency();
  const { addItem } = useCart();
  const price = parseFloat(product.priceBase);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <Card
      className="group overflow-hidden hover-elevate transition-all duration-300"
      data-testid={`card-product-${product.id}`}
    >
      <Link href={`/product/${product.id}`}>
        <div className="aspect-[4/3] relative overflow-hidden bg-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <Package className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
          
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <Badge variant="secondary" className="text-sm">
                Out of Stock
              </Badge>
            </div>
          )}

          {isLowStock && !isOutOfStock && (
            <Badge
              variant="destructive"
              className="absolute top-2 right-2 text-xs"
            >
              Only {product.stock} left
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4 space-y-3">
        <Link href={`/product/${product.id}`}>
          <h3
            className="font-semibold text-base leading-tight line-clamp-2 hover:text-primary transition-colors"
            data-testid={`text-product-name-${product.id}`}
          >
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between gap-2">
          <p
            className="text-xl font-bold tabular-nums"
            data-testid={`text-product-price-${product.id}`}
          >
            {formatPrice(price)}
          </p>

          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
            disabled={isOutOfStock}
            data-testid={`button-add-to-cart-${product.id}`}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
