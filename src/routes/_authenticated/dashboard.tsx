import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ClipboardList, Truck, CheckCircle2, Wallet, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stat-card";
import { useAuth } from "@/lib/use-auth";
import { listMyOrders } from "@/lib/orders.functions";
import { formatGMD } from "@/lib/cart";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: BuyerDashboard,
});

function BuyerDashboard() {
  const { profile } = useAuth();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => listMyOrders(),
  });

  const stats = useMemo(() => {
    const active = orders.filter((o: any) => !["DELIVERED", "CANCELED"].includes(o.status)).length;
    const delivered = orders.filter((o: any) => o.status === "DELIVERED").length;
    const spent = orders.filter((o: any) => o.status === "DELIVERED").reduce((s: number, o: any) => s + Number(o.total), 0);
    return { active, delivered, spent };
  }, [orders]);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}</h1>
          <p className="text-muted-foreground mt-1">Track your orders and account.</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link to="/materials"><ShoppingBag className="h-4 w-4 mr-1" /> Shop materials</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
        <StatCard label="Active" value={stats.active} icon={Truck} tone="primary" />
        <StatCard label="Delivered" value={stats.delivered} icon={CheckCircle2} tone="success" />
        <StatCard label="Orders total" value={orders.length} icon={ClipboardList} />
        <StatCard label="Total spent" value={formatGMD(stats.spent)} icon={Wallet} tone="primary" />
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-3">My orders</h2>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)
        ) : orders.length === 0 ? (
          <EmptyState title="No orders yet" description="Your orders will show here."
            action={<Button asChild className="bg-primary text-primary-foreground"><Link to="/materials">Start shopping</Link></Button>} />
        ) : (
          orders.map((o: any) => (
            <Card key={o.id} className="p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="text-sm font-semibold">Order #{o.id.slice(0, 8)}</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                </div>
                <OrderStatusBadge status={o.status} />
              </div>
              <div className="mt-3 text-sm space-y-1">
                {o.items?.map((it: any) => (
                  <div key={it.id} className="flex justify-between">
                    <span className="truncate pr-2">{it.quantity} × {it.product_name} <span className="text-muted-foreground">({it.product_unit})</span></span>
                    <span className="tabular-nums">{formatGMD(Number(it.price) * it.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t flex justify-between font-semibold">
                <span>Total</span><span className="text-primary">{formatGMD(Number(o.total))}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Deliver to: {o.delivery_address}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
