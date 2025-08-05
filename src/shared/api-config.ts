// Configuração de API para diferentes ambientes
export const API_CONFIG = {
  // Detecta se está rodando no GitHub Pages
  isGitHubPages: typeof window !== 'undefined' && window.location.hostname.includes('github.io'),
  
  // Base URL para APIs
  getApiUrl: (endpoint: string) => {
    // Se estiver no GitHub Pages, não usar APIs backend
    if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
      return null; // Indica que deve usar Supabase diretamente
    }
    
    // Para desenvolvimento local ou outros ambientes
    return endpoint;
  },
  
  // Verifica se deve usar APIs backend ou Supabase direto
  shouldUseBackendApi: () => {
    return !(typeof window !== 'undefined' && window.location.hostname.includes('github.io'));
  }
};