import type { CSSProperties } from "react";

/**
 * Bienvenida boutique con el osito y destellos respirando suave.
 * El texto es el que definió la casa, con su kawaii explícito.
 */
export function WelcomeBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl border-2 border-line bg-gradient-to-r from-blossom-soft via-lilac-soft to-honey-soft p-6 shadow-card sm:p-8">
      <Sparkle className="twinkle absolute left-[12%] top-4 h-4 w-4 text-ink/30" />
      <Sparkle
        className="twinkle absolute bottom-5 left-[45%] h-3 w-3 text-ink/25"
        style={{ animationDelay: "0.8s" }}
      />
      <Sparkle
        className="twinkle absolute right-[38%] top-6 h-5 w-5 text-ink/30"
        style={{ animationDelay: "1.6s" }}
      />

      <div className="flex items-center gap-5">
        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center gap-2 font-display text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
            ¡Bienvenido a Inversiones Cositas!
            <span className="inline-flex items-center gap-1">
              <MiniBear />
              <Sparkle className="twinkle inline h-5 w-5" />
            </span>
          </h1>
          <p className="mt-2 max-w-md text-sm text-ink sm:text-base">
            ¿Qué deseas descubrir hoy? Explora nuestro catálogo y llévate lo
            que te enamore…
          </p>
        </div>
        <img
          src="/osito-cositas.svg"
          alt=""
          width={96}
          height={90}
          className="h-24 w-auto shrink-0 shadow-soft sm:h-28"
        />
      </div>
    </section>
  );
}

function MiniBear() {
  return (
    <svg
      viewBox="0 0 64 44"
      className="inline-block h-7 w-10 align-[-8px]"
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

function Sparkle({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M12 2c.4 4.8 1.6 6.4 7 8-5.4 1.6-6.6 3.2-7 8-.4-4.8-1.6-6.4-7-8 5.4-1.6 6.6-3.2 7-8z" />
    </svg>
  );
}
