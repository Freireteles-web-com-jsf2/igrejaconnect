import { useState } from 'react';
import Layout from '@/react-app/components/Layout';
import { Bell, Settings } from 'lucide-react';

export default function NotificationsGradual() {
  const [selectedTab, setSelectedTab] = useState('notifications');

  console.log('NotificationsGradual: Rendering');

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Bell className="w-7 h-7 mr-3 text-purple-600" />
                Notificações - Versão Gradual
              </h1>
              <p className="text-gray-600 mt-1">
                Testando componentes gradualmente
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats - Valores fixos para teste */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Notificações</p>
                <p className="text-2xl font-bold text-purple-600">5</p>
              </div>
              <Bell className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Não Lidas</p>
                <p className="text-2xl font-bold text-red-600">2</p>
              </div>
              <Bell className="w-8 h-8 text-red-600" />
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
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  2
                </span>
              </button>
              <button
                onClick={() => setSelectedTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'settings'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Configurações
              </button>
            </nav>
          </div>

          <div className="p-6">
            {selectedTab === 'notifications' && (
              <div>
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Teste de Notificações
                  </h3>
                  <p className="text-gray-600">
                    Esta versão usa Layout mas sem contextos complexos
                  </p>
                </div>

                {/* Simulação de notificações */}
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Notificações Simuladas (5)
                  </h3>
                  
                  {[1, 2, 3, 4, 5].map((id) => (
                    <div
                      key={id}
                      className={`border-l-4 rounded-lg p-4 border-l-blue-500 bg-blue-50 ${
                        id <= 2 ? 'shadow-md' : 'opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            <Bell className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className={`font-semibold ${
                                id <= 2 ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                Notificação de Teste #{id}
                              </h4>
                              {id <= 2 && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-gray-700 mt-1">
                              Esta é uma notificação simulada para testar a interface
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date().toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Configurações de Teste
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Esta versão usa Layout mas sem contextos complexos
                  </p>
                </div>

                {/* Status do Teste */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-gray-900">
                      Status do Teste
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-800">
                          Layout Funcionando
                        </span>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        Sidebar, navegação e layout principal OK
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-800">
                          Componente Básico OK
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 mt-1">
                        Abas, cards e interações funcionando
                      </p>
                    </div>

                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm font-medium text-yellow-800">
                          Sem Contextos Complexos
                        </span>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">
                        NotificationContext, useNotifications removidos
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botões de Teste */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      console.log('Teste de interação - Layout OK');
                      alert('Layout e componente funcionando!');
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ✅ Testar Layout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}