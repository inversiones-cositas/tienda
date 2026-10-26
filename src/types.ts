/**
 * Tipos compartidos del dominio de Inversiones Cositas.
 */
export interface Product {
  id: string;
  /** Nombre visible del producto, p. ej. "Perfume Tommy Girl 100ml". */
  name: string;
  description: string | null;
  /** Precio en la moneda del catálogo (sin símbolo). */
  price: number;
  /** Lista de URLs de imágenes del producto. */
  images: string[];
  /** Categoría para filtros del catálogo. */
  category: string | null;
  /** Unidades disponibles. `null` = sin control de stock. */
  stock: number | null;
  /** Los productos no visibles no aparecen en el catálogo público. */
  is_visible: boolean;
  created_at: string;
}

/** Línea del carrito local antes del checkout por WhatsApp. */
export interface CartItem {
  product: Product;
  quantity: number;
}
