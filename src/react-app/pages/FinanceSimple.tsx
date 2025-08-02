import { useState } from 'react';
import Layout from '@/react-app/components/Layout';
import { useApi, apiRequest } from '@/react-app/hooks/useApi';
import {
  DollarSign,
  Plus,
  Search,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';

interface FinancialTransaction {
  id: number;
  type: 'receita' | 'despesa';
  amount: number;
  description: string;
  category: string | null;
  date: string;
  member_id: number | null;
  member?: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

interface Member {
  id: number;
  name: string;
}



export default function FinanceSimple() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'receita' | 'despesa'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    type: 'receita' as 'receita' | 'despesa',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    member_id: '',
  });

  // Carregar dados reais do Supabase
  const { data: transactions, loading } = useApi<FinancialTransaction[]>('/api/financial/transactions');
  const { data: members } = useApi<Member[]>('/api/financial/members');
  const { data: categories, loading: categoriesLoading, error: categoriesError } = useApi<{receita: string[], despesa: string[]}>('/api/financial/categories/simple');
  const { data: stats } = useApi<{
    total: { income: number, expenses: number, balance: number, transactionCount: number },
    monthly: { income: number, expenses: number, balance: number, transactionCount: number }
  }>('/api/financial/stats');

  // Debug das categorias
  console.log('Categories loading:', categoriesLoading);
  console.log('Categories error:', categoriesError);
  console.log('Categories data:', categories);

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setFormData({
      type: 'receita',
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      member_id: '',
    });
    setShowForm(true);
  };

  const handleEditTransaction = (transaction: FinancialTransaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      category: transaction.category || '',
      date: transaction.date,
      member_id: transaction.member_id?.toString() || '',
    });
    setShowForm(true);
  };

  const handleSaveTransaction = async () => {
    if (!formData.description.trim() || !formData.amount) {
      alert('Descrição e valor são obrigatórios');
      return;
    }

    setSaving(true);
    try {
      const url = editingTransaction
        ? `/api/financial/transactions/${editingTransaction.id}`
        : '/api/financial/transactions';

      const method = editingTransaction ? 'PUT' : 'POST';

      const cleanFormData = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        category: formData.category.trim() || null,
        date: formData.date,
        member_id: formData.member_id ? parseInt(formData.member_id) : null,
      };

      await apiRequest(url, {
        method,
        body: JSON.stringify(cleanFormData),
      });

      setShowForm(false);
      setEditingTransaction(null);
      // Recarregar dados sem refresh da página
      window.location.reload();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      alert('Erro ao salvar transação. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTransaction = async (transaction: FinancialTransaction) => {
    if (!confirm(`Tem certeza que deseja excluir a transação "${transaction.description}"?`)) {
      return;
    }

    try {
      await apiRequest(`/api/financial/transactions/${transaction.id}`, {
        method: 'DELETE',
      });

      // Recarregar dados sem refresh da página
      window.location.reload();
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      alert('Erro ao excluir transação. Tente novamente.');
    }
  };

  const filteredTransactions = (transactions || []).filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.category && transaction.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Usar estatísticas do backend
  const totalIncome = stats?.total.income || 0;
  const totalExpenses = stats?.total.expenses || 0;
  const balance = stats?.total.balance || 0;





  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getCategoryOptions = () => {
    if (!categories) {
      console.log('Categories not loaded yet');
      return [];
    }
    console.log('Categories loaded:', categories);
    console.log('Form type:', formData.type);
    const options = formData.type === 'receita' ? categories.receita : categories.despesa;
    console.log('Category options:', options);
    return options || [];
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <DollarSign className="w-7 h-7 mr-3 text-green-600" />
                Controle Financeiro
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie as finanças da sua igreja
              </p>
            </div>
            <button
              onClick={handleAddTransaction}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Transação</span>
            </button>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receitas Totais</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              </div>
              <ArrowUpCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Despesas Totais</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              </div>
              <ArrowDownCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo Geral</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(balance)}
                </p>
              </div>
              {balance >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-600" />
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transações</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.total.transactionCount || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 lg:mr-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar transações por descrição ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as 'all' | 'receita' | 'despesa')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                >
                  <option value="all">Todas</option>
                  <option value="receita">Receitas</option>
                  <option value="despesa">Despesas</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Transações Recentes</h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm || typeFilter !== 'all' ? 'Nenhuma transação encontrada' : 'Nenhuma transação cadastrada'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || typeFilter !== 'all'
                    ? 'Tente ajustar seus filtros de busca'
                    : 'Comece registrando a primeira transação financeira'
                  }
                </p>
                <button
                  onClick={handleAddTransaction}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Primeira Transação</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${transaction.type === 'receita' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                        {transaction.type === 'receita' ? (
                          <ArrowUpCircle className="w-6 h-6" />
                        ) : (
                          <ArrowDownCircle className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{transaction.description}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.type === 'receita'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                            {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                          </span>
                          {transaction.category && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {transaction.category}
                            </span>
                          )}
                          {transaction.member && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                              {transaction.member.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{formatDate(transaction.date)}</span>
                          </div>
                          <div className={`font-semibold ${transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditTransaction(transaction)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar transação"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(transaction)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir transação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Transaction Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Nova Transação</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  ×
                </button>
              </div>

              <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'receita', category: '' })}
                        className={`p-3 rounded-lg border-2 transition-colors ${formData.type === 'receita'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        <ArrowUpCircle className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-sm font-medium">Receita</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'despesa', category: '' })}
                        className={`p-3 rounded-lg border-2 transition-colors ${formData.type === 'despesa'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        <ArrowDownCircle className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-sm font-medium">Despesa</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Ex: Dízimo do mês de Janeiro"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0,00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={categoriesLoading}
                    >
                      <option value="">
                        {categoriesLoading ? 'Carregando categorias...' : 'Selecione uma categoria'}
                      </option>
                      {getCategoryOptions().map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    {categoriesError && (
                      <p className="text-xs text-red-500 mt-1">
                        Erro ao carregar categorias: {categoriesError}
                      </p>
                    )}
                  </div>

                  {/* Campo de seleção de membro - especialmente útil para dízimos */}
                  {formData.type === 'receita' && (formData.category === 'Dízimos' || formData.category === 'Ofertas') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Membro {formData.category === 'Dízimos' ? '(Dizimista)' : '(Ofertante)'}
                      </label>
                      <select
                        value={formData.member_id}
                        onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Selecione um membro (opcional)</option>
                        {members?.map(member => (
                          <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Selecione o membro para registrar {formData.category === 'Dízimos' ? 'o dízimo' : 'a oferta'}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveTransaction}
                  disabled={saving || !formData.description.trim() || !formData.amount}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <span>{editingTransaction ? 'Atualizar' : 'Salvar'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}