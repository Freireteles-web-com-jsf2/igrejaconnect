import { useState } from 'react';
import { useApi } from '@/react-app/hooks/useApi';
import { History, User, Shield, Calendar, Download, Filter } from 'lucide-react';
import { getAvatarUrl } from '@/react-app/utils/avatarPlaceholder';

interface AuditEntry {
  id: string;
  user_id: string;
  target_user_id?: string;
  action: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
  target_user?: {
    name: string;
    email: string;
  };
}

interface UserAuditTrailProps {
  userId?: string;
}

export default function UserAuditTrail({ userId }: UserAuditTrailProps) {
  const [timeFilter, setTimeFilter] = useState<string>('7d');
  const [actionFilter, setActionFilter] = useState<string>('');
  
  const { data: auditEntries, loading } = useApi<AuditEntry[]>(
    userId ? `/api/users/${userId}/audit` : '/api/audit/users'
  );

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'user_created':
        return <User className="w-4 h-4 text-green-600" />;
      case 'user_updated':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'user_deactivated':
      case 'user_activated':
        return <User className="w-4 h-4 text-orange-600" />;
      case 'permissions_changed':
      case 'role_changed':
        return <Shield className="w-4 h-4 text-purple-600" />;
      default:
        return <History className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionName = (action: string) => {
    const actionNames: Record<string, string> = {
      user_created: 'Usuário Criado',
      user_updated: 'Usuário Atualizado',
      user_activated: 'Usuário Ativado',
      user_deactivated: 'Usuário Desativado',
      permissions_changed: 'Permissões Alteradas',
      role_changed: 'Papel Alterado',
      login: 'Login Realizado',
      logout: 'Logout Realizado',
      password_changed: 'Senha Alterada'
    };
    return actionNames[action] || action;
  };

  const formatDetails = (action: string, details: Record<string, any>) => {
    switch (action) {
      case 'permissions_changed':
        const added = details.added_permissions || [];
        const removed = details.removed_permissions || [];
        return (
          <div className="text-xs text-gray-600 mt-1">
            {added.length > 0 && (
              <div>+ Adicionadas: {added.join(', ')}</div>
            )}
            {removed.length > 0 && (
              <div>- Removidas: {removed.join(', ')}</div>
            )}
          </div>
        );
      case 'role_changed':
        return (
          <div className="text-xs text-gray-600 mt-1">
            De: {details.old_role} → Para: {details.new_role}
          </div>
        );
      default:
        return null;
    }
  };

  const exportAudit = () => {
    if (!auditEntries) return;

    const csvContent = [
      ['Data/Hora', 'Usuário', 'Ação', 'Usuário Alvo', 'Detalhes', 'IP'].join(','),
      ...auditEntries.map(entry => [
        new Date(entry.created_at).toLocaleString('pt-BR'),
        entry.user?.name || entry.user?.email || 'Sistema',
        getActionName(entry.action),
        entry.target_user?.name || entry.target_user?.email || '-',
        JSON.stringify(entry.details),
        entry.ip_address || '-'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `auditoria_usuarios_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEntries = auditEntries?.filter(entry => {
    const entryDate = new Date(entry.created_at);
    const now = new Date();
    
    let timeMatch = true;
    switch (timeFilter) {
      case '24h':
        timeMatch = (now.getTime() - entryDate.getTime()) <= 1000 * 60 * 60 * 24;
        break;
      case '7d':
        timeMatch = (now.getTime() - entryDate.getTime()) <= 1000 * 60 * 60 * 24 * 7;
        break;
      case '30d':
        timeMatch = (now.getTime() - entryDate.getTime()) <= 1000 * 60 * 60 * 24 * 30;
        break;
    }

    const actionMatch = !actionFilter || entry.action === actionFilter;
    return timeMatch && actionMatch;
  }) || [];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <History className="w-5 h-5 mr-2 text-blue-600" />
              {userId ? 'Histórico do Usuário' : 'Trilha de Auditoria'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Registro completo de todas as ações relacionadas aos usuários
            </p>
          </div>
          <button
            onClick={exportAudit}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Exportar</span>
          </button>
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
              <option value="user_created">Usuário Criado</option>
              <option value="user_updated">Usuário Atualizado</option>
              <option value="permissions_changed">Permissões Alteradas</option>
              <option value="role_changed">Papel Alterado</option>
              <option value="user_activated">Usuário Ativado</option>
              <option value="user_deactivated">Usuário Desativado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Entries */}
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Nenhuma entrada de auditoria encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {getActionIcon(entry.action)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={getAvatarUrl(entry.user?.avatar_url, entry.user?.name, 32)}
                        alt="Profile"
                        className="w-8 h-8 rounded-full border border-gray-200"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {entry.user?.name || 'Sistema'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {entry.user?.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(entry.created_at).toLocaleString('pt-BR')}
                      </p>
                      {entry.ip_address && (
                        <p className="text-xs text-gray-400">
                          IP: {entry.ip_address}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{getActionName(entry.action)}</span>
                      {entry.target_user && (
                        <span> em <span className="font-medium">{entry.target_user.name}</span></span>
                      )}
                    </p>
                    {formatDetails(entry.action, entry.details)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}