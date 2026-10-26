import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

/**
 * Autenticación del panel /admin con Supabase Auth (email + contraseña).
 * El catálogo público nunca abre sesión: solo este módulo la usa.
 */
export async function signIn(
  email: string,
  password: string,
): Promise<string | null> {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return translateAuthError(error.message);
  return null;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

/** Devuelve la sesión activa, restaurada del almacenamiento local. */
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

function translateAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) {
    return "Correo o contraseña incorrectos.";
  }
  if (/email not confirmed/i.test(message)) {
    return "Confirma tu correo en el enlace de Supabase antes de entrar.";
  }
  if (/too many requests/i.test(message)) {
    return "Demasiados intentos. Espera un momento y prueba de nuevo.";
  }
  return message;
}
