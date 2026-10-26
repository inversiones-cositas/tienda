import { buildWhatsAppCheckoutUrl } from "../lib/whatsapp";
import { useCart } from "../context/CartContext";

/**
 * Isla flotante del pedido: aparece con una animación tierna en cuanto el
 * carrito tiene productos y envía el mensaje directo a WhatsApp.
 */
export function CartBar() {
  const { items, totalItems, totalPrice, clear } = useCart();

  if (items.length === 0) return null;

  return (
    <aside
      className="cart-pop fixed inset-x-4 bottom-4 z-40 mx-auto max-w-2xl"
      aria-label="Resumen de tu pedido"
    >
      <div className="flex flex-col gap-3 rounded-3xl border-2 border-line bg-gradient-to-r from-blossom-soft via-lilac-soft to-honey-soft p-4 shadow-pop sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-ink">
          <p className="font-display font-extrabold">
            <span className="mx-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-ink px-1.5 text-xs font-bold text-accent-contrast">
              {totalItems}
            </span>
            {totalItems === 1 ? "tesoro" : "tesoros"} en tu pedido
          </p>
          <p className="mt-0.5 line-clamp-1 text-xs">
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
            className="rounded-full px-3 py-2 text-sm font-semibold text-ink/70 transition-colors duration-200 hover:text-ink"
          >
            Vaciar
          </button>
          <a
            href={buildWhatsAppCheckoutUrl(items)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-whatsapp px-5 py-3 text-sm font-extrabold text-accent-contrast shadow-soft transition-opacity duration-200 hover:opacity-90 active:opacity-75 active:translate-y-px"
          >
            <WhatsAppIcon />
            Pedir por WhatsApp
          </a>
        </div>
      </div>
    </aside>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.1 14.9l-.5-.3-3 .8.8-2.9-.3-.5A8 8 0 0 1 12 4zm-3.1 3.8c-.2 0-.5 0-.7.3-.2.3-.9.9-.9 2.2s.9 2.6 1 2.8c.2.2 1.9 3 4.6 4.1 2.3.9 2.7.7 3.2.7.5-.1 1.5-.6 1.8-1.2.3-.6.3-1.2.2-1.3l-.5-.2-1.8-.9c-.2-.1-.4-.1-.6.1l-.8 1c-.2.2-.3.2-.6.1-.2-.1-1-.4-2-1.3-.7-.7-1.2-1.5-1.4-1.8-.1-.3 0-.4.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.8-1.9c-.2-.4-.4-.4-.6-.4h-.6z" />
    </svg>
  );
}
