import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { Product } from "../types";
import type { ProductDraft } from "../lib/products";
import { uploadProductImages } from "../lib/storage";

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
  /** URLs ya guardadas en Supabase (fotos existentes al editar). */
  images: string[];
  category: string;
  stock: number | null;
  is_visible: boolean;
}

/**
 * Estado del formulario: los campos de texto viven como string de verdad
 * (los inputs requieren string | number, nunca null); la conversión a
 * ProductDraft —con nulls del dominio— ocurre solo en handleSubmit.
 */
const EMPTY: FormState = {
  name: "",
  description: "",
  price: 0,
  images: [],
  category: "",
  stock: null,
  is_visible: true,
};

const MAX_FILES = 8;

/**
 * Formulario de alta/edición de productos del panel /admin.
 * Las fotos se suben a Supabase Storage (bucket product-images) y se
 * guardan como array de URLs; la primera es la portada del catálogo.
 */
export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const editing = product !== undefined;
  const [draft, setDraft] = useState<FormState>(
    editing
      ? {
          name: product.name,
          description: product.description ?? "",
          price: product.price,
          images: product.images,
          category: product.category ?? "",
          stock: product.stock,
          is_visible: product.is_visible,
        }
      : EMPTY,
  );
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Los object URLs se liberan solo al desmontar el formulario: suscribirse
  // a `previews` aquí revocaría URLs que todavía están en pantalla.
  const previewsRef = useRef<string[]>([]);
  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);
  useEffect(() => {
    return () => {
      for (const url of previewsRef.current) URL.revokeObjectURL(url);
    };
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function handleFilesChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = [...(e.target.files ?? [])];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (selected.length === 0) return;

    const room = MAX_FILES - draft.images.length - files.length;
    if (room <= 0) {
      setError(`Máximo ${MAX_FILES} fotos por producto.`);
      return;
    }

    const accepted: File[] = [];
    for (const file of selected.slice(0, room)) {
      if (!file.type.startsWith("image/")) {
        setError(`“${file.name}” no es una imagen (usa PNG, JPG o WebP).`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`“${file.name}” supera los 5 MB. Redúcela e intenta de nuevo.`);
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length === 0) return;
    setError(null);
    setFiles((prev) => [...prev, ...accepted]);
    setPreviews((prev) => [
      ...prev,
      ...accepted.map((file) => URL.createObjectURL(file)),
    ]);
  }

  function removeSavedImage(index: number) {
    setDraft((d) => ({
      ...d,
      images: d.images.filter((_, i) => i !== index),
    }));
  }

  function removeNewFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  function clearImages() {
    for (const url of previews) URL.revokeObjectURL(url);
    setPreviews([]);
    setFiles([]);
    set("images", []);
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
      const uploaded = files.length > 0 ? await uploadProductImages(files) : [];
      const finalDraft: ProductDraft = {
        ...draft,
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        category: draft.category.trim() || null,
        images: [...draft.images, ...uploaded],
      };

      await onSubmit(finalDraft);
      if (!editing) {
        setDraft(EMPTY);
        clearImages();
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

  const totalPhotos = draft.images.length + files.length;

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

      {/* Galería: subida múltiple directa a Supabase Storage */}
      <fieldset className="rounded-2xl border-2 border-line bg-page p-4">
        <legend className="px-2 text-sm font-semibold text-ink">
          Fotos del producto ({totalPhotos}/{MAX_FILES})
        </legend>

        {totalPhotos > 0 && (
          <ul className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {draft.images.map((url, index) => (
              <li key={url} className="relative">
                <img
                  src={url}
                  alt={`Foto ${index + 1} guardada`}
                  className="aspect-square w-full rounded-xl border border-line object-cover"
                />
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 rounded-full bg-surface/90 px-1.5 py-0.5 text-[10px] font-bold text-ink">
                    Portada
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeSavedImage(index)}
                  aria-label={`Quitar la foto ${index + 1}`}
                  className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-blossom text-xs font-bold text-accent-contrast shadow-soft"
                >
                  ×
                </button>
              </li>
            ))}
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="relative">
                <img
                  src={previews[index]}
                  alt={`Foto nueva ${index + 1} sin guardar`}
                  className="aspect-square w-full rounded-xl border-2 border-dashed border-accent object-cover"
                />
                <span className="absolute bottom-1 left-1 rounded-full bg-honey-soft px-1.5 py-0.5 text-[10px] font-bold text-ink">
                  Nueva
                </span>
                <button
                  type="button"
                  onClick={() => removeNewFile(index)}
                  aria-label={`Quitar la foto nueva ${index + 1}`}
                  className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-blossom text-xs font-bold text-accent-contrast shadow-soft"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-full border-2 border-accent bg-accent-soft px-4 py-2 text-center text-sm font-bold text-ink transition-opacity duration-200 hover:opacity-85 active:translate-y-px">
            Elegir fotos…
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={handleFilesChange}
              disabled={totalPhotos >= MAX_FILES}
              className="sr-only"
            />
          </label>
          {totalPhotos > 0 && (
            <button
              type="button"
              onClick={clearImages}
              className="rounded-full px-3 py-1 text-xs font-semibold text-blossom transition-colors duration-200 hover:text-ink"
            >
              Quitar todas
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-ink-soft">
          PNG, JPG o WebP. Hasta 5 MB cada una. La primera foto es la portada
          del catálogo.
        </p>
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
            ? files.length > 0
              ? "Subiendo fotos…"
              : "Guardando…"
            : editing
              ? "Guardar cambios"
              : "Crear"}
        </button>
      </div>
    </form>
  );
}
