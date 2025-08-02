import { useState, useEffect } from 'react';
import Layout from '@/react-app/components/Layout';
import PermissionGuard from '@/react-app/components/PermissionGuard';
import CreateNotificationModal from '@/react-app/components/CreateNotificationModal';
import { useApi } from '@/react-app/hooks/useApi';
import { Bell, Calendar, Plus, Clock, Gift, Phone, Mail, Trash2, Check, CheckCheck, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';
import { PermissionModule, PermissionAction } from '@/shared/permissions';

interface Member {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  address: string | null;
  is_active: boolean;
}

interface Department {
  id: number;
  name: string;
  meeting_datetime: string | null;
  is_active: boolean;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  created_by?: string;
}

export default function Notifications() {
  const [selectedTab, setSelectedTab] = useState<'notifications' | 'events' | 'birthdays'>('notifications');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const { data: members } = useApi<Member[]>('/api/members');
  const { data: departments } = useApi<Department[]>('/api/departments');
  const { data: notificationsData, refetch: refetchNotifications } = useApi<Notification[]>('/api/notifications');

  useEffect(() => {
    if (notificationsData) {
      setNotifications(notificationsData);
    }
  }, [notificationsData]);

  // Get birthday members for current month
  const currentMonth = new Date().getMonth() + 1;
  const birthdayMembers = members?.filter(member => {
    if (!member.birth_date || !member.is_active) return false;
    const birthMonth = new Date(member.birth_date).getMonth() + 1;
    return birthMonth === currentMonth;
  }) || [];

  // Get today's birthdays
  const today = new Date();
  const todayBirthdays = members?.filter(member => {
    if (!member.birth_date || !member.is_active) return false;
    const birthDate = new Date(member.birth_date);
    return birthDate.getMonth() === today.getMonth() && birthDate.getDate() === today.getDate();
  }) || [];

  // Get upcoming meetings (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const upcomingMeetings = departments?.filter(dept => {
    if (!dept.meeting_datetime || !dept.is_active) return false;
    const meetingDate = new Date(dept.meeting_datetime);
    return meetingDate >= today && meetingDate <= nextWeek;
  }).sort((a, b) => new Date(a.meeting_datetime!).getTime() - new Date(b.meeting_datetime!).getTime()) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth() - birth.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const createAutoBirthdayNotifications = async () => {
    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch('/api/notifications/auto/birthday', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${result.count} notificações de aniversário criadas!`);
        refetchNotifications();
      }
    } catch (error) {
      console.error('Error creating birthday notifications:', error);
    }
  };

  const createAutoMeetingNotifications = async () => {
    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch('/api/notifications/auto/meetings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${result.count} notificações de reunião criadas!`);
        refetchNotifications();
      }
    } catch (error) {
      console.error('Error creating meeting notifications:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}min atrás`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <PermissionGuard module={PermissionModule.NOTIFICATIONS} action={PermissionAction.VIEW}>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Bell className="w-7 h-7 mr-3 text-purple-600" />
                  Notificações e Agenda
                </h1>
                <p className="text-gray-600 mt-1">
                  Gerencie notificações e eventos da sua igreja
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <PermissionGuard permission="notifications.create">
                  <button 
                    onClick={createAutoBirthdayNotifications}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Notificar Aniversários</span>
                  </button>
                </PermissionGuard>
                <PermissionGuard permission="notifications.create">
                  <button 
                    onClick={createAutoMeetingNotifications}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Notificar Reuniões</span>
                  </button>
                </PermissionGuard>
                <PermissionGuard permission="notifications.create">
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nova Notificação</span>
                  </button>
                </PermissionGuard>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Notificações</p>
                  <p className="text-2xl font-bold text-purple-600">{notifications.length}</p>
                </div>
                <Bell className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Não Lidas</p>
                  <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
                </div>
                <Bell className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aniversários do Mês</p>
                  <p className="text-2xl font-bold text-blue-600">{birthdayMembers.length}</p>
                </div>
                <Gift className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reuniões Próximas</p>
                  <p className="text-2xl font-bold text-green-600">{upcomingMeetings.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setSelectedTab('notifications')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === 'notifications'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Bell className="w-4 h-4 inline mr-2" />
                  Notificações
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setSelectedTab('events')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === 'events'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Próximas Reuniões
                </button>
                <button
                  onClick={() => setSelectedTab('birthdays')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === 'birthdays'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Gift className="w-4 h-4 inline mr-2" />
                  Aniversários
                </button>
              </nav>
            </div>

            <div className="p-6">
              {selectedTab === 'notifications' && (
                <div>
                  {notifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma notificação</h3>
                      <p className="text-gray-600">
                        As notificações aparecerão aqui quando criadas
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Suas Notificações
                        </h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          >
                            <CheckCheck className="w-4 h-4" />
                            <span>Marcar todas como lidas</span>
                          </button>
                        )}
                      </div>
                      
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`border-l-4 rounded-lg p-4 ${getNotificationColor(notification.type)} ${
                            !notification.is_read ? 'shadow-md' : 'opacity-75'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <h4 className={`font-semibold ${
                                    !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  {!notification.is_read && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                  )}
                                </div>
                                <p className="text-gray-700 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {formatNotificationDate(notification.created_at)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 ml-4">
                              {!notification.is_read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                  title="Marcar como lida"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Excluir notificação"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedTab === 'events' && (
                <div>
                  {upcomingMeetings.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma reunião próxima</h3>
                      <p className="text-gray-600">
                        As reuniões dos departamentos aparecerão aqui quando agendadas
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Reuniões nos próximos 7 dias
                      </h3>
                      {upcomingMeetings.map((dept) => (
                        <div key={dept.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{dept.name}</h4>
                              <p className="text-sm text-gray-600">
                                <Clock className="w-4 h-4 inline mr-1" />
                                {formatDateTime(dept.meeting_datetime!)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                              Reunião
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedTab === 'birthdays' && (
                <div>
                  {birthdayMembers.length === 0 ? (
                    <div className="text-center py-12">
                      <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum aniversário este mês</h3>
                      <p className="text-gray-600">
                        Os aniversários dos membros aparecerão aqui automaticamente
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Aniversários de {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </h3>
                      {birthdayMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Gift className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{member.name}</h4>
                              <p className="text-sm text-gray-600">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                {formatDate(member.birth_date!)} • {calculateAge(member.birth_date!) + 1} anos
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                {member.phone && (
                                  <div className="flex items-center">
                                    <Phone className="w-3 h-3 mr-1" />
                                    <span>{member.phone}</span>
                                  </div>
                                )}
                                {member.email && (
                                  <div className="flex items-center">
                                    <Mail className="w-3 h-3 mr-1" />
                                    <span>{member.email}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              todayBirthdays.some(b => b.id === member.id)
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {todayBirthdays.some(b => b.id === member.id) ? 'Hoje!' : 'Este mês'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>


        </div>
      </Layout>

      {/* Create Notification Modal */}
      <CreateNotificationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          refetchNotifications();
        }}
      />
    </PermissionGuard>
  );
}