import { useState, type ChangeEvent, type FormEvent } from "react";
import type { Product } from "../types";
import type { ProductDraft } from "../lib/products";
import { uploadProductImage } from "../lib/storage";

interface ProductFormProps {
  /** Producto a editar; `undefined` = alta de producto nuevo. */
  product?: Product;
  onSubmit: (draft: ProductDraft) => Promise<void>;
  onCancel: () => void;
}

/** Campos del formulario: texto siempre string, el dominio se conserva. */
interface FormState {
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number | null;
  is_visible: boolean;
}

/** Estado del formulario: los campos de texto viven como string de verdad
 * (los inputs requieren string | number, nunca null); la conversión a
 * ProductDraft —con nulls del dominio— ocurre solo en handleSubmit.
 */
const EMPTY: FormState = {
  name: "",
  description: "",
  price: 0,
  image_url: "",
  category: "",
  stock: null,
  is_visible: true,
};

/**
 * Formulario de alta/edición de productos del panel /admin.
 * La imagen se sube a Supabase Storage (bucket product-images).
 */
export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const editing = product !== undefined;
  const [draft, setDraft] = useState<FormState>(
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
  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shownPreview = localPreview ?? (draft.image_url || null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setError("El archivo no es una imagen (usa PNG, JPG o WebP).");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError("La imagen supera los 5 MB. Redúcela e intenta de nuevo.");
      return;
    }
    setError(null);
    setFile(selected);
    // Aviso honesto: liberar el blob anterior evita fugas de memoria.
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(URL.createObjectURL(selected));
  }

  function clearImage() {
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
    }
    setFile(null);
    set("image_url", "");
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
      let finalDraft: ProductDraft = {
        ...draft,
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        category: draft.category.trim() || null,
      };

      if (file) {
        finalDraft = {
          ...finalDraft,
          image_url: await uploadProductImage(file),
        };
      }

      await onSubmit(finalDraft);
      if (!editing) {
        setDraft(EMPTY);
        clearImage();
      }
      onCancel();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el producto.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-3xl border-2 border-line bg-surface p-5 shadow-card"
    >
      <h3 className="font-display text-lg font-extrabold text-ink">
        {editing ? "Editar producto" : "Nuevo producto"}
      </h3>

      <label className="flex flex-col gap-1 text-sm">
        Nombre
        <input
          type="text"
          required
          value={draft.name}
          onChange={(e) => set("name", e.target.value)}
          className="rounded-full border-2 border-line bg-surface px-4 py-2 text-sm outline-none transition-colors duration-200 focus:border-accent"
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
            className="rounded-full border-2 border-line bg-surface px-4 py-2 text-sm outline-none transition-colors duration-200 focus:border-accent"
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
            className="rounded-full border-2 border-line bg-surface px-4 py-2 text-sm outline-none transition-colors duration-200 focus:border-accent"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Categoría
        <input
          type="text"
          value={draft.category}
          onChange={(e) => set("category", e.target.value)}
          className="rounded-full border-2 border-line bg-surface px-4 py-2 text-sm outline-none transition-colors duration-200 focus:border-accent"
        />
      </label>

      {/* Imagen: subida directa a Supabase Storage */}
      <fieldset className="rounded-2xl border-2 border-line bg-page p-4">
        <legend className="px-2 text-sm font-semibold text-ink">
          Foto del producto
        </legend>
        <div className="flex items-center gap-4">
          <div
            className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl ${
              shownPreview ? "bg-lilac-soft" : "bg-surface"
            }`}
          >
            {shownPreview && (
              <img
                src={shownPreview}
                alt="Vista previa de la imagen del producto"
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="cursor-pointer rounded-full border-2 border-accent bg-accent-soft px-4 py-2 text-center text-sm font-bold text-ink transition-opacity duration-200 hover:opacity-85 active:translate-y-px">
              Elegir imagen…
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
            {shownPreview && (
              <button
                type="button"
                onClick={clearImage}
                className="rounded-full px-3 py-1 text-xs font-semibold text-blossom transition-colors duration-200 hover:text-ink"
              >
                Quitar imagen
              </button>
            )}
            <p className="text-xs text-ink-soft">
              PNG, JPG o WebP · hasta 5 MB
            </p>
          </div>
        </div>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm">
        Descripción
        <textarea
          rows={2}
          value={draft.description}
          onChange={(e) => set("description", e.target.value)}
          className="rounded-3xl border-2 border-line bg-surface px-4 py-2 text-sm outline-none transition-colors duration-200 focus:border-accent"
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
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-contrast shadow-soft transition-opacity duration-200 hover:opacity-90 active:opacity-75 active:translate-y-px disabled:opacity-40"
        >
          {saving
            ? file
              ? "Subiendo imagen…"
              : "Guardando…"
            : editing
              ? "Guardar cambios"
              : "Crear"}
        </button>
      </div>
    </form>
  );
}
