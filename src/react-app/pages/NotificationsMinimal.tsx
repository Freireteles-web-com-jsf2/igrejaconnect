import { Bell } from 'lucide-react';

export default function NotificationsMinimal() {
  console.log('NotificationsMinimal: Rendering');

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Teste Mínimo - Notificações
              </h1>
              <p className="text-gray-600">
                Versão mínima para testar renderização
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">✓</div>
              <div className="text-sm text-blue-700">Página Carregou</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">OK</div>
              <div className="text-sm text-green-700">Componente OK</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-600">🎉</div>
              <div className="text-sm text-purple-700">Funcionando</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Informações de Debug
              </h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">URL:</span> {window.location.href}
                </div>
                <div>
                  <span className="font-medium">Timestamp:</span> {new Date().toLocaleString('pt-BR')}
                </div>
                <div>
                  <span className="font-medium">Status:</span> 
                  <span className="text-green-600 ml-2">✅ Renderizando corretamente</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                💡 Se você está vendo esta página:
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• O roteamento está funcionando</li>
                <li>• O React está renderizando</li>
                <li>• O problema pode estar nos contextos ou hooks</li>
                <li>• Verifique o console para mais detalhes</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  console.log('Botão clicado - teste de interatividade');
                  alert('Interatividade funcionando!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Testar Interatividade
              </button>
              
              <button
                onClick={() => {
                  console.log('Recarregando página...');
                  window.location.reload();
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Recarregar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}