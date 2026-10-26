import { useState, type FormEvent } from "react";
import type { Product } from "../types";
import type { ProductDraft } from "../lib/products";

interface ProductFormProps {
  /** Producto a editar; `undefined` = alta de producto nuevo. */
  product?: Product;
  onSubmit: (draft: ProductDraft) => Promise<void>;
  onCancel: () => void;
}

const EMPTY: ProductDraft = {
  name: "",
  description: "",
  price: 0,
  image_url: "",
  category: "",
  stock: null,
  is_visible: true,
};

/** Formulario de alta/edición de productos del panel /admin. */
export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const editing = product !== undefined;
  const [draft, setDraft] = useState<ProductDraft>(
    editing
      ? {
          name: product.name,
          description: product.description ?? "",
          price: product.price,
          image_url: product.image_url ?? "",
          category: product.category ?? "",
          stock: product.stock,
          is_visible: product.is_visible,
        }
      : EMPTY,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) {
      setError("El producto necesita un nombre.");
      return;
    }
    if (draft.price <= 0) {
      setError("El precio debe ser mayor a 0.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        ...draft,
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        image_url: draft.image_url.trim() || null,
        category: draft.category.trim() || null,
      });
      if (!editing) setDraft(EMPTY);
      onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5"
    >
      <h3 className="font-display text-lg font-semibold text-ink">
        {editing ? "Editar producto" : "Nuevo producto"}
      </h3>

      <label className="flex flex-col gap-1 text-sm">
        Nombre
        <input
          type="text"
          required
          value={draft.name}
          onChange={(e) => set("name", e.target.value)}
          className="rounded-full border border-line bg-page px-4 py-2 text-sm outline-none transition-colors duration-200 focus:border-accent"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Precio
          <input
            type="number"
            required
            min="0.01"
            step="0.01"
            value={draft.price}
            onChange={(e) => set("price", Number(e.target.value))}
            className="rounded-full border border-line bg-page px-4 py-2 text-sm outline-none transition-colors duration-200 focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Stock (vacío = sin control)
          <input
            type="number"
            min="0"
            placeholder="Sin límite"
            value={draft.stock ?? ""}
            onChange={(e) =>
              set(
                "stock",
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
            className="rounded-full border border-line bg-page px-4 py-2 text-sm outline-none transition-colors duration-200 focus:border-accent"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Categoría
          <input
            type="text"
            value={draft.category}
            onChange={(e) => set("category", e.target.value)}
            className="rounded-full border border-line bg-page px-4 py-2 text-sm outline-none transition-colors duration-200 focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          URL de la imagen
          <input
            type="url"
            placeholder="https://…"
            value={draft.image_url}
            onChange={(e) => set("image_url", e.target.value)}
            className="rounded-full border border-line bg-page px-4 py-2 text-sm outline-none transition-colors duration-200 focus:border-accent"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Descripción
        <textarea
          rows={2}
          value={draft.description}
          onChange={(e) => set("description", e.target.value)}
          className="rounded-2xl border border-line bg-page px-4 py-2 text-sm outline-none transition-colors duration-200 focus:border-accent"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.is_visible}
          onChange={(e) => set("is_visible", e.target.checked)}
          className="h-4 w-4 accent-[var(--color-accent)]"
        />
        Visible en el catálogo público
      </label>

      {error && (
        <p className="rounded-xl bg-blossom-soft px-4 py-2 text-sm text-ink">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-4 py-2 text-sm text-ink-soft transition-colors duration-200 hover:text-ink"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-contrast transition-opacity duration-200 hover:opacity-90 active:opacity-75 active:translate-y-px disabled:opacity-40"
        >
          {saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear"}
        </button>
      </div>
    </form>
  );
}
