import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase con validación temprana de entorno.
 * Falla con mensaje claro si faltan variables en .env.local, en lugar de
 * romperse mysteriousamente al hacer la primera consulta.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Faltan variables de entorno: define VITE_SUPABASE_URL y " +
      "VITE_SUPABASE_ANON_KEY en .env.local (ver .env.example)" +
      " y reinicia el servidor de desarrollo.",
  );
}

if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(SUPABASE_URL)) {
  // Aviso suave: la URL esperada es <ref>.supabase.co
  console.warn(
    `"${SUPABASE_URL}" no parece una URL de proyecto de Supabase.`,
  );
}

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      // El catálogo público no abre sesión; solo /admin la usará.
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);

/** Nombre de la tabla de productos en Supabase. */
export const PRODUCTS_TABLE = "products";
