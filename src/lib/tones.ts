/**
 * Rotación de los pasteles del logo: cada categoría recibe un color suave
 * distinto (lila, rosa, miel, salvia, celeste) de forma determinista,
 * para que la grilla del catálogo sea colorida pero ordenada.
 */

export const CATEGORY_TONES = [
  { bg: "bg-lilac-soft", text: "text-ink" }, // lila de la "a"
  { bg: "bg-blossom-soft", text: "text-ink" }, // rosa del blush
  { bg: "bg-honey-soft", text: "text-ink" }, // miel de la "i"
  { bg: "bg-whatsapp-soft", text: "text-ink" }, // salvia de la "t"
  { bg: "bg-accent-soft", text: "text-ink" }, // celeste de la "C"
] as const;

export type CategoryTone = (typeof CATEGORY_TONES)[number];

/** Tono estable para un producto: por categoría, o por id si no tiene. */
export function toneFor(category: string | null, seed: string): CategoryTone {
  const key = (category ?? seed).toLowerCase().trim();
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return CATEGORY_TONES[hash % CATEGORY_TONES.length];
}
