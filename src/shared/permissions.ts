import z from "zod";

// Permission schema
export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  module: z.string(),
  action: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Permission = z.infer<typeof PermissionSchema>;

// Role schema
export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  is_system_role: z.boolean(),
  created_by: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Role = z.infer<typeof RoleSchema>;

// User permissions context
export interface UserPermissions {
  role: string;
  permissions: string[];
}

// Permission modules
export enum PermissionModule {
  DASHBOARD = 'dashboard',
  MEMBERS = 'members',
  DEPARTMENTS = 'departments',
  EVENTS = 'events',
  FINANCIAL = 'financial',
  USERS = 'users',
  NOTIFICATIONS = 'notifications',
  SETTINGS = 'settings',
}

// Permission actions
export enum PermissionAction {
  VIEW = 'view',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
  EXPORT = 'export',
  REPORTS = 'reports',
  PERMISSIONS = 'permissions',
}

// System roles
export const SYSTEM_ROLES = [
  'Administrador',
  'Pastor', 
  'Líder',
  'Tesoureiro',
  'Voluntário',
  'Membro'
] as const;

export type SystemRole = typeof SYSTEM_ROLES[number];

// Permission helpers
export class PermissionHelper {
  static hasPermission(userPermissions: string[], permission: string): boolean {
    return userPermissions.includes(permission);
  }

  static hasModuleAccess(userPermissions: string[], module: PermissionModule, action?: PermissionAction): boolean {
    if (action) {
      return userPermissions.includes(`${module}.${action}`);
    }
    return userPermissions.some(p => p.startsWith(`${module}.`));
  }

  static canEditFinancial(role: string): boolean {
    return role === 'Administrador' || role === 'Tesoureiro';
  }

  static canManageUsers(role: string): boolean {
    return role === 'Administrador';
  }

  static canCreateMembers(userPermissions: string[]): boolean {
    return userPermissions.includes('members.create');
  }

  static canEditMembers(userPermissions: string[]): boolean {
    return userPermissions.includes('members.edit');
  }

  static canDeleteMembers(userPermissions: string[]): boolean {
    return userPermissions.includes('members.delete');
  }
}

// Default permissions by role
export const DEFAULT_ROLE_PERMISSIONS = {
  'Administrador': [
    'dashboard.view', 'members.view', 'members.create', 'members.edit', 'members.delete', 'members.export',
    'departments.view', 'departments.create', 'departments.edit', 'departments.delete',
    'events.view', 'events.create', 'events.edit', 'events.delete',
    'financial.view', 'financial.create', 'financial.edit', 'financial.delete', 'financial.reports',
    'users.view', 'users.edit', 'users.permissions',
    'notifications.view', 'notifications.create', 'notifications.edit', 'notifications.delete',
    'settings.view', 'settings.edit'
  ],
  'Pastor': [
    'dashboard.view', 'members.view', 'members.create', 'members.edit', 'members.export',
    'departments.view', 'departments.create', 'departments.edit',
    'events.view', 'events.create', 'events.edit',
    'financial.view', 'financial.reports',
    'notifications.view', 'notifications.create', 'notifications.edit', 'notifications.delete'
  ],
  'Líder': [
    'dashboard.view', 'members.view', 'members.create', 'members.edit',
    'departments.view', 'departments.create', 'departments.edit',
    'events.view', 'events.create', 'events.edit',
    'notifications.view', 'notifications.create'
  ],
  'Tesoureiro': [
    'dashboard.view', 'members.view',
    'events.view',
    'financial.view', 'financial.create', 'financial.edit', 'financial.delete', 'financial.reports'
  ],
  'Voluntário': [
    'dashboard.view', 'members.view', 'departments.view', 'events.view', 'notifications.view'
  ],
  'Membro': [
    'dashboard.view', 
    'members.view', 
    'departments.view', 
    'events.view', 
    'financial.view', 
    'notifications.view'
  ]
};
