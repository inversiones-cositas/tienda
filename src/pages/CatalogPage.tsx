import { useMemo, useState } from "react";
import { useProducts } from "../hooks/useProducts";
import { ProductCard } from "../components/ProductCard";

export default function CatalogPage() {
  const { products, loading, error } = useProducts();
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      products.filter((p) =>
        p.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [products, query],
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

  if (filtered.length === 0) {
    return (
      <p className="text-center text-ink-soft">
        {query
          ? `No hay resultados para “${query}”.`
          : "Aún no hay productos publicados."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Nuestro catálogo
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Agrega lo que te guste y envía tu lista por WhatsApp.
        </p>
      </div>

      <label className="sr-only" htmlFor="catalog-search">
        Buscar productos
      </label>
      <input
        id="catalog-search"
        type="search"
        placeholder="Buscar productos…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-sm rounded-full border-2 border-line bg-surface px-4 py-2 text-sm shadow-soft outline-none transition-colors duration-200 focus:border-accent"
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product, index) => (
          <ProductCard key={product.id} product={product} eager={index === 0} />
        ))}
      </div>
    </div>
  );
}
