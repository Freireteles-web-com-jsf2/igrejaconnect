import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface ResourceCheck {
  url: string;
  status: 'checking' | 'success' | 'error';
  description: string;
}

export default function Error404Checker() {
  const [resources, setResources] = useState<ResourceCheck[]>([
    {
      url: '/favicon.ico',
      status: 'checking',
      description: 'Favicon do site'
    },
    {
      url: '/api/health',
      status: 'checking',
      description: 'API Health Check'
    },
    {
      url: '/api/notifications',
      status: 'checking',
      description: 'API de Notificações'
    }
  ]);

  const [consoleErrors, setConsoleErrors] = useState<string[]>([]);

  useEffect(() => {
    // Interceptar erros do console
    const originalError = console.error;
    const errors: string[] = [];

    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('404') || message.includes('Failed to load resource')) {
        errors.push(message);
        setConsoleErrors(prev => [...prev, message]);
      }
      originalError.apply(console, args);
    };

    // Verificar recursos
    checkResources();

    return () => {
      console.error = originalError;
    };
  }, []);

  const checkResources = async () => {
    const updatedResources = await Promise.all(
      resources.map(async (resource) => {
        try {
          const response = await fetch(resource.url);
          return {
            ...resource,
            status: response.ok ? 'success' : 'error'
          } as ResourceCheck;
        } catch (error) {
          return {
            ...resource,
            status: 'error'
          } as ResourceCheck;
        }
      })
    );

    setResources(updatedResources);
  };

  const getStatusIcon = (status: ResourceCheck['status']) => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: ResourceCheck['status']) => {
    switch (status) {
      case 'checking':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  const errorCount = resources.filter(r => r.status === 'error').length;
  const successCount = resources.filter(r => r.status === 'success').length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Verificador de Erros 404
        </h3>
      </div>

      {/* Status Geral */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{successCount}</div>
          <div className="text-sm text-green-700">Recursos OK</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          <div className="text-sm text-red-700">Erros 404</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{consoleErrors.length}</div>
          <div className="text-sm text-blue-700">Erros Console</div>
        </div>
      </div>

      {/* Lista de Recursos */}
      <div className="space-y-2 mb-4">
        <h4 className="text-sm font-medium text-gray-900">Recursos Verificados:</h4>
        {resources.map((resource, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center space-x-2">
              {getStatusIcon(resource.status)}
              <span className="text-sm font-mono text-gray-700">{resource.url}</span>
            </div>
            <div className="text-right">
              <div className={`text-xs font-medium ${getStatusColor(resource.status)}`}>
                {resource.status.toUpperCase()}
              </div>
              <div className="text-xs text-gray-500">{resource.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Erros do Console */}
      {consoleErrors.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Erros Detectados no Console:</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {consoleErrors.slice(-5).map((error, index) => (
              <div key={index} className="text-xs bg-red-50 text-red-700 p-2 rounded font-mono">
                {error.length > 100 ? `${error.substring(0, 100)}...` : error}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex items-center space-x-2">
        <button
          onClick={checkResources}
          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
        >
          Verificar Novamente
        </button>
        <button
          onClick={() => {
            setConsoleErrors([]);
          }}
          className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
        >
          Limpar Erros
        </button>
      </div>

      {/* Dicas */}
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
        <h5 className="text-sm font-medium text-yellow-800 mb-1">💡 Dicas:</h5>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• Abra o DevTools (F12) → Console para ver erros em tempo real</li>
          <li>• Erros 404 são normais durante desenvolvimento</li>
          <li>• Recursos externos podem falhar temporariamente</li>
          <li>• Avatars agora usam SVG gerado automaticamente</li>
        </ul>
      </div>
    </div>
  );
}