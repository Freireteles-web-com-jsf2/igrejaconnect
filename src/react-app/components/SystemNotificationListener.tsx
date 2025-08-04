import { useEffect } from 'react';
import { useSupabaseAuth } from '@/react-app/hooks/useSupabaseAuth';
import { supabase } from '@/shared/supabase';

export default function SystemNotificationListener() {
  const { user } = useSupabaseAuth();
  
  // Tentar usar o contexto de notificação, mas não falhar se não estiver disponível
  let showToast: ((notification: any) => void) | null = null;
  
  try {
    const { useNotificationContext } = require('@/react-app/contexts/NotificationContext');
    const context = useNotificationContext();
    showToast = context.showToast;
  } catch (error) {
    // NotificationProvider não está disponível, usar fallback
    console.log('SystemNotificationListener: NotificationProvider not available, using fallback');
    showToast = (notification: any) => {
      console.log('System notification (fallback):', notification);
    };
  }

  useEffect(() => {
    if (!user || !showToast) return;

    // Escutar mudanças em membros (novos cadastros, aniversários)
    const membersChannel = supabase
      .channel('members-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'members',
        },
        (payload) => {
          const newMember = payload.new as any;
          showToast({
            title: '👥 Novo membro cadastrado',
            message: `${newMember.name} foi adicionado ao sistema`,
            type: 'success',
          });
        }
      )
      .subscribe();

    // Escutar mudanças em transações financeiras
    const financialChannel = supabase
      .channel('financial-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'financial_transactions',
        },
        (payload) => {
          const transaction = payload.new as any;
          const isIncome = transaction.type === 'receita';
          
          showToast({
            title: `💰 Nova ${isIncome ? 'receita' : 'despesa'}`,
            message: `${transaction.description}: R$ ${transaction.amount.toFixed(2)}`,
            type: isIncome ? 'success' : 'info',
          });
        }
      )
      .subscribe();

    // Escutar mudanças em eventos
    const eventsChannel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
        },
        (payload) => {
          const event = payload.new as any;
          showToast({
            title: '📅 Novo evento criado',
            message: `${event.title} - ${new Date(event.date).toLocaleDateString('pt-BR')}`,
            type: 'info',
          });
        }
      )
      .subscribe();

    // Verificar aniversários diários
    const checkDailyBirthdays = () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Verificar se já foi executado hoje
      const lastCheck = localStorage.getItem('lastBirthdayCheck');
      if (lastCheck === todayStr) return;

      // Buscar aniversariantes do dia
      supabase
        .from('members')
        .select('id, name, birth_date')
        .eq('is_active', true)
        .not('birth_date', 'is', null)
        .then(({ data, error }) => {
          if (error || !data) return;

          const todayBirthdays = data.filter(member => {
            if (!member.birth_date) return false;
            const birthDate = new Date(member.birth_date);
            return birthDate.getMonth() === today.getMonth() && 
                   birthDate.getDate() === today.getDate();
          });

          if (todayBirthdays.length > 0) {
            todayBirthdays.forEach(member => {
              const age = today.getFullYear() - new Date(member.birth_date!).getFullYear();
              showToast({
                title: '🎉 Aniversário hoje!',
                message: `${member.name} está fazendo ${age} anos hoje!`,
                type: 'success',
              });
            });
          }

          localStorage.setItem('lastBirthdayCheck', todayStr);
        });
    };

    // Verificar aniversários na inicialização e a cada hora
    checkDailyBirthdays();
    const birthdayInterval = setInterval(checkDailyBirthdays, 60 * 60 * 1000);

    // Verificar reuniões próximas
    const checkUpcomingMeetings = () => {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      
      supabase
        .from('departments')
        .select('id, name, meeting_datetime')
        .eq('is_active', true)
        .not('meeting_datetime', 'is', null)
        .gte('meeting_datetime', now.toISOString())
        .lte('meeting_datetime', oneHourFromNow.toISOString())
        .then(({ data, error }) => {
          if (error || !data) return;

          data.forEach(dept => {
            const meetingTime = new Date(dept.meeting_datetime!);
            const minutesUntil = Math.round((meetingTime.getTime() - now.getTime()) / (1000 * 60));
            
            showToast({
              title: '⏰ Reunião em breve',
              message: `${dept.name} em ${minutesUntil} minutos`,
              type: 'warning',
            });
          });
        });
    };

    // Verificar reuniões a cada 15 minutos
    const meetingInterval = setInterval(checkUpcomingMeetings, 15 * 60 * 1000);

    return () => {
      supabase.removeChannel(membersChannel);
      supabase.removeChannel(financialChannel);
      supabase.removeChannel(eventsChannel);
      clearInterval(birthdayInterval);
      clearInterval(meetingInterval);
    };
  }, [user]);

  return null; // Este componente não renderiza nada
}