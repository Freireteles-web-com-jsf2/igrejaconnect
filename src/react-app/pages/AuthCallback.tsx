import { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/react-app/hooks/useSupabaseAuth';
import { useNavigate, useLocation } from 'react-router';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/shared/supabase';

export default function AuthCallback() {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Finalizando login...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('loading');
        setMessage('Processando autenticação...');
        
        console.log('Current URL:', window.location.href);
        console.log('Location search:', location.search);
        console.log('Location hash:', location.hash);
        
        // Verificar se há parâmetros de callback na URL
        const urlParams = new URLSearchParams(location.search);
        const hashParams = new URLSearchParams(location.hash.substring(1));
        
        console.log('URL Params:', Object.fromEntries(urlParams));
        console.log('Hash Params:', Object.fromEntries(hashParams));
        
        // Se há access_token no hash, processar manualmente
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken) {
          console.log('Found access token in URL, setting session...');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });
          
          if (error) {
            throw error;
          }
          
          if (data.session) {
            setStatus('success');
            setMessage('Login realizado com sucesso! Redirecionando...');
            
            setTimeout(() => {
              navigate('/');
            }, 1500);
            return;
          }
        }
        
        // Fallback: aguardar processamento automático do Supabase
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verificar se há sessão
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session) {
          setStatus('success');
          setMessage('Login realizado com sucesso! Redirecionando...');
          
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          throw new Error('Sessão não encontrada');
        }
      } catch (error) {
        console.error('Authentication failed:', error);
        setStatus('error');
        setMessage('Falha na autenticação. Redirecionando para login...');
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, location]);

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (user && status !== 'loading') {
      navigate('/');
    }
  }, [user, navigate, status]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto mb-4">
            {getStatusIcon()}
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${getStatusColor()}`}>
            {status === 'loading' && 'Finalizando login...'}
            {status === 'success' && 'Login realizado!'}
            {status === 'error' && 'Erro no login'}
          </h2>
          <p className="text-gray-600">{message}</p>
          
          {status === 'success' && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                Bem-vindo ao sistema de gestão da igreja!
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700">
                Tente fazer login novamente. Se o problema persistir, entre em contato com o administrador.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
