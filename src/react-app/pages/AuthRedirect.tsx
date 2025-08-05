import { useEffect } from 'react';

export default function AuthRedirect() {
  useEffect(() => {
    // Esta página processa redirecionamentos que vêm na URL errada
    // Redireciona de /auth/callback para /igrejaconnect/auth/callback
    
    const currentUrl = window.location.href;
    console.log('AuthRedirect - Current URL:', currentUrl);
    
    // Se estamos em produção e a URL não tem /igrejaconnect
    if (window.location.hostname === 'freireteles-web-com-jsf2.github.io' && 
        !window.location.pathname.includes('/igrejaconnect')) {
      
      // Extrair o hash com os tokens
      const hash = window.location.hash;
      
      // Redirecionar para a URL correta
      const correctUrl = `https://freireteles-web-com-jsf2.github.io/igrejaconnect/auth/callback${hash}`;
      console.log('Redirecting to correct URL:', correctUrl);
      
      window.location.replace(correctUrl);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2 text-blue-600">
            Redirecionando...
          </h2>
          <p className="text-gray-600">
            Corrigindo URL de autenticação...
          </p>
        </div>
      </div>
    </div>
  );
}