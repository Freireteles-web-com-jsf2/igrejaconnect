import { useState } from 'react';
import Layout from '@/react-app/components/Layout';
import { useApi, apiRequest } from '@/react-app/hooks/useApi';
import { 
  Calendar, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  MapPin, 
  Clock,
  CheckCircle, 
  XCircle, 
  Save, 
  X,
  Filter,
  Eye
} from 'lucide-react';

interface Event {
  id: number;
  title: string;
  description: string | null;
  event_type: 'culto' | 'reuniao' | 'evento_especial';
  start_datetime: string;
  end_datetime: string | null;
  location: string | null;
  max_participants: number | null;
  requires_confirmation: boolean;
  department_id: number | null;
  created_by: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  departments?: { name: string };
  church_users?: { name: string };
  event_participants?: Array<{
    id: number;
    status: string;
    members: {
      id: number;
      name: string;
      email: string;
      phone: string;
    };
  }>;
}

interface Department {
  id: number;
  name: string;
  is_active: boolean;
}

const EVENT_TYPES = [
  { value: 'culto', label: 'Culto', color: 'bg-blue-100 text-blue-800' },
  { value: 'reuniao', label: 'Reunião', color: 'bg-green-100 text-green-800' },
  { value: 'evento_especial', label: 'Evento Especial', color: 'bg-purple-100 text-purple-800' }
];

export default function Events() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'culto' as 'culto' | 'reuniao' | 'evento_especial',
    start_datetime: '',
    end_datetime: '',
    location: '',
    max_participants: '',
    requires_confirmation: false,
    department_id: '',
    is_active: true,
  });

  const { data: events, loading, error } = useApi<Event[]>('/api/events');
  const { data: departments } = useApi<Department[]>('/api/departments');

  const activeDepartments = departments?.filter(dept => dept.is_active) || [];

  const filteredEvents = events?.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || event.event_type === filterType;
    return matchesSearch && matchesType;
  }) || [];

  const handleAddEvent = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      event_type: 'culto',
      start_datetime: '',
      end_datetime: '',
      location: '',
      max_participants: '',
      requires_confirmation: false,
      department_id: '',
      is_active: true,
    });
    setShowForm(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      start_datetime: event.start_datetime.slice(0, 16), // Format for datetime-local
      end_datetime: event.end_datetime?.slice(0, 16) || '',
      location: event.location || '',
      max_participants: event.max_participants?.toString() || '',
      requires_confirmation: event.requires_confirmation,
      department_id: event.department_id?.toString() || '',
      is_active: event.is_active,
    });
    setShowForm(true);
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowDetails(true);
  };

  const handleSaveEvent = async () => {
    if (!formData.title.trim()) {
      alert('Título do evento é obrigatório');
      return;
    }

    if (!formData.start_datetime) {
      alert('Data e hora de início são obrigatórias');
      return;
    }

    setSaving(true);
    try {
      const url = editingEvent 
        ? `/api/events/${editingEvent.id}` 
        : '/api/events';
      
      const method = editingEvent ? 'PUT' : 'POST';
      
      const cleanFormData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        event_type: formData.event_type,
        start_datetime: new Date(formData.start_datetime).toISOString(),
        end_datetime: formData.end_datetime ? new Date(formData.end_datetime).toISOString() : null,
        location: formData.location.trim() || null,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        requires_confirmation: formData.requires_confirmation,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        is_active: formData.is_active,
      };
      
      await apiRequest(url, {
        method,
        body: JSON.stringify(cleanFormData),
      });

      setShowForm(false);
      setEditingEvent(null);
      window.location.reload();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      alert('Erro ao salvar evento. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (event: Event) => {
    if (!confirm(`Tem certeza que deseja excluir o evento "${event.title}"?`)) {
      return;
    }

    try {
      await apiRequest(`/api/events/${event.id}`, {
        method: 'DELETE',
      });

      window.location.reload();
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      alert('Erro ao excluir evento. Tente novamente.');
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  const getEventTypeInfo = (type: string) => {
    return EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[0];
  };

  const isEventPast = (dateTime: string) => {
    return new Date(dateTime) < new Date();
  };

  const isEventToday = (dateTime: string) => {
    const eventDate = new Date(dateTime);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Calendar className="w-7 h-7 mr-3 text-blue-600" />
                Gestão de Eventos
              </h1>
              <p className="text-gray-600 mt-1">
                Organize e gerencie os eventos da sua igreja
              </p>
            </div>
            <button
              onClick={handleAddEvent}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Evento</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar eventos por título, descrição ou local..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm appearance-none"
              >
                <option value="">Todos os tipos</option>
                {EVENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
            <div className="text-center">
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{events?.length || 0}</p>
              <p className="text-sm text-gray-600">Total de Eventos</p>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Lista de Eventos</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                  <span>{events?.filter(e => e.is_active).length || 0} Ativos</span>
                </div>
                <div className="flex items-center">
                  <XCircle className="w-4 h-4 text-red-600 mr-1" />
                  <span>{events?.filter(e => !e.is_active).length || 0} Inativos</span>
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
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar eventos</h3>
                <p className="text-gray-600">{error}</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm || filterType ? 'Nenhum evento encontrado' : 'Nenhum evento cadastrado'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterType
                    ? 'Tente ajustar sua busca ou filtros'
                    : 'Comece criando o primeiro evento da sua igreja'
                  }
                </p>
                <button
                  onClick={handleAddEvent}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar Primeiro Evento</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => {
                  const typeInfo = getEventTypeInfo(event.event_type);
                  const isPast = isEventPast(event.start_datetime);
                  const isToday = isEventToday(event.start_datetime);
                  
                  return (
                    <div 
                      key={event.id} 
                      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                        isPast ? 'border-gray-200 opacity-75' : 
                        isToday ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                          event.is_active ? 'bg-blue-600' : 'bg-gray-400'
                        }`}>
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{event.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {event.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                            {isToday && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                Hoje
                              </span>
                            )}
                            {isPast && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                Finalizado
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{formatDateTime(event.start_datetime)}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            {event.departments && (
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                <span>{event.departments.name}</span>
                              </div>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-gray-500 mt-1 truncate max-w-md">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewEvent(event)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar evento"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir evento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Event Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingEvent ? 'Editar Evento' : 'Novo Evento'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {editingEvent ? 'Atualize as informações do evento' : 'Crie um novo evento para sua igreja'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título do Evento *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Culto Dominical"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Evento *</label>
                    <select
                      value={formData.event_type}
                      onChange={(e) => setFormData({ ...formData, event_type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {EVENT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora de Início *</label>
                    <input
                      type="datetime-local"
                      value={formData.start_datetime}
                      onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora de Fim</label>
                    <input
                      type="datetime-local"
                      value={formData.end_datetime}
                      onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Templo Principal"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de Participantes</label>
                    <input
                      type="number"
                      value={formData.max_participants}
                      onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Deixe vazio para ilimitado"
                      min="1"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Descrição do evento"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.requires_confirmation}
                        onChange={(e) => setFormData({ ...formData, requires_confirmation: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Requer confirmação de presença</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Evento ativo</span>
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
                  onClick={handleSaveEvent}
                  disabled={saving || !formData.title.trim() || !formData.start_datetime}
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
                      <span>{editingEvent ? 'Atualizar' : 'Salvar'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        {showDetails && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">Detalhes do evento</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getEventTypeInfo(selectedEvent.event_type).color}`}>
                        {getEventTypeInfo(selectedEvent.event_type).label}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        selectedEvent.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedEvent.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
                      <p className="text-gray-900">{formatDateTime(selectedEvent.start_datetime)}</p>
                    </div>
                    {selectedEvent.end_datetime && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Fim</label>
                        <p className="text-gray-900">{formatDateTime(selectedEvent.end_datetime)}</p>
                      </div>
                    )}
                  </div>

                  {selectedEvent.location && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                      <p className="text-gray-900">{selectedEvent.location}</p>
                    </div>
                  )}

                  {selectedEvent.departments && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                      <p className="text-gray-900">{selectedEvent.departments.name}</p>
                    </div>
                  )}

                  {selectedEvent.max_participants && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de Participantes</label>
                      <p className="text-gray-900">{selectedEvent.max_participants}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Requer Confirmação</label>
                    <p className="text-gray-900">{selectedEvent.requires_confirmation ? 'Sim' : 'Não'}</p>
                  </div>

                  {selectedEvent.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <p className="text-gray-900">{selectedEvent.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Criado em</label>
                      <p>{formatDateTime(selectedEvent.created_at)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Atualizado em</label>
                      <p>{formatDateTime(selectedEvent.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    handleEditEvent(selectedEvent);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}