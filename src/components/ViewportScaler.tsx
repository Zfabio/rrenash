import React, { useState, useEffect, useRef, ReactNode } from 'react';

interface ViewportScalerProps {
  children: ReactNode;
  baseWidth?: number;
  baseHeight?: number;
}

export const ViewportScaler: React.FC<ViewportScalerProps> = ({ 
  children, 
  baseWidth = 1000, 
  baseHeight = 600 
}) => {
  const [scale, setScale] = useState(1);
  const [dynamicWidth, setDynamicWidth] = useState(baseWidth);
  const [dynamicHeight, setDynamicHeight] = useState(baseHeight);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      
      // On mobile (portrait-like), we scale by width and expand height
      // We reduce the effective baseWidth so everything inside renders MUCH larger!
      const isMobile = winW < 768 || winH > winW;
      
      if (isMobile) {
        // Use a much smaller base width for mobile so the relative scale is higher
        const mobileBaseWidth = Math.min(winW, 600); // Cards will be 1000/600 = 1.66x larger
        const newScale = winW / mobileBaseWidth;
        setScale(newScale);
        
        // We set the dynamic width and height to match the new scale
        setDynamicWidth(mobileBaseWidth);
        setDynamicHeight(winH / newScale);
      } else {
        const scaleX = winW / baseWidth;
        const scaleY = winH / baseHeight;
        const newScale = Math.min(scaleX, scaleY);
        setScale(newScale);
        setDynamicWidth(baseWidth);
        setDynamicHeight(baseHeight);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', updateScale);
    
    return () => {
      window.removeEventListener('resize', updateScale);
      window.removeEventListener('orientationchange', updateScale);
    };
  }, [baseWidth, baseHeight]);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black overflow-hidden"
      style={{ perspective: '1000px' }}
    >
      <div 
        ref={containerRef}
        style={{
          width: `${dynamicWidth}px`,
          height: `${dynamicHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
          transition: 'transform 0.1s ease-out'
        }}
        className="relative shadow-2xl"
      >
        {children}
      </div>
    </div>
  );
};
