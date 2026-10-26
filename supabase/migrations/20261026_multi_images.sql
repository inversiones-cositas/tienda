-- Migración: Soporte para múltiples imágenes en Inversiones Cositas
-- Ejecutar en el SQL Editor de Supabase

-- 1. Añadir la columna images como un array de texto
ALTER TABLE products ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- 2. Migrar datos existentes (si image_url tiene valor, ponerlo como primer elemento del array)
UPDATE products 
SET images = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND (images IS NULL OR array_length(images, 1) IS NULL);

-- 3. (Opcional) Si decides dejar de usar image_url más adelante, puedes borrarla:
-- ALTER TABLE products DROP COLUMN image_url;
