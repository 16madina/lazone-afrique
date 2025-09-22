import { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const usePushNotifications = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const { user } = useAuth();

  // Initialize push notifications
  const initializePushNotifications = async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications only work on native platforms');
      return;
    }

    // Request permission for notifications
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      toast.error('Permissions de notification refusées');
      return;
    }

    // Register for push notifications
    await PushNotifications.register();
    console.log('Push notifications registered');
  };

  // Save push token to database
  const savePushTokenToDatabase = async (token: string) => {
    if (!user) return;

    try {
      // For now, store in local storage until types are updated
      localStorage.setItem('push_token', token);
      localStorage.setItem('push_platform', Capacitor.getPlatform());
      
      // TODO: Save to database once types are generated
      // We'll use an RPC call to insert directly
      const { error } = await supabase.rpc('save_push_token', {
        p_user_id: user.id,
        p_token: token,
        p_platform: Capacitor.getPlatform()
      });

      if (error) {
        console.warn('Push token saved locally, database save failed:', error);
      } else {
        console.log('Push token saved to database');
      }
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  };

  // Send a test notification
  const sendTestNotification = async () => {
    if (!Capacitor.isNativePlatform()) {
      // Fallback to local notification for web
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Test LaZone',
            body: 'Les notifications fonctionnent !',
            id: Math.floor(Math.random() * 1000),
            schedule: { at: new Date(Date.now() + 1000) }
          }
        ]
      });
      return;
    }

    // For native platforms, we'll use the edge function
    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: user?.id,
          title: 'Test LaZone',
          body: 'Les notifications fonctionnent !',
          type: 'test'
        }
      });

      if (error) {
        console.error('Error sending test notification:', error);
        toast.error('Erreur lors de l\'envoi de la notification test');
      } else {
        toast.success('Notification test envoyée');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Initialize push notifications
    initializePushNotifications();

    // Listen for registration success
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
      setPushToken(token.value);
      setIsRegistered(true);
      savePushTokenToDatabase(token.value);
    });

    // Listen for registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
      toast.error('Erreur lors de l\'enregistrement des notifications');
    });

    // Listen for push notifications received
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received: ', notification);
      
      // Show local notification when app is in foreground
      LocalNotifications.schedule({
        notifications: [
          {
            title: notification.title || 'LaZone',
            body: notification.body || 'Nouveau message',
            id: Math.floor(Math.random() * 1000),
            schedule: { at: new Date(Date.now() + 1000) }
          }
        ]
      });
    });

    // Listen for notification actions
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed', notification);
      
      // Handle navigation based on notification data
      if (notification.notification.data?.type === 'message') {
        const conversationId = notification.notification.data?.conversation_id;
        if (conversationId) {
          // Navigate to messages page with conversation
          window.location.href = `/messages?conversation=${conversationId}`;
        }
      }
    });

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [user]);

  return {
    isRegistered,
    pushToken,
    sendTestNotification,
    initializePushNotifications
  };
};