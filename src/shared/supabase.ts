import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './supabase-config';

// Cliente Supabase para o frontend
export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      church_users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: string;
          permissions: string[] | null;
          is_active: boolean;
          phone: string | null;
          birth_date: string | null;
          address: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          role?: string;
          permissions?: string[] | null;
          is_active?: boolean;
          phone?: string | null;
          birth_date?: string | null;
          address?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          role?: string;
          permissions?: string[] | null;
          is_active?: boolean;
          phone?: string | null;
          birth_date?: string | null;
          address?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      members: {
        Row: {
          id: number;
          name: string;
          email: string | null;
          phone: string | null;
          birth_date: string | null;
          address: string | null;
          baptism_date: string | null;
          gender: 'masculino' | 'feminino' | 'outro' | null;
          marital_status: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel' | null;
          is_active: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          email?: string | null;
          phone?: string | null;
          birth_date?: string | null;
          address?: string | null;
          baptism_date?: string | null;
          gender?: 'masculino' | 'feminino' | 'outro' | null;
          marital_status?: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel' | null;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          email?: string | null;
          phone?: string | null;
          birth_date?: string | null;
          address?: string | null;
          baptism_date?: string | null;
          gender?: 'masculino' | 'feminino' | 'outro' | null;
          marital_status?: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel' | null;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      departments: {
        Row: {
          id: number;
          name: string;
          category: string;
          leaders: number[] | null;
          meeting_datetime: string | null;
          is_active: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          category: string;
          leaders?: number[] | null;
          meeting_datetime?: string | null;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          category?: string;
          leaders?: number[] | null;
          meeting_datetime?: string | null;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type ChurchUser = Database['public']['Tables']['church_users']['Row'];
export type Member = Database['public']['Tables']['members']['Row'];
export type Department = Database['public']['Tables']['departments']['Row'];