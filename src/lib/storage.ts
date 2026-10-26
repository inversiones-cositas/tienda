import { supabase } from "./supabase";

/**
 * Subida de imágenes de productos al bucket público "product-images"
 * de Supabase Storage. Devuelve la URL pública lista para la tarjeta.
 */

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB por imagen

export async function uploadProductImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo no es una imagen (usa PNG, JPG o WebP).");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("La imagen supera los 5 MB. Redúcela e intenta de nuevo.");
  }

  const safeName = file.name.replace(/[^a-z0-9.\-_]/gi, "-");
  const path = `${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) {
    throw new Error(translateStorageError(error.message));
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function translateStorageError(message: string): string {
  if (/row-level security/i.test(message)) {
    return "Supabase rechazó la subida por RLS: ejecuta supabase/storage-setup.sql.";
  }
  if (/bucket/i.test(message) && /not found/i.test(message)) {
    return "No existe el bucket. Ejecuta supabase/storage-setup.sql en Supabase.";
  }
  if (/already exists/i.test(message)) {
    return "Ya existe una imagen con ese nombre. Cambia el nombre del archivo.";
  }
  return message;
}
