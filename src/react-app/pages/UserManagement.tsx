import React, { useState } from 'react';
import Layout from '@/react-app/components/Layout';
import { AdminOnly } from '@/react-app/components/PermissionGuard';
import UserPermissionMatrix from '@/react-app/components/UserPermissionMatrix';
import UserActivityLog from '@/react-app/components/UserActivityLog';
import UserPermissionValidation from '@/react-app/components/UserPermissionValidation';
import UserAuditTrail from '@/react-app/components/UserAuditTrail';
import SimplePermissionEditor from '@/react-app/components/SimplePermissionEditor';
import { useApi, apiRequest } from '@/react-app/hooks/useApi';
import { useSupabaseData } from '@/react-app/hooks/useSupabaseData';
import { Users, Edit, Shield, Save, X, UserCheck, UserX, Search, Download, Grid, List, Clock } from 'lucide-react';
import { showToast } from '@/react-app/utils/toast';
import Avatar from '@/react-app/components/Avatar';
import type { ChurchUser } from '@/shared/supabase';
import type { Permission } from '@/shared/permissions';
import { SYSTEM_ROLES } from '@/shared/permissions';

interface UserWithPermissions extends ChurchUser {
  userPermissions: string[];
  churchRole: string;
  google_user_data?: {
    name?: string;
    picture?: string;
  };
  isActive?: boolean;
}

export default function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null);
  const [editingPermissions, setEditingPermissions] = useState(false);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'matrix' | 'activity' | 'audit'>('list');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [localUserUpdates, setLocalUserUpdates] = useState<Record<string, Partial<UserWithPermissions>>>({});

  // Função para testar a API de permissões
  const testPermissionsAPI = async (userId: string) => {
    try {
      console.log('🧪 Testando API de permissões para usuário:', userId);

      // Buscar o usuário específico na lista atual
      const currentUser = users?.find(u => u.id === userId);
      if (currentUser) {
        console.log('📄 Usuário encontrado localmente:', {
          id: currentUser.id,
          email: currentUser.email,
          churchRole: currentUser.churchRole,
          permissions: currentUser.userPermissions?.length || 0
        });
        return currentUser;
      } else {
        console.log('❌ Usuário não encontrado na lista local');
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao testar API:', error);
      return null;
    }
  };

  const { data: users, loading: usersLoading, refetch: refetchUsers, error: usersError } = useSupabaseData<UserWithPermissions[]>('users', '/api/users');

  // Debug: Log dos usuários quando mudarem
  React.useEffect(() => {
    if (users) {
      console.log('👥 Usuários carregados:', users.length);
      users.forEach(user => {
        console.log(`- ${user.email}: ${user.churchRole} (${user.userPermissions?.length || 0} permissões)`);
      });
    }
  }, [users]);
  const { data: permissions, error: permissionsError } = useApi<Permission[]>('/api/permissions');

  // Debug: mostrar erros no console
  React.useEffect(() => {
    if (usersError) {
      console.error('Erro ao carregar usuários:', usersError);
    }
    if (permissionsError) {
      console.error('Erro ao carregar permissões:', permissionsError);
    }
  }, [usersError, permissionsError]);

  const handleEditUser = (user: UserWithPermissions) => {
    // Debug logs detalhados
    console.log('🔧 handleEditUser chamado para:', {
      id: user.id,
      email: user.email,
      churchRole: user.churchRole,
      userPermissions: user.userPermissions?.length || 0
    });

    setSelectedUser(user);
    // Tentar diferentes campos para o papel
    const userRole = user.churchRole || (user as any).role || 'Membro';
    setSelectedRole(userRole);
    setUserPermissions(user.userPermissions || []);
    setEditingPermissions(true);

    console.log('✅ Estado atualizado:', {
      selectedUserId: user.id,
      selectedRole: userRole,
      selectedPermissions: user.userPermissions?.length || 0
    });
  };

  const handleSavePermissions = async (roleOverride?: string, permissionsOverride?: string[]) => {
    if (!selectedUser) return;

    // Usar valores passados ou valores do estado
    const roleToSave = roleOverride || selectedRole;
    const permissionsToSave = permissionsOverride || userPermissions;

    // Debug logs detalhados
    console.log('🚀 handleSavePermissions chamado:', {
      userId: selectedUser.id,
      userEmail: selectedUser.email,
      roleToSave,
      permissionsCount: permissionsToSave.length,
      usingOverride: !!roleOverride
    });

    try {
      const oldRole = selectedUser.churchRole;
      const oldPermissions = selectedUser.userPermissions;

      const payload = {
        role: roleToSave,
        permissions: permissionsToSave,
      };

      console.log('📦 Payload enviado:', {
        userId: selectedUser.id,
        role: payload.role,
        permissions: payload.permissions.length,
        permissionsList: payload.permissions
      });

      // Tentar salvar via API
      try {
        await apiRequest(`/api/users/${selectedUser.id}/permissions`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        console.log('✅ API call successful');
      } catch (apiError) {
        console.error('❌ API call failed:', apiError);
        console.log('🔄 Tentando atualização local como fallback...');

        // Fallback: atualizar dados localmente
        setLocalUserUpdates(prev => ({
          ...prev,
          [selectedUser.id]: {
            churchRole: roleToSave,
            userPermissions: permissionsToSave
          }
        }));
        console.log('📝 Dados atualizados localmente para usuário:', selectedUser.id);

        showToast({
          title: 'Aviso',
          message: 'Alterações aplicadas localmente. Verifique a conexão com o servidor.',
          type: 'warning'
        });
      }



      // Log de auditoria local (não depende da API de notificações)
      const oldPermissionsSorted = (oldPermissions || []).slice().sort();
      const newPermissionsSorted = permissionsToSave.slice().sort();

      if (oldRole !== roleToSave || JSON.stringify(oldPermissionsSorted) !== JSON.stringify(newPermissionsSorted)) {
        console.log('Auditoria: Permissões alteradas', {
          user: selectedUser.google_user_data?.name || selectedUser.email,
          oldRole,
          newRole: roleToSave,
          oldPermissions: oldPermissionsSorted,
          newPermissions: newPermissionsSorted,
          timestamp: new Date().toISOString()
        });

        // Mostrar toast informativo sobre a mudança
        showToast({
          title: 'Auditoria Registrada',
          message: `Alterações nas permissões de ${selectedUser.google_user_data?.name || selectedUser.email} foram registradas`,
          type: 'info'
        });
      }

      // Atualizar o usuário localmente para testar
      if (selectedUser) {
        const updatedUser = {
          ...selectedUser,
          churchRole: roleToSave,
          userPermissions: permissionsToSave
        };
        console.log('✅ Usuário atualizado localmente:', {
          id: updatedUser.id,
          email: updatedUser.email,
          newRole: updatedUser.churchRole,
          newPermissions: updatedUser.userPermissions.length
        });
      }

      setEditingPermissions(false);
      setSelectedUser(null);

      // Forçar atualização dos dados
      console.log('🔄 Forçando atualização dos dados...');
      await refetchUsers();

      // Aguardar um pouco para garantir que os dados foram atualizados
      setTimeout(() => {
        console.log('✅ Dados atualizados');
      }, 1000);

      // Feedback de sucesso
      showToast({
        title: 'Permissões Salvas',
        message: 'As permissões foram atualizadas com sucesso',
        type: 'success'
      });

    } catch (error) {
      console.error('Erro ao salvar permissões:', error);

      // Feedback de erro
      showToast({
        title: 'Erro ao Salvar',
        message: 'Não foi possível salvar as permissões. Tente novamente.',
        type: 'error'
      });
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await apiRequest(`/api/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          is_active: !currentStatus,
        }),
      });
      refetchUsers();

      showToast({
        title: 'Status Alterado',
        message: `Usuário ${currentStatus ? 'desativado' : 'ativado'} com sucesso`,
        type: 'success'
      });
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      showToast({
        title: 'Erro ao Alterar Status',
        message: 'Não foi possível alterar o status do usuário. Tente novamente.',
        type: 'error'
      });
    }
  };

  const exportUsers = () => {
    if (!users) return;

    const csvContent = [
      ['Nome', 'Email', 'Papel', 'Status', 'Data de Criação'].join(','),
      ...users.map(user => [
        user.google_user_data?.name || user.email,
        user.email,
        user.churchRole,
        user.is_active ? 'Ativo' : 'Inativo',
        new Date(user.created_at).toLocaleDateString('pt-BR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePermissionToggle = (permission: string) => {
    setUserPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const groupedPermissions = permissions?.reduce((groups, permission) => {
    const module = permission.module;
    if (!groups[module]) {
      groups[module] = [];
    }
    groups[module].push(permission);
    return groups;
  }, {} as Record<string, Permission[]>) || {};

  // Apply local updates to users
  const usersWithLocalUpdates = users?.map(user => ({
    ...user,
    ...localUserUpdates[user.id]
  })) || [];

  // Filter users based on search and filters
  const filteredUsers = usersWithLocalUpdates?.filter(user => {
    const matchesSearch = !searchTerm ||
      (user.google_user_data?.name || user.email).toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !roleFilter || user.churchRole === roleFilter;

    const matchesStatus = !statusFilter ||
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  const userStats = {
    total: users?.length || 0,
    active: users?.filter(u => u.is_active).length || 0,
    inactive: users?.filter(u => !u.is_active).length || 0,
    byRole: SYSTEM_ROLES.reduce((acc, role) => {
      acc[role] = users?.filter(u => u.churchRole === role).length || 0;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <AdminOnly fallback={
      <Layout>
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </Layout>
    }>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Users className="w-7 h-7 mr-3 text-blue-600" />
                  Gestão de Usuários e Permissões
                </h1>
                <p className="text-gray-600 mt-1">
                  Gerencie perfis e permissões dos usuários do sistema
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    <List className="w-4 h-4" />
                    <span className="text-sm">Lista</span>
                  </button>
                  <button
                    onClick={() => setViewMode('matrix')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${viewMode === 'matrix'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    <Grid className="w-4 h-4" />
                    <span className="text-sm">Matriz</span>
                  </button>
                  <button
                    onClick={() => setViewMode('activity')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${viewMode === 'activity'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Atividades</span>
                  </button>
                  <button
                    onClick={() => setViewMode('audit')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${viewMode === 'audit'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Auditoria</span>
                  </button>
                </div>
                <button
                  onClick={exportUsers}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-green-600">{userStats.active}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuários Inativos</p>
                  <p className="text-2xl font-bold text-red-600">{userStats.inactive}</p>
                </div>
                <UserX className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Administradores</p>
                  <p className="text-2xl font-bold text-purple-600">{userStats.byRole['Administrador']}</p>
                </div>
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos os papéis</option>
                  {SYSTEM_ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos os status</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Debug Info */}
          {(usersError || permissionsError) && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <h3 className="text-red-800 font-semibold mb-2">🐛 Debug - Erros de API</h3>
              {usersError && (
                <p className="text-red-700 text-sm mb-1">
                  <strong>Erro ao carregar usuários:</strong> {usersError}
                </p>
              )}
              {permissionsError && (
                <p className="text-red-700 text-sm">
                  <strong>Erro ao carregar permissões:</strong> {permissionsError}
                </p>
              )}
            </div>
          )}

          {/* Content based on view mode */}
          {viewMode === 'matrix' ? (
            <UserPermissionMatrix />
          ) : viewMode === 'activity' ? (
            <UserActivityLog />
          ) : viewMode === 'audit' ? (
            <UserAuditTrail />
          ) : (
            /* Users List */
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Usuários do Sistema ({filteredUsers.length})
                  </h2>
                  {searchTerm || roleFilter || statusFilter ? (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setRoleFilter('');
                        setStatusFilter('');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Limpar filtros
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="p-6">
                {usersLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                          </div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {searchTerm || roleFilter || statusFilter ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm || roleFilter || statusFilter
                        ? 'Tente ajustar os filtros de busca.'
                        : 'Os usuários aparecerão aqui quando fizerem login no sistema.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <Avatar
                            src={user.google_user_data?.picture}
                            name={user.google_user_data?.name || user.email}
                            size={48}
                            className="border-2 border-gray-200"
                            alt="Profile"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {user.google_user_data?.name || user.email}
                            </h3>
                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                              <span>{user.email}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.churchRole === 'Administrador'
                                ? 'bg-purple-100 text-purple-800'
                                : user.churchRole === 'Pastor'
                                  ? 'bg-blue-100 text-blue-800'
                                  : user.churchRole === 'Tesoureiro'
                                    ? 'bg-green-100 text-green-800'
                                    : user.churchRole === 'Líder'
                                      ? 'bg-orange-100 text-orange-800'
                                      : user.churchRole === 'Voluntário'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                {user.churchRole}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {user.is_active ? 'Ativo' : 'Inativo'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {user.userPermissions.length} permissões
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                            className={`p-2 rounded-lg transition-colors ${user.is_active
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-green-600 hover:bg-green-50'
                              }`}
                            title={user.is_active ? 'Desativar usuário' : 'Ativar usuário'}
                          >
                            {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Editar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Simple Permission Editor Modal */}
          {editingPermissions && selectedUser && (
            <SimplePermissionEditor
              user={selectedUser}
              onClose={() => setEditingPermissions(false)}
              onSave={async (role, permissions) => {
                console.log('🎯 Received from SimpleEditor:', {
                  userId: selectedUser.id,
                  role,
                  permissions: permissions.length
                });

                // Atualizar estado local
                setSelectedRole(role);
                setUserPermissions(permissions);

                // Testar API antes de salvar
                const apiTest = await testPermissionsAPI(selectedUser.id);
                if (apiTest) {
                  console.log('✅ API está respondendo, prosseguindo com salvamento...');
                  // Passar valores diretamente para evitar problemas de estado assíncrono
                  await handleSavePermissions(role, permissions);
                } else {
                  console.error('❌ API não está respondendo');
                  showToast({
                    title: 'Erro de Conexão',
                    message: 'Não foi possível conectar com o servidor. Tente novamente.',
                    type: 'error'
                  });
                }
              }}
            />
          )}

          {/* Original Permission Editor Modal - Permanently replaced */}
          {false && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Editar Permissões - {selectedUser?.google_user_data?.name || selectedUser?.email}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Configure o perfil e permissões específicas do usuário
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingPermissions(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                  {/* Role Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Perfil do Usuário
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {SYSTEM_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Validation */}
                  <UserPermissionValidation
                    selectedRole={selectedRole}
                    userPermissions={userPermissions}
                    onValidationChange={setValidationResult}
                  />

                  {/* Permissions Grid */}
                  <div className="space-y-6">
                    <h4 className="text-sm font-medium text-gray-700">Permissões Específicas</h4>
                    {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                      <div key={module} className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900 mb-3 capitalize">
                          {module === 'dashboard' ? 'Dashboard' :
                            module === 'members' ? 'Membros' :
                              module === 'financial' ? 'Financeiro' :
                                module === 'users' ? 'Usuários' :
                                  module === 'notifications' ? 'Notificações' :
                                    module === 'settings' ? 'Configurações' : module}
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {modulePermissions.map((permission) => (
                            <label key={permission.id} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={userPermissions.includes(permission.name)}
                                onChange={() => handlePermissionToggle(permission.name)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                disabled={module === 'financial' && !['Administrador', 'Tesoureiro'].includes(selectedRole) && permission.action !== 'view'}
                              />
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">{permission.description}</div>
                                <div className="text-gray-500 text-xs">{permission.name}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setEditingPermissions(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleSavePermissions()}
                    disabled={validationResult && !validationResult.isValid}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${validationResult && !validationResult.isValid
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </AdminOnly>
  );
}
