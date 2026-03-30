import { useState, useEffect } from 'react';
import { Card as CardType, Claim, Rank, RANKS } from '@/types/game';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSound } from '@/hooks/useSound';
import { useIsMobile } from '@/hooks/use-mobile';

interface GameControlsProps {
  selectedCards: CardType[];
  currentClaim: Claim | null;
  canPlay: boolean;
  canChallenge: boolean;
  canPass: boolean;
  onPlay: (claimedRank: Rank) => void;
  onChallenge: () => void;
  onPass: () => void;
}

export function GameControls({
  selectedCards,
  currentClaim,
  canPlay,
  canChallenge,
  canPass,
  onPlay,
  onChallenge,
  onPass,
}: GameControlsProps) {
  const { t } = useLanguage();
  const { playCardPlay, playChallenge, playPass } = useSound();
  const isMobile = useIsMobile();
  const [claimRank, setClaimRank] = useState<Rank | null>(null);

  useEffect(() => {
    if (!currentClaim && selectedCards.length > 0) {
      setClaimRank(selectedCards[0]?.rank as Rank);
    }
  }, [selectedCards, currentClaim]);

  useEffect(() => {
    if (selectedCards.length === 0) {
      setClaimRank(null);
    }
  }, [selectedCards.length]);

  const effectiveClaimRank = currentClaim?.rank || claimRank;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const rankToUse = effectiveClaimRank || (selectedCards[0]?.rank as Rank);
    if (rankToUse) {
      playCardPlay();
      onPlay(rankToUse);
    }
  };

  const handleChallenge = (e: React.MouseEvent) => {
    e.stopPropagation();
    playChallenge();
    onChallenge();
  };

  const handlePass = (e: React.MouseEvent) => {
    e.stopPropagation();
    playPass();
    onPass();
  };

  const allSameRank = selectedCards.length > 0 &&
    selectedCards.every(c => c.rank === selectedCards[0].rank);
  const hasMixedRanks = selectedCards.length > 0 && !allSameRank;
  const actualRank = selectedCards[0]?.rank;
  const isBluffing = hasMixedRanks || (effectiveClaimRank && actualRank && effectiveClaimRank !== actualRank);

  return (
    <div className={cn(
      'flex flex-wrap items-center justify-center gap-2',
      isMobile ? 'px-2' : 'px-4',
    )}>
      {/* Claim rank selector */}
      {!currentClaim && selectedCards.length > 0 && (
        <Select
          value={claimRank || undefined}
          onValueChange={(val) => setClaimRank(val as Rank)}
        >
          <SelectTrigger className={cn(
            'bg-card border-border text-foreground',
            isMobile ? 'w-16 h-8 text-[10px]' : 'w-20 h-9 text-xs',
          )}>
            <SelectValue placeholder="Rank" />
          </SelectTrigger>
          <SelectContent>
            {RANKS.map(rank => (
              <SelectItem key={rank} value={rank}>{rank}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Play button */}
      <button
        onClick={handlePlay}
        disabled={!canPlay || selectedCards.length === 0}
        className={cn(
          'rounded-lg font-semibold transition-all border',
          isMobile ? 'px-4 py-2 text-xs' : 'px-6 py-2.5 text-sm',
          canPlay && selectedCards.length > 0
            ? 'bg-primary text-primary-foreground border-primary hover:brightness-110 cursor-pointer shadow-md'
            : 'bg-muted text-foreground/30 border-border cursor-not-allowed',
          isBluffing && canPlay && 'bg-destructive border-destructive',
        )}
      >
        {selectedCards.length > 0 ? (
          <>
            {t.play} {selectedCards.length}
            {currentClaim && ` as ${currentClaim.rank}`}
            {isBluffing && ' 🎭'}
          </>
        ) : (
          t.selectCardsFirst
        )}
      </button>

      {/* Challenge button */}
      <button
        onClick={handleChallenge}
        disabled={!canChallenge}
        className={cn(
          'rounded-lg font-semibold transition-all border',
          isMobile ? 'px-4 py-2 text-xs' : 'px-6 py-2.5 text-sm',
          canChallenge
            ? 'bg-destructive text-destructive-foreground border-destructive hover:brightness-110 cursor-pointer shadow-md'
            : 'bg-muted text-foreground/30 border-border cursor-not-allowed',
        )}
      >
        🔥 {t.challenge}
      </button>

      {/* Pass button */}
      <button
        onClick={handlePass}
        disabled={!canPass}
        className={cn(
          'rounded-lg font-semibold transition-all border',
          isMobile ? 'px-4 py-2 text-xs' : 'px-6 py-2.5 text-sm',
          canPass
            ? 'bg-secondary text-secondary-foreground border-border hover:brightness-110 cursor-pointer shadow-md'
            : 'bg-muted text-foreground/30 border-border cursor-not-allowed',
        )}
      >
        {t.pass}
      </button>

      {/* Bluff warning */}
      {!allSameRank && selectedCards.length > 1 && (
        <p className={cn(
          'text-primary w-full text-center',
          isMobile ? 'text-[9px]' : 'text-[10px]',
        )}>
          🎭 {t.mixedCardsWarning}
        </p>
      )}
    </div>
  );
}
