import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { useCart, formatGMD } from "@/lib/cart";
import { useAuth } from "@/lib/use-auth";
import { createOrder } from "@/lib/orders.functions";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
});

function Checkout() {
  const cart = useCart();
  const auth = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ delivery_address: "", phone: "", notes: "", delivery_date: "" });
  const [submitting, setSubmitting] = useState(false);

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.isAuthenticated) {
      toast.error("Please log in to place an order");
      navigate({ to: "/auth" });
      return;
    }
    if (cart.items.length === 0) return;
    setSubmitting(true);
    try {
      await createOrder({
        data: {
          delivery_address: form.delivery_address,
          phone: form.phone,
          notes: [form.delivery_date && `Preferred delivery: ${form.delivery_date}`, form.notes].filter(Boolean).join(" — ") || null,
          items: cart.items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
        },
      });
      cart.clear();
      toast.success("Order placed! The supplier will be in touch.");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Could not place order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold">Checkout</h1>

      {cart.items.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="Your cart is empty" description="Browse materials to add to your cart."
            action={<Button asChild><Link to="/materials">Browse materials</Link></Button>} />
        </div>
      ) : (
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            {cart.items.map((it) => (
              <Card key={it.productId} className="p-4 flex items-center gap-3">
                <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden shrink-0">
                  {it.image_url && <img src={it.image_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{it.name}</div>
                  <div className="text-sm text-muted-foreground">{formatGMD(it.price)} / {it.unit}</div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => cart.setQty(it.productId, it.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                  <span className="w-8 text-center font-medium">{it.quantity}</span>
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => cart.setQty(it.productId, it.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                </div>
                <div className="w-24 text-right font-semibold">{formatGMD(it.price * it.quantity)}</div>
                <Button size="icon" variant="ghost" onClick={() => cart.remove(it.productId)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </Card>
            ))}
          </div>
          <Card className="p-5 h-fit md:sticky md:top-20">
            <h2 className="font-semibold text-lg">Delivery details</h2>
            <form onSubmit={placeOrder} className="space-y-3 mt-4">
              <div><Label>Delivery address</Label><Textarea required value={form.delivery_address} onChange={(e) => setForm({ ...form, delivery_address: e.target.value })} /></div>
              <div><Label>Phone number</Label><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Preferred delivery date</Label><Input type="date" value={form.delivery_date} onChange={(e) => setForm({ ...form, delivery_date: e.target.value })} /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional instructions" /></div>
              <div className="border-t pt-3 mt-3 flex items-center justify-between font-bold text-lg">
                <span>Total</span><span>{formatGMD(cart.total)}</span>
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {submitting ? "Placing order…" : "Place Order"}
              </Button>
              {!auth.isAuthenticated && <p className="text-xs text-center text-muted-foreground">You'll be asked to log in.</p>}
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
