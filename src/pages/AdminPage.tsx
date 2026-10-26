/**
 * Panel /admin — esqueleto de la Etapa 1.
 * La autenticación con Supabase Auth y el CRUD de productos quedan
 * documentados en AGENTS.md (Módulo 3) y se construyen como siguiente fase.
 */
export default function AdminPage() {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-line bg-surface p-8 text-center">
      <h1 className="font-display text-xl font-semibold text-ink">
        Panel de administración
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Módulo en construcción. A la fecha, el catálogo se gestiona
        directamente en Supabase (tabla <code>products</code>).
      </p>
      <p className="mt-4 text-xs text-ink-soft">
        Próximo hito: inicio de sesión con Supabase Auth y CRUD de productos
        desde esta interfaz.
      </p>
    </div>
  );
}
