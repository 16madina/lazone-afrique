import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

export const useAllNotifications = () => {
  const { user } = useAuth();

  // Fonction utilitaire pour envoyer des notifications
  const sendNotification = async ({ title, body, type, data }: {
    title: string;
    body: string;
    type: string;
    data?: Record<string, any>;
  }) => {
    try {
      console.log('📤 Envoi notification:', { title, body, type });

      // Notification locale (immédiate)
      if (Capacitor.isNativePlatform()) {
        try {
          await LocalNotifications.schedule({
            notifications: [{
              title,
              body,
              id: Math.floor(Math.random() * 100000),
              schedule: { at: new Date(Date.now() + 1000) },
              extra: { type, ...data }
            }]
          });
        } catch (error) {
          console.error('Erreur notification locale:', error);
        }
      }

      // Notification web (navigateur)
      if (!Capacitor.isNativePlatform() && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/src/assets/lazone-logo.png',
          data: { type, ...data }
        });
      }

      // Toast de secours (toujours affiché)
      toast(title, {
        description: body,
        duration: 5000,
      });

      // Notification push via Edge Function (pour mobile natif)
      if (user?.id) {
        try {
          await supabase.functions.invoke('send-push-notification', {
            body: {
              user_id: user.id,
              title,
              body,
              type,
              data
            }
          });
        } catch (error) {
          console.error('Erreur Edge Function notification:', error);
        }
      }
    } catch (error) {
      console.error('Erreur générale sendNotification:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    try {
      console.log('🔔 Initializing all notification listeners for user:', user.id);

      // 1. Écouter les nouveaux messages
      const messagesChannel = supabase
        .channel('all-message-notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        }, async (payload) => {
          try {
            console.log('📨 Nouveau message détecté:', payload);
            
            if (payload.new.sender_id === user.id) return;

            const { data: senderProfile } = await supabase.rpc('get_public_profile_safe', {
              profile_user_id: payload.new.sender_id
            });

            const senderName = (senderProfile as any)?.full_name || 'Utilisateur';
            
            await sendNotification({
              title: `Nouveau message de ${senderName}`,
              body: payload.new.content.substring(0, 100) + (payload.new.content.length > 100 ? '...' : ''),
              type: 'message',
              data: {
                conversation_id: payload.new.conversation_id,
                sender_id: payload.new.sender_id
              }
            });
          } catch (error) {
            console.error('Erreur notification message:', error);
          }
        })
        .subscribe();

      // 2. Écouter les nouvelles demandes de contact (via conversations)
      const contactRequestsChannel = supabase
        .channel('contact-request-notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations'
        }, async (payload) => {
          try {
            console.log('🤝 Nouvelle demande de contact:', payload);
            
            // Vérifier si c'est une conversation liée à une propriété (demande de contact)
            if (payload.new.property_id) {
              const { data: property } = await supabase
                .from('listings')
                .select('title, user_id')
                .eq('id', payload.new.property_id)
                .maybeSingle();

              // Notifier le propriétaire
              if (property?.user_id === user.id) {
                await sendNotification({
                  title: 'Nouvelle demande de contact',
                  body: `Quelqu'un s'intéresse à votre propriété "${property.title}"`,
                  type: 'contact_request',
                  data: {
                    property_id: payload.new.property_id,
                    conversation_id: payload.new.id
                  }
                });
              }
            }
          } catch (error) {
            console.error('Erreur notification contact:', error);
          }
        })
        .subscribe();

      // 3. Écouter les mises à jour de sponsoring
      const sponsorshipChannel = supabase
        .channel('sponsorship-notifications')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'sponsorship_transactions'
        }, async (payload) => {
          try {
            console.log('💰 Mise à jour sponsoring:', payload);
            
            if (payload.new.user_id === user.id) {
              let title = '';
              let body = '';

              if (payload.new.approval_status === 'approved' && payload.old?.approval_status === 'pending') {
                title = 'Sponsoring approuvé !';
                body = 'Votre demande de sponsoring a été approuvée. Votre annonce est maintenant mise en avant.';
              } else if (payload.new.approval_status === 'rejected') {
                title = 'Sponsoring refusé';
                body = 'Votre demande de sponsoring a été refusée. Contactez le support pour plus d\'informations.';
              } else if (payload.new.payment_status === 'completed') {
                title = 'Paiement confirmé';
                body = 'Votre paiement pour le sponsoring a été confirmé.';
              }

              if (title) {
                await sendNotification({
                  title,
                  body,
                  type: 'sponsorship',
                  data: {
                    transaction_id: payload.new.id,
                    approval_status: payload.new.approval_status
                  }
                });
              }
            }
          } catch (error) {
            console.error('Erreur notification sponsoring:', error);
          }
        })
        .subscribe();

      // 4. Écouter les nouvelles demandes de visite (appointments)
      const appointmentsChannel = supabase
        .channel('appointment-notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments'
        }, async (payload) => {
          try {
            console.log('📅 Nouvelle demande de visite:', payload);
            
            // Notification pour le vendeur (owner)
            if (payload.new.owner_user_id === user.id) {
              const { data: visitorProfile } = await supabase.rpc('get_public_profile_safe', {
                profile_user_id: payload.new.visitor_user_id
              });

              const { data: listing } = await supabase
                .from('listings')
                .select('title')
                .eq('id', payload.new.listing_id)
                .single();

              const visitorName = (visitorProfile as any)?.full_name || 'Un utilisateur';
              const listingTitle = listing?.title || 'votre propriété';
              
              const visitTypeText = payload.new.visit_type === 'physical' ? 'une visite physique' :
                                  payload.new.visit_type === 'virtual' ? 'une visite virtuelle' : 'un appel vidéo';

              await sendNotification({
                title: 'Nouvelle demande de visite',
                body: `${visitorName} souhaite planifier ${visitTypeText} pour ${listingTitle}`,
                type: 'appointment_request',
                data: {
                  appointment_id: payload.new.id,
                  listing_id: payload.new.listing_id,
                  visitor_id: payload.new.visitor_user_id
                }
              });
            }
          } catch (error) {
            console.error('Erreur notification appointment:', error);
          }
        })
        .subscribe();

      // 5. Écouter les mises à jour de statut des appointments
      const appointmentUpdatesChannel = supabase
        .channel('appointment-status-updates')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments'
        }, async (payload) => {
          try {
            console.log('📅 Mise à jour appointment:', payload);
            
            // Notification pour le visiteur quand le statut change
            if (payload.new.visitor_user_id === user.id && payload.new.status !== payload.old?.status) {
              const { data: ownerProfile } = await supabase.rpc('get_public_profile_safe', {
                profile_user_id: payload.new.owner_user_id
              });

              const ownerName = (ownerProfile as any)?.full_name || 'Le propriétaire';
              
              let title = '';
              let body = '';

              if (payload.new.status === 'confirmed') {
                title = 'Visite confirmée !';
                body = `${ownerName} a confirmé votre demande de visite`;
              } else if (payload.new.status === 'cancelled') {
                title = 'Visite annulée';
                body = `${ownerName} a annulé votre demande de visite`;
              }

              if (title) {
                await sendNotification({
                  title,
                  body,
                  type: 'appointment_update',
                  data: {
                    appointment_id: payload.new.id,
                    listing_id: payload.new.listing_id,
                    status: payload.new.status
                  }
                });
              }
            }
          } catch (error) {
            console.error('Erreur notification appointment update:', error);
          }
        })
        .subscribe();

      // 6. Écouter les notifications admin (si c'est un admin)
      const adminNotificationsChannel = supabase
        .channel('admin-notifications-updates')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications'
        }, async (payload) => {
          try {
            console.log('👮 Nouvelle notification admin:', payload);
            
            // Vérifier si l'utilisateur est admin
            const { data: isAdmin } = await supabase.rpc('is_admin', { user_uuid: user.id });
            
            if (isAdmin) {
              await sendNotification({
                title: 'Notification Admin',
                body: payload.new.title || 'Nouvelle notification administrateur',
                type: 'admin',
                data: {
                  admin_notification_id: payload.new.id,
                  notification_type: payload.new.type
                }
              });
            }
          } catch (error) {
            console.error('Erreur notification admin:', error);
          }
        })
        .subscribe();

      // 5. Écouter les mises à jour d'annonces importantes
      const listingsChannel = supabase
        .channel('listings-notifications')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'listings'
        }, async (payload) => {
          try {
            console.log('🏠 Mise à jour annonce:', payload);
            
            if (payload.new.user_id === user.id) {
              // Notification si l'annonce est sponsorisée
              if (payload.new.is_sponsored && !payload.old?.is_sponsored) {
                await sendNotification({
                  title: 'Annonce sponsorisée !',
                  body: `Votre annonce "${payload.new.title}" est maintenant sponsorisée et mise en avant.`,
                  type: 'listing_sponsored',
                  data: {
                    listing_id: payload.new.id
                  }
                });
              }
            }
          } catch (error) {
            console.error('Erreur notification annonce:', error);
          }
        })
        .subscribe();

      return () => {
        try {
          console.log('🔕 Arrêt des listeners de notifications');
          supabase.removeChannel(messagesChannel);
          supabase.removeChannel(contactRequestsChannel);
          supabase.removeChannel(sponsorshipChannel);
          supabase.removeChannel(appointmentsChannel);
          supabase.removeChannel(appointmentUpdatesChannel);
          supabase.removeChannel(adminNotificationsChannel);
          supabase.removeChannel(listingsChannel);
        } catch (error) {
          console.error('Erreur lors de l\'arrêt des listeners:', error);
        }
      };
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des notifications:', error);
      return () => {}; // Retourner une fonction de nettoyage vide en cas d'erreur
    }
  }, [user]);

  return { sendNotification };
};