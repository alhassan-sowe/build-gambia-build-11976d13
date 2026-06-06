import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Search, ArrowRight, ShieldCheck, Truck, Banknote,
  Package, Hammer, Layers, Boxes, Wrench, Square, Construction, MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { SectionHeader } from "@/components/section-header";
import { listCategories } from "@/lib/categories.functions";
import { listProducts } from "@/lib/products.functions";

export const Route = createFileRoute("/")({
  component: Index,
});

const categoryIcons: Record<string, any> = {
  cement: Package, sand: Layers, blocks: Boxes, gravel: Boxes,
  iron: Wrench, rod: Wrench, tile: Square, transport: Truck,
};

function iconFor(name: string) {
  const key = name.toLowerCase();
  for (const k of Object.keys(categoryIcons)) if (key.includes(k)) return categoryIcons[k];
  return Hammer;
}

function Index() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => listCategories() });
  const { data: products = [] } = useQuery({ queryKey: ["products-home"], queryFn: () => listProducts() });

  const featured = products.slice(0, 8);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/materials", search: { search: q || undefined } as any });
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative bg-surface text-surface-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 20% 30%, oklch(0.68 0.21 45 / 0.45), transparent 50%), radial-gradient(circle at 80% 70%, oklch(0.72 0.19 50 / 0.35), transparent 50%)" }} />
        <div className="container mx-auto px-4 py-10 md:py-20 relative">
          <div className="max-w-2xl">
            <Badge className="bg-primary text-primary-foreground mb-3">The Gambia</Badge>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
              Build smarter. <span className="text-primary">Order direct.</span>
            </h1>
            <p className="mt-3 text-base md:text-lg opacity-90 max-w-lg">
              Cement, sand, blocks, gravel, iron rods, tiles and transport — straight from trusted suppliers across The Gambia.
            </p>

            <form onSubmit={onSearch} className="mt-6 flex items-stretch gap-0 bg-white rounded-full p-1.5 shadow-2xl max-w-xl">
              <div className="pl-4 pr-2 flex items-center text-muted-foreground">
                <Search className="h-5 w-5" />
              </div>
              <Input
                value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="What are you building today?"
                className="flex-1 border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 h-10"
              />
              <Button type="submit" className="rounded-full px-5 h-10 bg-primary text-primary-foreground hover:bg-primary/90">
                Search
              </Button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="opacity-70">Popular:</span>
              {["Cement", "Iron rods", "Blocks", "Sand"].map((t) => (
                <Link key={t} to="/materials" search={{ search: t } as any}
                  className="rounded-full border border-white/20 px-3 py-1 hover:bg-white/10 transition">{t}</Link>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-1 text-sm opacity-80">
              <MapPin className="h-3.5 w-3.5" /> Delivering across Banjul, Serrekunda, Brikama
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY RAIL */}
      <section className="container mx-auto px-4 py-8 md:py-10">
        <SectionHeader title="Shop by category" subtitle="Everything you need to build, in one place." viewAllTo="/materials" />
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 md:grid md:grid-cols-7 md:gap-4 md:mx-0 md:px-0">
          {categories.map((c: any) => {
            const Icon = iconFor(c.name);
            return (
              <Link key={c.id} to="/materials" search={{ category: c.id } as any}
                className="shrink-0 md:shrink w-24 md:w-auto flex flex-col items-center gap-2 group">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-card border flex items-center justify-center text-primary group-hover:border-primary group-hover:shadow-md transition">
                  <Icon className="h-7 w-7 md:h-8 md:w-8" />
                </div>
                <span className="text-xs md:text-sm font-medium text-center line-clamp-1">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURED DEALS BANNER */}
      <section className="container mx-auto px-4 pb-6">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground p-5 md:p-8 flex items-center justify-between gap-4 overflow-hidden relative">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider opacity-90">Direct from supplier</div>
            <h3 className="text-xl md:text-3xl font-bold mt-1">Save up to 20% on bulk orders</h3>
            <p className="text-sm opacity-90 mt-1">Bigger sites, better prices.</p>
          </div>
          <Button asChild size="lg" variant="secondary" className="shrink-0 bg-white text-primary hover:bg-white/90">
            <Link to="/materials">Shop now <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container mx-auto px-4 py-6 md:py-10">
        <SectionHeader title="Featured materials" subtitle="Trending with builders this week." viewAllTo="/materials" />
        {featured.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">No products yet — check back soon.</Card>
        ) : (
          <>
            {/* Mobile: horizontal rail */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 md:hidden">
              {featured.map((p: any) => <ProductCard key={p.id} product={p} variant="rail" />)}
            </div>
            {/* Desktop: grid */}
            <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-muted/60 py-10 md:py-16">
        <div className="container mx-auto px-4">
          <SectionHeader title="How Envora works" subtitle="From browse to building site in 3 steps." />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { n: "1", t: "Browse & compare", d: "Find materials from suppliers across The Gambia.", Icon: Search },
              { n: "2", t: "Order in seconds", d: "Add to cart and confirm delivery details.", Icon: Boxes },
              { n: "3", t: "Get it delivered", d: "Your supplier brings it straight to your site.", Icon: Truck },
            ].map((s) => (
              <Card key={s.n} className="p-6 hover:shadow-lg transition">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">{s.n}</div>
                  <s.Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mt-4">{s.t}</h3>
                <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SELL ON ENVORA CTA */}
      <section className="container mx-auto px-4 py-10 md:py-16">
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12">
              <Badge variant="secondary" className="mb-3">For suppliers</Badge>
              <h3 className="text-2xl md:text-3xl font-bold">Sell directly to thousands of builders</h3>
              <p className="text-muted-foreground mt-3">List your materials, manage orders, and grow your business — with no middlemen.</p>
              <Button asChild size="lg" className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/auth">Become a supplier <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="bg-surface text-surface-foreground p-8 md:p-12 flex flex-col justify-center gap-4">
              {[
                { Icon: ShieldCheck, t: "Verified storefront", d: "Build trust from day one." },
                { Icon: Construction, t: "Reach urban builders", d: "Banjul, Serrekunda, Brikama & beyond." },
                { Icon: Banknote, t: "Get paid on delivery", d: "No platform fees on cash orders." },
              ].map(({ Icon, t, d }) => (
                <div key={t} className="flex items-start gap-3">
                  <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div><div className="font-semibold">{t}</div><div className="text-sm opacity-80">{d}</div></div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
