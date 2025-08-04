import { useState } from 'react';
import { useNotificationContext } from '@/react-app/contexts/NotificationContext';
import { Bell, Plus, TestTube } from 'lucide-react';

export default function NotificationTest() {
  const { notifications, unreadCount, showToast } = useNotificationContext();
  const [isCreating, setIsCreating] = useState(false);

  const createTestNotification = async () => {
    setIsCreating(true);
    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '🧪 Teste de Notificação',
          message: `Notificação criada em ${new Date().toLocaleTimeString('pt-BR')}`,
          type: 'info',
          send_to_all: false,
        }),
      });

      if (response.ok) {
        showToast({
          title: '✅ Sucesso!',
          message: 'Notificação de teste criada com sucesso',
          type: 'success',
        });
      } else {
        throw new Error('Erro ao criar notificação');
      }
    } catch (error) {
      console.error('Error creating test notification:', error);
      showToast({
        title: '❌ Erro',
        message: 'Não foi possível criar a notificação de teste',
        type: 'error',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const showTestToast = () => {
    showToast({
      title: '🎉 Toast de Teste',
      message: 'Este é um toast de teste do sistema de notificações!',
      type: 'info',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TestTube className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Teste do Sistema
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Bell className="w-4 h-4" />
          <span>{notifications.length} notificações</span>
          {unreadCount > 0 && (
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
              {unreadCount} não lidas
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          Use os botões abaixo para testar o sistema de notificações:
        </p>

        <div className="flex items-center space-x-3">
          <button
            onClick={showTestToast}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span>Testar Toast</span>
          </button>

          <button
            onClick={createTestNotification}
            disabled={isCreating}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{isCreating ? 'Criando...' : 'Criar Notificação'}</span>
          </button>
        </div>

        {/* Status do Sistema */}
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-800">
              Sistema de Notificações Ativo
            </span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            Contexto carregado, real-time ativo, toasts funcionando
          </p>
        </div>

        {/* Lista de Notificações Recentes */}
        {notifications.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Últimas Notificações:
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {notifications.slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  className={`text-xs p-2 rounded border-l-2 ${
                    notification.is_read
                      ? 'border-gray-300 bg-gray-50 text-gray-600'
                      : 'border-blue-500 bg-blue-50 text-blue-800'
                  }`}
                >
                  <div className="font-medium">{notification.title}</div>
                  <div className="truncate">{notification.message}</div>
                  <div className="text-gray-500 mt-1">
                    {new Date(notification.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}