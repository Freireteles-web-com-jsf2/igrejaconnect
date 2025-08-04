// Utilitário para testar o sistema de notificações

export const testNotificationSystem = {
  // Testar notificação toast
  testToast: (showToast: Function) => {
    showToast({
      title: '🧪 Teste de Toast',
      message: 'Esta é uma notificação de teste do sistema',
      type: 'info',
    });
  },

  // Testar notificação push
  testPushNotification: () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🧪 Teste Push - IgrejaConnect', {
        body: 'Sistema de notificações funcionando corretamente!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification',
      });
      return true;
    }
    return false;
  },

  // Testar criação de notificação via API
  testApiNotification: async () => {
    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '🧪 Teste de API',
          message: 'Notificação criada via API de teste',
          type: 'success',
          send_to_all: false,
          target_users: [], // Apenas para o usuário atual
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Teste de API bem-sucedido:', result);
        return true;
      } else {
        console.error('❌ Erro no teste de API:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro no teste de API:', error);
      return false;
    }
  },

  // Testar notificações automáticas de aniversário
  testBirthdayNotifications: async () => {
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
        console.log('✅ Teste de aniversários bem-sucedido:', result);
        return result;
      } else {
        console.error('❌ Erro no teste de aniversários:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro no teste de aniversários:', error);
      return false;
    }
  },

  // Testar notificações automáticas de reuniões
  testMeetingNotifications: async () => {
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
        console.log('✅ Teste de reuniões bem-sucedido:', result);
        return result;
      } else {
        console.error('❌ Erro no teste de reuniões:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro no teste de reuniões:', error);
      return false;
    }
  },

  // Executar todos os testes
  runAllTests: async (showToast: Function) => {
    console.log('🧪 Iniciando testes do sistema de notificações...');
    
    // Teste 1: Toast
    console.log('1. Testando toast...');
    testNotificationSystem.testToast(showToast);
    
    // Aguardar 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Teste 2: Push Notification
    console.log('2. Testando push notification...');
    const pushResult = testNotificationSystem.testPushNotification();
    console.log(pushResult ? '✅ Push notification OK' : '⚠️ Push notification não disponível');
    
    // Aguardar 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Teste 3: API Notification
    console.log('3. Testando API de notificações...');
    const apiResult = await testNotificationSystem.testApiNotification();
    console.log(apiResult ? '✅ API OK' : '❌ API com erro');
    
    // Aguardar 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Teste 4: Birthday Notifications
    console.log('4. Testando notificações de aniversário...');
    const birthdayResult = await testNotificationSystem.testBirthdayNotifications();
    console.log(birthdayResult ? '✅ Aniversários OK' : '❌ Aniversários com erro');
    
    // Aguardar 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Teste 5: Meeting Notifications
    console.log('5. Testando notificações de reuniões...');
    const meetingResult = await testNotificationSystem.testMeetingNotifications();
    console.log(meetingResult ? '✅ Reuniões OK' : '❌ Reuniões com erro');
    
    console.log('🎉 Testes concluídos!');
    
    // Toast final
    showToast({
      title: '🎉 Testes concluídos!',
      message: 'Verifique o console para ver os resultados detalhados',
      type: 'success',
    });
    
    return {
      toast: true,
      push: pushResult,
      api: apiResult,
      birthday: !!birthdayResult,
      meeting: !!meetingResult,
    };
  },
};

// Adicionar ao window para acesso via console
if (typeof window !== 'undefined') {
  (window as any).testNotifications = testNotificationSystem;
}