import { formatPrice } from "../lib/whatsapp";
import { useCart } from "../context/CartContext";
import { toneFor } from "../lib/tones";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  /** La primera tarjeta carga su imagen con prioridad: es el LCP de la página. */
  eager?: boolean;
}

export function ProductCard({ product, eager = false }: ProductCardProps) {
  const { addItem } = useCart();
  const soldOut = product.stock !== null && product.stock <= 0;
  const tone = toneFor(product.category, product.id);

  return (
    <article className="card-float group flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
      <div
        className={`relative aspect-square overflow-hidden transition-shadow duration-200 group-hover:shadow-pop ${tone.bg}`}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            {...(eager ? { fetchpriority: "high" as const } : { loading: "lazy" as const })}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-sm font-semibold text-ink/60">
            Sin imagen aún
          </div>
        )}
        {product.category && (
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-ink ${tone.bg}`}
          >
            {product.category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-base font-bold text-ink">
          {product.name}
        </h3>
        {product.description && (
          <p className="line-clamp-2 text-sm text-ink-soft">
            {product.description}
          </p>
        )}
        <p className="mt-auto text-lg font-extrabold text-price">
          {formatPrice(product.price)}
        </p>
        <button
          type="button"
          onClick={() => addItem(product)}
          disabled={soldOut}
          className="mt-1 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-contrast shadow-soft transition-opacity duration-200 hover:opacity-90 active:opacity-75 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:active:opacity-40"
        >
          {soldOut ? "Agotado" : "Agregar al pedido"}
        </button>
      </div>
    </article>
  );
}
