import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { getSession, signIn, signOut } from "../lib/auth";
import {
  createProduct,
  deleteProduct,
  listAllProducts,
  messageFromDatabaseError,
  updateProduct,
  type ProductDraft,
} from "../lib/products";
import { ProductForm } from "./ProductForm";
import { formatPrice } from "../lib/whatsapp";
import type { Product } from "../types";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getSession().then((s) => {
      if (!cancelled) {
        setSession(s);
        setAuthReady(true);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  if (!authReady) {
    return <p className="text-center text-ink-soft">Verificando sesión…</p>;
  }

  return session ? <AdminDashboard /> : <LoginForm />;
}

/* ── Inicio de sesión ──────────────────────────────────────────────── */

function LoginForm() {
  const [email, setEmail] = useState(ADMIN_EMAIL ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(await signIn(email, password));
    setBusy(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex max-w-sm flex-col gap-4 rounded-3xl border border-line bg-surface p-6 shadow-card"
    >
      <img
        src="/osito-cositas.svg"
        alt=""
        width={70}
        height={65}
        className="mx-auto mt-1 h-14 w-auto"
      />
      <h1 className="font-display text-xl font-extrabold text-ink">
        Panel de administración
      </h1>
      <p className="text-sm text-ink-soft">
        Correo y contraseña de Supabase Auth (Authentication → Users).
      </p>

      <label className="flex flex-col gap-1 text-sm">
        Correo
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-full border border-line bg-page px-4 py-2 text-sm outline-none transition-colors duration-200 focus:border-accent"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Contraseña
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-full border border-line bg-page px-4 py-2 text-sm outline-none transition-colors duration-200 focus:border-accent"
        />
      </label>

      {error && (
        <p className="rounded-xl bg-blossom-soft px-4 py-2 text-sm text-ink">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-contrast transition-opacity duration-200 hover:opacity-90 active:opacity-75 disabled:opacity-40"
      >
        {busy ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}

/* ── Gestión de productos ──────────────────────────────────────────── */

function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | undefined>();
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    try {
      setProducts(await listAllProducts());
      setError(null);
    } catch (e) {
      setError(messageFromDatabaseError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(draft: ProductDraft) {
    if (editing) {
      await updateProduct(editing.id, draft);
    } else {
      await createProduct(draft);
    }
    setShowForm(false);
    setEditing(undefined);
    await load();
  }

  async function handleDelete(product: Product) {
    if (
      !window.confirm(
        `¿Eliminar “${product.name}” del catálogo? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    try {
      await deleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (e) {
      setError(messageFromDatabaseError(e));
    }
  }

  async function toggleVisible(product: Product) {
    try {
      const updated = await updateProduct(product.id, {
        is_visible: !product.is_visible,
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
      );
    } catch (e) {
      setError(messageFromDatabaseError(e));
    }
  }

  if (loading) {
    return <p className="text-center text-ink-soft">Cargando catálogo…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Administración del catálogo
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditing(undefined);
              setShowForm((v) => !v);
            }}
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-contrast transition-opacity duration-200 hover:opacity-90 active:opacity-75 active:translate-y-px"
          >
            {showForm && !editing ? "Cerrar formulario" : "Nuevo producto"}
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-full px-4 py-2 text-sm text-ink-soft transition-colors duration-200 hover:text-ink"
          >
            Salir
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-blossom-soft px-4 py-2 text-sm text-ink">
          {error}
        </p>
      )}

      {showForm && (
        <ProductForm
          product={editing}
          onSubmit={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditing(undefined);
          }}
        />
      )}

      {products.length === 0 ? (
        <p className="text-center text-ink-soft">
          Aún no hay productos. Crea el primero con “Nuevo producto”.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex flex-wrap items-center gap-4 rounded-3xl border border-line bg-surface p-4 shadow-card"
            >
              <div className="h-14 w-14 overflow-hidden rounded-xl bg-muted">
                {product.images[0] && (
                  <img
                    src={product.images[0]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-bold text-ink">
                  {product.name}
                </p>
                <p className="mt-0.5 text-sm text-ink-soft">
                  <span className="font-semibold text-price">
                    {formatPrice(product.price)}
                  </span>
                  {product.category && (
                    <>
                      {" · "}
                      <span className="rounded-full bg-lilac-soft px-2 py-0.5 text-xs font-semibold text-ink">
                        {product.category}
                      </span>
                    </>
                  )}
                  {product.stock !== null
                    ? ` · stock ${product.stock}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void toggleVisible(product)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  product.is_visible
                    ? "bg-whatsapp-soft text-ink"
                    : "bg-muted text-ink-soft"
                }`}
              >
                {product.is_visible ? "Visible" : "Oculto"}
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(product);
                    setShowForm(true);
                  }}
                  className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink transition-colors duration-200 hover:border-accent"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(product)}
                  className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-blossom transition-colors duration-200 hover:border-blossom"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
