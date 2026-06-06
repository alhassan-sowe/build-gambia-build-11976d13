import { Link } from "@tanstack/react-router";
import { MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import { formatGMD } from "@/lib/cart";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden group flex flex-col">
      <Link
        to="/materials/$productId"
        params={{ productId: product.id }}
        className="block aspect-square bg-muted overflow-hidden"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-105 transition"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            <Package className="h-12 w-12" />
          </div>
        )}
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight line-clamp-2">{product.name}</h3>
          {product.stock > 0 ? (
            <Badge variant="secondary" className="shrink-0 text-xs">In stock</Badge>
          ) : (
            <Badge variant="destructive" className="shrink-0 text-xs">Out</Badge>
          )}
        </div>
        <div className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{product.location || product.supplier_name || "The Gambia"}</span>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <div className="text-xl font-bold text-primary">{formatGMD(Number(product.price))}</div>
            <div className="text-xs text-muted-foreground">per {product.unit}</div>
          </div>
        </div>
        <Button asChild className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
          <Link to="/materials/$productId" params={{ productId: product.id }}>Order</Link>
        </Button>
      </div>
    </Card>
  );
}
