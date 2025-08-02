import { useSupabaseAuth } from '@/react-app/hooks/useSupabaseAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import Layout from '@/react-app/components/Layout';
import { useApi } from '@/react-app/hooks/useApi';
import FinancialChart from '@/react-app/components/FinancialChart';
import { Users, Calendar, TrendingUp, Building2, DollarSign, FileText } from 'lucide-react';

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  birthdayMembers: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netBalance: number;
  totalDepartments: number;
  activeDepartments: number;
  totalIncome: number;
  totalExpenses: number;
  totalBalance: number;
  recentTransactions: number;
  monthlyEvents: number;
}

interface ChartData {
  monthlyData: {
    month: string;
    receitas: number;
    despesas: number;
    saldo: number;
  }[];
  categoryData: {
    name: string;
    value: number;
    color: string;
  }[];
  memberGrowthData: {
    month: string;
    membros: number;
  }[];
  topContributors: {
    name: string;
    amount: number;
  }[];
}

export default function Home() {
  const { user, isLoading } = useSupabaseAuth();
  const navigate = useNavigate();
  const { data: stats, loading: statsLoading } = useApi<DashboardStats>('/api/dashboard/stats');
  const { data: chartData, loading: chartsLoading } = useApi<ChartData>('/api/dashboard/charts');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        navigate('/login');
      }, 0);
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Bem-vindo, {user.name || user.email}!
              </h1>
              <p className="text-blue-100 text-lg">
                Aqui está um resumo da sua igreja hoje
              </p>
              <div className="flex items-center mt-4 space-x-6">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-sm text-blue-100">Sistema Online</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-blue-200" />
                  <span className="text-sm text-blue-100">
                    {stats?.activeMembers || 0} membros ativos
                  </span>
                </div>
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-blue-200" />
                  <span className="text-sm text-blue-100">
                    {stats?.activeDepartments || 0} departamentos
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm text-blue-100 mb-1">Hoje</p>
                <p className="text-lg font-semibold">
                  {new Date().toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'short'
                  })}
                </p>
                <p className="text-sm text-blue-200">
                  {new Date().toLocaleDateString('pt-BR', { year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">Membros</p>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                {statsLoading ? (
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                ) : (
                  <div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stats?.totalMembers || 0}</p>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <p className="text-sm text-green-600 font-medium">
                        {stats?.activeMembers || 0} ativos
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">Aniversários</p>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                {statsLoading ? (
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                ) : (
                  <div>
                    <p className="text-3xl font-bold text-purple-600 mb-1">{stats?.birthdayMembers || 0}</p>
                    <p className="text-sm text-gray-500">Este mês</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">Departamentos</p>
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                {statsLoading ? (
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                ) : (
                  <div>
                    <p className="text-3xl font-bold text-indigo-600 mb-1">{stats?.activeDepartments || 0}</p>
                    <p className="text-sm text-gray-500">
                      de {stats?.totalDepartments || 0} total
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">Eventos</p>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                {statsLoading ? (
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                ) : (
                  <div>
                    <p className="text-3xl font-bold text-green-600 mb-1">{stats?.monthlyEvents || 0}</p>
                    <p className="text-sm text-gray-500">Este mês</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receitas do Mês</p>
                {statsLoading ? (
                  <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(stats?.monthlyIncome || 0)}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Total: {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(stats?.totalIncome || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Despesas do Mês</p>
                {statsLoading ? (
                  <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-bold text-red-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(stats?.monthlyExpenses || 0)}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Total: {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(stats?.totalExpenses || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo do Mês</p>
                {statsLoading ? (
                  <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                ) : (
                  <p className={`text-2xl font-bold ${(stats?.netBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(stats?.netBalance || 0)}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Geral: {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(stats?.totalBalance || 0)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                (stats?.netBalance || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <TrendingUp className={`w-6 h-6 ${
                  (stats?.netBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eventos do Mês</p>
                {statsLoading ? (
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-bold text-blue-600">{stats?.monthlyEvents || 0}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Programados</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Ações Rápidas</h3>
            <p className="text-sm text-gray-500">Acesse rapidamente as principais funcionalidades</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/members')}
              className="group flex items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold">Membros</h4>
                <p className="text-sm text-blue-100">Gerenciar comunidade</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/departments')}
              className="group flex items-center p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold">Departamentos</h4>
                <p className="text-sm text-indigo-100">Ministérios e líderes</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/events')}
              className="group flex items-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold">Eventos</h4>
                <p className="text-sm text-purple-100">Cultos e programações</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/finance')}
              className="group flex items-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold">Financeiro</h4>
                <p className="text-sm text-green-100">Receitas e despesas</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/communication')}
              className="group flex items-center p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold">Comunicação</h4>
                <p className="text-sm text-orange-100">Avisos e comunicados</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="group flex items-center p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold">Relatórios</h4>
                <p className="text-sm text-red-100">Exportar dados</p>
              </div>
            </button>
          </div>
        </div>

        {/* Top Contributors */}
        {!chartsLoading && chartData?.topContributors && chartData.topContributors.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Maiores Contribuintes do Mês</h3>
            <div className="space-y-3">
              {chartData.topContributors.map((contributor, index) => (
                <div key={contributor.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{contributor.name}</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(contributor.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Financial Charts */}
        {chartsLoading ? (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : chartData && (chartData.monthlyData.length > 0 || chartData.categoryData.length > 0) ? (
          <FinancialChart 
            monthlyData={chartData.monthlyData}
            categoryData={chartData.categoryData}
            memberGrowthData={chartData.memberGrowthData}
          />
        ) : null}

        {/* Recent Activity & User Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Atividades Recentes</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Ver todas
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {stats?.totalMembers || 0} membros cadastrados
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats?.activeMembers || 0} membros ativos na comunidade
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Atualizado agora</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {stats?.activeDepartments || 0} departamentos ativos
                  </p>
                  <p className="text-xs text-gray-500">
                    Ministérios organizados e funcionando
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Sincronizado</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Saldo atual: {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(stats?.totalBalance || 0)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Controle financeiro em tempo real
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Dados reais</p>
                </div>
              </div>

              {stats?.birthdayMembers && stats.birthdayMembers > 0 && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {stats.birthdayMembers} aniversariante{stats.birthdayMembers > 1 ? 's' : ''} este mês
                    </p>
                    <p className="text-xs text-gray-500">
                      Não esqueça de parabenizar!
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Lembretes ativos</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Perfil do Usuário</h3>
            <div className="flex items-center space-x-4">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name || 'Usuário'}
                  className="w-16 h-16 rounded-full border-4 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900">
                  {user.name || user.email}
                </h4>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-2 mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {user.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="mt-4">
                  <button 
                    onClick={() => navigate('/settings')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Configurar perfil →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
