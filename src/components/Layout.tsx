import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export function Layout({ children }: { children: ReactNode }) {
  const { totalItems } = useCart();

  return (
    <div className="flex min-h-dvh flex-col bg-page text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link
            to="/"
            className="font-display text-lg font-bold text-ink transition-opacity duration-200 hover:opacity-80"
          >
            {import.meta.env.VITE_STORE_NAME}
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
            <span
              className="rounded-full bg-muted px-3 py-1"
              aria-label={`Carrito con ${totalItems} artículos`}
            >
              Carrito: {totalItems}
            </span>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 pb-40">
        {children}
      </main>

      <footer className="border-t border-line bg-surface py-6 text-center text-sm text-ink-soft">
        © {new Date().getFullYear()} {import.meta.env.VITE_STORE_NAME} · Pedidos
        por WhatsApp
      </footer>
    </div>
  );
}
