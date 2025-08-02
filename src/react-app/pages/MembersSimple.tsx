import { useState } from 'react';
import Layout from '@/react-app/components/Layout';
import { useApi, apiRequest } from '@/react-app/hooks/useApi';
import { Users, Plus, Search, Edit, Trash2, UserCheck, UserX, Phone, Mail, Calendar, Save, X } from 'lucide-react';

interface Member {
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
}

export default function MembersSimple() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birth_date: '',
    address: '',
    baptism_date: '',
    gender: '',
    marital_status: '',
    is_active: true,
    notes: '',
  });

  const { data: members, loading, error } = useApi<Member[]>('/api/members');

  const filteredMembers = members?.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone?.includes(searchTerm)
  ) || [];

  const handleAddMember = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      birth_date: '',
      address: '',
      baptism_date: '',
      gender: '',
      marital_status: '',
      is_active: true,
      notes: '',
    });
    setShowForm(true);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email || '',
      phone: member.phone || '',
      birth_date: member.birth_date || '',
      address: member.address || '',
      baptism_date: member.baptism_date || '',
      gender: member.gender || '',
      marital_status: member.marital_status || '',
      is_active: member.is_active,
      notes: member.notes || '',
    });
    setShowForm(true);
  };

  const handleSaveMember = async () => {
    if (!formData.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    setSaving(true);
    try {
      const url = editingMember
        ? `/api/members/${editingMember.id}`
        : '/api/members';

      const method = editingMember ? 'PUT' : 'POST';

      const cleanFormData = {
        ...formData,
        email: formData.email?.trim() || null,
        phone: formData.phone?.trim() || null,
        birth_date: formData.birth_date || null,
        address: formData.address?.trim() || null,
        baptism_date: formData.baptism_date || null,
        gender: formData.gender || null,
        marital_status: formData.marital_status || null,
        notes: formData.notes?.trim() || null,
      };

      await apiRequest(url, {
        method,
        body: JSON.stringify(cleanFormData),
      });

      setShowForm(false);
      setEditingMember(null);
      // Recarregar a página para atualizar a lista
      window.location.reload();
    } catch (error) {
      console.error('Erro ao salvar membro:', error);

      let errorMessage = 'Erro ao salvar membro. Tente novamente.';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = (error as any).message || 'Erro desconhecido ao salvar membro.';
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      alert(`Erro ao salvar membro: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (member: Member) => {
    if (!confirm(`Tem certeza que deseja excluir ${member.name}?`)) {
      return;
    }

    try {
      await apiRequest(`/api/members/${member.id}`, {
        method: 'DELETE',
      });

      // Recarregar a página para atualizar a lista
      window.location.reload();
    } catch (error) {
      console.error('Erro ao excluir membro:', error);
      alert('Erro ao excluir membro. Tente novamente.');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth() - birth.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="w-7 h-7 mr-3 text-blue-600" />
                Gestão de Membros
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie os membros da sua comunidade
              </p>
            </div>
            <button
              onClick={handleAddMember}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Membro</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar membros por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3"></div>
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
            <div className="text-center">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{members?.length || 0}</p>
              <p className="text-sm text-gray-600">Total de Membros</p>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Lista de Membros</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <UserCheck className="w-4 h-4 text-green-600 mr-1" />
                  <span>{members?.filter(m => m.is_active).length || 0} Ativos</span>
                </div>
                <div className="flex items-center">
                  <UserX className="w-4 h-4 text-red-600 mr-1" />
                  <span>{members?.filter(m => !m.is_active).length || 0} Inativos</span>
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
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar membros</h3>
                <p className="text-gray-600">{error}</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'Nenhum membro encontrado' : 'Nenhum membro cadastrado'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm
                    ? 'Tente ajustar sua busca ou limpar o filtro'
                    : 'Comece adicionando o primeiro membro da sua comunidade'
                  }
                </p>
                <button
                  onClick={handleAddMember}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Primeiro Membro</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${member.is_active ? 'bg-blue-600' : 'bg-gray-400'
                        }`}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{member.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                            {member.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                          {member.birth_date && (
                            <span className="text-xs text-gray-500">
                              {calculateAge(member.birth_date)} anos
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {member.email && (
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              <span>{member.email}</span>
                            </div>
                          )}
                          {member.phone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                          {member.birth_date && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>Nasc. {formatDate(member.birth_date)}</span>
                            </div>
                          )}
                        </div>
                        {(member.gender || member.marital_status) && (
                          <div className="flex items-center space-x-2 mt-1">
                            {member.gender && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                {member.gender === 'masculino' ? 'Masculino' :
                                  member.gender === 'feminino' ? 'Feminino' : 'Outro'}
                              </span>
                            )}
                            {member.marital_status && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                {member.marital_status === 'solteiro' ? 'Solteiro(a)' :
                                  member.marital_status === 'casado' ? 'Casado(a)' :
                                    member.marital_status === 'divorciado' ? 'Divorciado(a)' :
                                      member.marital_status === 'viuvo' ? 'Viúvo(a)' :
                                        member.marital_status === 'uniao_estavel' ? 'União Estável' : ''}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditMember(member)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar membro"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir membro"
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

        {/* Member Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingMember ? 'Editar Membro' : 'Novo Membro'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {editingMember ? 'Atualize as informações do membro' : 'Adicione um novo membro à comunidade'}
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Digite o nome completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de nascimento</label>
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data do batismo</label>
                    <input
                      type="date"
                      value={formData.baptism_date}
                      onChange={(e) => setFormData({ ...formData, baptism_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
                    <select
                      value={formData.marital_status}
                      onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione</option>
                      <option value="solteiro">Solteiro(a)</option>
                      <option value="casado">Casado(a)</option>
                      <option value="divorciado">Divorciado(a)</option>
                      <option value="viuvo">Viúvo(a)</option>
                      <option value="uniao_estavel">União Estável</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Endereço completo"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Informações adicionais sobre o membro"
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
                      <span className="text-sm font-medium text-gray-700">Membro ativo</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveMember}
                  disabled={saving || !formData.name.trim()}
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
                      <span>{editingMember ? 'Atualizar' : 'Salvar'}</span>
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