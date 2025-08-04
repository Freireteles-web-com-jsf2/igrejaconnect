import { useState } from 'react';
import { useSupabaseAuth } from '@/react-app/hooks/useSupabaseAuth';
import { Mail, Phone, Calendar, MapPin, Shield, LogOut, Settings } from 'lucide-react';
import { getAvatarUrl } from '@/react-app/utils/avatarPlaceholder';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user, signOut } = useSupabaseAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen || !user) return null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Perfil do Usuário</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {/* Avatar and Basic Info */}
          <div className="text-center mb-6">
            <img
              src={getAvatarUrl(user.avatar_url, user.name, 80)}
              alt={user.name || 'Usuário'}
              className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-blue-100"
            />
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {user.name || user.email}
            </h3>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <Shield className="w-4 h-4 mr-1" />
              {user.role}
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-medium text-gray-900">{user.phone}</p>
                </div>
              </div>
            )}

            {user.birth_date && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Data de Nascimento</p>
                  <p className="font-medium text-gray-900">
                    {new Date(user.birth_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )}

            {user.address && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Endereço</p>
                  <p className="font-medium text-gray-900">{user.address}</p>
                </div>
              </div>
            )}

            {/* Permissions */}
            {user.permissions && user.permissions.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Permissões</p>
                <div className="flex flex-wrap gap-1">
                  {user.permissions.slice(0, 3).map((permission) => (
                    <span
                      key={permission}
                      className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                    >
                      {permission.split('.')[0]}
                    </span>
                  ))}
                  {user.permissions.length > 3 && (
                    <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                      +{user.permissions.length - 3} mais
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Account Status */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Status da Conta</p>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`text-sm font-medium ${user.is_active ? 'text-green-700' : 'text-red-700'}`}>
                  {user.is_active ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-3">
            <button
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Configurações</span>
            </button>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>{isLoggingOut ? 'Saindo...' : 'Sair'}</span>
            </button>
          </div>

          {/* Sync Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 text-center">
              Dados sincronizados com Google • Última atualização: {' '}
              {user.updated_at ? 
                new Date(user.updated_at).toLocaleDateString('pt-BR') : 
                'Agora'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}