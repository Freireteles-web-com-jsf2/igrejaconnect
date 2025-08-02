import { ReactNode } from 'react';
import { usePermissions } from '@/react-app/hooks/usePermissions';
import { PermissionModule, PermissionAction } from '@/shared/permissions';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  module?: PermissionModule;
  action?: PermissionAction;
  role?: string;
  fallback?: ReactNode;
}

export default function PermissionGuard({ 
  children, 
  permission, 
  module, 
  action, 
  role,
  fallback = null 
}: PermissionGuardProps) {
  const { hasPermission, hasModuleAccess, role: userRole } = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (module) {
    hasAccess = hasModuleAccess(module, action);
  } else if (role) {
    hasAccess = userRole === role;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Specialized guards for common use cases
export function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard role="Administrador" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function TreasurerOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard role="Tesoureiro" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function FinancialEditGuard({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const { canEditFinancial } = usePermissions();
  
  if (!canEditFinancial()) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
