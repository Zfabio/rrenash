import { Card as CardType, Claim } from '@/types/game';
import { CardBack, PlayingCard } from './PlayingCard';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface OvalTableProps {
  pile: CardType[];
  claim: Claim | null;
  lastPlayedCards: CardType[];
  showLastPlayed?: boolean;
  challengeResult?: {
    wasBluff: boolean;
    revealedCards: CardType[];
  } | null;
}

export function OvalTable({
  pile,
  claim,
  lastPlayedCards,
  showLastPlayed = false,
  challengeResult
}: OvalTableProps) {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      'relative mx-auto',
      isMobile ? 'w-full max-w-[340px]' : 'w-full max-w-[520px]'
    )}>
      {/* Oval table shape */}
      <div className={cn(
        'table-surface rounded-[50%] border-4 border-primary/20 flex flex-col items-center justify-center relative',
        isMobile 
          ? 'aspect-[4/3] min-h-[180px]' 
          : 'aspect-[3/2] min-h-[280px]'
      )}>
        {/* Inner decorative ring */}
        <div className={cn(
          'absolute inset-3 rounded-[50%] border border-primary/10'
        )} />

        {/* Current claim */}
        {claim && (
          <div className="text-center mb-2 z-10">
            <span className={cn(
              'text-muted-foreground uppercase tracking-wider',
              isMobile ? 'text-[9px]' : 'text-[11px]'
            )}>
              Claimed
            </span>
            <div className={cn(
              'font-bold text-primary',
              isMobile ? 'text-base' : 'text-xl'
            )}>
              {claim.count}× {claim.rank}
            </div>
          </div>
        )}

        {/* Pile visualization */}
        <div className={cn(
          'relative flex items-center justify-center z-10',
          isMobile ? 'min-h-[40px]' : 'min-h-[60px]'
        )}>
          {pile.length === 0 ? (
            <div className={cn(
              'text-muted-foreground/40 italic border border-dashed border-muted-foreground/20 rounded-lg',
              isMobile ? 'text-[10px] px-3 py-1.5' : 'text-xs px-6 py-3'
            )}>
              Empty table
            </div>
          ) : challengeResult ? (
            <div className={cn(
              'flex gap-0.5 p-2 rounded-lg',
              challengeResult.wasBluff ? 'bg-destructive/20' : 'bg-secondary/20'
            )}>
              {challengeResult.revealedCards.map((card, idx) => (
                <PlayingCard
                  key={card.id}
                  card={card}
                  size={isMobile ? 'xs' : 'sm'}
                  animationDelay={idx * 100}
                />
              ))}
            </div>
          ) : showLastPlayed && lastPlayedCards.length > 0 ? (
            <div className="flex gap-0.5">
              {lastPlayedCards.map((card) => (
                <CardBack key={card.id} size={isMobile ? 'xs' : 'sm'} />
              ))}
            </div>
          ) : (
            <div className="relative">
              {pile.slice(-4).map((_, idx) => (
                <div
                  key={idx}
                  className="absolute"
                  style={{
                    transform: `rotate(${(idx - 1.5) * 8}deg) translateX(${(idx - 1.5) * 2}px)`,
                    zIndex: idx
                  }}
                >
                  <CardBack size={isMobile ? 'xs' : 'sm'} />
                </div>
              ))}
              <div className="relative z-10">
                <CardBack size={isMobile ? 'xs' : 'sm'} />
              </div>
            </div>
          )}
        </div>

        {/* Pile count */}
        <div className={cn(
          'text-muted-foreground mt-1 z-10',
          isMobile ? 'text-[9px]' : 'text-[11px]'
        )}>
          {pile.length} cards
        </div>
      </div>
    </div>
  );
}
