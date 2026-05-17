import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'lg' }: LogoProps) {
  const isSmall = size === 'sm';
  const isMedium = size === 'md';

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Joker Card Background */}
      <div className={cn(
        "absolute flex items-center justify-center text-primary pointer-events-none transition-all",
        isSmall ? "opacity-10 scale-75 -rotate-6" : "opacity-[0.07] scale-125 -rotate-12",
        "drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]"
      )}>
        <div className={cn(
          "border-current rounded-xl flex flex-col items-center justify-center overflow-hidden relative",
          isSmall ? "w-12 h-16 border-2" : "w-28 h-40 border-4"
        )}>
          <span className={cn(
            "font-serif font-bold absolute top-1 left-1.5",
            isSmall ? "text-xs" : "text-xl"
          )}>J</span>
          <span className={cn(
            "font-serif font-bold absolute bottom-1 right-1.5 rotate-180",
            isSmall ? "text-xs" : "text-xl"
          )}>J</span>
          <span className={cn(
            "font-serif",
            isSmall ? "text-2xl" : "text-6xl"
          )}>🤡</span>
        </div>
      </div>
      
      {/* Text */}
      <h1 className={cn(
        "font-black tracking-widest text-primary drop-shadow-[0_0_15px_rgba(74,222,128,0.5)] relative z-10 uppercase",
        isSmall ? "text-xl md:text-2xl" : isMedium ? "text-4xl md:text-5xl" : "text-5xl md:text-7xl",
        "font-serif"
      )}>
        Rrenash
      </h1>
    </div>
  );
}
