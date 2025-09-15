import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export const useCapacitor = () => {
  useEffect(() => {
    const initializeCapacitor = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // Configure status bar
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#E4A853' });
          
          // Hide splash screen
          await SplashScreen.hide();
        } catch (error) {
          console.warn('Capacitor initialization error:', error);
        }
      }
    };

    initializeCapacitor();
  }, []);

  return {
    isNative: Capacitor.isNativePlatform(),
    platform: Capacitor.getPlatform(),
  };
};