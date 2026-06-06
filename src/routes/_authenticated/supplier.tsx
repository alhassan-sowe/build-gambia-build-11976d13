import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/lib/use-auth";
import { listMyProducts, createProduct, updateProduct, deleteProduct } from "@/lib/products.functions";
import { listCategories } from "@/lib/categories.functions";
import { listSupplierOrders, updateOrderStatus } from "@/lib/orders.functions";
import { updateMyProfile } from "@/lib/profiles.functions";
import { formatGMD } from "@/lib/cart";
import type { OrderStatus } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/supplier")({
  component: SupplierDashboard,
});

function SupplierDashboard() {
  const { profile } = useAuth();

  if (!profile) return <div className="container mx-auto px-4 py-8">Loading…</div>;
  if (profile.role !== "SUPPLIER" && profile.role !== "ADMIN") {
    return <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">Suppliers only</h1>
      <p className="text-muted-foreground mt-2">This area is for suppliers.</p>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Supplier dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage products and orders.</p>
        </div>
        {!profile.is_active && (
          <Badge variant="destructive">Awaiting admin approval</Badge>
        )}
      </div>

      <Tabs defaultValue="products" className="mt-6">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="mt-6"><ProductsTab disabled={!profile.is_active} /></TabsContent>
        <TabsContent value="orders" className="mt-6"><OrdersTab /></TabsContent>
        <TabsContent value="profile" className="mt-6"><ProfileTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function ProductsTab({ disabled }: { disabled: boolean }) {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery({ queryKey: ["my-products"], queryFn: () => listMyProducts() });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => listCategories() });
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const delMut = useMutation({
    mutationFn: (id: string) => deleteProduct({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-products"] }); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button disabled={disabled} className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4 mr-1" /> Add product</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} product</DialogTitle></DialogHeader>
            <ProductForm categories={categories} initial={editing} onDone={() => { setOpen(false); setEditing(null); qc.invalidateQueries({ queryKey: ["my-products"] }); }} />
          </DialogContent>
        </Dialog>
      </div>
      {products.length === 0 ? (
        <EmptyState title="No products yet" description={disabled ? "Wait for admin approval to start listing." : "Add your first product."} />
      ) : (
        <div className="grid gap-3">
          {products.map((p: any) => (
            <Card key={p.id} className="p-4 flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden shrink-0">
                {p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-muted-foreground">{formatGMD(Number(p.price))} / {p.unit} · {p.stock} in stock · {p.category_name || "Uncategorized"}</div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete this product?")) delMut.mutate(p.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductForm({ categories, initial, onDone }: { categories: any[]; initial: any; onDone: () => void }) {
  const [f, setF] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    price: initial?.price?.toString() || "0",
    unit: initial?.unit || "bag",
    stock: initial?.stock?.toString() || "0",
    image_url: initial?.image_url || "",
    location: initial?.location || "",
    category_id: initial?.category_id || "",
  });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: f.name, description: f.description || null,
        price: Number(f.price), unit: f.unit, stock: parseInt(f.stock),
        image_url: f.image_url || null, location: f.location || null,
        category_id: f.category_id || null,
      };
      if (initial) await updateProduct({ data: { id: initial.id, ...payload } });
      else await createProduct({ data: payload });
      toast.success(initial ? "Updated" : "Product added");
      onDone();
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div><Label>Name</Label><Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
      <div><Label>Description</Label><Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Price (GMD)</Label><Input type="number" step="0.01" required value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></div>
        <div><Label>Unit</Label><Input required value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })} /></div>
        <div><Label>Stock</Label><Input type="number" required value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} /></div>
      </div>
      <div><Label>Image URL</Label><Input value={f.image_url} onChange={(e) => setF({ ...f, image_url: e.target.value })} placeholder="https://…" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Location</Label><Input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></div>
        <div>
          <Label>Category</Label>
          <Select value={f.category_id} onValueChange={(v) => setF({ ...f, category_id: v })}>
            <SelectTrigger><SelectValue placeholder="Choose…" /></SelectTrigger>
            <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full">{loading ? "Saving…" : "Save"}</Button>
    </form>
  );
}

function OrdersTab() {
  const qc = useQueryClient();
  const { data: orders = [] } = useQuery({ queryKey: ["supplier-orders"], queryFn: () => listSupplierOrders() });
  const mut = useMutation({
    mutationFn: (v: { id: string; status: OrderStatus }) => updateOrderStatus({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["supplier-orders"] }); toast.success("Order updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  if (orders.length === 0) return <EmptyState title="No orders yet" />;

  return (
    <div className="space-y-3">
      {orders.map((o: any) => (
        <Card key={o.id} className="p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="text-sm text-muted-foreground">Order #{o.id.slice(0, 8)} · {o.buyer_name}</div>
              <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
            </div>
            <OrderStatusBadge status={o.status} />
          </div>
          <div className="mt-3 text-sm space-y-1">
            {o.items?.map((it: any) => <div key={it.id}>{it.quantity} × {it.product_name} — {formatGMD(Number(it.price) * it.quantity)}</div>)}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Deliver to: {o.delivery_address} · {o.phone}</div>
          <div className="mt-3 flex gap-2 flex-wrap">
            <Select value={o.status} onValueChange={(v) => mut.mutate({ id: o.id, status: v as OrderStatus })}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["PENDING","CONFIRMED","DELIVERING","DELIVERED","CANCELED"] as OrderStatus[]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ProfileTab() {
  const { profile } = useAuth();
  const [f, setF] = useState({ name: profile?.name || "", phone: profile?.phone || "", location: profile?.location || "" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateMyProfile({ data: f });
      toast.success("Profile updated");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }

  return (
    <Card className="p-6 max-w-lg">
      <form onSubmit={submit} className="space-y-3">
        <div><Label>Name</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><Label>Phone</Label><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
        <div><Label>Location</Label><Input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></div>
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save changes"}</Button>
      </form>
    </Card>
  );
}
