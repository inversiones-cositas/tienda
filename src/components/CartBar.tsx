import { buildWhatsAppCheckoutUrl } from "../lib/whatsapp";
import { useCart } from "../context/CartContext";

/**
 * Barra inferior del catálogo con el resumen del carrito y el botón
 * que abre WhatsApp con el pedido armado.
 */
export function CartBar() {
  const { items, totalItems, totalPrice, clear } = useCart();

  if (items.length === 0) return null;

  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface p-4 shadow-lg">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-ink-soft">
          <p className="font-medium text-ink">
            {totalItems} {totalItems === 1 ? "artículo" : "artículos"} · pedido
            listo para WhatsApp
          </p>
          <p>
            {items
              .map((it) => `${it.quantity}× ${it.product.name}`)
              .join(" · ")}
            {" — "}
            <strong>${totalPrice.toFixed(2)}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clear}
            className="rounded-md px-3 py-2 text-sm text-ink-soft transition-colors duration-200 hover:text-ink"
          >
            Vaciar
          </button>
          <a
            href={buildWhatsAppCheckoutUrl(items)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-contrast transition-opacity duration-200 hover:opacity-90 active:opacity-75"
          >
            Pedir por WhatsApp
          </a>
        </div>
      </div>
    </aside>
  );
}
