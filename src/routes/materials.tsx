import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { listProducts } from "@/lib/products.functions";
import { listCategories } from "@/lib/categories.functions";

type Search = { category?: string };

export const Route = createFileRoute("/materials")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  component: Materials,
});

function Materials() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState("");

  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => listCategories() });
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", search.category, q],
    queryFn: () => listProducts({ data: { categoryId: search.category, search: q || undefined } }),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Materials catalog</h1>
      <p className="text-muted-foreground mt-1">Browse and order directly from suppliers.</p>

      <div className="mt-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search materials…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="mt-4 flex gap-2 flex-wrap">
        <Button size="sm" variant={!search.category ? "default" : "outline"} onClick={() => navigate({ search: {} })}>All</Button>
        {categories.map((c: any) => (
          <Button key={c.id} size="sm" variant={search.category === c.id ? "default" : "outline"}
            onClick={() => navigate({ search: { category: c.id } })}>{c.name}</Button>
        ))}
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState title="No products found" description="Try a different search or category." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
