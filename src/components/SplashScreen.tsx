import { useEffect, useState } from 'react';
import splashLogo from '@/assets/lazone-splash-logo.png';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500); // Wait for fade out animation to complete
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-primary/90 to-secondary/90 z-50 flex items-center justify-center animate-fade-out">
        <div className="text-center animate-scale-out">
          <div className="w-48 h-48 mx-auto mb-8 animate-scale-out">
            <img 
              src={splashLogo} 
              alt="LaZone Logo" 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
          <div className="text-white/90 animate-fade-out">
            <h1 className="text-3xl font-fredoka font-bold mb-2">LaZone</h1>
            <p className="text-lg opacity-80">Trouve ton chez toi dans ta zone</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/90 to-secondary/90 z-50 flex items-center justify-center animate-fade-in">
      <div className="text-center animate-scale-in">
        <div className="w-48 h-48 mx-auto mb-8 animate-scale-in">
          <img 
            src={splashLogo} 
            alt="LaZone Logo" 
            className="w-full h-full object-contain drop-shadow-2xl animate-pulse"
          />
        </div>
        <div className="text-white animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <h1 className="text-3xl font-fredoka font-bold mb-2">LaZone</h1>
          <p className="text-lg opacity-80">Trouve ton chez toi dans ta zone</p>
        </div>
      </div>
    </div>
  );
};