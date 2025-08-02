import { useState } from 'react';
import Layout from '@/react-app/components/Layout';
import { useApi, apiRequest } from '@/react-app/hooks/useApi';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Pin, 
  PinOff,
  Save, 
  X,
  AlertTriangle,
  Info,
  Calendar,
  DollarSign,
  Building2,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  announcement_type: 'general' | 'urgent' | 'department' | 'event' | 'financial';
  target_audience: 'all' | 'members' | 'leaders' | 'department' | 'specific';
  department_id: number | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expires_at: string | null;
  is_published: boolean;
  is_pinned: boolean;
  created_by: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  department?: { id: number; name: string };
  creator?: { id: string; email: string };
}

interface AnnouncementStats {
  total: number;
  published: number;
  pinned: number;
  byType: Record<string, number>;
  byAudience: Record<string, number>;
}

export default function Communication() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterAudience, setFilterAudience] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    announcement_type: 'general' as 'general' | 'urgent' | 'department' | 'event' | 'financial',
    target_audience: 'all' as 'all' | 'members' | 'leaders' | 'department' | 'specific',
    department_id: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    expires_at: '',
    is_published: false,
    is_pinned: false,
  });

  const { data: announcements, loading, error } = useApi<Announcement[]>('/api/announcements?published=true');
  const { data: stats } = useApi<AnnouncementStats>('/api/announcements/stats');
  const { data: departments } = useApi<any[]>('/api/departments');

  const activeDepartments = departments?.filter(dept => dept.is_active) || [];

  const announcementTypes = [
    { value: 'general', label: 'Geral', icon: Info, color: 'bg-blue-100 text-blue-800' },
    { value: 'urgent', label: 'Urgente', icon: AlertTriangle, color: 'bg-red-100 text-red-800' },
    { value: 'department', label: 'Departamento', icon: Building2, color: 'bg-purple-100 text-purple-800' },
    { value: 'event', label: 'Evento', icon: Calendar, color: 'bg-green-100 text-green-800' },
    { value: 'financial', label: 'Financeiro', icon: DollarSign, color: 'bg-yellow-100 text-yellow-800' }
  ];

  const targetAudiences = [
    { value: 'all', label: 'Todos', icon: Users },
    { value: 'members', label: 'Membros', icon: Users },
    { value: 'leaders', label: 'Líderes', icon: Users },
    { value: 'department', label: 'Departamento', icon: Building2 },
    { value: 'specific', label: 'Específico', icon: Users }
  ];

  const priorities = [
    { value: 'low', label: 'Baixa', color: 'text-gray-600' },
    { value: 'normal', label: 'Normal', color: 'text-blue-600' },
    { value: 'high', label: 'Alta', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgente', color: 'text-red-600' }
  ];

  const filteredAnnouncements = announcements?.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || announcement.announcement_type === filterType;
    const matchesAudience = !filterAudience || announcement.target_audience === filterAudience;
    return matchesSearch && matchesType && matchesAudience;
  }) || [];

  const handleAddAnnouncement = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      announcement_type: 'general',
      target_audience: 'all',
      department_id: '',
      priority: 'normal',
      expires_at: '',
      is_published: false,
      is_pinned: false,
    });
    setShowForm(true);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      announcement_type: announcement.announcement_type,
      target_audience: announcement.target_audience,
      department_id: announcement.department_id?.toString() || '',
      priority: announcement.priority,
      expires_at: announcement.expires_at ? announcement.expires_at.slice(0, 16) : '',
      is_published: announcement.is_published,
      is_pinned: announcement.is_pinned,
    });
    setShowForm(true);
  };

  const handleSaveAnnouncement = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Título e conteúdo são obrigatórios');
      return;
    }

    setSaving(true);
    try {
      const url = editingAnnouncement 
        ? `/api/announcements/${editingAnnouncement.id}` 
        : '/api/announcements';
      
      const method = editingAnnouncement ? 'PUT' : 'POST';
      
      const cleanFormData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        announcement_type: formData.announcement_type,
        target_audience: formData.target_audience,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        priority: formData.priority,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        is_published: formData.is_published,
        is_pinned: formData.is_pinned,
      };
      
      await apiRequest(url, {
        method,
        body: JSON.stringify(cleanFormData),
      });

      setShowForm(false);
      setEditingAnnouncement(null);
      window.location.reload();
    } catch (error) {
      console.error('Erro ao salvar aviso:', error);
      alert('Erro ao salvar aviso. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAnnouncement = async (announcement: Announcement) => {
    if (!confirm(`Tem certeza que deseja excluir o aviso "${announcement.title}"?`)) {
      return;
    }

    try {
      await apiRequest(`/api/announcements/${announcement.id}`, {
        method: 'DELETE',
      });

      window.location.reload();
    } catch (error) {
      console.error('Erro ao excluir aviso:', error);
      alert('Erro ao excluir aviso. Tente novamente.');
    }
  };

  const togglePin = async (announcement: Announcement) => {
    try {
      await apiRequest(`/api/announcements/${announcement.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...announcement,
          is_pinned: !announcement.is_pinned,
        }),
      });

      window.location.reload();
    } catch (error) {
      console.error('Erro ao fixar/desafixar aviso:', error);
      alert('Erro ao alterar fixação do aviso.');
    }
  };

  const getTypeInfo = (type: string) => {
    return announcementTypes.find(t => t.value === type) || announcementTypes[0];
  };

  const getPriorityInfo = (priority: string) => {
    return priorities.find(p => p.value === priority) || priorities[1];
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('pt-BR');
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Megaphone className="w-7 h-7 mr-3 text-blue-600" />
                Sistema de Comunicação
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie avisos, comunicados e notificações da igreja
              </p>
            </div>
            <button
              onClick={handleAddAnnouncement}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Aviso</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Avisos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Publicados</p>
                  <p className="text-2xl font-bold text-green-600">{stats.published}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fixados</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.pinned}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Pin className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Urgentes</p>
                  <p className="text-2xl font-bold text-red-600">{stats.byType.urgent || 0}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar avisos por título ou conteúdo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
              />
            </div>
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            >
              <option value="">Todos os tipos</option>
              {announcementTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterAudience}
              onChange={(e) => setFilterAudience(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            >
              <option value="">Todos os públicos</option>
              {targetAudiences.map(audience => (
                <option key={audience.value} value={audience.value}>{audience.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Announcements List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Lista de Avisos</h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar avisos</h3>
                <p className="text-gray-600">{error}</p>
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm || filterType || filterAudience ? 'Nenhum aviso encontrado' : 'Nenhum aviso publicado'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterType || filterAudience
                    ? 'Tente ajustar sua busca ou filtros'
                    : 'Comece criando o primeiro aviso da sua igreja'
                  }
                </p>
                <button
                  onClick={handleAddAnnouncement}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar Primeiro Aviso</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAnnouncements.map((announcement) => {
                  const typeInfo = getTypeInfo(announcement.announcement_type);
                  const priorityInfo = getPriorityInfo(announcement.priority);
                  // const TypeIcon = typeInfo.icon;
                  const expired = isExpired(announcement.expires_at);
                  
                  return (
                    <div 
                      key={announcement.id} 
                      className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                        announcement.is_pinned ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                      } ${expired ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {announcement.is_pinned && (
                              <Pin className="w-4 h-4 text-blue-600" />
                            )}
                            <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                            <span className={`text-xs font-medium ${priorityInfo.color}`}>
                              {priorityInfo.label}
                            </span>
                            {expired && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                Expirado
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">{announcement.content}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{formatDateTime(announcement.created_at)}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              <span>{targetAudiences.find(a => a.value === announcement.target_audience)?.label}</span>
                            </div>
                            {announcement.department && (
                              <div className="flex items-center">
                                <Building2 className="w-4 h-4 mr-1" />
                                <span>{announcement.department.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => togglePin(announcement)}
                            className={`p-2 rounded-lg transition-colors ${
                              announcement.is_pinned 
                                ? 'text-blue-600 hover:bg-blue-50' 
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            title={announcement.is_pinned ? 'Desafixar' : 'Fixar'}
                          >
                            {announcement.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleEditAnnouncement(announcement)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar aviso"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAnnouncement(announcement)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir aviso"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Announcement Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingAnnouncement ? 'Editar Aviso' : 'Novo Aviso'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {editingAnnouncement ? 'Atualize as informações do aviso' : 'Crie um novo aviso para sua igreja'}
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Culto Especial de Domingo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo *</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Descreva o aviso ou comunicado..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                      <select
                        value={formData.announcement_type}
                        onChange={(e) => setFormData({ ...formData, announcement_type: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {announcementTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Público-alvo</label>
                      <select
                        value={formData.target_audience}
                        onChange={(e) => setFormData({ ...formData, target_audience: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {targetAudiences.map(audience => (
                          <option key={audience.value} value={audience.value}>{audience.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {priorities.map(priority => (
                          <option key={priority.value} value={priority.value}>{priority.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                      <select
                        value={formData.department_id}
                        onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Nenhum departamento</option>
                        {activeDepartments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Expiração</label>
                    <input
                      type="datetime-local"
                      value={formData.expires_at}
                      onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Deixe vazio para não expirar</p>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_published}
                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Publicar aviso</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_pinned}
                        onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Fixar no topo</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAnnouncement}
                  disabled={saving || !formData.title.trim() || !formData.content.trim()}
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
                      <span>{editingAnnouncement ? 'Atualizar' : 'Salvar'}</span>
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