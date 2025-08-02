import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import Layout from '@/react-app/components/Layout';
import PermissionGuard from '@/react-app/components/PermissionGuard';
import { apiRequest } from '@/react-app/hooks/useApi';

import { 
  User, 
  Save, 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  FileText,
  UserCheck,
  UserX
} from 'lucide-react';
import { PermissionModule, PermissionAction } from '@/shared/permissions';

interface Member {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  address: string | null;
  baptism_date: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface MemberFormData {
  name: string;
  email: string;
  phone: string;
  birth_date: string;
  address: string;
  baptism_date: string;
  is_active: boolean;
  notes: string;
}

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    email: '',
    phone: '',
    birth_date: '',
    address: '',
    baptism_date: '',
    is_active: true,
    notes: '',
  });

  useEffect(() => {
    if (!isNew && id) {
      loadMember(id);
    }
  }, [id, isNew]);

  const loadMember = async (memberId: string) => {
    try {
      setLoading(true);
      const response = await apiRequest(`/api/members/${memberId}`);
      const memberData = await (response as Response).json() as Member;
      
      setMember(memberData);
      setFormData({
        name: memberData.name || '',
        email: memberData.email || '',
        phone: memberData.phone || '',
        birth_date: memberData.birth_date || '',
        address: memberData.address || '',
        baptism_date: memberData.baptism_date || '',
        is_active: memberData.is_active,
        notes: memberData.notes || '',
      });
    } catch (error) {
      console.error('Erro ao carregar membro:', error);
      setError('Erro ao carregar dados do membro');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    setSaving(true);
    try {
      const url = isNew ? '/api/members' : `/api/members/${id}`;
      const method = isNew ? 'POST' : 'PUT';
      
      const cleanFormData = {
        ...formData,
        email: formData.email?.trim() || null,
        phone: formData.phone?.trim() || null,
        birth_date: formData.birth_date || null,
        address: formData.address?.trim() || null,
        baptism_date: formData.baptism_date || null,
        notes: formData.notes?.trim() || null,
      };
      
      await apiRequest(url, {
        method,
        body: JSON.stringify(cleanFormData),
      });

      navigate('/members');
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="animate-pulse space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar membro</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => navigate('/members')}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para Membros</span>
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <PermissionGuard module={PermissionModule.MEMBERS} action={isNew ? PermissionAction.CREATE : PermissionAction.EDIT}>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/members')}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <User className="w-7 h-7 mr-3 text-blue-600" />
                    {isNew ? 'Novo Membro' : `Editar: ${member?.name || 'Membro'}`}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {isNew ? 'Adicione um novo membro à comunidade' : 'Atualize as informações do membro'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {!isNew && member && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    member.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {member.is_active ? (
                      <>
                        <UserCheck className="w-4 h-4 inline mr-1" />
                        Ativo
                      </>
                    ) : (
                      <>
                        <UserX className="w-4 h-4 inline mr-1" />
                        Inativo
                      </>
                    )}
                  </span>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.name.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isNew ? 'Salvar' : 'Atualizar'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Member Form */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Informações Pessoais</h2>
              <p className="text-sm text-gray-600 mt-1">Dados básicos do membro</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome completo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Data de nascimento
                  </label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {formData.birth_date && (
                    <p className="text-sm text-gray-500 mt-1">
                      Idade: {calculateAge(formData.birth_date)} anos
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Data do batismo
                  </label>
                  <input
                    type="date"
                    value={formData.baptism_date}
                    onChange={(e) => setFormData({ ...formData, baptism_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Endereço completo"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Observações
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Informações adicionais sobre o membro"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                    />
                    <span className="text-sm font-medium text-gray-700">Membro ativo</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-8">
                    Membros inativos não aparecem em relatórios e estatísticas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Member History (only for existing members) */}
          {!isNew && member && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Histórico</h2>
                <p className="text-sm text-gray-600 mt-1">Informações sobre o cadastro</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de cadastro
                    </label>
                    <p className="text-gray-900">{formatDate(member.created_at)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Última atualização
                    </label>
                    <p className="text-gray-900">{formatDate(member.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </PermissionGuard>
  );
}