import { useState } from 'react';
import { useApi } from '@/react-app/hooks/useApi';
import { Shield, Users, Eye, EyeOff, Download } from 'lucide-react';
import type { Permission } from '@/shared/permissions';
// import { SYSTEM_ROLES } from '@/shared/permissions'; // Não usado no mock

interface UserWithPermissions {
  id: string;
  email: string;
  name: string | null;
  role: string;
  permissions: string[];
  is_active: boolean;
  google_user_data?: {
    name?: string;
    picture?: string;
  };
}

export default function UserPermissionMatrix() {
  const [showInactiveUsers, setShowInactiveUsers] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string>('');

  const { data: users, loading: usersLoading } = useApi<UserWithPermissions[]>('/api/users');
  const { data: permissions } = useApi<Permission[]>('/api/permissions');

  // Group permissions by module
  const groupedPermissions = permissions?.reduce((groups, permission) => {
    const module = permission.module;
    if (!groups[module]) {
      groups[module] = [];
    }
    groups[module].push(permission);
    return groups;
  }, {} as Record<string, Permission[]>) || {};

  // Filter users
  const filteredUsers = users?.filter(user => 
    showInactiveUsers || user.is_active
  ) || [];

  // Get modules list
  const modules = Object.keys(groupedPermissions);

  const exportMatrix = () => {
    if (!users || !permissions) return;

    const csvContent = [
      ['Usuário', 'Email', 'Papel', 'Status', ...permissions.map(p => p.name)].join(','),
      ...filteredUsers.map(user => [
        user.google_user_data?.name || user.name || user.email,
        user.email,
        user.role,
        user.is_active ? 'Ativo' : 'Inativo',
        ...permissions.map(p => user.permissions.includes(p.name) ? 'Sim' : 'Não')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `matriz_permissoes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getModuleName = (module: string) => {
    const moduleNames: Record<string, string> = {
      dashboard: 'Dashboard',
      members: 'Membros',
      departments: 'Departamentos',
      events: 'Eventos',
      financial: 'Financeiro',
      users: 'Usuários',
      notifications: 'Notificações',
      settings: 'Configurações'
    };
    return moduleNames[module] || module;
  };

  const getActionName = (action: string) => {
    const actionNames: Record<string, string> = {
      view: 'Visualizar',
      create: 'Criar',
      edit: 'Editar',
      delete: 'Excluir',
      export: 'Exportar',
      reports: 'Relatórios',
      permissions: 'Permissões'
    };
    return actionNames[action] || action;
  };

  if (usersLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Matriz de Permissões
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Visualize as permissões de todos os usuários de forma consolidada
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowInactiveUsers(!showInactiveUsers)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                showInactiveUsers 
                  ? 'bg-gray-100 text-gray-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {showInactiveUsers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-sm">
                {showInactiveUsers ? 'Ocultar inativos' : 'Mostrar inativos'}
              </span>
            </button>
            <button
              onClick={exportMatrix}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por módulo:</label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos os módulos</option>
            {modules.map(module => (
              <option key={module} value={module}>
                {getModuleName(module)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Matrix */}
      <div className="p-6">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 sticky left-0 bg-white">
                    Usuário
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 sticky left-32 bg-white">
                    Papel
                  </th>
                  {Object.entries(groupedPermissions)
                    .filter(([module]) => !selectedModule || module === selectedModule)
                    .map(([module, modulePermissions]) => (
                      <th key={module} className="text-center py-3 px-2 font-semibold text-gray-900 min-w-32">
                        <div className="text-xs text-gray-600 mb-1">{getModuleName(module)}</div>
                        <div className="space-y-1">
                          {modulePermissions.map(permission => (
                            <div key={permission.id} className="text-xs text-gray-500 transform -rotate-45 origin-center">
                              {getActionName(permission.action)}
                            </div>
                          ))}
                        </div>
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 sticky left-0 bg-white">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.google_user_data?.picture || '/api/placeholder/32/32'}
                          alt="Profile"
                          className="w-8 h-8 rounded-full border border-gray-200"
                        />
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {user.google_user_data?.name || user.name || user.email}
                          </div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 sticky left-32 bg-white">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'Administrador' 
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'Pastor'
                          ? 'bg-blue-100 text-blue-800'
                          : user.role === 'Tesoureiro'
                          ? 'bg-green-100 text-green-800'
                          : user.role === 'Líder'
                          ? 'bg-orange-100 text-orange-800'
                          : user.role === 'Voluntário'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    {Object.entries(groupedPermissions)
                      .filter(([module]) => !selectedModule || module === selectedModule)
                      .map(([module, modulePermissions]) => (
                        <td key={module} className="py-3 px-2 text-center">
                          <div className="space-y-1">
                            {modulePermissions.map(permission => (
                              <div key={permission.id} className="flex justify-center">
                                {user.permissions.includes(permission.name) ? (
                                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}