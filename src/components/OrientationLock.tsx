import React, { useState, useEffect } from 'react';
import { Smartphone, RotateCw } from 'lucide-react';

export const OrientationLock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth;
      // Triggers if height > width AND it's a small screen (mobile/tablet)
      const isSmallScreen = window.innerWidth < 1024;
      
      setIsPortrait(portrait);
      setIsMobile(isSmallScreen);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (isMobile && isPortrait) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#1a1a1a] text-white p-6 text-center select-none">
        <div className="relative mb-8">
          <Smartphone className="w-24 h-24 text-primary animate-pulse" />
          <div className="absolute -top-2 -right-2">
            <RotateCw className="w-10 h-10 text-primary animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 font-serif text-primary">Landscape Mode Required</h1>
        <p className="text-lg text-gray-300 max-w-xs leading-relaxed">
          Please rotate your device to landscape for the best gameplay experience.
        </p>
        
        <div className="mt-12 flex gap-4">
          <div className="w-12 h-20 border-2 border-gray-600 rounded-lg flex items-center justify-center opacity-40">
            <div className="w-8 h-1 bg-gray-600 rounded-full mt-auto mb-2" />
          </div>
          <div className="flex items-center text-primary font-bold text-2xl">→</div>
          <div className="w-20 h-12 border-2 border-primary rounded-lg flex items-center justify-center bg-primary/10">
            <div className="w-1 h-8 bg-primary rounded-full ml-auto mr-2" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
