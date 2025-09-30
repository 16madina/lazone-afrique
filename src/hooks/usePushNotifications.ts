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
    try {
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
        console.warn('Push notification permissions denied');
        return;
      }

      // Register for push notifications
      await PushNotifications.register();
      console.log('Push notifications registered');
    } catch (error) {
      console.warn('Error initializing push notifications:', error);
    }
  };

  // Save push token to database
  const savePushTokenToDatabase = async (token: string) => {
    if (!user) return;

    try {
      // Store token locally for now
      localStorage.setItem('push_token', token);
      localStorage.setItem('push_platform', Capacitor.getPlatform());
      localStorage.setItem('push_user_id', user.id);
      
      console.log('Push token saved locally:', {
        platform: Capacitor.getPlatform(),
        token: token.substring(0, 10) + '...'
      });
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  };

  // Send a test notification
  const sendTestNotification = async () => {
    if (!Capacitor.isNativePlatform()) {
      // Fallback to local notification for web
      try {
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
        toast.success('Notification test envoyée (locale)');
      } catch (error) {
        console.error('Error sending local notification:', error);
        toast.error('Erreur lors de l\'envoi de la notification test');
      }
      return;
    }

    // For native platforms, send a local notification as test
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Test LaZone',
            body: 'Les notifications push fonctionnent !',
            id: Math.floor(Math.random() * 1000),
            schedule: { at: new Date(Date.now() + 1000) }
          }
        ]
      });
      toast.success('Notification test envoyée');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Erreur lors de l\'envoi de la notification test');
    }
  };

  useEffect(() => {
    if (!user) return;
    
    // Only initialize on native platforms
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications disabled: not a native platform');
      return;
    }

    // Initialize push notifications with better error handling
    const setupPushNotifications = async () => {
      try {
        await initializePushNotifications();
        
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
          // Don't show error toast to avoid spamming users if Firebase is not configured
          console.warn('Push notifications may not be available on this device');
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
          }).catch(err => console.warn('Local notification error:', err));
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
      } catch (error) {
        console.warn('Failed to setup push notifications:', error);
        // Silently fail - the app should continue to work without push notifications
      }
    };

    setupPushNotifications();

    return () => {
      try {
        PushNotifications.removeAllListeners();
      } catch (error) {
        console.warn('Error removing push notification listeners:', error);
      }
    };
  }, [user]);

  return {
    isRegistered,
    pushToken,
    sendTestNotification,
    initializePushNotifications
  };
};