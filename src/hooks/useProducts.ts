import { useEffect, useState } from "react";
import { supabase, PRODUCTS_TABLE } from "../lib/supabase";
import type { Product } from "../types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data, error: err } = await supabase
          .from(PRODUCTS_TABLE)
          .select("*")
          .eq("is_visible", true)
          .order("created_at", { ascending: false });

        if (cancelled) return;
        if (err) throw err;
        setProducts(data ?? []);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof Error) setError(e.message);
        else setError("Error desconocido al cargar el catálogo.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading, error };
}
