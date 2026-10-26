import { useMemo, useState } from "react";
import { useProducts } from "../hooks/useProducts";
import { ProductCard } from "../components/ProductCard";
import { ProductDetailModal } from "../components/ProductDetailModal";
import { WelcomeBanner } from "../components/WelcomeBanner";
import { CategoryBubbles } from "../components/CategoryBubbles";
import type { Product } from "../types";

export default function CatalogPage() {
  const { products, loading, error } = useProducts();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);

  const categories = useMemo(() => {
    const set = new Map<string, number>();
    for (const p of products) {
      if (p.category) set.set(p.category, (set.get(p.category) ?? 0) + 1);
    }
    return [...set.keys()];
  }, [products]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of products) {
      if (p.category) map[p.category] = (map[p.category] ?? 0) + 1;
    }
    return map;
  }, [products]);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (category === null || p.category === category) &&
          p.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [products, query, category],
  );

  if (loading) {
    return (
      <p className="text-center text-ink-soft" role="status">
        Cargando catálogo…
      </p>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-line bg-surface p-6 text-center">
        <p className="font-medium text-ink">No se pudo cargar el catálogo</p>
        <p className="mt-2 text-sm text-ink-soft">{error}</p>
        <p className="mt-4 text-xs text-ink-soft">
          Verifica que la tabla <code>products</code> exista en Supabase y que
          las políticas RLS permitan lecturas públicas (<code>select</code>)
          de filas con <code>is_visible = true</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <WelcomeBanner />

      <label className="sr-only" htmlFor="catalog-search">
        Buscar productos
      </label>
      <input
        id="catalog-search"
        type="search"
        placeholder="Buscar en Cositas…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-sm rounded-full border-2 border-line bg-surface px-4 py-2 text-sm shadow-soft outline-none transition-colors duration-200 focus:border-accent"
      />

      <CategoryBubbles
        categories={categories}
        selected={category}
        counts={counts}
        total={products.length}
        onSelect={setCategory}
      />

      {filtered.length === 0 ? (
        <p className="text-center text-ink-soft">
          {query || category
            ? "Nada por aquí todavía. Prueba otra categoría o quita la búsqueda."
            : "Aún no hay productos publicados."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              eager={index < 3}
              onOpen={setSelected}
            />
          ))}
        </div>
      )}

      <ProductDetailModal
        product={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

