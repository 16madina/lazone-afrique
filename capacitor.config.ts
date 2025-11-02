import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lazone.afrique',
  appName: 'lazone-afrique',
  webDir: 'dist',
  // IMPORTANT: Pour la production, ne PAS utiliser server.url
  // Décommenter uniquement pour le développement avec hot-reload
  // server: {
  //   url: 'https://77dab0d8-0ecb-432b-9820-b39b851a7f4a.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#E4A853',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_INSIDE',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: false,
    },
    StatusBar: {
      style: 'LIGHT_CONTENT',
      backgroundColor: '#E4A853',
    },
  },
};

export default config;