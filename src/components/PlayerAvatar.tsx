import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { OnlineGameState } from '@/types/multiplayer';

interface PlayerAvatarProps {
  name: string;
  cardCount: number;
  score: number;
  isCurrentPlayer: boolean;
  isThinking?: boolean;
  position: 'top' | 'left' | 'right' | 'top-left' | 'top-right';
  finishPosition?: number;
  challengeResult?: OnlineGameState['challenge_result'];
  playerId: number;
  language?: 'en' | 'sq';
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
  finishPosition,
  challengeResult,
  playerId,
  language = 'en'
}: PlayerAvatarProps) {
  const isMobile = useIsMobile();

  // Determine if this player was involved in the last challenge
  const wasChallenger = challengeResult?.challenger === playerId;
  const wasChallenged = challengeResult?.challenged === playerId;
  
  // Show result label with translations
  let resultLabel = null;
  if (challengeResult) {
    if (wasChallenger) {
      if (challengeResult.wasBluff) {
        resultLabel = language === 'sq' ? "Rren e Saktë! ✅" : "Rren Correct! ✅";
      } else {
        resultLabel = language === 'sq' ? "Sfida dështoi ❌" : "Failed Challenge ❌";
      }
    } else if (wasChallenged) {
      if (challengeResult.wasBluff) {
        resultLabel = language === 'sq' ? "U kap duke rrejt! 🎭" : "Caught Bluffing! 🎭";
      } else {
        resultLabel = language === 'sq' ? "Ishte i Saktë! ✨" : "Was Honest! ✨";
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-1 relative">
      {/* Turn indicator glow */}
      {isCurrentPlayer && (
        <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl animate-pulse" />
      )}

      {/* Bluff Result Label */}
      {resultLabel && (
        <div className={cn(
          "absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold shadow-lg animate-bounce z-50",
          (wasChallenger && challengeResult?.wasBluff) || (wasChallenged && !challengeResult?.wasBluff)
            ? "bg-green-600 text-white"
            : "bg-destructive text-white"
        )}>
          {resultLabel}
        </div>
      )}

      {/* Gold circle avatar */}
      <div 
        className={cn(
          'rounded-full bg-primary flex items-center justify-center shadow-lg transition-all relative',
          isCurrentPlayer && 'ring-4 ring-primary/40 z-10 scale-110 shadow-[0_0_20px_rgba(234,179,8,0.5)]',
          isMobile ? 'w-9 h-9' : 'w-12 h-12'
        )}
      >
        <span className={cn(
          'font-bold text-primary-foreground',
          isMobile ? 'text-sm' : 'text-lg'
        )}>
          {getInitial(name)}
        </span>
        
        {/* Active turn indicator dot */}
        {isCurrentPlayer && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </div>

      {/* Name label */}
      <div className={cn(
        'name-label transition-colors duration-300',
        isCurrentPlayer ? 'bg-primary text-primary-foreground px-2 py-0.5 rounded-md text-xs font-bold' : 'text-foreground/70'
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
      {isThinking && !isCurrentPlayer && (
        <span className="text-xs text-foreground/80 animate-bounce">
          💭
        </span>
      )}
    </div>
  );
}
