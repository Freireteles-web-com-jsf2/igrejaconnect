import { useSupabaseAuth } from '@/react-app/hooks/useSupabaseAuth';
import { PermissionHelper, PermissionModule, PermissionAction } from '@/shared/permissions';

export function usePermissions() {
  const { user } = useSupabaseAuth();

  const userRole = user?.role || 'Membro';
  const userPermissions = user?.permissions || [];

  const hasPermission = (permission: string): boolean => {
    return PermissionHelper.hasPermission(userPermissions, permission);
  };

  const hasModuleAccess = (module: PermissionModule, action?: PermissionAction): boolean => {
    return PermissionHelper.hasModuleAccess(userPermissions, module, action);
  };

  const canEditFinancial = (): boolean => {
    return PermissionHelper.canEditFinancial(userRole);
  };

  const canManageUsers = (): boolean => {
    return PermissionHelper.canManageUsers(userRole);
  };

  const canCreateMembers = (): boolean => {
    return PermissionHelper.canCreateMembers(userPermissions);
  };

  const canEditMembers = (): boolean => {
    return PermissionHelper.canEditMembers(userPermissions);
  };

  const canDeleteMembers = (): boolean => {
    return PermissionHelper.canDeleteMembers(userPermissions);
  };

  const isAdministrator = (): boolean => {
    return userRole === 'Administrador';
  };

  const isTreasurer = (): boolean => {
    return userRole === 'Tesoureiro';
  };

  return {
    user,
    role: userRole,
    permissions: userPermissions,
    hasPermission,
    hasModuleAccess,
    canEditFinancial,
    canManageUsers,
    canCreateMembers,
    canEditMembers,
    canDeleteMembers,
    isAdministrator,
    isTreasurer,
  };
}
