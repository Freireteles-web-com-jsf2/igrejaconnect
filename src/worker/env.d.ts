// Tipos para as variáveis de ambiente

interface Env {
  // Supabase
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  
  // Database (opcional)
  DB?: any;
}