import z from "zod";

// Church-specific data interface
export interface ChurchData {
  id?: number;
  phone?: string;
  birth_date?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

// Base user interface (similar to Supabase User)
export interface BaseUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Enhanced user type with church-specific data
export interface ChurchUser extends BaseUser {
  name: string | null;
  role: string;
  permissions: string[] | null;
  is_active: boolean;
  phone: string | null;
  birth_date: string | null;
  address: string | null;
  avatar_url: string | null;
}

// Dashboard stats schema
export const DashboardStatsSchema = z.object({
  totalMembers: z.number(),
  activeMembers: z.number(),
  birthdayMembers: z.number(),
  monthlyIncome: z.number(),
  monthlyExpenses: z.number(),
  netBalance: z.number(),
  totalDepartments: z.number(),
  activeDepartments: z.number(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

// Notification schema
export const NotificationSchema = z.object({
  id: z.number(),
  title: z.string(),
  message: z.string(),
  type: z.string().default('info'),
  is_read: z.boolean().default(false),
  user_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Notification = z.infer<typeof NotificationSchema>;

// Financial chart data schema
export const FinancialChartDataSchema = z.object({
  month: z.string(),
  type: z.string(),
  total: z.number(),
});

export type FinancialChartData = z.infer<typeof FinancialChartDataSchema>;

// Church roles
export const CHURCH_ROLES = [
  'Administrador',
  'Pastor',
  'Líder',
  'Tesoureiro',
  'Voluntário',
  'Membro'
] as const;

export type ChurchRole = typeof CHURCH_ROLES[number];
