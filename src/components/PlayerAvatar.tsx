import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface PlayerAvatarProps {
  name: string;
  cardCount: number;
  score: number;
  isCurrentPlayer: boolean;
  isThinking?: boolean;
  position: 'top' | 'left' | 'right' | 'top-left' | 'top-right';
  finishPosition?: number;
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

export function PlayerAvatar({
  name,
  cardCount,
  score,
  isCurrentPlayer,
  isThinking,
  position,
  finishPosition
}: PlayerAvatarProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Gold circle avatar */}
      <div 
        className={cn(
          'rounded-full bg-primary flex items-center justify-center shadow-lg transition-all',
          isCurrentPlayer && 'ring-2 ring-white/50 z-10 scale-105',
          isMobile ? 'w-9 h-9' : 'w-12 h-12'
        )}
      >
        <span className={cn(
          'font-bold text-primary-foreground',
          isMobile ? 'text-sm' : 'text-lg'
        )}>
          {getInitial(name)}
        </span>
      </div>

      {/* Name label */}
      <div className={cn(
        'name-label',
        isCurrentPlayer && 'name-label-active'
      )}>
        {name}
      </div>

      {finishPosition ? (
        <div 
          className="text-xs font-bold text-primary bg-background/80 rounded-full px-2 py-0.5 border border-primary/30 mt-1 shadow-sm animate-fade-in"
        >
          {finishPosition === 1 ? '🥇 1st' : finishPosition === 2 ? '🥈 2nd' : '🥉 3rd'}
        </div>
      ) : (
        <div 
          className="flex items-center gap-1 mt-0.5 opacity-80 bg-background/50 rounded-full px-2 py-0.5 text-xs shadow-sm animate-fade-in"
        >
          <span>🃏</span>
          <span className="font-medium text-foreground">{cardCount}</span>
        </div>
      )}

      {/* Thinking indicator */}
      {isThinking && (
        <span className="text-xs text-foreground/80 animate-bounce">
          💭
        </span>
      )}
    </div>
  );
}
