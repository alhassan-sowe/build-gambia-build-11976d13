import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({
  label, value, icon: Icon, hint, tone = "default",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "primary" | "success" | "warning" | "destructive";
}) {
  const toneMap: Record<string, string> = {
    default: "bg-muted text-foreground",
    primary: "bg-primary/15 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    destructive: "bg-destructive/15 text-destructive",
  };
  return (
    <Card className="p-4 md:p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
          <div className="text-2xl md:text-3xl font-extrabold mt-1 tabular-nums">{value}</div>
          {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
        </div>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${toneMap[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
