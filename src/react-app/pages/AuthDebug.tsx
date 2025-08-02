import { useState } from 'react';
import { useSupabaseAuth } from '@/react-app/hooks/useSupabaseAuth';
import { apiRequest } from '@/react-app/hooks/useApi';
import { supabase } from '@/shared/supabase';

interface TestResults {
  session?: {
    exists: boolean;
    accessToken: string | null;
    user: { id: string; email: string | undefined } | null;
  };
  authTest?: unknown;
  health?: unknown;
  dashboardStats?: { success: boolean; dataLength: number } | { error: string };
  members?: { success: boolean; count: number | string } | { error: string };
  generalError?: string;
}

export default function AuthDebug() {
  const { user } = useSupabaseAuth();
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results: TestResults = {};

    try {
      // Teste 1: Verificar sessão do Supabase
      const { data: { session } } = await supabase.auth.getSession();
      results.session = {
        exists: !!session,
        accessToken: session?.access_token ? session.access_token.substring(0, 20) + '...' : null,
        user: session?.user ? { id: session.user.id, email: session.user.email } : null
      };

      // Teste 2: Testar rota de auth test
      try {
        const authTest = await apiRequest('/api/auth/test');
        results.authTest = authTest;
      } catch (error) {
        results.authTest = { error: error instanceof Error ? error.message : 'Erro desconhecido' };
      }

      // Teste 3: Testar rota de health
      try {
        const health = await apiRequest('/api/health');
        results.health = health;
      } catch (error) {
        results.health = { error: error instanceof Error ? error.message : 'Erro desconhecido' };
      }

      // Teste 4: Testar rota de dashboard stats
      try {
        const stats = await apiRequest('/api/dashboard/stats');
        results.dashboardStats = { success: true, dataLength: JSON.stringify(stats).length };
      } catch (error) {
        results.dashboardStats = { error: error instanceof Error ? error.message : 'Erro desconhecido' };
      }

      // Teste 5: Testar rota de members
      try {
        const members = await apiRequest('/api/members');
        results.members = { success: true, count: Array.isArray(members) ? members.length : 'não é array' };
      } catch (error) {
        results.members = { error: error instanceof Error ? error.message : 'Erro desconhecido' };
      }

    } catch (error) {
      results.generalError = error instanceof Error ? error.message : 'Erro desconhecido';
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug de Autenticação</h1>
        
        {/* Informações do usuário */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Informações do Usuário</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {/* Botão de teste */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <button
            onClick={runTests}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Executando testes...' : 'Executar Testes de API'}
          </button>
        </div>

        {/* Resultados dos testes */}
        {testResults && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Resultados dos Testes</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}