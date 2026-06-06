import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/types";

const styles: Record<OrderStatus, string> = {
  PENDING: "bg-warning text-warning-foreground",
  CONFIRMED: "bg-chart-5 text-white",
  DELIVERING: "bg-accent text-accent-foreground",
  DELIVERED: "bg-success text-success-foreground",
  CANCELED: "bg-destructive text-destructive-foreground",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge className={styles[status]}>{status}</Badge>;
}
