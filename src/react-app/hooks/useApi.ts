import { useState, useEffect } from 'react';
import { supabase } from '@/shared/supabase';
import { API_CONFIG } from '@/shared/api-config';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ApiStateWithRefetch<T> extends ApiState<T> {
  refetch: () => void;
}

export function useApi<T>(url: string, deps: unknown[] = []): ApiStateWithRefetch<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Se estiver no GitHub Pages, não fazer chamadas de API
      if (API_CONFIG.isGitHubPages) {
        setState({ 
          data: [] as T, 
          loading: false, 
          error: 'API não disponível no GitHub Pages. Use Supabase diretamente.' 
        });
        return;
      }
      
      // Sem autenticação já que as APIs estão temporariamente sem auth
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  useEffect(() => {
    const runFetch = async () => {
      await fetchData();
    };

    runFetch();
  }, [url, ...deps]);

  const refetch = () => {
    fetchData();
  };

  return { ...state, refetch };
}

export async function apiRequest<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // Obter token de autenticação do Supabase
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    
    try {
      const errorData = await response.json();
      if (errorData.error) {
        // Ensure we get a string error message
        if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (typeof errorData.error === 'object' && errorData.error.message) {
          errorMessage = errorData.error.message;
        } else {
          errorMessage = `Erro do servidor: ${JSON.stringify(errorData.error)}`;
        }
      }
    } catch {
      // If response is not JSON, keep the generic error message
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
}
