import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export const useCapacitor = () => {
  const [statusBarHeight, setStatusBarHeight] = useState(0);
  
  useEffect(() => {
    const initializeCapacitor = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          try {
            // Configure status bar
            await StatusBar.setStyle({ style: Style.Light });
            await StatusBar.setBackgroundColor({ color: '#E4A853' });
            
            // Get status bar info for Android
            if (Capacitor.getPlatform() === 'android') {
              // For Android, set a standard status bar height
              // Most Android devices have 24dp status bar (24px at 1x density)
              const androidStatusBarHeight = 24;
              setStatusBarHeight(androidStatusBarHeight);
              
              // Set CSS custom property for Android safe area
              document.documentElement.style.setProperty(
                '--android-status-bar-height', 
                `${androidStatusBarHeight}px`
              );
            }
            
            // Hide splash screen
            await SplashScreen.hide();
          } catch (error) {
            console.warn('Capacitor initialization error:', error);
          }
        }
      } catch (error) {
        console.warn('Capacitor hook error:', error);
      }
    };

    initializeCapacitor();
  }, []);

  return {
    isNative: Capacitor.isNativePlatform(),
    platform: Capacitor.getPlatform(),
    isAndroid: Capacitor.getPlatform() === 'android',
    isIOS: Capacitor.getPlatform() === 'ios',
    statusBarHeight,
  };
};