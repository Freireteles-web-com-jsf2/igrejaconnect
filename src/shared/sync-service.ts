// Serviço para gerenciar sincronização de dados entre Google e banco local

export interface GoogleUserData {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
}

export interface SyncResult {
  success: boolean;
  updated: boolean;
  fields_updated: string[];
  error?: string;
}

export class UserSyncService {
  /**
   * Sincroniza dados do usuário Google com o banco local
   */
  static async syncGoogleUser(googleData: GoogleUserData, currentUserData?: any): Promise<SyncResult> {
    try {
      const fieldsToUpdate: string[] = [];
      const updates: Record<string, any> = {};

      // Sempre atualizar email se mudou
      if (!currentUserData || currentUserData.email !== googleData.email) {
        updates.email = googleData.email;
        fieldsToUpdate.push('email');
      }

      // Sempre atualizar nome se mudou
      if (!currentUserData || currentUserData.name !== googleData.name) {
        updates.name = googleData.name;
        fieldsToUpdate.push('name');
      }

      // Atualizar foto se mudou
      if (googleData.picture && (!currentUserData || currentUserData.picture !== googleData.picture)) {
        updates.picture = googleData.picture;
        fieldsToUpdate.push('picture');
      }

      // Se não há atualizações necessárias
      if (fieldsToUpdate.length === 0) {
        return {
          success: true,
          updated: false,
          fields_updated: [],
        };
      }

      // Fazer a atualização no backend
      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          google_data: googleData,
          updates: updates,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na sincronização');
      }

      return {
        success: true,
        updated: true,
        fields_updated: fieldsToUpdate,
      };
    } catch (error) {
      console.error('Erro na sincronização:', error);
      return {
        success: false,
        updated: false,
        fields_updated: [],
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Verifica se os dados locais estão desatualizados
   */
  static needsSync(googleData: GoogleUserData, localData: any): boolean {
    if (!localData) return true;

    // Verificar campos críticos
    const criticalFields = ['email', 'name'];
    
    for (const field of criticalFields) {
      if (googleData[field as keyof GoogleUserData] !== localData[field]) {
        return true;
      }
    }

    // Verificar se a foto mudou
    if (googleData.picture && googleData.picture !== localData.picture) {
      return true;
    }

    return false;
  }

  /**
   * Obtém dados do perfil Google do usuário atual
   */
  static async getGoogleProfile(): Promise<GoogleUserData | null> {
    try {
      const response = await fetch('/api/auth/google/profile', {
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter perfil Google:', error);
      return null;
    }
  }

  /**
   * Força sincronização manual
   */
  static async forcSync(): Promise<SyncResult> {
    try {
      const response = await fetch('/api/users/force-sync', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Falha na sincronização forçada');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro na sincronização forçada:', error);
      return {
        success: false,
        updated: false,
        fields_updated: [],
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Obtém histórico de sincronizações
   */
  static async getSyncHistory(): Promise<any[]> {
    try {
      const response = await fetch('/api/users/sync-history', {
        credentials: 'include',
      });

      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter histórico de sincronização:', error);
      return [];
    }
  }
}

// Hook para usar o serviço de sincronização
export function useSyncService() {
  const syncUser = async (googleData: GoogleUserData, currentData?: any) => {
    return await UserSyncService.syncGoogleUser(googleData, currentData);
  };

  const checkNeedsSync = (googleData: GoogleUserData, localData: any) => {
    return UserSyncService.needsSync(googleData, localData);
  };

  const forceSync = async () => {
    return await UserSyncService.forcSync();
  };

  const getSyncHistory = async () => {
    return await UserSyncService.getSyncHistory();
  };

  return {
    syncUser,
    checkNeedsSync,
    forceSync,
    getSyncHistory,
  };
}