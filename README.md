<<<<<<< HEAD
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
   + RLS de lectura pública).
3. Publica productos y el catálogo los muestra al instante.

## Estado actual

- ✅ Estructura Vite + Tailwind + TypeScript lista, remotas conectadas.
- ✅ Conexión a Supabase con validación temprana de entorno.
- ✅ Catálogo público: grilla, búsqueda y carrito local.
- ✅ Checkout por WhatsApp con mensaje prellenado (lista + total).
- ✅ Panel `/admin`: login Supabase Auth + CRUD completo de productos.
- 🛠️ Subida de imágenes a Storage desde el panel (hoy se pega una URL).

## Configurar el acceso admin

1. Ejecuta `supabase/schema.sql` (tabla + lectura pública) y
   `supabase/admin-policy.sql` (escrituras para usuarios autenticados).
2. En Supabase → Authentication → Users, crea tu usuario admin.
3. Opcional: agrega `VITE_ADMIN_EMAIL` en `.env.local` para prellenar el login.

## Para probar el checkout sin productos

Mientras no hay filas en `products`, el carrito queda vacío y el botón de
pedido se oculta. Inserta una fila de prueba para ver la grilla:

```sql
insert into public.products (name, description, price, stock)
values ('Producto de prueba', 'Primer artículo del catálogo', 10.00, 5);
```
=======
# tienda
Tienda Online de Inversiones Cositas.
>>>>>>> 21924c4eaa5af8a5e8ae84308a0c4354f5aefade
