import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/shared/supabase';
import { useSupabaseAuth } from '@/react-app/hooks/useSupabaseAuth';
import NotificationToast from '@/react-app/components/NotificationToast';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  user_id?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  showToast: (notification: Omit<Notification, 'id' | 'is_read' | 'created_at'>) => void;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useSupabaseAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toastNotifications, setToastNotifications] = useState<Array<Notification & { toastId: string }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Função para buscar notificações
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    }
  };

  // Função para mostrar toast
  const showToast = (notification: Omit<Notification, 'id' | 'is_read' | 'created_at'>) => {
    const toastId = Math.random().toString(36).substring(2, 11);
    const toastNotification = {
      ...notification,
      id: Date.now(),
      is_read: false,
      created_at: new Date().toISOString(),
      toastId,
    };

    setToastNotifications(prev => [...prev, toastNotification]);

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToastNotifications(prev => prev.filter(n => n.toastId !== toastId));
    }, 5000);
  };

  // Função para marcar como lida
  const markAsRead = async (id: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .or(`user_id.eq.${user.id},user_id.is.null`);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  };

  // Função para marcar todas como lidas
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
    }
  };

  // Função para deletar notificação
  const deleteNotification = async (id: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .or(`user_id.eq.${user.id},user_id.is.null`);

      if (error) {
        console.error('Error deleting notification:', error);
        return;
      }

      const notification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));

      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error in deleteNotification:', error);
    }
  };

  // Função para atualizar notificações
  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  // Configurar real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    // Evitar múltiplas chamadas
    let isMounted = true;

    const initializeNotifications = async () => {
      if (isMounted) {
        await fetchNotifications();
      }
    };

    initializeNotifications();

    // Subscribe to real-time changes apenas se o usuário estiver logado
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (!isMounted) return;

          console.log('Real-time notification update:', payload);

          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show toast for new notifications
            showToast({
              title: newNotification.title,
              message: newNotification.message,
              type: newNotification.type,
              user_id: newNotification.user_id,
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedNotification = payload.new as Notification;
            setNotifications(prev =>
              prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            setNotifications(prev => prev.filter(n => n.id !== deletedId));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: 'user_id=is.null', // Global notifications
        },
        (payload) => {
          if (!isMounted) return;

          console.log('Real-time global notification update:', payload);

          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show toast for new global notifications
            showToast({
              title: newNotification.title,
              message: newNotification.message,
              type: newNotification.type,
              user_id: newNotification.user_id,
            });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Polling fallback (in case real-time fails) - menos frequente para evitar loops
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 300000); // Check every 5 minutes (menos frequente)

    return () => clearInterval(interval);
  }, [user?.id]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    showToast,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Render toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toastNotifications.map((notification) => (
          <NotificationToast
            key={notification.toastId}
            notification={notification}
            onClose={() => {
              setToastNotifications(prev =>
                prev.filter(n => n.toastId !== notification.toastId)
              );
            }}
            duration={5000}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}