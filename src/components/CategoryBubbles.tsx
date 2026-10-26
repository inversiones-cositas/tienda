import { CATEGORY_TONES } from "../lib/tones";

interface CategoryBubblesProps {
  categories: string[];
  selected: string | null;
  counts: Record<string, number>;
  total: number;
  onSelect: (category: string | null) => void;
}

/**
 * Burbujas de filtro del catálogo: cada categoría lleva su pastel del logo.
 * `selected === null` muestra todo el catálogo.
 */
export function CategoryBubbles({
  categories,
  selected,
  counts,
  total,
  onSelect,
}: CategoryBubblesProps) {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
      <button
        type="button"
        onClick={() => onSelect(null)}
        aria-pressed={selected === null}
        className={`rounded-full border-2 px-4 py-2 text-sm font-bold [transition-property:background-color,border-color,color,transform] duration-200 active:translate-y-px ${
          selected === null
            ? "border-accent bg-accent text-accent-contrast"
            : "border-line bg-honey-soft text-ink hover:border-accent"
        }`}
      >
        Todo · {total}
      </button>

      {categories.map((category) => {
        const tone = CATEGORY_TONES[categories.indexOf(category) % CATEGORY_TONES.length];
        const active = selected === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(active ? null : category)}
            aria-pressed={active}
            className={`rounded-full border-2 px-4 py-2 text-sm font-bold [transition-property:background-color,border-color,color,transform] duration-200 active:translate-y-px ${
              active
                ? "border-accent bg-accent text-accent-contrast"
                : `${tone.bg} border-line text-ink hover:border-accent`
            }`}
          >
            {category} · {counts[category] ?? 0}
          </button>
        );
      })}
    </div>
  );
}
