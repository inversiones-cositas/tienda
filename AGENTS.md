# AGENTS.md — Catálogo de Inversiones Cositas

Proyecto: tienda-catalogo web para **Inversiones Cositas** (Venezuela).
Stack: Vite + React + TypeScript + Tailwind CSS v4 + Supabase.

## Módulos

### 1. Catálogo público (`/`)
- Página principal con la grilla de productos obtenidos de Supabase (tabla `products`).
- Cada producto: imagen, nombre, precio, disponibilidad y botón de acción.
- Carrito local (sin backend): el usuario acumula productos antes de pedir.
- Búsqueda / orden básico. Sección de contacto y redes en el footer.

### 2. Checkout por WhatsApp (`/`)
- No hay pasarela de pago: la venta se cierra **conversando**.
- El botón de pedido arma un mensaje de WhatsApp con la lista del carrito
  (productos, cantidades, precios, total) usando `VITE_WHATSAPP_NUMBER`.
- Deep link `https://wa.me/<numero>?text=<mensaje>` en UTF-8.
- Confirmación de stock, dirección y método de pago se resuelven en el chat.

### 3. Panel de administración (`/admin`)
- ✅ Implementado: login con Supabase Auth (email + contraseña) y CRUD de
  productos (alta, edición, visibilidad, borrado con confirmación).
- Acceso **no anunciado**: no hay enlace "Admin" en el menú público; se
  entra escribiendo `/admin` en la barra o con el atajo secreto
  (Ctrl+Shift+A / Ctrl+Alt+A). La protección real es el login (Supabase
  Auth); el atajo es solo discreción de interfaz.
- Escrituras habilitadas por `supabase/admin-policy.sql` para el rol
  `authenticated`. Imágenes: `supabase/storage-setup.sql` crea el bucket
  público `product-images` con sus políticas.
- Nunca exponer la clave de servicio en el frontend. Solo `anon key`.

### Estilo
- Identidad kawaii boutique: fondo con wash de rosa/lila/miel (siempre vía
  tokens), tarjetas redondeadas con sombras suaves, animaciones discretas
  (`cart-pop`, `twinkle`) con fallback en `prefers-reduced-motion`.
- La caja de música de `MusicWidget.tsx` es melodía sintetizada con Web
  Audio (sin archivos ni licencias); solo suena por decisión del usuario.

## Convenciones
- Lenguaje de la interfaz: español (Venezuela). Moneda según catálogo.
- Variables de entorno con prefijo `VITE_` (ver `.env.example`). `.env.local`
  jamás se commitea.
- Componentes en `src/components`, conectores de datos en `src/lib`,
  tipos compartidos en `src/types.ts`.
- Cada cambio importante se documenta en el commit con mensaje convencional
  (`feat:`, `fix:`, `chore:`…).
