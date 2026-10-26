import { formatPrice } from "../lib/whatsapp";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  /** La primera tarjeta carga su imagen con prioridad: es el LCP de la página. */
  eager?: boolean;
}

export function ProductCard({ product, eager = false }: ProductCardProps) {
  const { addItem } = useCart();
  const soldOut = product.stock !== null && product.stock <= 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_0_0_var(--color-line)] transition-transform duration-200 hover:-translate-y-0.5">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            {...(eager ? { fetchpriority: "high" as const } : { loading: "lazy" as const })}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-soft">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-base font-semibold text-ink">
          {product.name}
        </h3>
        {product.description && (
          <p className="line-clamp-2 text-sm text-ink-soft">
            {product.description}
          </p>
        )}
        <p className="mt-auto text-lg font-bold text-accent">
          {formatPrice(product.price)}
        </p>
        <button
          type="button"
          onClick={() => addItem(product)}
          disabled={soldOut}
          className="mt-1 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast transition-opacity duration-200 hover:opacity-90 active:opacity-75 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:active:opacity-40"
        >
          {soldOut ? "Agotado" : "Agregar al pedido"}
        </button>
      </div>
    </article>
  );
}
