import React from 'react';
import { Player, Card as CardType } from '@/types/game';
import { PlayingCard } from './PlayingCard';
import { useIsMobile } from '@/hooks/use-mobile';

interface MyHandProps {
  player: Player;
  isCurrentPlayer: boolean;
  selectedCards: CardType[];
  onCardSelect?: (card: CardType) => void;
  disabled?: boolean;
}

export function MyHand({
  player,
  isCurrentPlayer,
  selectedCards,
  onCardSelect,
  disabled,
}: MyHandProps) {
  const isMobile = useIsMobile();
  const total = player.hand.length;

  const [isPortrait, setIsPortrait] = React.useState(window.innerHeight > window.innerWidth);
  
  React.useEffect(() => {
    const handleResize = () => setIsPortrait(window.innerHeight > window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // We will always use 'lg' so cards look bigger
  const cardSize = 'lg';
  const cardW = 68;
  const cardH = 98;

  // The virtual container matches ViewportScaler's dynamicWidth calculation
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const isLandscape = winW >= winH;
  const dynamicWidth = isLandscape ? winW * (600 / winH) : 600;
  
  // We use 90% of the virtual container width to fit cards
  const maxWidth = dynamicWidth * 0.9;

  // We want to fit EVERYTHING in one row if possible.
  // We calculate the required spacing to fit all cards.
  const maxSpacing = 46;
  const minSpacing = 15; // Minimum spacing before it looks too squished
  
  let idealSpacing = maxSpacing;
  if (total > 1) {
    const requiredSpacing = (maxWidth - cardW) / (total - 1);
    idealSpacing = Math.max(minSpacing, Math.min(maxSpacing, requiredSpacing));
  }

  // Determine how many we can fit in a row before splitting (only if extremely squished)
  const calcMax = Math.max(1, Math.floor((maxWidth - cardW) / minSpacing) + 1);
  const maxCardsPerRow = Math.min(25, calcMax); // We allow up to 25 cards in a single row!
  
  // If we have more cards than the limit, split into multiple rows
  const numRows = total === 0 ? 0 : Math.ceil(total / maxCardsPerRow);
  
  // We balance the rows evenly
  const cardsPerRow = numRows === 0 ? 0 : Math.ceil(total / numRows);

  const rows: CardType[][] = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(player.hand.slice(i * cardsPerRow, (i + 1) * cardsPerRow));
  }

  // Helper values for fanning Effect - increased depth for single huge rows
  const getArcDepth = (rowTotal: number) => rowTotal > 15 ? 35 : rowTotal > 10 ? 25 : rowTotal > 6 ? 15 : 8;
  const getAnglePer = (rowTotal: number) => rowTotal > 15 ? 0.6 : rowTotal > 10 ? 1.0 : 1.8;

  return (
    <div className="flex flex-col items-center w-full px-2" style={{ paddingBottom: '16px' }}>
      {rows.length > 0 && (
        <div className="flex flex-col items-center justify-center w-full mt-2">
          {rows.map((rowCards, rIdx) => {
            const rowTotal = rowCards.length;
            const containerWidth = rowTotal <= 1 ? cardW + 8 : idealSpacing * (rowTotal - 1) + cardW;
            const arcDepth = getArcDepth(rowTotal);
            const containerHeight = cardH + arcDepth + 10;
            const anglePer = getAnglePer(rowTotal);

            return (
              <div
                key={`row-${rIdx}`}
                className="relative mx-auto transition-transform duration-300"
                style={{
                  width: `${containerWidth}px`,
                  height: `${containerHeight}px`,
                  // Make the rows overlap slightly
                  marginTop: rIdx > 0 ? `-${cardH * 0.4}px` : '0',
                  zIndex: rIdx,
                }}
              >
                {rowCards.map((card, idx) => {
                  const centerIdx = (rowTotal - 1) / 2;
                  const offset = idx - centerIdx;
                  const normalized = rowTotal > 1 ? offset / ((rowTotal - 1) / 2) : 0;
              
                  const maxAngle = 18;
                  const angle = Math.max(-maxAngle, Math.min(maxAngle, offset * anglePer));
              
                  const yOffset = normalized * normalized * arcDepth;

                  return (
                    <div 
                      key={card.id} 
                      style={{
                        transform: `translateY(${yOffset}px) rotate(${angle}deg)`,
                        transformOrigin: 'center 300%',
                        position: 'absolute',
                        left: `${idx * idealSpacing}px`,
                        zIndex: idx,
                        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <PlayingCard
                        card={card}
                        isSelected={selectedCards.some(c => c.id === card.id)}
                        onClick={() => onCardSelect?.(card)}
                        disabled={disabled || !isCurrentPlayer}
                        size={cardSize}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {total === 0 && (
        <div className="text-foreground/70 text-sm italic py-4">
          No cards — finished! 🎉
        </div>
      )}
    </div>
  );
}
