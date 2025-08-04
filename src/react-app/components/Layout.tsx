import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useSupabaseAuth } from '@/react-app/hooks/useSupabaseAuth';
import SystemNotificationListener from './SystemNotificationListener';
import { getAvatarUrl } from '@/react-app/utils/avatarPlaceholder';
import { LogOut, Users, DollarSign, Bell, Home, Menu, Shield, Settings, Building2, Calendar, FileText, Megaphone, ChevronRight, Activity } from 'lucide-react';
import { useState } from 'react';
import { usePermissions } from '@/react-app/hooks/usePermissions';
import { PermissionModule } from '@/shared/permissions';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasModuleAccess, isAdministrator } = usePermissions();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Função para verificar se a rota está ativa
  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  // Organizar itens do menu por seções
  const menuSections = [
    {
      title: 'Principal',
      items: [
        {
          name: 'Dashboard',
          href: '/',
          icon: Home,
          permission: PermissionModule.DASHBOARD,
          show: hasModuleAccess(PermissionModule.DASHBOARD),
          description: 'Visão geral do sistema',
          badge: null
        }
      ]
    },
    {
      title: 'Gestão',
      items: [
        {
          name: 'Membros',
          href: '/members',
          icon: Users,
          permission: PermissionModule.MEMBERS,
          show: hasModuleAccess(PermissionModule.MEMBERS),
          description: 'Gerenciar membros da igreja',
          badge: null
        },
        {
          name: 'Departamentos',
          href: '/departments',
          icon: Building2,
          permission: PermissionModule.DEPARTMENTS,
          show: hasModuleAccess(PermissionModule.DEPARTMENTS),
          description: 'Ministérios e lideranças',
          badge: null
        },
        {
          name: 'Eventos',
          href: '/events',
          icon: Calendar,
          permission: PermissionModule.EVENTS,
          show: hasModuleAccess(PermissionModule.EVENTS),
          description: 'Cultos e programações',
          badge: null
        },
        {
          name: 'Financeiro',
          href: '/finance',
          icon: DollarSign,
          permission: PermissionModule.FINANCIAL,
          show: hasModuleAccess(PermissionModule.FINANCIAL),
          description: 'Receitas e despesas',
          badge: null
        }
      ]
    },
    {
      title: 'Comunicação',
      items: [
        {
          name: 'Avisos',
          href: '/communication',
          icon: Megaphone,
          permission: PermissionModule.NOTIFICATIONS,
          show: hasModuleAccess(PermissionModule.NOTIFICATIONS),
          description: 'Comunicados e avisos',
          badge: 'Novo'
        },
        {
          name: 'Notificações',
          href: '/notifications',
          icon: Bell,
          permission: PermissionModule.NOTIFICATIONS,
          show: hasModuleAccess(PermissionModule.NOTIFICATIONS),
          description: 'Aniversários e lembretes',
          badge: null
        }
      ]
    },
    {
      title: 'Relatórios',
      items: [
        {
          name: 'Relatórios',
          href: '/reports',
          icon: FileText,
          permission: PermissionModule.FINANCIAL,
          show: hasModuleAccess(PermissionModule.FINANCIAL),
          description: 'Exportar dados em PDF/Excel',
          badge: 'Beta'
        }
      ]
    },
    {
      title: 'Administração',
      items: [
        {
          name: 'Usuários',
          href: '/users',
          icon: Shield,
          permission: PermissionModule.USERS,
          show: isAdministrator(),
          description: 'Gerenciar usuários e permissões',
          badge: null
        },
        {
          name: 'Configurações',
          href: '/settings',
          icon: Settings,
          permission: PermissionModule.SETTINGS,
          show: hasModuleAccess(PermissionModule.SETTINGS),
          description: 'Personalizar sistema',
          badge: null
        }
      ]
    }
  ];

  // Filtrar seções que têm pelo menos um item visível
  const visibleSections = menuSections.filter(section =>
    section.items.some(item => item.show)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* System Notification Listener */}
      <SystemNotificationListener />
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">IgrejaConnect</h1>
              <p className="text-xs text-blue-100 mt-1">Sistema de Gestão</p>
            </div>
          </div>
          <div className="absolute top-3 right-3 flex items-center">
            <Activity className="w-3 h-3 text-green-400 animate-pulse mr-1" />
            <span className="text-xs text-blue-100">Online</span>
          </div>
        </div>

        <nav className="mt-6 px-4 flex-1 overflow-y-auto pb-40">
          {visibleSections.map((section) => (
            <div key={section.title} className="mb-8">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.filter(item => item.show).map((item) => {
                  const isActive = isActiveRoute(item.href);
                  return (
                    <button
                      key={item.name}
                      onClick={() => navigate(item.href)}
                      className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-sm ${isActive
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      title={item.description}
                    >
                      <item.icon className={`w-5 h-5 mr-3 ${isActive
                        ? 'text-blue-600'
                        : 'text-gray-400 group-hover:text-blue-500'
                        }`} />
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.name}</span>
                          {item.badge && (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${item.badge === 'Novo'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                              }`}>
                              {item.badge}
                            </span>
                          )}
                          {isActive && (
                            <ChevronRight className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className={`text-xs mt-0.5 ${isActive
                          ? 'text-blue-500'
                          : 'text-gray-500 group-hover:text-blue-400'
                          }`}>
                          {item.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center mb-3 p-3 bg-white rounded-lg shadow-sm">
            <div className="relative">
              <img
                src={getAvatarUrl(user?.avatar_url, user?.name, 40)}
                alt="Profile"
                className="w-10 h-10 rounded-full mr-3 border-2 border-blue-200"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || user?.email}
              </p>
              <p className="text-xs text-gray-500 truncate flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                {user?.role || 'Membro'}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200"
            >
              <Settings className="w-4 h-4 mr-3" />
              Configurações
            </button>
            <button
              onClick={signOut}
              className="flex items-center w-full px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 hover:shadow-sm transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sair do Sistema
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Breadcrumb */}
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <Home className="w-4 h-4" />
                <ChevronRight className="w-4 h-4" />
                <span className="font-medium text-gray-900">
                  {menuSections
                    .flatMap(section => section.items)
                    .find(item => isActiveRoute(item.href))?.name || 'Página'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notificações */}
              <div className="relative">
                <button
                  onClick={() => {
                    console.log('Clicou no ícone de notificação do Layout - navegando para /notifications');
                    navigate('/notifications');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Sistema de Notificações"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                </button>
              </div>

              {/* Avatar do usuário */}
              <div className="flex items-center space-x-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || user?.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date().toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </p>
                </div>
                <img
                  src={getAvatarUrl(user?.avatar_url, user?.name, 32)}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-700">Navegação Rápida</h2>
              <div className="text-xs text-gray-500">
                {menuSections
                  .flatMap(section => section.items)
                  .find(item => isActiveRoute(item.href))?.description || 'Selecione uma página'}
              </div>
            </div>
            <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide pb-2">
              {/* Dashboard */}
              <div className="relative">
                <button
                  onClick={() => navigate('/')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 mr-1 ${isActiveRoute('/')
                      ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                    }`}
                  title="Visão geral do sistema"
                >
                  <Home className={`w-4 h-4 mr-2 ${isActiveRoute('/') ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">D</span>
                </button>
                {isActiveRoute('/') && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>

              <div className="h-6 w-px bg-gray-200 mx-3 flex-shrink-0"></div>

              {/* Membros */}
              <div className="relative">
                <button
                  onClick={() => navigate('/members')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 mr-1 ${isActiveRoute('/members')
                      ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                    }`}
                  title="Gerenciar membros da igreja"
                >
                  <Users className={`w-4 h-4 mr-2 ${isActiveRoute('/members') ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="hidden sm:inline">Membros</span>
                  <span className="sm:hidden">M</span>
                </button>
                {isActiveRoute('/members') && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>

              {/* Departamentos */}
              <div className="relative">
                <button
                  onClick={() => navigate('/departments')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 mr-1 ${isActiveRoute('/departments')
                      ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                    }`}
                  title="Ministérios e lideranças"
                >
                  <Building2 className={`w-4 h-4 mr-2 ${isActiveRoute('/departments') ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="hidden sm:inline">Departamentos</span>
                  <span className="sm:hidden">D</span>
                </button>
                {isActiveRoute('/departments') && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>

              {/* Eventos */}
              <div className="relative">
                <button
                  onClick={() => navigate('/events')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 mr-1 ${isActiveRoute('/events')
                      ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                    }`}
                  title="Cultos e programações"
                >
                  <Calendar className={`w-4 h-4 mr-2 ${isActiveRoute('/events') ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="hidden sm:inline">Eventos</span>
                  <span className="sm:hidden">E</span>
                </button>
                {isActiveRoute('/events') && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>

              {/* Financeiro */}
              <div className="relative">
                <button
                  onClick={() => navigate('/finance')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 mr-1 ${isActiveRoute('/finance')
                      ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                    }`}
                  title="Receitas e despesas"
                >
                  <DollarSign className={`w-4 h-4 mr-2 ${isActiveRoute('/finance') ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="hidden sm:inline">Financeiro</span>
                  <span className="sm:hidden">F</span>
                </button>
                {isActiveRoute('/finance') && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>

              <div className="h-6 w-px bg-gray-200 mx-3 flex-shrink-0"></div>

              {/* Avisos */}
              <div className="relative">
                <button
                  onClick={() => navigate('/communication')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 mr-1 ${isActiveRoute('/communication')
                      ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                    }`}
                  title="Comunicados e avisos"
                >
                  <Megaphone className={`w-4 h-4 mr-2 ${isActiveRoute('/communication') ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="hidden sm:inline">Avisos</span>
                  <span className="sm:hidden">A</span>
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    Novo
                  </span>
                </button>
                {isActiveRoute('/communication') && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>

              {/* Notificações */}
              <div className="relative">
                <button
                  onClick={() => navigate('/notifications')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 mr-1 ${isActiveRoute('/notifications')
                      ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                    }`}
                  title="Aniversários e lembretes"
                >
                  <Bell className={`w-4 h-4 mr-2 ${isActiveRoute('/notifications') ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="hidden sm:inline">Notificações</span>
                  <span className="sm:hidden">N</span>
                </button>
                {isActiveRoute('/notifications') && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>

              <div className="h-6 w-px bg-gray-200 mx-3 flex-shrink-0"></div>

              {/* Relatórios */}
              <div className="relative">
                <button
                  onClick={() => navigate('/reports')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 mr-1 ${isActiveRoute('/reports')
                      ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                    }`}
                  title="Exportar dados em PDF/Excel"
                >
                  <FileText className={`w-4 h-4 mr-2 ${isActiveRoute('/reports') ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="hidden sm:inline">Relatórios</span>
                  <span className="sm:hidden">R</span>
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                    Beta
                  </span>
                </button>
                {isActiveRoute('/reports') && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>

              {/* Usuários (apenas para administradores) */}
              {isAdministrator() && (
                <>
                  <div className="h-6 w-px bg-gray-200 mx-3 flex-shrink-0"></div>
                  <div className="relative">
                    <button
                      onClick={() => navigate('/users')}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 mr-1 ${isActiveRoute('/users')
                          ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                        }`}
                      title="Gerenciar usuários e permissões"
                    >
                      <Shield className={`w-4 h-4 mr-2 ${isActiveRoute('/users') ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className="hidden sm:inline">Usuários</span>
                      <span className="sm:hidden">U</span>
                    </button>
                    {isActiveRoute('/users') && (
                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </>
              )}

              {/* Configurações */}
              <div className="relative">
                <button
                  onClick={() => navigate('/settings')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 mr-1 ${isActiveRoute('/settings')
                      ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                    }`}
                  title="Personalizar sistema"
                >
                  <Settings className={`w-4 h-4 mr-2 ${isActiveRoute('/settings') ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="hidden sm:inline">Configurações</span>
                  <span className="sm:hidden">C</span>
                </button>
                {isActiveRoute('/settings') && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
