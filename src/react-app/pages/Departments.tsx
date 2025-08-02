import { useState } from 'react';
import Layout from '@/react-app/components/Layout';
import PermissionGuard from '@/react-app/components/PermissionGuard';
import { useApi, apiRequest } from '@/react-app/hooks/useApi';

import { 
  Building2, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  Calendar,
  Save,
  X,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { PermissionModule, PermissionAction } from '@/shared/permissions';

interface Department {
  id: number;
  name: string;
  category: string;
  leaders: number[] | null;
  meeting_datetime: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  leader_names?: string[];
}

interface Member {
  id: number;
  name: string;
  is_active: boolean;
}

interface DepartmentFormData {
  name: string;
  category: string;
  leaders: number[];
  meeting_datetime: string;
  is_active: boolean;
  notes: string;
}

const DEPARTMENT_CATEGORIES = [
  'Louvor e Adoração',
  'Educação Cristã',
  'Juventude',
  'Crianças',
  'Mulheres',
  'Homens',
  'Evangelismo',
  'Missões',
  'Diaconia',
  'Administração',
  'Mídia',
  'Recepção',
  'Limpeza',
  'Segurança',
  'Outros'
];

export default function Departments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    category: '',
    leaders: [],
    meeting_datetime: '',
    is_active: true,
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const { data: departments, loading, error } = useApi<Department[]>('/api/departments');
  const { data: members } = useApi<Member[]>('/api/members');

  const activeMembers = members?.filter(member => member.is_active) || [];

  const filteredDepartments = departments?.filter(department =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAddDepartment = () => {
    setEditingDepartment(null);
    setFormData({
      name: '',
      category: '',
      leaders: [],
      meeting_datetime: '',
      is_active: true,
      notes: '',
    });
    setShowForm(true);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      category: department.category,
      leaders: department.leaders || [],
      meeting_datetime: department.meeting_datetime || '',
      is_active: department.is_active,
      notes: department.notes || '',
    });
    setShowForm(true);
  };

  const handleSaveDepartment = async () => {
    if (!formData.name.trim()) {
      alert('Nome do departamento é obrigatório');
      return;
    }

    if (!formData.category.trim()) {
      alert('Categoria é obrigatória');
      return;
    }

    setSaving(true);
    try {
      const url = editingDepartment 
        ? `/api/departments/${editingDepartment.id}` 
        : '/api/departments';
      
      const method = editingDepartment ? 'PUT' : 'POST';
      
      const cleanFormData = {
        ...formData,
        meeting_datetime: formData.meeting_datetime || null,
        notes: formData.notes?.trim() || null,
      };
      
      await apiRequest(url, {
        method,
        body: JSON.stringify(cleanFormData),
      });

      setShowForm(false);
      setEditingDepartment(null);
      // Recarregar a página para atualizar a lista
      window.location.reload();
    } catch (error) {
      console.error('Erro ao salvar departamento:', error);
      
      let errorMessage = 'Erro ao salvar departamento. Tente novamente.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = (error as any).message || 'Erro desconhecido ao salvar departamento.';
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(`Erro ao salvar departamento: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDepartment = async (department: Department) => {
    if (!confirm(`Tem certeza que deseja excluir o departamento "${department.name}"?`)) {
      return;
    }

    try {
      await apiRequest(`/api/departments/${department.id}`, {
        method: 'DELETE',
      });

      // Recarregar a página para atualizar a lista
      window.location.reload();
    } catch (error) {
      console.error('Erro ao excluir departamento:', error);
      alert('Erro ao excluir departamento. Tente novamente.');
    }
  };

  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    return date.toLocaleString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLeaderToggle = (memberId: number) => {
    setFormData(prev => ({
      ...prev,
      leaders: prev.leaders.includes(memberId)
        ? prev.leaders.filter(id => id !== memberId)
        : [...prev.leaders, memberId]
    }));
  };

  return (
    <PermissionGuard module={PermissionModule.DEPARTMENTS} action={PermissionAction.VIEW}>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Building2 className="w-7 h-7 mr-3 text-blue-600" />
                  Gestão de Departamentos
                </h1>
                <p className="text-gray-600 mt-1">
                  Organize e gerencie os departamentos da sua igreja
                </p>
              </div>
              <PermissionGuard permission="departments.create">
                <button
                  onClick={handleAddDepartment}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Departamento</span>
                </button>
              </PermissionGuard>
            </div>
          </div>

          {/* Search and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar departamentos por nome ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="text-center">
                <Building2 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{departments?.length || 0}</p>
                <p className="text-sm text-gray-600">Total de Departamentos</p>
              </div>
            </div>
          </div>

          {/* Departments List */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Lista de Departamentos</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                    <span>{departments?.filter(d => d.is_active).length || 0} Ativos</span>
                  </div>
                  <div className="flex items-center">
                    <XCircle className="w-4 h-4 text-red-600 mr-1" />
                    <span>{departments?.filter(d => !d.is_active).length || 0} Inativos</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar departamentos</h3>
                  <p className="text-gray-600">{error}</p>
                </div>
              ) : filteredDepartments.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm ? 'Nenhum departamento encontrado' : 'Nenhum departamento cadastrado'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm 
                      ? 'Tente ajustar sua busca ou limpar o filtro'
                      : 'Comece criando o primeiro departamento da sua igreja'
                    }
                  </p>
                  <PermissionGuard permission="departments.create">
                    <button
                      onClick={handleAddDepartment}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Criar Primeiro Departamento</span>
                    </button>
                  </PermissionGuard>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDepartments.map((department) => (
                    <div key={department.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                          department.is_active ? 'bg-blue-600' : 'bg-gray-400'
                        }`}>
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{department.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              department.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {department.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {department.category}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {department.leader_names && department.leader_names.length > 0 && (
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                <span>{department.leader_names.join(', ')}</span>
                              </div>
                            )}
                            {department.meeting_datetime && (
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>{formatDateTime(department.meeting_datetime)}</span>
                              </div>
                            )}
                          </div>
                          {department.notes && (
                            <p className="text-sm text-gray-500 mt-1 truncate max-w-md">
                              {department.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <PermissionGuard permission="departments.edit">
                          <button
                            onClick={() => handleEditDepartment(department)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar departamento"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </PermissionGuard>
                        <PermissionGuard permission="departments.delete">
                          <button
                            onClick={() => handleDeleteDepartment(department)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir departamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </PermissionGuard>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Department Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editingDepartment ? 'Editar Departamento' : 'Novo Departamento'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {editingDepartment ? 'Atualize as informações do departamento' : 'Crie um novo departamento para organizar sua igreja'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Departamento *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Louvor e Adoração"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoria *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Selecione uma categoria</option>
                        {DEPARTMENT_CATEGORIES.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Líderes
                      </label>
                      <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                        {activeMembers.length > 0 ? (
                          activeMembers.map(member => (
                            <label key={member.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                              <input
                                type="checkbox"
                                checked={formData.leaders.includes(member.id)}
                                onChange={() => handleLeaderToggle(member.id)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{member.name}</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 p-2">Nenhum membro ativo disponível</p>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data e hora da reunião
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.meeting_datetime}
                        onChange={(e) => setFormData({ ...formData, meeting_datetime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observações
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Informações adicionais sobre o departamento"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Departamento ativo</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveDepartment}
                    disabled={saving || !formData.name.trim() || !formData.category.trim()}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{editingDepartment ? 'Atualizar' : 'Salvar'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </PermissionGuard>
  );
}
