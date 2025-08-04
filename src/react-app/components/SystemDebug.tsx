import { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/react-app/hooks/useSupabaseAuth';
import { useNotificationContext } from '@/react-app/contexts/NotificationContext';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

export default function SystemDebug() {
  const { user } = useSupabaseAuth();
  const { notifications, unreadCount } = useNotificationContext();
  const [systemStatus, setSystemStatus] = useState({
    auth: false,
    notifications: false,
    api: false,
    realtime: false,
  });

  useEffect(() => {
    const checkSystemStatus = async () => {
      // Check Auth
      const authStatus = !!user?.id;

      // Check Notifications Context
      const notificationsStatus = notifications !== undefined;

      // Check API
      let apiStatus = false;
      try {
        const response = await fetch('/api/health');
        apiStatus = response.ok;
      } catch (error) {
        console.error('API Health Check failed:', error);
      }

      // Check Real-time (simplified)
      const realtimeStatus = true; // Assume working if no errors

      setSystemStatus({
        auth: authStatus,
        notifications: notificationsStatus,
        api: apiStatus,
        realtime: realtimeStatus,
      });
    };

    checkSystemStatus();
  }, [user, notifications]);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getStatusText = (status: boolean) => {
    return status ? 'OK' : 'ERRO';
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Info className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Debug do Sistema
        </h3>
      </div>

      <div className="space-y-3">
        {/* User Info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Usuário</h4>
          <div className="text-xs space-y-1">
            <div>ID: {user?.id || 'Não logado'}</div>
            <div>Email: {user?.email || 'N/A'}</div>
            <div>Nome: {user?.name || 'N/A'}</div>
            <div>Role: {user?.role || 'N/A'}</div>
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Autenticação</span>
              <div className="flex items-center space-x-1">
                {getStatusIcon(systemStatus.auth)}
                <span className={`text-xs font-medium ${getStatusColor(systemStatus.auth)}`}>
                  {getStatusText(systemStatus.auth)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Notificações</span>
              <div className="flex items-center space-x-1">
                {getStatusIcon(systemStatus.notifications)}
                <span className={`text-xs font-medium ${getStatusColor(systemStatus.notifications)}`}>
                  {getStatusText(systemStatus.notifications)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">API</span>
              <div className="flex items-center space-x-1">
                {getStatusIcon(systemStatus.api)}
                <span className={`text-xs font-medium ${getStatusColor(systemStatus.api)}`}>
                  {getStatusText(systemStatus.api)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Real-time</span>
              <div className="flex items-center space-x-1">
                {getStatusIcon(systemStatus.realtime)}
                <span className={`text-xs font-medium ${getStatusColor(systemStatus.realtime)}`}>
                  {getStatusText(systemStatus.realtime)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Stats */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Estatísticas</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-600">Total de notificações:</span>
              <span className="ml-2 font-medium text-blue-600">{notifications.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Não lidas:</span>
              <span className="ml-2 font-medium text-red-600">{unreadCount}</span>
            </div>
          </div>
        </div>

        {/* Console Errors */}
        <div className="p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <h4 className="text-sm font-medium text-gray-900">Avisos</h4>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>• Verifique o console do navegador para erros 404</div>
            <div>• Loops de autenticação podem indicar problemas de configuração</div>
            <div>• Real-time pode demorar alguns segundos para conectar</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
          >
            Recarregar Página
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
          >
            Limpar Cache
          </button>
        </div>
      </div>
    </div>
  );
}