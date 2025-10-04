import { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

// Session flag to ensure push notifications are only initialized once
let hasInitialized = false;

export const usePushNotifications = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const { user } = useAuth();

  // Initialize push notifications
  const initializePushNotifications = async () => {
    try {
      if (!Capacitor.isNativePlatform()) {
        logger.info('Push notifications only work on native platforms');
        return;
      }

      // Request permission for notifications
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        logger.warn('Push notification permissions denied');
        return;
      }

      // Register for push notifications
      await PushNotifications.register();
      logger.info('Push notifications registered');
    } catch (error) {
      logger.error('Error initializing push notifications', error);
    }
  };

  // Save push token to database securely using RPC
  const savePushTokenToDatabase = async (token: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('save_push_token', {
        p_user_id: user.id,
        p_token: token,
        p_platform: Capacitor.getPlatform()
      });
      
      if (error) {
        logger.error('Error saving push token to database', error);
      } else {
        logger.info('Push token saved successfully to database');
      }
    } catch (error) {
      logger.error('Error saving push token', error);
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
        logger.error('Error sending local notification', error);
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
      logger.error('Error sending test notification', error);
      toast.error('Erreur lors de l\'envoi de la notification test');
    }
  };

  useEffect(() => {
    // Don't initialize if no user or already initialized
    if (!user || hasInitialized) return;
    
    // Only initialize on native platforms
    if (!Capacitor.isNativePlatform()) {
      logger.info('Push notifications disabled: not a native platform');
      return;
    }

    logger.info('🔔 Initializing push notifications for user:', user.id);

    // Initialize push notifications with better error handling
    const setupPushNotifications = async () => {
      try {
        await initializePushNotifications();
        
        // Mark as initialized to prevent multiple attempts
        hasInitialized = true;
        
        // Listen for registration success
        PushNotifications.addListener('registration', (token) => {
          logger.info('✅ Push registration success, token: ' + token.value.substring(0, 20) + '...');
          setPushToken(token.value);
          setIsRegistered(true);
          savePushTokenToDatabase(token.value);
        });

        // Listen for registration errors
        PushNotifications.addListener('registrationError', (error) => {
          logger.error('Error on registration', error);
          logger.warn('Push notifications may not be available on this device');
        });

        // Listen for push notifications received
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          logger.safe('Push notification received', notification);
          
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
          }).catch(err => logger.warn('Local notification error:', err));
        });

        // Listen for notification actions
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          logger.info('Push notification action performed', notification.actionId);
          
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
        logger.warn('Failed to setup push notifications', error);
        // Silently fail - the app should continue to work without push notifications
      }
    };

    setupPushNotifications();

    return () => {
      try {
        PushNotifications.removeAllListeners();
      } catch (error) {
        logger.warn('Error removing push notification listeners', error);
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