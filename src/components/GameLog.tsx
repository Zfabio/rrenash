import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface GameLogProps {
  logs: string[];
}

export function GameLog({ logs }: GameLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        'overflow-y-auto',
        isMobile ? 'p-2 max-h-32 text-[10px]' : 'p-3 max-h-40 text-xs',
      )}
    >
      {logs.map((log, idx) => (
        <div
          key={idx}
          className={cn(
            'py-0.5 border-b border-white/5 last:border-0 leading-relaxed text-foreground/70',
            log.includes('challenged') && 'text-destructive font-medium',
            log.includes('won') && 'text-primary font-medium',
            log.includes('bluff') && 'text-primary font-semibold',
            log.includes('🏆') && 'text-primary font-semibold',
            log.includes('🎉') && 'text-primary',
          )}
        >
          {log}
        </div>
      ))}
    </div>
  );
}
