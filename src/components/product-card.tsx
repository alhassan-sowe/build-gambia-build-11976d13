import { Link } from "@tanstack/react-router";
import { MapPin, Package, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import { formatGMD, useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

export function ProductCard({ product, variant = "grid" }: { product: Product; variant?: "grid" | "list" | "rail" }) {
  const cart = useCart();

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    cart.add({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      unit: product.unit,
      quantity: 1,
      image_url: product.image_url,
      supplier_id: product.supplier_id,
      stock: product.stock,
    });
    toast.success("Added to cart");
  }

  if (variant === "list") {
    return (
      <Link to="/materials/$productId" params={{ productId: product.id }} className="block">
        <Card className="p-3 flex gap-3 hover:border-primary/40 hover:shadow-md transition">
          <div className="h-24 w-24 rounded-lg bg-muted overflow-hidden shrink-0">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground"><Package className="h-8 w-8" /></div>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col">
            <h3 className="font-semibold leading-tight line-clamp-2">{product.name}</h3>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" /><span className="truncate">{product.location || product.supplier_name || "The Gambia"}</span>
            </div>
            <div className="mt-auto flex items-end justify-between pt-2">
              <div>
                <div className="text-lg font-bold text-primary leading-none">{formatGMD(Number(product.price))}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">per {product.unit}</div>
              </div>
              <Button size="sm" onClick={quickAdd} disabled={product.stock === 0} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  const railWidth = variant === "rail" ? "w-44 sm:w-48 shrink-0" : "";

  return (
    <Card className={cn("overflow-hidden group flex flex-col hover:border-primary/40 hover:shadow-lg transition relative", railWidth)}>
      <Link
        to="/materials/$productId"
        params={{ productId: product.id }}
        className="block aspect-square bg-muted overflow-hidden relative"
      >
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground"><Package className="h-10 w-10" /></div>
        )}
        {product.stock === 0 && (
          <Badge variant="destructive" className="absolute top-2 left-2 text-[10px]">Out of stock</Badge>
        )}
      </Link>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
        <div className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{product.location || product.supplier_name || "The Gambia"}</span>
        </div>
        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="text-base font-bold text-primary leading-none">{formatGMD(Number(product.price))}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">per {product.unit}</div>
          </div>
          <Button size="icon" onClick={quickAdd} disabled={product.stock === 0} aria-label="Add to cart"
            className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
