import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";
import { useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const { profile, isAuthenticated } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const dashHref =
    profile?.role === "ADMIN" ? "/admin"
    : profile?.role === "SUPPLIER" ? "/supplier"
    : "/dashboard";

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  const links = (
    <>
      <Link to="/materials" className="text-sm font-medium hover:text-accent transition" onClick={() => setOpen(false)}>Materials</Link>
      <Link to="/contact" className="text-sm font-medium hover:text-accent transition" onClick={() => setOpen(false)}>Contact</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">E</span>
          <span>Envora</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">{links}</nav>

        <div className="flex items-center gap-2">
          <Link to="/checkout" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 bg-accent text-accent-foreground">{count}</Badge>
              )}
            </Button>
          </Link>

          {isAuthenticated && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <span className="hidden sm:inline">{profile.name || "Account"}</span>
                  <Badge variant="secondary" className="text-xs">{profile.role}</Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{profile.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: dashHref })}>
                  <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm"><Link to="/auth">Log In</Link></Button>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto flex flex-col gap-3 px-4 py-4">{links}</nav>
        </div>
      )}
    </header>
  );
}
