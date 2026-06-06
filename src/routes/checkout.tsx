import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Check, ShoppingBag, MapPin, Phone as PhoneIcon, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { QuantityStepper } from "@/components/quantity-stepper";
import { useCart, formatGMD } from "@/lib/cart";
import { useAuth } from "@/lib/use-auth";
import { createOrder } from "@/lib/orders.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
});

type Step = 1 | 2 | 3;

function Checkout() {
  const cart = useCart();
  const auth = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({ delivery_address: "", phone: "", notes: "", delivery_date: "" });
  const [submitting, setSubmitting] = useState(false);

  async function placeOrder() {
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

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <EmptyState
          icon={<ShoppingBag className="h-12 w-12" />}
          title="Your cart is empty"
          description="Browse materials to add to your cart."
          action={<Button asChild className="bg-primary text-primary-foreground"><Link to="/materials">Browse materials</Link></Button>}
        />
      </div>
    );
  }

  const canContinue1 = cart.items.length > 0;
  const canContinue2 = form.delivery_address.trim().length >= 3 && form.phone.trim().length >= 5;

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl pb-32 md:pb-8">
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => step > 1 ? setStep((step - 1) as Step) : navigate({ to: "/materials" })}>
        <ChevronLeft className="h-4 w-4 mr-1" /> Back
      </Button>
      <h1 className="text-2xl md:text-3xl font-bold">Checkout</h1>

      {/* Stepper */}
      <div className="mt-4 mb-6 flex items-center gap-2">
        {[
          { n: 1, l: "Cart" },
          { n: 2, l: "Delivery" },
          { n: 3, l: "Review" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition",
              step >= s.n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {step > s.n ? <Check className="h-4 w-4" /> : s.n}
            </div>
            <span className={cn("text-sm font-medium hidden sm:inline", step >= s.n ? "text-foreground" : "text-muted-foreground")}>{s.l}</span>
            {i < 2 && <div className={cn("h-0.5 flex-1 rounded", step > s.n ? "bg-primary" : "bg-muted")} />}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {step === 1 && (
            <>
              <h2 className="font-semibold text-lg">Your cart ({cart.items.length})</h2>
              {cart.items.map((it) => (
                <Card key={it.productId} className="p-4 flex items-center gap-3">
                  <div className="h-20 w-20 rounded-xl bg-muted overflow-hidden shrink-0">
                    {it.image_url && <img src={it.image_url} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{it.name}</div>
                    <div className="text-sm text-muted-foreground">{formatGMD(it.price)} / {it.unit}</div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <QuantityStepper value={it.quantity} onChange={(q) => cart.setQty(it.productId, q)} max={it.stock} size="sm" />
                      <span className="font-bold text-primary">{formatGMD(it.price * it.quantity)}</span>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => cart.remove(it.productId)} aria-label="Remove">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </Card>
              ))}
            </>
          )}

          {step === 2 && (
            <Card className="p-5">
              <h2 className="font-semibold text-lg">Delivery details</h2>
              <p className="text-sm text-muted-foreground mt-1">Where should we deliver your order?</p>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Delivery address</Label>
                  <Textarea required value={form.delivery_address} onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                    placeholder="Street, neighborhood, city" rows={3} />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="flex items-center gap-1"><PhoneIcon className="h-3.5 w-3.5" /> Phone number</Label>
                    <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+220 …" />
                  </div>
                  <div>
                    <Label>Preferred delivery date</Label>
                    <Input type="date" value={form.delivery_date} onChange={(e) => setForm({ ...form, delivery_date: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Notes (optional)</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Site access, landmarks…" rows={2} />
                </div>
              </div>
            </Card>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Card className="p-5">
                <h2 className="font-semibold text-lg">Order summary</h2>
                <div className="mt-3 space-y-2 text-sm">
                  {cart.items.map((it) => (
                    <div key={it.productId} className="flex justify-between">
                      <span className="truncate pr-2">{it.quantity} × {it.name}</span>
                      <span className="font-medium">{formatGMD(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-5">
                <h2 className="font-semibold text-lg">Deliver to</h2>
                <div className="mt-2 text-sm space-y-1">
                  <div className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />{form.delivery_address}</div>
                  <div className="flex items-center gap-2"><PhoneIcon className="h-4 w-4 text-muted-foreground" />{form.phone}</div>
                  {form.delivery_date && <div className="text-muted-foreground">Preferred: {form.delivery_date}</div>}
                  {form.notes && <div className="text-muted-foreground">Notes: {form.notes}</div>}
                </div>
                <Button variant="link" className="px-0 mt-2 h-auto" onClick={() => setStep(2)}>Edit details</Button>
              </Card>
              <Card className="p-5 bg-muted/50">
                <div className="text-sm">
                  <div className="font-semibold">Payment: Cash on delivery</div>
                  <div className="text-muted-foreground mt-1">Pay your supplier directly when materials arrive.</div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Order total sidebar */}
        <Card className="p-5 h-fit md:sticky md:top-24">
          <h3 className="font-semibold">Order total</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatGMD(cart.total)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="text-success font-medium">Arranged with supplier</span></div>
            <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg">
              <span>Total</span><span className="text-primary">{formatGMD(cart.total)}</span>
            </div>
          </div>

          <div className="hidden md:block mt-4">
            {step < 3 ? (
              <Button
                onClick={() => setStep((step + 1) as Step)}
                disabled={(step === 1 && !canContinue1) || (step === 2 && !canContinue2)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Continue
              </Button>
            ) : (
              <Button onClick={placeOrder} disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {submitting ? "Placing order…" : "Place order"}
              </Button>
            )}
            {!auth.isAuthenticated && <p className="mt-2 text-xs text-center text-muted-foreground">You'll be asked to log in.</p>}
          </div>
        </Card>
      </div>

      {/* Sticky mobile action bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-card border-t p-3 flex items-center gap-3 safe-bottom">
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="font-bold text-primary">{formatGMD(cart.total)}</div>
        </div>
        {step < 3 ? (
          <Button onClick={() => setStep((step + 1) as Step)}
            disabled={(step === 1 && !canContinue1) || (step === 2 && !canContinue2)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6">
            Continue
          </Button>
        ) : (
          <Button onClick={placeOrder} disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90 px-6">
            {submitting ? "Placing…" : "Place order"}
          </Button>
        )}
      </div>
    </div>
  );
}
