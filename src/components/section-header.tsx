import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export function SectionHeader({
  title, subtitle, viewAllTo, viewAllSearch, action,
}: {
  title: string;
  subtitle?: string;
  viewAllTo?: string;
  viewAllSearch?: Record<string, any>;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3 mb-4">
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action ?? (viewAllTo && (
        <Link
          to={viewAllTo as any}
          search={viewAllSearch as any}
          className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1 shrink-0"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ))}
    </div>
  );
}
