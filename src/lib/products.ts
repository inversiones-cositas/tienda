import { supabase, PRODUCTS_TABLE } from "./supabase";
import type { Product } from "../types";

export type ProductDraft = Omit<Product, "id" | "created_at">;

/** Lista todos los productos, incluidos los ocultos (vista de admin). */
export async function listAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createProduct(draft: ProductDraft): Promise<Product> {
  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .insert(draft)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(
  id: string,
  changes: Partial<ProductDraft>,
): Promise<Product> {
  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .update(changes)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from(PRODUCTS_TABLE)
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export function messageFromDatabaseError(e: unknown): string {
  if (e instanceof Error) {
    if (/row-level security/i.test(e.message)) {
      return "Supabase rechazó la operación por RLS: ejecuta supabase/admin-policy.sql para permitir escrituras al rol authenticated.";
    }
    return e.message;
  }
  return "Error desconocido de la base de datos.";
}
