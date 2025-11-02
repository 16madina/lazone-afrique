import { useCallback } from 'react';

// Types pour Haptics (d?finis manuellement car @capacitor/haptics pourrait ne pas ?tre import? partout)
enum ImpactStyle {
  Heavy = 'HEAVY',
  Medium = 'MEDIUM',
  Light = 'LIGHT'
}

enum NotificationType {
  Success = 'SUCCESS',
  Warning = 'WARNING',
  Error = 'ERROR'
}

export const useHaptics = () => {
  // V?rifier si Haptics est disponible
  const isAvailable = useCallback(() => {
    return typeof window !== 'undefined' && 
           'Capacitor' in window && 
           (window as any).Capacitor?.Plugins?.Haptics;
  }, []);

  // Impact Haptic
  const impact = useCallback(async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (!isAvailable()) return;
    
    try {
      const { Haptics } = (window as any).Capacitor.Plugins;
      await Haptics.impact({ style });
    } catch (error) {
      // Silencieusement ignorer si pas disponible
      console.debug('Haptics not available:', error);
    }
  }, [isAvailable]);

  // Notification Haptic
  const notification = useCallback(async (type: NotificationType = NotificationType.Success) => {
    if (!isAvailable()) return;
    
    try {
      const { Haptics } = (window as any).Capacitor.Plugins;
      await Haptics.notification({ type });
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  }, [isAvailable]);

  // S?lection Haptic (pour les listes, switches, etc.)
  const selectionStart = useCallback(async () => {
    if (!isAvailable()) return;
    
    try {
      const { Haptics } = (window as any).Capacitor.Plugins;
      await Haptics.selectionStart();
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  }, [isAvailable]);

  const selectionChanged = useCallback(async () => {
    if (!isAvailable()) return;
    
    try {
      const { Haptics } = (window as any).Capacitor.Plugins;
      await Haptics.selectionChanged();
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  }, [isAvailable]);

  const selectionEnd = useCallback(async () => {
    if (!isAvailable()) return;
    
    try {
      const { Haptics } = (window as any).Capacitor.Plugins;
      await Haptics.selectionEnd();
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  }, [isAvailable]);

  // Helpers avec des noms plus simples
  const light = useCallback(() => impact(ImpactStyle.Light), [impact]);
  const medium = useCallback(() => impact(ImpactStyle.Medium), [impact]);
  const heavy = useCallback(() => impact(ImpactStyle.Heavy), [impact]);
  
  const success = useCallback(() => notification(NotificationType.Success), [notification]);
  const warning = useCallback(() => notification(NotificationType.Warning), [notification]);
  const error = useCallback(() => notification(NotificationType.Error), [notification]);

  return {
    // Impact
    impact,
    light,
    medium,
    heavy,
    
    // Notifications
    notification,
    success,
    warning,
    error,
    
    // S?lection
    selectionStart,
    selectionChanged,
    selectionEnd,
    
    // Utilitaire
    isAvailable: isAvailable()
  };
};

export default useHaptics;
