import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Package, MapPin, Phone, ArrowLeft, ShieldCheck, Truck, Banknote,
  Store, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuantityStepper } from "@/components/quantity-stepper";
import { ProductCard } from "@/components/product-card";
import { SectionHeader } from "@/components/section-header";
import { EmptyState } from "@/components/empty-state";
import { getProduct, listProducts } from "@/lib/products.functions";
import { useCart, formatGMD } from "@/lib/cart";

export const Route = createFileRoute("/materials/$productId")({
  component: ProductDetail,
});

function ProductDetail() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const cart = useCart();
  const [qty, setQty] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct({ data: { id: productId } }),
  });

  const { data: related = [] } = useQuery({
    queryKey: ["products", product?.category_id, "related"],
    queryFn: () => listProducts({ data: { categoryId: product?.category_id || undefined } }),
    enabled: !!product?.category_id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square rounded-2xl bg-muted" />
          <div className="space-y-4">
            <div className="h-6 w-2/3 bg-muted rounded" />
            <div className="h-10 w-1/2 bg-muted rounded" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState title="Product not found" description="It may have been removed."
          action={<Button asChild><Link to="/materials">Back to catalog</Link></Button>} />
      </div>
    );
  }

  function addToCart(redirect = false) {
    cart.add({
      productId: product!.id, name: product!.name, price: Number(product!.price),
      unit: product!.unit, quantity: qty, image_url: product!.image_url,
      supplier_id: product!.supplier_id, stock: product!.stock,
    });
    toast.success(`Added ${qty} × ${product!.name}`);
    if (redirect) navigate({ to: "/checkout" });
  }

  const total = Number(product.price) * qty;
  const relatedFiltered = related.filter((p: any) => p.id !== product.id).slice(0, 8);

  return (
    <div className="pb-24 md:pb-0">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-4">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/materials" className="hover:text-primary">Materials</Link>
          {product.category_name && (<>
            <ChevronRight className="h-3 w-3" />
            <Link to="/materials" search={{ category: product.category_id } as any} className="hover:text-primary">{product.category_name}</Link>
          </>)}
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground line-clamp-1 max-w-[160px]">{product.name}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-6">
        <Button asChild variant="ghost" size="sm" className="mb-3 md:hidden">
          <Link to="/materials"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
        </Button>

        <div className="grid md:grid-cols-2 gap-6 md:gap-10">
          {/* Gallery */}
          <div className="md:sticky md:top-24 md:self-start">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted border">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground"><Package className="h-20 w-20" /></div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              {product.category_name && <Badge variant="secondary" className="mb-2">{product.category_name}</Badge>}
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">{product.name}</h1>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-extrabold text-primary">{formatGMD(Number(product.price))}</span>
                <span className="text-muted-foreground">/ {product.unit}</span>
              </div>
              <div className="mt-2 text-sm">
                {product.stock > 0
                  ? <span className="text-success font-medium">✓ {product.stock} {product.unit}(s) in stock</span>
                  : <span className="text-destructive font-medium">Out of stock</span>}
              </div>
            </div>

            {/* Quantity + Add to cart (desktop) */}
            <div className="hidden md:flex flex-col gap-3 p-4 rounded-2xl border bg-card">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Quantity</span>
                <QuantityStepper value={qty} onChange={setQty} max={product.stock || 99} />
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-lg font-bold text-primary">{formatGMD(total)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Button variant="outline" onClick={() => addToCart(false)} disabled={product.stock === 0}>Add to Cart</Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => addToCart(true)} disabled={product.stock === 0}>Order Now</Button>
              </div>
            </div>

            {/* Supplier card */}
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <Store className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{product.supplier_name || "Supplier"}</h3>
                    <Badge variant="secondary" className="text-[10px]"><ShieldCheck className="h-3 w-3 mr-1" />Verified</Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground space-y-0.5">
                    {product.location && <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {product.location}</div>}
                    {product.supplier_phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {product.supplier_phone}</div>}
                  </div>
                </div>
              </div>
            </Card>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { Icon: Truck, t: "Direct delivery" },
                { Icon: Banknote, t: "Pay on delivery" },
                { Icon: ShieldCheck, t: "Verified seller" },
              ].map(({ Icon, t }) => (
                <div key={t} className="p-3 rounded-xl bg-muted/60">
                  <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
                  <div className="text-[11px] font-medium leading-tight">{t}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="description" className="mt-2">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="delivery">Delivery</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4 text-sm text-foreground/90 whitespace-pre-line">
                {product.description || "No description provided by the supplier."}
              </TabsContent>
              <TabsContent value="delivery" className="mt-4 text-sm text-muted-foreground space-y-2">
                <p>Delivery handled directly by {product.supplier_name || "the supplier"}.</p>
                <p>Typical lead time: 1–3 days within Greater Banjul.</p>
                <p>Payment is collected on delivery (cash or mobile money).</p>
              </TabsContent>
              <TabsContent value="reviews" className="mt-4">
                <EmptyState title="No reviews yet" description="Be the first to review after delivery." />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Related */}
        {relatedFiltered.length > 0 && (
          <section className="mt-12">
            <SectionHeader title="You may also like" viewAllTo="/materials" viewAllSearch={{ category: product.category_id }} />
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 md:grid md:grid-cols-4 md:gap-4 md:mx-0 md:px-0">
              {relatedFiltered.map((p: any) => <ProductCard key={p.id} product={p} variant="rail" />)}
            </div>
          </section>
        )}
      </div>

      {/* Sticky mobile bottom bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-card border-t shadow-lg p-3 flex items-center gap-2 safe-bottom">
        <QuantityStepper value={qty} onChange={setQty} max={product.stock || 99} size="sm" />
        <Button onClick={() => addToCart(false)} variant="outline" disabled={product.stock === 0} className="flex-1">
          Add — {formatGMD(total)}
        </Button>
        <Button onClick={() => addToCart(true)} disabled={product.stock === 0} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          Buy now
        </Button>
      </div>
    </div>
  );
}
