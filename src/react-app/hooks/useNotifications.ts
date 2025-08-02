import { useState, useEffect } from 'react';
import { useApi } from './useApi';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: notificationsData, refetch: refetchNotifications } = useApi<Notification[]>('/api/notifications');
  const { data: unreadData, refetch: refetchUnreadCount } = useApi<{ count: number }>('/api/notifications/unread-count');

  useEffect(() => {
    if (notificationsData) {
      setNotifications(notificationsData);
    }
  }, [notificationsData]);

  useEffect(() => {
    if (unreadData) {
      setUnreadCount(unreadData.count);
    }
  }, [unreadData]);

  // Polling para atualizar notificações a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      refetchNotifications();
      refetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchNotifications, refetchUnreadCount]);

  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const notification = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        if (notification && !notification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  };

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
        refetchNotifications();
        refetchUnreadCount();
        return await response.json();
      }
      throw new Error('Failed to create notification');
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  const refresh = () => {
    refetchNotifications();
    refetchUnreadCount();
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refresh,
  };
}