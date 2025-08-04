import { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/react-app/hooks/useSupabaseAuth';
import { useNotificationContext } from '@/react-app/contexts/NotificationContext';
import { Bell, BellOff } from 'lucide-react';

export default function PushNotificationManager() {
  const { user } = useSupabaseAuth();
  const { showToast } = useNotificationContext();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verificar se o navegador suporta notificações
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      showToast({
        title: 'Não suportado',
        message: 'Seu navegador não suporta notificações push',
        type: 'warning',
      });
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        showToast({
          title: 'Notificações ativadas!',
          message: 'Você receberá notificações push quando houver novidades',
          type: 'success',
        });

        // Mostrar notificação de teste
        new Notification('IgrejaConnect', {
          body: 'Notificações push ativadas com sucesso!',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      } else if (result === 'denied') {
        showToast({
          title: 'Notificações bloqueadas',
          message: 'Para receber notificações, ative-as nas configurações do navegador',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      showToast({
        title: 'Erro',
        message: 'Não foi possível ativar as notificações',
        type: 'error',
      });
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('Teste - IgrejaConnect', {
        body: 'Esta é uma notificação de teste do sistema',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification',
        requireInteraction: false,
      });
    }
  };

  if (!isSupported || !user) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {permission === 'granted' ? (
            <Bell className="w-5 h-5 text-green-600" />
          ) : (
            <BellOff className="w-5 h-5 text-gray-400" />
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Notificações Push
            </h3>
            <p className="text-xs text-gray-500">
              {permission === 'granted' 
                ? 'Ativadas - você receberá notificações em tempo real'
                : permission === 'denied'
                ? 'Bloqueadas - ative nas configurações do navegador'
                : 'Receba notificações mesmo quando não estiver no site'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {permission === 'granted' && (
            <button
              onClick={sendTestNotification}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              Testar
            </button>
          )}
          
          {permission !== 'granted' && (
            <button
              onClick={requestPermission}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Ativar
            </button>
          )}
        </div>
      </div>

      {permission === 'denied' && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-800">
            <strong>Como ativar:</strong> Clique no ícone de cadeado na barra de endereços → 
            Notificações → Permitir
          </p>
        </div>
      )}
    </div>
  );
}