import { useState } from 'react';
// Remova a linha abaixo
// import { useNavigate } from 'react-router';
import { useSupabaseAuth } from '@/react-app/hooks/useSupabaseAuth';
import UserProfile from './UserProfile';
import SyncNotification from './SyncNotification';
import NotificationBell from './NotificationBell';
import { User, ChevronDown, Settings, RefreshCw } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

export default function Header({ title = 'Dashboard' }: HeaderProps) {
  const { user, refreshUser } = useSupabaseAuth();
  // Remova a linha abaixo
  // const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotification, setSyncNotification] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'syncing';
    message: string;
  }>({ visible: false, type: 'success', message: '' });

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncNotification({
      visible: true,
      type: 'syncing',
      message: 'Sincronizando dados com Google...',
    });

    try {
      await refreshUser();
      
      setSyncNotification({
        visible: true,
        type: 'success',
        message: 'Dados sincronizados com sucesso!',
      });
    } catch {
      setSyncNotification({
        visible: true,
        type: 'error',
        message: 'Erro na sincronização',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <NotificationBell />

              {/* Sync Button */}
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:text-gray-300 transition-colors"
                title="Sincronizar com Google"
              >
                <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name || 'Usuário'}
                      className="w-8 h-8 rounded-full border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={() => {
                        setShowProfile(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Ver Perfil
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Configurações
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        // Logout será feito através do UserProfile
                        setShowProfile(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sync Status Indicator */}
        <div className="bg-blue-50 border-t border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-2">
              <p className="text-xs text-blue-600 text-center">
                🔄 Dados sincronizados com Google • Última atualização: {' '}
                {user.updated_at ? 
                  new Date(user.updated_at).toLocaleString('pt-BR') : 
                  'Agora'
                }
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* User Profile Modal */}
      <UserProfile 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
      />

      {/* Sync Notification */}
      <SyncNotification
        isVisible={syncNotification.visible}
        type={syncNotification.type}
        message={syncNotification.message}
        onClose={() => setSyncNotification(prev => ({ ...prev, visible: false }))}
      />

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
}