import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, ShoppingCart, ClipboardList, User } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile, isAuthenticated } = useAuth();
  const { count } = useCart();

  if (pathname === "/auth") return null;

  const dashHref =
    profile?.role === "ADMIN" ? "/admin"
    : profile?.role === "SUPPLIER" ? "/supplier"
    : "/dashboard";

  const items = [
    { to: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
    { to: "/materials", label: "Browse", icon: LayoutGrid, match: (p: string) => p.startsWith("/materials") },
    { to: "/checkout", label: "Cart", icon: ShoppingCart, match: (p: string) => p === "/checkout", badge: count },
    { to: isAuthenticated ? dashHref : "/auth", label: "Orders", icon: ClipboardList, match: (p: string) => p === "/dashboard" },
    { to: isAuthenticated ? dashHref : "/auth", label: isAuthenticated ? "Account" : "Sign in", icon: User, match: (p: string) => p.startsWith("/admin") || p.startsWith("/supplier") || p === "/auth" },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface text-surface-foreground border-t border-white/10 safe-bottom">
      <ul className="grid grid-cols-5">
        {items.map((it) => {
          const active = it.match(pathname);
          const Icon = it.icon;
          return (
            <li key={it.label}>
              <Link
                to={it.to as any}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition relative",
                  active ? "text-primary" : "text-surface-foreground/70 hover:text-surface-foreground",
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {"badge" in it && it.badge ? (
                    <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {it.badge}
                    </span>
                  ) : null}
                </div>
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
