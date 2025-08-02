// Tipos para as variáveis de ambiente do Cloudflare Workers

interface Env {
  // Supabase
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  
  // Cloudflare D1 Database (se ainda for usado)
  DB?: D1Database;
}