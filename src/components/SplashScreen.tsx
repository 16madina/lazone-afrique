import { useEffect, useState } from 'react';
import splashLogo from '@/assets/lazone-splash-logo.png';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    console.log('🎬 SplashScreen mounted');
    const timer = setTimeout(() => {
      console.log('⏰ Starting fade out animation');
      setIsVisible(false);
      setTimeout(() => {
        console.log('✅ SplashScreen finished, calling onFinish');
        setShouldRender(false);
        onFinish();
      }, 300); // Wait for fade-out animation to complete
    }, 1200); // Synchronized with native splash

    return () => {
      console.log('🧹 SplashScreen unmounting');
      clearTimeout(timer);
    };
  }, [onFinish]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 bg-gradient-to-br from-primary/90 to-secondary/90 flex items-center justify-center transition-all duration-300 ${
        isVisible ? 'animate-fade-in opacity-100 z-[9999]' : 'animate-fade-out opacity-0 z-[9999]'
      }`}
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      <div className={`text-center transition-all duration-300 ${
        isVisible ? 'animate-scale-in scale-100' : 'animate-scale-out scale-95'
      }`}>
        <div className="w-48 h-48 mx-auto mb-8 transform-gpu">
          <img 
            src={splashLogo} 
            alt="LaZone Logo" 
            className={`w-full h-full object-contain drop-shadow-2xl transition-all duration-500 ${
              isVisible ? 'animate-[fade-in_2s_ease-in-out]' : ''
            }`}
            style={{ 
              filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))',
            }}
          />
        </div>
        <div className={`text-white transition-all duration-300 ${
          isVisible ? 'animate-fade-in opacity-100' : 'animate-fade-out opacity-0'
        }`} style={{ animationDelay: isVisible ? '1s' : '0s' }}>
          <p className="text-xl font-fredoka">Trouve ton chez toi dans ta zone</p>
        </div>
      </div>
    </div>
  );
};