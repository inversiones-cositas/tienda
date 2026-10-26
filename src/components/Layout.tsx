import type { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { MusicWidget } from "./MusicWidget";
import { CartModal } from "./CartModal";

export function Layout({ children }: { children: ReactNode }) {
  const { totalItems } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col text-ink">
      <header className="border-b-2 border-toast/50 bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link
            to="/"
            className="flex items-center transition-opacity duration-200 hover:opacity-80"
            aria-label="Ir al catálogo — Inversiones Cositas"
          >
            <img
              src="/logotipo-cositas.svg"
              alt="Inversiones Cositas"
              width={128}
              height={35}
              className="h-9 w-auto object-contain"
            />
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <a
              href="/"
              className="transition-colors duration-200 hover:text-accent"
            >
              Catálogo
            </a>
            <Link
              to="/admin"
              className="text-ink-soft transition-colors duration-200 hover:text-accent"
            >
              Admin
            </Link>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 rounded-full bg-blossom-soft px-4 py-2 font-display text-sm font-extrabold text-ink border-2 border-blossom shadow-soft [transition-property:background-color,border-color,color,transform] duration-200 hover:bg-blossom hover:text-accent-contrast active:translate-y-px"
              aria-label={`Abrir mi pedido, ${totalItems} artículos`}
            >
              <BagIcon />
              Mi pedido
              {totalItems > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-ink px-1.5 text-xs font-bold text-accent-contrast">
                  {totalItems}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <CartModal open={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 pb-48">
        {children}
      </main>

      <footer className="border-t-2 border-toast/50 bg-surface pt-8 pb-8 text-center text-sm text-ink-soft">
        <img
          src="/osito-cositas.svg"
          alt=""
          width={88}
          height={82}
          className="mx-auto mb-3 h-14 w-auto"
        />
        <p className="font-display font-bold text-ink">
          {import.meta.env.VITE_STORE_NAME}
        </p>
        <p className="mt-1">Pedidos por WhatsApp</p>
        <p className="mt-1">© {new Date().getFullYear()}</p>
      </footer>

      <MusicWidget />
    </div>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M9 5a3 3 0 0 1 6 0 1 1 0 1 1-2 0 1 1 0 0 0-2 0 1 1 0 0 1-2 0zM6.2 7h11.6l1 12a2 2 0 0 1-2 2.2H7.2A2 2 0 0 1 5.2 19l1-12zm5.8 4a1 1 0 0 1 1 1v.5a.5.5 0 0 0 1 0V12a2 2 0 1 0-4 0v.5a.5.5 0 0 0 1 0V12a1 1 0 0 1 1-1z" />
    </svg>
  );
}
