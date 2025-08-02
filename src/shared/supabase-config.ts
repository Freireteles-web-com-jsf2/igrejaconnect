// Configuração para futura integração com Supabase
// Este arquivo está preparado para quando você quiser migrar do sistema atual para Supabase

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

// Configurações de ambiente para Supabase
export const supabaseConfig: SupabaseConfig = {
  url: import.meta.env?.VITE_SUPABASE_URL || 'https://pskaimoanrxcsjeaalrz.supabase.co',
  anonKey: import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBza2FpbW9hbnJ4Y3NqZWFhbHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTIwMjgsImV4cCI6MjA2ODE4ODAyOH0.yQtaXz0Ss854-X47rAM-kMzCdyWdIFf-VE744U3tcYU',
  serviceRoleKey: import.meta.env?.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBza2FpbW9hbnJ4Y3NqZWFhbHJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjYxMjAyOCwiZXhwIjoyMDY4MTg4MDI4fQ.ccp5-Rq-ohrM2k0WlThMwySDapmgnkmNDDD34XizQfo',
};

// Configurações de autenticação social
export const authConfig = {
  google: {
    enabled: true,
    scopes: ['email', 'profile'],
    // Configurações específicas do Google OAuth
    clientId: import.meta.env?.VITE_GOOGLE_CLIENT_ID || '',
    redirectUrl: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '',
  },
  // Outros provedores podem ser adicionados aqui
  facebook: {
    enabled: false,
  },
  github: {
    enabled: false,
  },
};

// Mapeamento de dados do Google para o banco local
export const googleUserMapping = {
  // Campos obrigatórios
  email: 'email',
  name: 'name',
  picture: 'avatar_url',
  
  // Campos opcionais que podem vir do Google
  given_name: 'first_name',
  family_name: 'last_name',
  locale: 'locale',
  
  // Campos específicos da igreja (não vêm do Google)
  church_role: 'Membro', // Valor padrão
  permissions: [],
  is_active: true,
};

// Configurações de sincronização
export const syncConfig = {
  // Sincronizar dados do Google a cada login
  syncOnLogin: true,
  
  // Campos que devem ser sempre atualizados do Google
  alwaysUpdateFields: ['name', 'email', 'picture'],
  
  // Campos que só devem ser atualizados se estiverem vazios localmente
  updateIfEmptyFields: ['given_name', 'family_name'],
  
  // Campos que nunca devem ser sobrescritos
  protectedFields: ['church_role', 'permissions', 'is_active', 'phone', 'address'],
};

// Função para validar configuração do Supabase
export function validateSupabaseConfig(): boolean {
  return !!(supabaseConfig.url && supabaseConfig.anonKey);
}

// Função para obter configuração de autenticação
export function getAuthConfig() {
  return {
    ...authConfig,
    // Adicionar configurações dinâmicas baseadas no ambiente
    redirectUrl: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '',
  };
}

// Tipos para integração futura com Supabase
export interface SupabaseUser {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
    picture?: string;
    given_name?: string;
    family_name?: string;
  };
  app_metadata: {
    provider: string;
    providers: string[];
  };
}

export interface ChurchUserProfile {
  id: string;
  user_id: string; // Referência ao usuário do Supabase
  email: string;
  name: string;
  church_role: string;
  permissions: string[];
  is_active: boolean;
  phone?: string;
  birth_date?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

// Função para migrar dados do sistema atual para Supabase (futura)
export async function migrateToSupabase() {
  // Esta função será implementada quando decidir migrar para Supabase
  console.log('Migração para Supabase não implementada ainda');
  throw new Error('Migração para Supabase não implementada');
}