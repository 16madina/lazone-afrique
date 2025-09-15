import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.77dab0d80ecb432b9820b39b851a7f4a',
  appName: 'lazone-afrique',
  webDir: 'dist',
  server: {
    url: 'https://77dab0d8-0ecb-432b-9820-b39b851a7f4a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    StatusBar: {
      style: 'DARK'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;