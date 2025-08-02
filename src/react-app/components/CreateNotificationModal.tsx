import { useState, useEffect } from 'react';
import { X, Send, Users, User } from 'lucide-react';
import { useApi } from '@/react-app/hooks/useApi';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface CreateNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateNotificationModal({ isOpen, onClose, onSuccess }: CreateNotificationModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    send_to_all: true,
    target_users: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { data: users } = useApi<User[]>('/api/notifications/users');

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        message: '',
        type: 'info',
        send_to_all: true,
        target_users: [],
      });
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar notificação');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserToggle = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      target_users: prev.target_users.includes(userId)
        ? prev.target_users.filter(id => id !== userId)
        : [...prev.target_users, userId]
    }));
  };

  const selectAllUsers = () => {
    setFormData(prev => ({
      ...prev,
      target_users: users?.map(u => u.id) || []
    }));
  };

  const clearAllUsers = () => {
    setFormData(prev => ({
      ...prev,
      target_users: []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Nova Notificação</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Digite o título da notificação"
              required
              maxLength={100}
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Digite a mensagem da notificação"
              required
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.message.length}/500 caracteres
            </p>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="info">ℹ️ Informação</option>
              <option value="success">✅ Sucesso</option>
              <option value="warning">⚠️ Aviso</option>
              <option value="error">❌ Erro</option>
            </select>
          </div>

          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Destinatários
            </label>
            
            {/* Send to all toggle */}
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                id="send_to_all"
                checked={formData.send_to_all}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  send_to_all: e.target.checked,
                  target_users: e.target.checked ? [] : prev.target_users
                }))}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="send_to_all" className="text-sm text-gray-700 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Enviar para todos os usuários
              </label>
            </div>

            {/* Individual user selection */}
            {!formData.send_to_all && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Selecionar usuários específicos
                  </span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={selectAllUsers}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Selecionar todos
                    </button>
                    <span className="text-xs text-gray-400">|</span>
                    <button
                      type="button"
                      onClick={clearAllUsers}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Limpar seleção
                    </button>
                  </div>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-2">
                  {users?.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={formData.target_users.includes(user.id)}
                        onChange={() => handleUserToggle(user.id)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor={`user-${user.id}`} className="flex-1 text-sm text-gray-700 flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.role} • {user.email}</div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>

                {formData.target_users.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.target_users.length} usuário(s) selecionado(s)
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.message.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Enviando...' : 'Enviar Notificação'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}