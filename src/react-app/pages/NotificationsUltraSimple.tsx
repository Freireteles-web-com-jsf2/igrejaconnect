import { useState } from 'react';
import Layout from '@/react-app/components/Layout';
import PermissionGuard from '@/react-app/components/PermissionGuard';
import { Bell, Settings } from 'lucide-react';
import { PermissionModule, PermissionAction } from '@/shared/permissions';

export default function NotificationsUltraSimple() {
  const [selectedTab, setSelectedTab] = useState('notifications');
  
  console.log('NotificationsUltraSimple: Rendering - START');

  // Sem hooks para evitar problemas

  console.log('NotificationsUltraSimple: Before return');

  return (
    <PermissionGuard module={PermissionModule.NOTIFICATIONS} action={PermissionAction.VIEW}>
      <Layout>
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Bell className="w-7 h-7 mr-3 text-purple-600" />
              Notificações - Ultra Simples
            </h1>
            <p className="text-gray-600 mt-1">
              Versão sem hooks para identificar o problema
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-purple-600">0</p>
                </div>
                <Bell className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="text-2xl font-bold text-green-600">OK</p>
                </div>
                <Bell className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => {
                    console.log('Tab clicked: notifications');
                    setSelectedTab('notifications');
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === 'notifications'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  <Bell className="w-4 h-4 inline mr-2" />
                  Notificações
                </button>
                <button
                  onClick={() => {
                    console.log('Tab clicked: settings');
                    setSelectedTab('settings');
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === 'settings'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Debug
                </button>
              </nav>
            </div>

            <div className="p-6">
              {selectedTab === 'notifications' && (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Versão Ultra Simples
                  </h3>
                  <p className="text-gray-600">
                    Sem hooks, sem contextos complexos - apenas Layout + PermissionGuard
                  </p>
                </div>
              )}

              {selectedTab === 'settings' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Debug Information
                  </h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Status dos Componentes:</h4>
                    <div className="space-y-1 text-sm">
                      <div>✅ Layout: Funcionando</div>
                      <div>✅ PermissionGuard: Funcionando</div>
                      <div>❌ useNotifications: Removido (pode ser o problema)</div>
                      <div>✅ Estado local: Funcionando</div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Se esta página funcionar:</h4>
                    <p className="text-sm text-blue-800">
                      O problema está no useNotifications hook ou no NotificationContext
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      console.log('Test button clicked - Ultra Simple version');
                      alert('Ultra Simple version funcionando!');
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    ✅ Testar Interação
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </PermissionGuard>
  );
}