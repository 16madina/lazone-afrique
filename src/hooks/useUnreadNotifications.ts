import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useUnreadNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    // Écouter tous les événements qui génèrent des notifications
    let localCount = 0;

    // 1. Messages non lus
    const messagesChannel = supabase
      .channel('unread-messages-count')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        if (payload.new.sender_id !== user.id) {
          localCount++;
          setUnreadCount(localCount);
        }
      })
      .subscribe();

    // 2. Demandes de visite
    const appointmentsChannel = supabase
      .channel('unread-appointments-count')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'appointments'
      }, (payload) => {
        if (payload.new.owner_user_id === user.id) {
          localCount++;
          setUnreadCount(localCount);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'appointments'
      }, (payload) => {
        if (payload.new.visitor_user_id === user.id && payload.new.status !== payload.old?.status) {
          localCount++;
          setUnreadCount(localCount);
        }
      })
      .subscribe();

    // 3. Nouvelles conversations
    const conversationsChannel = supabase
      .channel('unread-conversations-count')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'conversations'
      }, async (payload) => {
        if (payload.new.property_id) {
          const { data: property } = await supabase
            .from('listings')
            .select('user_id')
            .eq('id', payload.new.property_id)
            .maybeSingle();

          if (property?.user_id === user.id) {
            localCount++;
            setUnreadCount(localCount);
          }
        }
      })
      .subscribe();

    // 4. Sponsorships
    const sponsorshipChannel = supabase
      .channel('unread-sponsorship-count')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'sponsorship_transactions'
      }, (payload) => {
        if (payload.new.user_id === user.id && 
            (payload.new.approval_status !== payload.old?.approval_status ||
             payload.new.payment_status !== payload.old?.payment_status)) {
          localCount++;
          setUnreadCount(localCount);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(sponsorshipChannel);
    };
  }, [user]);

  const resetCount = () => {
    setUnreadCount(0);
  };

  return { unreadCount, resetCount };
};
