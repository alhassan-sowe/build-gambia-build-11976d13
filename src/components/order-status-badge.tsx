import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

const styles: Record<OrderStatus, string> = {
  PENDING: "bg-warning text-warning-foreground hover:bg-warning",
  CONFIRMED: "bg-chart-5 text-white hover:bg-chart-5",
  DELIVERING: "bg-accent text-accent-foreground hover:bg-accent",
  DELIVERED: "bg-success text-success-foreground hover:bg-success",
  CANCELED: "bg-destructive text-destructive-foreground hover:bg-destructive",
};

const labels: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  DELIVERING: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELED: "Canceled",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge className={cn("border-transparent", styles[status])}>{labels[status]}</Badge>;
}
