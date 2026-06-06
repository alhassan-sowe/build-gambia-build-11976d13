import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { listProducts } from "@/lib/products.functions";
import { listCategories } from "@/lib/categories.functions";
import { cn } from "@/lib/utils";

type Search = { category?: string; search?: string };

export const Route = createFileRoute("/materials")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
    search: typeof s.search === "string" ? s.search : undefined,
  }),
  component: Materials,
});

function Materials() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(search.search || "");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<"newest" | "price-asc" | "price-desc">("newest");

  useEffect(() => { setQ(search.search || ""); }, [search.search]);

  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => listCategories() });
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", search.category, search.search],
    queryFn: () => listProducts({ data: { categoryId: search.category, search: search.search || undefined } }),
  });

  const sorted = [...products].sort((a: any, b: any) => {
    if (sort === "price-asc") return Number(a.price) - Number(b.price);
    if (sort === "price-desc") return Number(b.price) - Number(a.price);
    return 0;
  });

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ search: { ...search, search: q || undefined } });
  }

  const activeCat = categories.find((c: any) => c.id === search.category);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {activeCat ? activeCat.name : "All materials"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Loading…" : `${sorted.length} ${sorted.length === 1 ? "product" : "products"}`}
            {search.search && ` matching "${search.search}"`}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1 rounded-lg border p-0.5 bg-card">
          <Button size="icon" variant={view === "grid" ? "default" : "ghost"} className="h-8 w-8" onClick={() => setView("grid")} aria-label="Grid view">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button size="icon" variant={view === "list" ? "default" : "ghost"} className="h-8 w-8" onClick={() => setView("list")} aria-label="List view">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 -mx-4 px-4 py-3 bg-background/95 backdrop-blur border-b">
        <form onSubmit={applySearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search materials…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 h-10 rounded-full bg-card" />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button type="button" variant="outline" size="icon" className="h-10 w-10 rounded-full shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px]">
              <SheetHeader><SheetTitle>Filter & sort</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <div className="text-sm font-semibold mb-2">Sort by</div>
                  <div className="grid gap-2">
                    {([
                      { v: "newest", l: "Newest" },
                      { v: "price-asc", l: "Price: low to high" },
                      { v: "price-desc", l: "Price: high to low" },
                    ] as const).map((o) => (
                      <button key={o.v} onClick={() => setSort(o.v)}
                        className={cn("text-left px-3 py-2 rounded-lg border text-sm", sort === o.v ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border")}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2">Category</div>
                  <div className="grid gap-2">
                    <button onClick={() => navigate({ search: { ...search, category: undefined } })}
                      className={cn("text-left px-3 py-2 rounded-lg border text-sm", !search.category ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border")}>
                      All categories
                    </button>
                    {categories.map((c: any) => (
                      <button key={c.id} onClick={() => navigate({ search: { ...search, category: c.id } })}
                        className={cn("text-left px-3 py-2 rounded-lg border text-sm", search.category === c.id ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border")}>
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </form>

        {/* Category chips */}
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          <button onClick={() => navigate({ search: { ...search, category: undefined } })}
            className={cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border transition",
              !search.category ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:border-primary")}>
            All
          </button>
          {categories.map((c: any) => (
            <button key={c.id} onClick={() => navigate({ search: { ...search, category: c.id } })}
              className={cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border transition",
                search.category === c.id ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:border-primary")}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState title="No products found" description="Try a different search or category."
            action={<Button onClick={() => navigate({ search: {} })} variant="outline">Clear filters</Button>} />
        ) : view === "list" ? (
          <div className="grid gap-3 md:grid-cols-2">
            {sorted.map((p: any) => <ProductCard key={p.id} product={p} variant="list" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {sorted.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
