import { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface DebugInfo {
  status: number | string;
  ok: boolean;
  data?: unknown;
  error?: string;
  timestamp: string;
}

export default function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testAuthEndpoint = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/oauth/google/redirect_url', {
        credentials: 'include',
      });
      
      const data = await response.json();
      
      setDebugInfo({
        status: response.status,
        ok: response.ok,
        data: data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      setDebugInfo({
        status: 'ERROR',
        ok: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border p-4 max-w-md z-50">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        🔧 Debug da Autenticação
      </h3>
      
      <button
        onClick={testAuthEndpoint}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors mb-3"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
            Testando...
          </>
        ) : (
          'Testar Endpoint de Auth'
        )}
      </button>

      {debugInfo && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            {debugInfo.ok ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span className={`font-medium ${debugInfo.ok ? 'text-green-700' : 'text-red-700'}`}>
              Status: {debugInfo.status}
            </span>
          </div>
          
          <div className="bg-gray-50 rounded p-2 text-xs">
            <pre className="whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
          
          <div className="text-xs text-gray-500">
            {debugInfo.timestamp}
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-600">
        <p><strong>Problemas comuns:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Variável MOCHA_USERS_SERVICE_API_KEY não configurada</li>
          <li>Chave API inválida ou expirada</li>
          <li>Projeto não configurado no Mocha</li>
        </ul>
      </div>
    </div>
  );
}