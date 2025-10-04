import { useEffect } from 'react';
import { useCapacitor } from '@/hooks/useCapacitor';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAllNotifications } from '@/hooks/useAllNotifications';

/**
 * NativeInitializer - Component responsible for initializing native features
 * This component is mounted once at the app level (outside BrowserRouter)
 * to prevent re-initialization on route changes
 */
export const NativeInitializer = () => {
  // Initialize Capacitor hooks (status bar, splash screen, etc.)
  useCapacitor();
  
  // Initialize push notifications for authenticated users
  usePushNotifications();
  
  // Initialize all notification listeners
  useAllNotifications();

  useEffect(() => {
    console.log('✅ Native features initialized');
  }, []);

  // This component doesn't render anything
  return null;
};
