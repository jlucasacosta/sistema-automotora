// Placeholder de auth. Reemplazar por Supabase Auth (@supabase/ssr) al
// conectar el backend. Ver BACKEND_RULES.md. NUNCA Clerk.
export async function getSession() {
  return { user: { id: "demo", name: "Usuario Demo" } }
}
