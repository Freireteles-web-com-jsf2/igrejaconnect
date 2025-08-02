import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationToast from '@/react-app/components/NotificationToast';

interface ToastNotification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationContextType {
  showNotification: (notification: Omit<ToastNotification, 'id'>) => void;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showNotification = useCallback((notification: Omit<ToastNotification, 'id'>) => {
    const id = Date.now();
    const newToast = { ...notification, id };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, message: string) => {
    showNotification({ title, message, type: 'success' });
  }, [showNotification]);

  const showError = useCallback((title: string, message: string) => {
    showNotification({ title, message, type: 'error' });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message: string) => {
    showNotification({ title, message, type: 'warning' });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string) => {
    showNotification({ title, message, type: 'info' });
  }, [showNotification]);

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      
      {/* Render toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{ transform: `translateY(${index * 10}px)` }}
          >
            <NotificationToast
              notification={toast}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}