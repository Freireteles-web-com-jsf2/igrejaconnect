import { useState, useEffect } from 'react';
import { supabase } from '@/shared/supabase';
import { API_CONFIG } from '@/shared/api-config';

interface DataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface DataStateWithRefetch<T> extends DataState<T> {
  refetch: () => void;
}

// Hook que usa Supabase diretamente quando no GitHub Pages
export function useSupabaseData<T>(
  tableName: string,
  apiEndpoint?: string,
  deps: unknown[] = []
): DataStateWithRefetch<T> {
  const [state, setState] = useState<DataState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Se estiver no GitHub Pages, usar Supabase diretamente
      if (API_CONFIG.isGitHubPages) {
        const { data, error } = await supabase
          .from(tableName)
          .select('*');
          
        if (error) {
          throw new Error(error.message);
        }
        
        setState({ data: data as T, loading: false, error: null });
      } else if (apiEndpoint) {
        // Usar API backend em outros ambientes
        const response = await fetch(apiEndpoint, {
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
      } else {
        throw new Error('No API endpoint provided for non-GitHub Pages environment');
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [tableName, apiEndpoint, ...deps]);

  const refetch = () => {
    fetchData();
  };

  return { ...state, refetch };
}