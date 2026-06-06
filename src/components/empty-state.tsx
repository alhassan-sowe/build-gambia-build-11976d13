import type { ReactNode } from "react";
import { PackageOpen } from "lucide-react";

export function EmptyState({
  title, description, icon, action,
}: { title: string; description?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center rounded-xl border border-dashed py-12 px-4">
      <div className="mb-3 text-muted-foreground">{icon ?? <PackageOpen className="h-10 w-10" />}</div>
      <h3 className="font-semibold text-lg">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
