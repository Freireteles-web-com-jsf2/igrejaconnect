import { useState } from 'react';
// import { useApi } from '@/react-app/hooks/useApi'; // Não usado no mock
import { Clock, User, Shield, Eye, Calendar, Filter } from 'lucide-react';
import { getAvatarUrl } from '@/react-app/utils/avatarPlaceholder';

interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export default function UserActivityLog() {
  const [timeFilter, setTimeFilter] = useState<string>('24h');
  const [actionFilter, setActionFilter] = useState<string>('');

  // Mock data - in a real app, this would come from an API
  const mockActivities: UserActivity[] = [
    {
      id: '1',
      user_id: 'user1',
      action: 'login',
      description: 'Usuário fez login no sistema',
      ip_address: '192.168.1.100',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
      user: {
        name: 'João Silva',
        email: 'joao@igreja.com',
        avatar_url: '/api/placeholder/32/32'
      }
    },
    {
      id: '2',
      user_id: 'user2',
      action: 'permission_change',
      description: 'Permissões do usuário foram alteradas',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      user: {
        name: 'Maria Santos',
        email: 'maria@igreja.com',
        avatar_url: '/api/placeholder/32/32'
      }
    },
    {
      id: '3',
      user_id: 'user3',
      action: 'role_change',
      description: 'Papel do usuário alterado para Líder',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      user: {
        name: 'Pedro Costa',
        email: 'pedro@igreja.com',
        avatar_url: '/api/placeholder/32/32'
      }
    },
    {
      id: '4',
      user_id: 'user4',
      action: 'logout',
      description: 'Usuário fez logout do sistema',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
      user: {
        name: 'Ana Oliveira',
        email: 'ana@igreja.com',
        avatar_url: '/api/placeholder/32/32'
      }
    },
    {
      id: '5',
      user_id: 'user5',
      action: 'status_change',
      description: 'Usuário foi desativado',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
      user: {
        name: 'Carlos Ferreira',
        email: 'carlos@igreja.com',
        avatar_url: '/api/placeholder/32/32'
      }
    }
  ];

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <User className="w-4 h-4 text-green-600" />;
      case 'logout':
        return <User className="w-4 h-4 text-gray-600" />;
      case 'permission_change':
      case 'role_change':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'status_change':
        return <Eye className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'login':
        return 'bg-green-100 text-green-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      case 'permission_change':
      case 'role_change':
        return 'bg-blue-100 text-blue-800';
      case 'status_change':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionName = (action: string) => {
    const actionNames: Record<string, string> = {
      login: 'Login',
      logout: 'Logout',
      permission_change: 'Alteração de Permissão',
      role_change: 'Alteração de Papel',
      status_change: 'Alteração de Status'
    };
    return actionNames[action] || action;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} dias atrás`;
  };

  // Filter activities based on time and action
  const filteredActivities = mockActivities.filter(activity => {
    const activityDate = new Date(activity.created_at);
    const now = new Date();
    
    let timeMatch = true;
    switch (timeFilter) {
      case '1h':
        timeMatch = (now.getTime() - activityDate.getTime()) <= 1000 * 60 * 60;
        break;
      case '24h':
        timeMatch = (now.getTime() - activityDate.getTime()) <= 1000 * 60 * 60 * 24;
        break;
      case '7d':
        timeMatch = (now.getTime() - activityDate.getTime()) <= 1000 * 60 * 60 * 24 * 7;
        break;
      case '30d':
        timeMatch = (now.getTime() - activityDate.getTime()) <= 1000 * 60 * 60 * 24 * 30;
        break;
    }

    const actionMatch = !actionFilter || activity.action === actionFilter;

    return timeMatch && actionMatch;
  });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Log de Atividades
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Acompanhe as atividades recentes dos usuários
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1h">Última hora</option>
              <option value="24h">Últimas 24 horas</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas as ações</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="permission_change">Alteração de Permissão</option>
              <option value="role_change">Alteração de Papel</option>
              <option value="status_change">Alteração de Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="p-6">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Nenhuma atividade encontrada no período selecionado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {getActionIcon(activity.action)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={getAvatarUrl(activity.user?.avatar_url, activity.user?.name, 32)}
                        alt="Profile"
                        className="w-8 h-8 rounded-full border border-gray-200"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.user?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.user?.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(activity.action)}`}>
                        {getActionName(activity.action)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(activity.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-2">
                    {activity.description}
                  </p>
                  
                  {activity.ip_address && (
                    <p className="text-xs text-gray-500 mt-1">
                      IP: {activity.ip_address}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}