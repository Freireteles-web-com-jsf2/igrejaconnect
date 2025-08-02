import { useState } from 'react';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications } from '@/react-app/hooks/useNotifications';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  // Remova a função abaixo
  // const getNotificationColor = (type: string) => {
  //   switch (type) {
  //     case 'success':
  //       return 'border-l-green-500 bg-green-50';
  //     case 'warning':
  //       return 'border-l-yellow-500 bg-yellow-50';
  //     case 'error':
  //       return 'border-l-red-500 bg-red-50';
  //     default:
  //       return 'border-l-blue-500 bg-blue-50';
  //   }
  // };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}min atrás`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notificações
                </h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Marcar todas como lidas</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 text-lg">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${
                                !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {formatDate(notification.created_at)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.is_read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                  title="Marcar como lida"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Excluir notificação"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Navegar para a página de notificações
                    window.location.href = '/notifications';
                  }}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver todas as notificações
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}