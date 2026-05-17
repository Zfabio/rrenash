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
      
      // We want to completely eliminate black bars (letterboxing).
      // We scale the UI so the container natively fills the screen.
      const isLandscape = winW >= winH;
      
      let newScale: number;
      let newDynamicWidth: number;
      let newDynamicHeight: number;

      if (isLandscape) {
        // In landscape, fix the height to baseHeight (600) and expand width
        newDynamicHeight = baseHeight;
        newScale = winH / newDynamicHeight;
        newDynamicWidth = winW / newScale;
      } else {
        // In portrait, fix the width to 600 and expand height
        newDynamicWidth = 600;
        newScale = winW / newDynamicWidth;
        newDynamicHeight = winH / newScale;
      }

      setScale(newScale);
      setDynamicWidth(newDynamicWidth);
      setDynamicHeight(newDynamicHeight);
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
