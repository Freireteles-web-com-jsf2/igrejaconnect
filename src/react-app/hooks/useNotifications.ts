import { useNotificationContext } from '@/react-app/contexts/NotificationContext';

// Hook wrapper para manter compatibilidade com código existente
export function useNotifications() {
  const context = useNotificationContext();
  
  const createNotification = async (data: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    send_to_all?: boolean;
    target_users?: string[];
  }) => {
    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await context.refreshNotifications();
        return await response.json();
      }
      throw new Error('Failed to create notification');
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  return {
    notifications: context.notifications,
    unreadCount: context.unreadCount,
    markAsRead: context.markAsRead,
    markAllAsRead: context.markAllAsRead,
    deleteNotification: context.deleteNotification,
    createNotification,
    refresh: context.refreshNotifications,
  };
}