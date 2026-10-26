import { useEffect } from "react";
import { buildWhatsAppCheckoutUrl } from "../lib/whatsapp";
import { useCart } from "../context/CartContext";

interface CartModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal "Tu pedido": resumen exacto y envío directo al WhatsApp de la casa.
 * Se abre desde el botón de bolsa del header.
 */
export function CartModal({ open, onClose }: CartModalProps) {
  const { items, totalItems, totalPrice, addItem, removeItem, clear } =
    useCart();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tu pedido"
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="cart-pop w-full max-w-md rounded-3xl border-2 border-line bg-surface p-6 shadow-pop">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-ink">
              Tu pedido cajita de tesoros
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              ¿Quieres proceder con la compra? Te comunicaremos directo con un
              asesor de ventas con tus productos ya cargados
              <InlineBear /> <InlineSparkle />
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar el pedido"
            className="rounded-full px-2 py-1 text-lg font-bold text-ink-soft transition-colors duration-200 hover:text-ink"
          >
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <p className="mt-6 text-center text-sm text-ink-soft">
            Tu cajita está vacía. ¡Elige una cosita que te enamore!
          </p>
        ) : (
          <>
            <ul className="mt-5 flex flex-col divide-y divide-line">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex items-center gap-3 py-3">
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                    {product.name}
                  </p>
                  <div
                    className="flex items-center gap-1.5"
                    aria-label={`Cantidad de ${product.name}`}
                  >
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      aria-label={`Quitar ${product.name}`}
                      className="h-7 w-7 rounded-full border-2 border-line font-bold text-ink transition-colors duration-200 hover:border-blossom"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-display font-bold">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => addItem(product)}
                      aria-label={`Agregar ${product.name}`}
                      className="h-7 w-7 rounded-full border-2 border-line font-bold text-ink transition-colors duration-200 hover:border-blossom"
                    >
                      +
                    </button>
                  </div>
                  <p className="w-20 text-right text-sm font-bold text-price">
                    ${(product.price * quantity).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center justify-between border-t-2 border-dashed border-line pt-3">
              <p className="text-sm text-ink-soft">
                {totalItems} {totalItems === 1 ? "tesoro" : "tesoros"}
              </p>
              <p className="font-display text-xl font-extrabold text-price">
                Total: ${totalPrice.toFixed(2)}
              </p>
            </div>

            <a
              href={buildWhatsAppCheckoutUrl(items)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 rounded-full bg-whatsapp px-5 py-3 text-sm font-extrabold text-accent-contrast shadow-soft transition-opacity duration-200 hover:opacity-90 active:opacity-75 active:translate-y-px"
            >
              <WhatsAppIcon />
              Enviar pedido al asesor
            </a>

            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={clear}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors duration-200 hover:text-ink"
              >
                Vaciar cajita
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors duration-200 hover:text-ink"
              >
                Seguir comprando
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.1 14.9l-.5-.3-3 .8.8-2.9-.3-.5A8 8 0 0 1 12 4zm-3.1 3.8c-.2 0-.5 0-.7.3-.2.3-.9.9-.9 2.2s.9 2.6 1 2.8c.2.2 1.9 3 4.6 4.1 2.3.9 2.7.7 3.2.7.5-.1 1.5-.6 1.8-1.2.3-.6.3-1.2.2-1.3l-.5-.2-1.8-.9c-.2-.1-.4-.1-.6.1l-.8 1c-.2.2-.3.2-.6.1-.2-.1-1-.4-2-1.3-.7-.7-1.2-1.5-1.4-1.8-.1-.3 0-.4.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.8-1.9c-.2-.4-.4-.4-.6-.4h-.6z" />
    </svg>
  );
}

function InlineBear() {
  return (
    <svg
      viewBox="0 0 64 44"
      className="inline-block h-5 w-8 align-[-4px]"
      aria-hidden="true"
    >
      <circle cx="12" cy="10" r="8" fill="#fdf1df" stroke="#c9b197" strokeWidth="3" />
      <circle cx="52" cy="10" r="8" fill="#fdf1df" stroke="#c9b197" strokeWidth="3" />
      <circle cx="13" cy="9" r="3.4" fill="#fbd7d5" />
      <circle cx="51" cy="9" r="3.4" fill="#fbd7d5" />
      <path d="M6 26a26 24 0 0 1 52 0a26 24 0 0 1-52 0z" fill="#fdf1df" stroke="#c9b197" strokeWidth="3.2" />
      <ellipse cx="24" cy="30" rx="3.2" ry="3.9" fill="#4a3a2d" />
      <ellipse cx="40" cy="30" rx="3.2" ry="3.9" fill="#4a3a2d" />
      <ellipse cx="32" cy="36.5" rx="4.6" ry="3.6" fill="#4a3a2d" />
    </svg>
  );
}

function InlineSparkle() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="inline-block h-4 w-4 align-[-3px] text-honey" aria-hidden="true">
      <path d="M12 2c.4 4.8 1.6 6.4 7 8-5.4 1.6-6.6 3.2-7 8-.4-4.8-1.6-6.4-7-8 5.4-1.6 6.6-3.2 7-8z" />
    </svg>
  );
}
