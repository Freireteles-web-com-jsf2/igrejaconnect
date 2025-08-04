import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { SYSTEM_ROLES, DEFAULT_ROLE_PERMISSIONS } from '@/shared/permissions';

interface SimplePermissionEditorProps {
  user: any;
  onClose: () => void;
  onSave: (role: string, permissions: string[]) => void;
}

export default function SimplePermissionEditor({ user, onClose, onSave }: SimplePermissionEditorProps) {
  const [selectedRole, setSelectedRole] = useState(user.churchRole || user.role || 'Membro');
  const [userPermissions, setUserPermissions] = useState<string[]>(user.userPermissions || []);

  // Lista de todas as permissões possíveis
  const allPermissions = [
    'dashboard.view',
    'members.view', 'members.create', 'members.edit', 'members.delete', 'members.export',
    'departments.view', 'departments.create', 'departments.edit', 'departments.delete',
    'events.view', 'events.create', 'events.edit', 'events.delete',
    'financial.view', 'financial.create', 'financial.edit', 'financial.delete', 'financial.reports',
    'users.view', 'users.edit', 'users.permissions',
    'notifications.view', 'notifications.create', 'notifications.edit',
    'settings.view', 'settings.edit'
  ];

  const handlePermissionToggle = (permission: string) => {
    console.log('Toggling permission:', permission);
    setUserPermissions(prev => {
      const newPermissions = prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission];
      console.log('New permissions:', newPermissions);
      return newPermissions;
    });
  };

  const handleRoleChange = (newRole: string) => {
    console.log('Changing role to:', newRole);
    setSelectedRole(newRole);
    
    // Aplicar permissões padrão do papel
    const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[newRole as keyof typeof DEFAULT_ROLE_PERMISSIONS] || [];
    setUserPermissions(defaultPermissions);
  };

  const handleSave = () => {
    console.log('Saving permissions...');
    console.log('Role:', selectedRole);
    console.log('Permissions:', userPermissions);
    onSave(selectedRole, userPermissions);
  };

  useEffect(() => {
    console.log('🎯 SimplePermissionEditor mounted para usuário:', {
      id: user.id,
      email: user.email,
      name: user.google_user_data?.name || user.name,
      churchRole: user.churchRole || user.role,
      userPermissions: user.userPermissions?.length || 0
    });
    console.log('📋 Estado inicial:', {
      selectedRole,
      userPermissions: userPermissions.length
    });
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Editar Permissões - {user.google_user_data?.name || user.email}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Versão simplificada para debug
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Perfil do Usuário
            </label>
            <select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {SYSTEM_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Debug Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Debug Info:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Papel Selecionado: <strong>{selectedRole}</strong></div>
              <div>Permissões Ativas: <strong>{userPermissions.length}</strong></div>
              <div className="max-h-20 overflow-y-auto">
                Permissões: {userPermissions.join(', ')}
              </div>
            </div>
          </div>

          {/* Permissions List */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Permissões Disponíveis</h4>
            <div className="grid grid-cols-1 gap-2">
              {allPermissions.map((permission) => (
                <label key={permission} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={userPermissions.includes(permission)}
                    onChange={() => handlePermissionToggle(permission)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{permission}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Salvar</span>
          </button>
        </div>
      </div>
    </div>
  );
}