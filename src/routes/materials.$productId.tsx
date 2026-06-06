import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, MapPin, Phone, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProduct } from "@/lib/products.functions";
import { useCart, formatGMD } from "@/lib/cart";

export const Route = createFileRoute("/materials/$productId")({
  component: ProductDetail,
});

function ProductDetail() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const cart = useCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct({ data: { id: productId } }),
  });

  if (isLoading) return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading…</div>;
  if (!product) return <div className="container mx-auto px-4 py-16 text-center"><h1 className="text-xl font-semibold">Product not found</h1><Button asChild className="mt-4"><Link to="/materials">Back to catalog</Link></Button></div>;

  function addToCart(redirect = false) {
    cart.add({
      productId: product!.id, name: product!.name, price: Number(product!.price),
      unit: product!.unit, quantity: 1, image_url: product!.image_url,
      supplier_id: product!.supplier_id, stock: product!.stock,
    });
    toast.success("Added to cart");
    if (redirect) navigate({ to: "/checkout" });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4"><Link to="/materials"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link></Button>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square rounded-xl overflow-hidden bg-muted">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground"><Package className="h-20 w-20" /></div>
          )}
        </div>
        <div>
          {product.category_name && <Badge variant="secondary">{product.category_name}</Badge>}
          <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">{formatGMD(Number(product.price))}</span>
            <span className="text-muted-foreground">/ {product.unit}</span>
          </div>
          <p className="mt-2 text-sm">{product.stock > 0 ? <span className="text-success font-medium">{product.stock} {product.unit}(s) in stock</span> : <span className="text-destructive font-medium">Out of stock</span>}</p>
          <p className="mt-4 text-muted-foreground whitespace-pre-line">{product.description || "No description provided."}</p>

          <div className="mt-6 p-4 rounded-lg bg-muted">
            <h3 className="font-semibold">Supplier</h3>
            <p className="text-sm mt-1">{product.supplier_name}</p>
            {product.supplier_phone && <p className="text-sm flex items-center gap-1 mt-1"><Phone className="h-3.5 w-3.5" /> {product.supplier_phone}</p>}
            {product.location && <p className="text-sm flex items-center gap-1 mt-1"><MapPin className="h-3.5 w-3.5" /> {product.location}</p>}
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => addToCart(false)} disabled={product.stock === 0}>Add to Cart</Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => addToCart(true)} disabled={product.stock === 0}>Order Now</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
