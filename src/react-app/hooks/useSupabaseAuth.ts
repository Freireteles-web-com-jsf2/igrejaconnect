import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, type ChurchUser } from '@/shared/supabase';
// import { apiRequest } from '@/react-app/hooks/useApi'; // Temporariamente não usado

interface UseSupabaseAuthReturn {
  user: ChurchUser | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useSupabaseAuth(): UseSupabaseAuthReturn {
  const [user, setUser] = useState<ChurchUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async (session: Session) => {
    try {
      console.log('Fetching user data for:', session.user.email);

      // Temporariamente usar fallback direto para evitar loops
      const fallbackUser = createUserFromAuth(session.user);
      setUser(fallbackUser);
    } catch (err) {
      console.error('Error fetching user data:', err);
      // Fallback to creating user from auth data
      const fallbackUser = createUserFromAuth(session.user);
      setUser(fallbackUser);
    }
  };

  const createUserFromAuth = (authUser: User): ChurchUser => {
    return {
      id: authUser.id,
      email: authUser.email!,
      name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email!,
      role: authUser.email === 'lucianofreireteles@gmail.com' ? 'Administrador' : 'Membro',
      avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
      is_active: true,
      permissions: [],
      phone: null,
      birth_date: null,
      address: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: import.meta.env.VITE_OAUTH_REDIRECT_URL

        }
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Error signing in with Google:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer login com Google');
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer logout');
    }
  };

  const refreshUser = async () => {
    if (session) {
      await fetchUserData(session);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      console.log('Initial session:', session?.user?.email || 'No user');
      setSession(session);

      if (session?.user) {
        // Use setTimeout to avoid setState during render
        setTimeout(async () => {
          if (mounted) {
            await fetchUserData(session);
          }
        }, 0);
      } else {
        setUser(null);
      }

      setIsLoading(false);
    }).catch((error) => {
      console.error('Error getting initial session:', error);
      if (mounted) {
        setError(error.message);
        setIsLoading(false);
      }
    });

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session?.user?.email || 'No user');

      setSession(session);

      if (session?.user) {
        // Use setTimeout to avoid setState during render
        setTimeout(async () => {
          if (mounted) {
            await fetchUserData(session);
          }
        }, 0);
      } else {
        setUser(null);
      }

      if (event !== 'INITIAL_SESSION') {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    isLoading,
    error,
    signInWithGoogle,
    signOut,
    refreshUser,
  };
}