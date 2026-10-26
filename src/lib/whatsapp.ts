import type { CartItem } from "../types";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER;
const STORE_NAME = import.meta.env.VITE_STORE_NAME || "Inversiones Cositas";

if (!WHATSAPP_NUMBER) {
  throw new Error(
    "Falta VITE_WHATSAPP_NUMBER en .env.local (ej. 584225454001).",
  );
}

const formatter = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(value: number): string {
  return `$ ${formatter.format(value)}`;
}

/**
 * Construye el deep link de WhatsApp con el pedido del carrito:
 * lista de productos, cantidades, precios y total, listo para enviar.
 */
export function buildWhatsAppCheckoutUrl(items: CartItem[]): string {
  if (items.length === 0) return `https://wa.me/${WHATSAPP_NUMBER}`;

  const lines: string[] = [`¡Hola ${STORE_NAME}! Quisiera hacer este pedido:`];

  for (const { product, quantity } of items) {
    lines.push(
      `• ${quantity} × ${product.name} — ${formatPrice(product.price * quantity)}`,
    );
  }

  const total = items.reduce(
    (sum, { product, quantity }) => sum + product.price * quantity,
    0,
  );
  lines.push(`Total: ${formatPrice(total)}`);
  lines.push("");
  lines.push("¿Me confirman disponibilidad, dirección y método de pago?");

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

/**
 * Deep link para consultar/pedir un producto concreto desde su ficha.
 */
export function buildWhatsAppProductUrl(
  product: Pick<CartItem["product"], "name" | "price">,
): string {
  const text = encodeURIComponent(
    `¡Hola ${STORE_NAME}! Me interesa esta cosita: ${product.name} — ${formatPrice(product.price)}. ¿Está disponible?`,
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
