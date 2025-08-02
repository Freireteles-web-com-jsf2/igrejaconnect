import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, RefreshCw, X } from 'lucide-react';

interface SyncNotificationProps {
  isVisible: boolean;
  type: 'success' | 'error' | 'syncing';
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export default function SyncNotification({
  isVisible,
  type,
  message,
  onClose,
  autoClose = true,
  duration = 3000
}: SyncNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);

      if (autoClose && type !== 'syncing') {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, autoClose, duration, type, onClose, handleClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'syncing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'syncing':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'syncing':
        return 'text-blue-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`
          ${getBackgroundColor()} 
          border rounded-lg shadow-lg p-4 max-w-sm
          transform transition-all duration-300 ease-in-out
          ${isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>

          <div className="flex-1">
            <p className={`text-sm font-medium ${getTextColor()}`}>
              {type === 'success' && 'Sincronização Concluída'}
              {type === 'error' && 'Erro na Sincronização'}
              {type === 'syncing' && 'Sincronizando...'}
            </p>
            <p className={`text-xs mt-1 ${getTextColor()} opacity-80`}>
              {message}
            </p>
          </div>

          {type !== 'syncing' && (
            <button
              onClick={handleClose}
              className={`flex-shrink-0 ${getTextColor()} opacity-60 hover:opacity-100 transition-opacity`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress bar for syncing */}
        {type === 'syncing' && (
          <div className="mt-3">
            <div className="w-full bg-blue-200 rounded-full h-1">
              <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}