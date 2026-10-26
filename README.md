# Catálogo de Inversiones Cositas

Tienda-catalogo con **checkout por WhatsApp**: el cliente arma su pedido en la
web y lo envía listo a WhatsApp. Stack: Vite · React · TypeScript · Tailwind
CSS v4 · Supabase. Los módulos y convenciones viven en [`AGENTS.md`](AGENTS.md).

## Puesta en marcha

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # verificación de tipos + bundle de producción
```

1. Copia `.env.example` a `.env.local` y completas las variables reales.
2. Ejecuta `supabase/schema.sql` en tu proyecto de Supabase (tabla `products`
   + RLS de lectura pública). Si ya tenías la tienda creada, ejecuta
   `supabase/migrations/20261026_multi_images.sql` para añadir `images[]`.
3. Publica productos y el catálogo los muestra al instante.

## Estado actual

- ✅ Estructura Vite + Tailwind + TypeScript lista, remotas conectadas.
- ✅ Conexión a Supabase con validación temprana de entorno.
- ✅ Catálogo público: grilla, búsqueda, filtros por burbujas y carrito local.
- ✅ Identidad kawaii boutique: degradados pastel desde tokens, banner de
  bienvenida, destellos, barra flotante del pedido y caja de música lo-fi
  sintetizada (Web Audio, opt-in con Play/Pause).
- ✅ Checkout por WhatsApp con mensaje prellenado (lista + total).
- ✅ Panel `/admin`: login Supabase Auth + CRUD completo de productos.
- ✅ Galería de fotos por producto (`products.images[]`, hasta 8): subida
  múltiple a Storage (bucket `product-images`, máx. 5 MB cada una) desde el
  formulario; la primera foto es la portada.
- ✅ Sub-ventana de detalle: foto principal + miniaturas navegables, ficha
  completa, "Agregar al pedido" y consulta directa por WhatsApp.
- 🛠️ Pendiente opcional: limpieza de imágenes huérfanas al reemplazar/borrar.

## Deploy a producción (Netlify)

Ver `netlify.toml` (build + redirects SPA). Resumen:

1. En Netlify: **Add new site → Import an existing project → GitHub** → repo `tienda`.
2. Framework detectado: Vite (build `npm run build`, publish `dist`).
3. **Environment variables**: copia las variables de `.env.local`
   (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_WHATSAPP_NUMBER`,
   `VITE_STORE_NAME`, opcional `VITE_ADMIN_EMAIL`).
4. En Supabase → Authentication → URL Configuration → agrega la URL
   pública de Netlify a **Redirect URLs** (para que el login de /admin
   funcione en producción).

## Configurar el acceso admin

1. Ejecuta `supabase/schema.sql` (tabla + lectura pública) y
   `supabase/admin-policy.sql` (escrituras para usuarios autenticados).
2. En Supabase → Authentication → Users, crea tu usuario admin.
3. Opcional: agrega `VITE_ADMIN_EMAIL` en `.env.local` para prellenar el login.
4. Entra al panel escribiendo `/admin` en la barra o con el atajo secreto:
   **Ctrl+Shift+A** (alternativa Ctrl+Alt+A). No aparece en el menú.

## Para probar el checkout sin productos

Mientras no hay filas en `products`, el carrito queda vacío y el botón de
pedido se oculta. Inserta una fila de prueba para ver la grilla:

```sql
insert into public.products (name, description, price, stock)
values ('Producto de prueba', 'Primer artículo del catálogo', 10.00, 5);
```
