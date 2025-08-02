import { Users } from 'lucide-react';

export default function UserManagementSimple() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          <Users className="w-7 h-7 mr-3 text-blue-600 inline" />
          Sistema de Usuários - Debug
        </h1>
        <div className="space-y-2">
          <p>✅ Página carregada com sucesso</p>
          <p>✅ Componente renderizado</p>
          <p>✅ Sem loops infinitos</p>
          <p className="text-sm text-gray-600 mt-4">
            Se você está vendo esta mensagem, o problema não está na estrutura básica da página.
          </p>
        </div>
      </div>
    </div>
  );
}