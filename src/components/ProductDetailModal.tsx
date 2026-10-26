import { useEffect, useRef, useState } from "react";
import type { Product } from "../types";
import { formatPrice, buildWhatsAppProductUrl } from "../lib/whatsapp";
import { useCart } from "../context/CartContext";
import { toneFor } from "../lib/tones";

interface ProductDetailModalProps {
  /** Producto a mostrar; `null` mantiene el modal cerrado. */
  product: Product | null;
  onClose: () => void;
}

/**
 * Sub-ventana de detalle: galería con foto principal + miniaturas,
 * ficha completa y las dos salidas de compra (carrito y WhatsApp).
 */
export function ProductDetailModal({
  product,
  onClose,
}: ProductDetailModalProps) {
  const { addItem } = useCart();
  const [active, setActive] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const imageCount = product?.images.length ?? 0;

  // Cada producto nuevo empieza en su foto de portada.
  useEffect(() => {
    setActive(0);
  }, [product?.id]);

  // Esc cierra, ←/→ navegan la galería y el fondo no hace scroll.
  useEffect(() => {
    if (!product) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (imageCount > 1 && e.key === "ArrowRight")
        setActive((i) => (i + 1) % imageCount);
      if (imageCount > 1 && e.key === "ArrowLeft")
        setActive((i) => (i - 1 + imageCount) % imageCount);
    }
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [product, imageCount, onClose]);

  if (!product) return null;

  const images = product.images;
  const current = images[Math.min(active, Math.max(images.length - 1, 0))] ?? null;
  const soldOut = product.stock !== null && product.stock <= 0;
  const tone = toneFor(product.category, product.id);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de ${product.name}`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="cart-pop max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-3xl border-2 border-line bg-surface shadow-pop">
        {/* Cabecera con cierre */}
        <div className="flex items-start justify-between gap-3 px-5 pt-4">
          {product.category ? (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold text-ink ${tone.bg}`}
            >
              {product.category}
            </span>
          ) : (
            <span className="text-xs font-semibold text-ink-soft">
              Cositas
            </span>
          )}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar el detalle"
            className="rounded-full px-2 py-1 text-xl font-bold leading-none text-ink-soft transition-colors duration-200 hover:text-ink"
          >
            ×
          </button>
        </div>

        {/* Galería: visor principal + miniaturas navegables */}
        <div className="px-5 pt-3">
          <div
            className={`relative aspect-square overflow-hidden rounded-2xl border border-line ${tone.bg}`}
          >
            {current ? (
              <img
                src={current}
                alt={`${product.name}, foto ${active + 1} de ${images.length}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-sm font-semibold text-ink/60">
                Sin foto todavía
              </div>
            )}

            {images.length > 1 && (
              <>
                <GalleryArrow
                  direction="left"
                  onClick={() =>
                    setActive((i) => (i - 1 + images.length) % images.length)
                  }
                />
                <GalleryArrow
                  direction="right"
                  onClick={() => setActive((i) => (i + 1) % images.length)}
                />
                <span className="absolute bottom-3 right-3 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-semibold text-ink">
                  {active + 1} / {images.length}
                </span>
              </>
            )}
          </div>

          {images.length > 1 && (
            <ul
              className="mt-3 flex gap-2 overflow-x-auto pb-1"
              aria-label="Miniaturas del producto"
            >
              {images.map((url, index) => (
                <li key={url} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setActive(index)}
                    aria-label={`Ver foto ${index + 1}`}
                    aria-current={index === active}
                    className={`block h-16 w-16 overflow-hidden rounded-xl border-2 transition-transform duration-200 ${
                      index === active
                        ? "border-accent"
                        : "border-line hover:-translate-y-0.5"
                    }`}
                  >
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Ficha */}
        <div className="flex flex-col gap-2 px-5 py-4">
          <h2 className="font-display text-2xl font-extrabold text-ink">
            {product.name}
          </h2>
          <p className="font-display text-xl font-extrabold text-price">
            {formatPrice(product.price)}
          </p>
          {product.description && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
              {product.description}
            </p>
          )}
          {soldOut && (
            <p className="text-xs font-semibold text-blossom">
              Por ahora agotado. Pregúntanos por la próxima reposición.
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-2 px-5 pb-5">
          <button
            type="button"
            onClick={() => {
              addItem(product);
              onClose();
            }}
            disabled={soldOut}
            className="rounded-full bg-accent px-5 py-3 text-sm font-extrabold text-accent-contrast shadow-soft transition-opacity duration-200 hover:opacity-90 active:opacity-75 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
          >
            {soldOut ? "Agotado" : "Agregar al pedido"}
          </button>
          <a
            href={buildWhatsAppProductUrl(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border-2 border-whatsapp bg-whatsapp-soft px-5 py-2.5 text-sm font-extrabold text-ink transition-opacity duration-200 hover:opacity-90 active:opacity-75 active:translate-y-px"
          >
            <WhatsAppIcon />
            Pedir por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function GalleryArrow({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Foto anterior" : "Foto siguiente"}
      className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-surface/90 p-1.5 text-ink shadow-soft transition-opacity duration-200 hover:opacity-85 ${
        direction === "left" ? "left-2" : "right-2"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        {direction === "left" ? (
          <path d="M15 5l-7 7 7 7" />
        ) : (
          <path d="M9 5l7 7-7 7" />
        )}
      </svg>
    </button>
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
