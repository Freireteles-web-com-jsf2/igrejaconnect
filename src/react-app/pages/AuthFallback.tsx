import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/shared/supabase';

export default function AuthFallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processando autenticação...');

  useEffect(() => {
    const handleAuthFromUrl = async () => {
      try {
        setStatus('loading');
        setMessage('Extraindo dados de autenticação da URL...');
        
        // Extrair parâmetros da URL atual
        const url = new URL(window.location.href);
        const fragment = url.hash.substring(1);
        const params = new URLSearchParams(fragment);
        
        console.log('URL completa:', window.location.href);
        console.log('Fragment:', fragment);
        console.log('Params:', Object.fromEntries(params));
        
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        // const tokenType = params.get('token_type'); // Não usado por enquanto
        
        if (accessToken) {
          setMessage('Token encontrado, configurando sessão...');
          
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
            
            // Limpar a URL
            window.history.replaceState({}, document.title, '/igrejaconnect/');
            
            setTimeout(() => {
              navigate('/');
            }, 2000);
          } else {
            throw new Error('Falha ao criar sessão');
          }
        } else {
          throw new Error('Token de acesso não encontrado na URL');
        }
      } catch (error) {
        console.error('Auth fallback failed:', error);
        setStatus('error');
        setMessage('Falha na autenticação. Tente fazer login novamente.');
      }
    };

    // Verificar se estamos na URL de callback
    if (window.location.hash.includes('access_token')) {
      handleAuthFromUrl();
    } else {
      setStatus('error');
      setMessage('URL de callback inválida');
    }
  }, [navigate]);

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
            {status === 'loading' && 'Processando...'}
            {status === 'success' && 'Login realizado!'}
            {status === 'error' && 'Erro no login'}
          </h2>
          <p className="text-gray-600 mb-4">{message}</p>
          
          {status === 'success' && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                Bem-vindo ao sistema de gestão da igreja!
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700">
                  Houve um problema com a autenticação. Isso pode acontecer quando o GitHub Pages não está configurado corretamente.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}