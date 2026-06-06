import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Truck, ShieldCheck, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroImage from "@/assets/hero-materials.jpg";
import { listCategories } from "@/lib/categories.functions";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="container mx-auto grid gap-10 px-4 py-16 md:py-24 md:grid-cols-2 items-center">
          <div>
            <span className="inline-block rounded-full bg-accent/20 text-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider">The Gambia</span>
            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight">
              Order construction materials <span className="text-accent">directly</span>.
            </h1>
            <p className="mt-4 text-base md:text-lg opacity-90 max-w-lg">
              Find cement, sand, blocks, gravel, iron rods, tiles, and transport from trusted suppliers across The Gambia.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/materials">Order Now <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-primary-foreground hover:bg-white/10">
                <Link to="/auth" search={{ tab: "register", role: "SUPPLIER" } as any}>Become a Supplier</Link>
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /> Trusted suppliers</div>
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-accent" /> Direct delivery</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-accent" /> Quick orders</div>
            </div>
          </div>
          <div className="relative">
            <img src={heroImage} alt="Stacked construction materials" width={1536} height={1024}
              className="rounded-2xl shadow-2xl border border-white/10" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Browse by category</h2>
            <p className="text-muted-foreground mt-1">Everything you need to build, in one place.</p>
          </div>
          <Button asChild variant="ghost"><Link to="/materials">View all <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c: any) => (
            <Link key={c.id} to="/materials" search={{ category: c.id } as any}>
              <Card className="p-6 hover:border-accent hover:shadow-md transition cursor-pointer h-full">
                <div className="h-12 w-12 rounded-lg bg-accent/15 text-accent flex items-center justify-center font-bold text-lg mb-3">
                  {c.name[0]}
                </div>
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center">How Envora works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { n: "1", t: "Browse", d: "Search materials by category and supplier." },
              { n: "2", t: "Order", d: "Pick what you need, set delivery details, place your order." },
              { n: "3", t: "Receive", d: "Supplier confirms and delivers straight to your site." },
            ].map((s) => (
              <Card key={s.n} className="p-6">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-3">{s.n}</div>
                <h3 className="font-semibold text-lg">{s.t}</h3>
                <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
