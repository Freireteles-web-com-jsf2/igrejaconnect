import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/react-app/hooks/useSupabaseAuth';
import { useNotificationContext } from '@/react-app/contexts/NotificationContext';
import { Calendar, Gift, Clock, Settings, Play, Pause } from 'lucide-react';

interface AutoNotificationSettings {
  birthdayReminders: boolean;
  meetingReminders: boolean;
  eventReminders: boolean;
  financialReminders: boolean;
  reminderTime: string; // HH:MM format
}

export default function AutoNotificationManager() {
  const { user } = useSupabaseAuth();
  const { showToast } = useNotificationContext();
  const [settings, setSettings] = useState<AutoNotificationSettings>({
    birthdayReminders: true,
    meetingReminders: true,
    eventReminders: true,
    financialReminders: false,
    reminderTime: '09:00',
  });
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('autoNotificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    const savedActive = localStorage.getItem('autoNotificationsActive');
    setIsActive(savedActive === 'true');
  }, []);

  // Salvar configurações no localStorage
  const saveSettings = (newSettings: AutoNotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('autoNotificationSettings', JSON.stringify(newSettings));
  };

  // Ativar/desativar notificações automáticas
  const toggleAutoNotifications = () => {
    const newActive = !isActive;
    setIsActive(newActive);
    localStorage.setItem('autoNotificationsActive', newActive.toString());

    if (newActive) {
      showToast({
        title: 'Notificações automáticas ativadas',
        message: 'Você receberá lembretes automáticos baseados nas suas configurações',
        type: 'success',
      });
      startAutoNotifications();
    } else {
      showToast({
        title: 'Notificações automáticas desativadas',
        message: 'Os lembretes automáticos foram pausados',
        type: 'info',
      });
      stopAutoNotifications();
    }
  };

  // Iniciar notificações automáticas
  const startAutoNotifications = () => {
    // Verificar aniversários diários
    if (settings.birthdayReminders) {
      checkBirthdays();
      setInterval(checkBirthdays, 24 * 60 * 60 * 1000); // Diário
    }

    // Verificar reuniões
    if (settings.meetingReminders) {
      checkMeetings();
      setInterval(checkMeetings, 60 * 60 * 1000); // A cada hora
    }

    // Verificar eventos
    if (settings.eventReminders) {
      checkEvents();
      setInterval(checkEvents, 60 * 60 * 1000); // A cada hora
    }
  };

  // Parar notificações automáticas
  const stopAutoNotifications = () => {
    // Em uma implementação real, você salvaria os IDs dos intervalos para poder cancelá-los
    console.log('Auto notifications stopped');
  };

  // Verificar aniversários do dia
  const checkBirthdays = async () => {
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
        if (result.count > 0) {
          showToast({
            title: '🎉 Aniversários hoje!',
            message: `${result.count} pessoa(s) fazem aniversário hoje`,
            type: 'info',
          });
        }
      }
    } catch (error) {
      console.error('Error checking birthdays:', error);
    }
  };

  // Verificar reuniões próximas
  const checkMeetings = async () => {
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
        if (result.count > 0) {
          showToast({
            title: '📅 Reuniões próximas',
            message: `${result.count} reunião(ões) nos próximos dias`,
            type: 'info',
          });
        }
      }
    } catch (error) {
      console.error('Error checking meetings:', error);
    }
  };

  // Verificar eventos próximos
  const checkEvents = async () => {
    // Implementar verificação de eventos
    console.log('Checking events...');
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
            {isActive ? (
              <Play className="w-5 h-5 text-green-600" />
            ) : (
              <Pause className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Notificações Automáticas
            </h3>
            <p className="text-xs text-gray-500">
              {isActive ? 'Ativas - lembretes automáticos habilitados' : 'Pausadas'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            title="Configurações"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button
            onClick={toggleAutoNotifications}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              isActive
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isActive ? 'Pausar' : 'Ativar'}
          </button>
        </div>
      </div>

      {/* Status dos lembretes */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={`p-3 rounded-lg border ${settings.birthdayReminders && isActive ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center space-x-2">
            <Gift className={`w-4 h-4 ${settings.birthdayReminders && isActive ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className="text-xs font-medium text-gray-700">Aniversários</span>
          </div>
        </div>

        <div className={`p-3 rounded-lg border ${settings.meetingReminders && isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center space-x-2">
            <Calendar className={`w-4 h-4 ${settings.meetingReminders && isActive ? 'text-green-600' : 'text-gray-400'}`} />
            <span className="text-xs font-medium text-gray-700">Reuniões</span>
          </div>
        </div>

        <div className={`p-3 rounded-lg border ${settings.eventReminders && isActive ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center space-x-2">
            <Calendar className={`w-4 h-4 ${settings.eventReminders && isActive ? 'text-purple-600' : 'text-gray-400'}`} />
            <span className="text-xs font-medium text-gray-700">Eventos</span>
          </div>
        </div>

        <div className={`p-3 rounded-lg border ${settings.financialReminders && isActive ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center space-x-2">
            <Clock className={`w-4 h-4 ${settings.financialReminders && isActive ? 'text-yellow-600' : 'text-gray-400'}`} />
            <span className="text-xs font-medium text-gray-700">Financeiro</span>
          </div>
        </div>
      </div>

      {/* Configurações detalhadas */}
      {showSettings && (
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Configurações</h4>
          
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.birthdayReminders}
                onChange={(e) => saveSettings({ ...settings, birthdayReminders: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Lembrar aniversários diariamente</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.meetingReminders}
                onChange={(e) => saveSettings({ ...settings, meetingReminders: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Lembrar reuniões próximas</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.eventReminders}
                onChange={(e) => saveSettings({ ...settings, eventReminders: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Lembrar eventos próximos</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.financialReminders}
                onChange={(e) => saveSettings({ ...settings, financialReminders: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Lembrar relatórios financeiros</span>
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">Horário dos lembretes:</label>
            <input
              type="time"
              value={settings.reminderTime}
              onChange={(e) => saveSettings({ ...settings, reminderTime: e.target.value })}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
}