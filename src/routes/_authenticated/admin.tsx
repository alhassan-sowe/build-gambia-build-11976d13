import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/lib/use-auth";
import { listAllProfiles, setSupplierActive, setUserRole, listAllProducts } from "@/lib/profiles.functions";
import { listCategories, createCategory, deleteCategory } from "@/lib/categories.functions";
import { deleteProduct, toggleProductActive } from "@/lib/products.functions";
import { listAllOrders } from "@/lib/orders.functions";
import { listAllInquiries, updateInquiryStatus } from "@/lib/inquiries.functions";
import { formatGMD } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
    const isAdmin = (roles || []).some((r: any) => r.role === "ADMIN");
    if (!isAdmin) throw redirect({ to: "/" });
  },
  component: AdminDashboard,
});

function AdminDashboard() {
  const { profile } = useAuth();
  if (!profile) return <div className="container mx-auto px-4 py-8">Loading…</div>;
  if (profile.role !== "ADMIN") return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">Admins only</h1>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Admin dashboard</h1>
      <Tabs defaultValue="suppliers" className="mt-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
        </TabsList>
        <TabsContent value="suppliers" className="mt-6"><SuppliersTab /></TabsContent>
        <TabsContent value="users" className="mt-6"><UsersTab /></TabsContent>
        <TabsContent value="categories" className="mt-6"><CategoriesTab /></TabsContent>
        <TabsContent value="products" className="mt-6"><ProductsTab /></TabsContent>
        <TabsContent value="orders" className="mt-6"><OrdersTab /></TabsContent>
        <TabsContent value="inquiries" className="mt-6"><InquiriesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function SuppliersTab() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any | null>(null);
  const { data: users = [] } = useQuery({ queryKey: ["all-profiles"], queryFn: () => listAllProfiles() });
  const mut = useMutation({
    mutationFn: (v: { id: string; is_active: boolean }) => setSupplierActive({ data: v }),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["all-profiles"] });
      toast.success(v.is_active ? "Supplier approved" : "Supplier rejected");
      setSelected(null);
    },
    onError: (e: any) => toast.error(e.message),
  });
  const suppliers = users.filter((u: any) => u.role === "SUPPLIER");
  const pending = suppliers.filter((u: any) => !u.is_active);
  const approved = suppliers.filter((u: any) => u.is_active);

  const Row = ({ u, showApprove }: { u: any; showApprove?: boolean }) => (
    <Card key={u.id} className="p-4 flex items-center justify-between gap-3 flex-wrap">
      <button onClick={() => setSelected(u)} className="min-w-0 text-left flex-1">
        <div className="font-medium flex items-center gap-2 flex-wrap">
          {u.name || "Unnamed"}
          {u.is_active ? <Badge variant="secondary">Approved</Badge> : <Badge variant="destructive">Pending</Badge>}
        </div>
        <div className="text-sm text-muted-foreground truncate">{u.email} · {u.phone || "no phone"} · {u.location || "no location"}</div>
        <div className="text-xs text-muted-foreground mt-1">Applied {new Date(u.created_at).toLocaleDateString()}</div>
      </button>
      <div className="flex items-center gap-2">
        {showApprove ? (
          <>
            <Button size="sm" onClick={() => setSelected({ ...u, _action: "approve" })}>Approve</Button>
            <Button size="sm" variant="outline" onClick={() => setSelected({ ...u, _action: "reject" })}>Reject</Button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Switch checked={u.is_active} onCheckedChange={(v) => mut.mutate({ id: u.id, is_active: v })} />
            <span className="text-sm">Active</span>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-3">Approval queue {pending.length > 0 && <Badge variant="destructive" className="ml-2">{pending.length}</Badge>}</h2>
        {pending.length === 0 ? <EmptyState title="No suppliers pending approval" /> : (
          <div className="space-y-3">{pending.map((u: any) => <Row key={u.id} u={u} showApprove />)}</div>
        )}
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-3">Approved suppliers</h2>
        {approved.length === 0 ? <EmptyState title="No approved suppliers yet" /> : (
          <div className="space-y-3">{approved.map((u: any) => <Row key={u.id} u={u} />)}</div>
        )}
      </section>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selected.name || "Unnamed supplier"}
                  {selected.is_active ? <Badge variant="secondary">Approved</Badge> : <Badge variant="destructive">Pending</Badge>}
                </DialogTitle>
                <DialogDescription>Review supplier details before deciding.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <div><span className="text-muted-foreground">Email:</span> {selected.email || "—"}</div>
                <div><span className="text-muted-foreground">Phone:</span> {selected.phone || "—"}</div>
                <div><span className="text-muted-foreground">Location:</span> {selected.location || "—"}</div>
                <div><span className="text-muted-foreground">Applied:</span> {new Date(selected.created_at).toLocaleString()}</div>
                <div><span className="text-muted-foreground">Status:</span> {selected.is_active ? "Active — can list products" : "Pending — cannot list yet"}</div>
              </div>
              <DialogFooter className="flex gap-2 sm:flex-row flex-col">
                {selected.is_active ? (
                  <Button variant="destructive" disabled={mut.isPending} onClick={() => mut.mutate({ id: selected.id, is_active: false })}>Suspend supplier</Button>
                ) : (
                  <>
                    <Button variant="outline" disabled={mut.isPending} onClick={() => mut.mutate({ id: selected.id, is_active: false })}>Reject</Button>
                    <Button disabled={mut.isPending} onClick={() => mut.mutate({ id: selected.id, is_active: true })}>Approve supplier</Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InquiriesTab() {
  const qc = useQueryClient();
  const { data: inquiries = [] } = useQuery({ queryKey: ["all-inquiries"], queryFn: () => listAllInquiries() });
  const mut = useMutation({
    mutationFn: (v: { id: string; status: "OPEN" | "ANSWERED" | "CLOSED" }) => updateInquiryStatus({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["all-inquiries"] }); toast.success("Updated"); },
    onError: (e: any) => toast.error(e.message),
  });
  if (inquiries.length === 0) return <EmptyState title="No inquiries yet" />;
  return (
    <div className="space-y-3">
      {inquiries.map((i: any) => (
        <Card key={i.id} className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="font-medium">{i.subject}</div>
            <Badge variant={i.status === "OPEN" ? "destructive" : i.status === "ANSWERED" ? "secondary" : "outline"}>{i.status}</Badge>
          </div>
          <div className="text-sm text-muted-foreground mt-1">{i.message}</div>
          <div className="text-xs text-muted-foreground mt-2">{new Date(i.created_at).toLocaleString()}</div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={() => mut.mutate({ id: i.id, status: "ANSWERED" })}>Mark answered</Button>
            <Button size="sm" variant="ghost" onClick={() => mut.mutate({ id: i.id, status: "CLOSED" })}>Close</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function UsersTab() {
  const qc = useQueryClient();
  const { data: users = [] } = useQuery({ queryKey: ["all-profiles"], queryFn: () => listAllProfiles() });
  const mut = useMutation({
    mutationFn: (v: { id: string; role: AppRole }) => setUserRole({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["all-profiles"] }); toast.success("Role updated"); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <div className="space-y-3">
      {users.map((u: any) => (
        <Card key={u.id} className="p-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="font-medium">{u.name || "—"}</div>
            <div className="text-sm text-muted-foreground">{u.email}</div>
          </div>
          <Select value={u.role} onValueChange={(v) => mut.mutate({ id: u.id, role: v as AppRole })}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="BUYER">Buyer</SelectItem>
              <SelectItem value="SUPPLIER">Supplier</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </Card>
      ))}
    </div>
  );
}

function CategoriesTab() {
  const qc = useQueryClient();
  const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: () => listCategories() });
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [open, setOpen] = useState(false);

  const add = useMutation({
    mutationFn: () => createCategory({ data: { name, description: desc || null } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast.success("Added"); setName(""); setDesc(""); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteCategory({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>Add category</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New category</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><Label>Description</Label><Input value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
              <Button onClick={() => add.mutate()} disabled={!name} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-2">
        {cats.map((c: any) => (
          <Card key={c.id} className="p-3 flex items-center justify-between">
            <div><div className="font-medium">{c.name}</div><div className="text-sm text-muted-foreground">{c.description}</div></div>
            <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete category?")) del.mutate(c.id); }}>Delete</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProductsTab() {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery({ queryKey: ["all-products"], queryFn: () => listAllProducts() });
  const toggle = useMutation({
    mutationFn: (v: { id: string; is_active: boolean }) => toggleProductActive({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["all-products"] }); toast.success("Updated"); },
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteProduct({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["all-products"] }); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <div className="space-y-3">
      {products.map((p: any) => (
        <Card key={p.id} className="p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-muted-foreground">{p.supplier_name} · {p.category_name} · {formatGMD(Number(p.price))} / {p.unit}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2"><Switch checked={p.is_active} onCheckedChange={(v) => toggle.mutate({ id: p.id, is_active: v })} /><span className="text-sm">Active</span></div>
            <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete product?")) del.mutate(p.id); }}>Delete</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function OrdersTab() {
  const { data: orders = [] } = useQuery({ queryKey: ["all-orders"], queryFn: () => listAllOrders() });
  if (orders.length === 0) return <EmptyState title="No orders yet" />;
  return (
    <div className="space-y-3">
      {orders.map((o: any) => (
        <Card key={o.id} className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-sm">#{o.id.slice(0, 8)} · {o.buyer_name} · {formatGMD(Number(o.total))}</div>
            <OrderStatusBadge status={o.status} />
          </div>
          <div className="text-xs text-muted-foreground mt-1">{new Date(o.created_at).toLocaleString()} · {o.delivery_address}</div>
        </Card>
      ))}
    </div>
  );
}
