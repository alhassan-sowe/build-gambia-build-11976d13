import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { EmptyState } from "@/components/empty-state";
import { listMyOrders } from "@/lib/orders.functions";
import { formatGMD } from "@/lib/cart";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: BuyerDashboard,
});

function BuyerDashboard() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => listMyOrders(),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">My orders</h1>
      <p className="text-muted-foreground mt-1">Track current and past orders.</p>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="h-24 rounded-xl bg-muted animate-pulse" />
        ) : orders.length === 0 ? (
          <EmptyState title="No orders yet" description="Your orders will show here." />
        ) : (
          orders.map((o: any) => (
            <Card key={o.id} className="p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="text-sm text-muted-foreground">Order #{o.id.slice(0, 8)}</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                </div>
                <OrderStatusBadge status={o.status} />
              </div>
              <div className="mt-3 text-sm space-y-1">
                {o.items?.map((it: any) => (
                  <div key={it.id} className="flex justify-between">
                    <span>{it.quantity} × {it.product_name} ({it.product_unit})</span>
                    <span>{formatGMD(Number(it.price) * it.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t flex justify-between font-semibold">
                <span>Total</span><span>{formatGMD(Number(o.total))}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Deliver to: {o.delivery_address}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
