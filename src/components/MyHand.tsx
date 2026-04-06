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

  // Use larger sizing! 'md' for mobile, 'lg' for PC.
  const cardSize = isMobile ? 'md' : 'lg';
  const cardW = cardSize === 'md' ? 52 : 68;
  const cardH = cardSize === 'md' ? 74 : 98;

  const maxWidth = isMobile ? window.innerWidth - 16 : Math.min(window.innerWidth - 40, 700);

  // Increase spacing since cards are bigger
  const idealSpacing = isMobile ? 32 : 46;
  
  // Calculate how many fit natively by math, but also add a hard cap 
  // so it never looks too squished (max 8 per row on mobile, max 10 on PC)
  const calcMax = Math.max(1, Math.floor((maxWidth - cardW) / idealSpacing) + 1);
  const maxCardsPerRow = Math.min(isMobile ? 8 : 10, calcMax);
  
  // If we have more cards than the limit, split into multiple rows
  const numRows = total === 0 ? 0 : Math.ceil(total / maxCardsPerRow);
  
  // We balance the rows evenly
  const cardsPerRow = numRows === 0 ? 0 : Math.ceil(total / numRows);

  const rows: CardType[][] = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(player.hand.slice(i * cardsPerRow, (i + 1) * cardsPerRow));
  }

  // Helper values for fanning Effect
  const getArcDepth = (rowTotal: number) => rowTotal > 14 ? 22 : rowTotal > 10 ? 16 : rowTotal > 6 ? 10 : 6;
  const getAnglePer = (rowTotal: number) => rowTotal > 14 ? 0.8 : rowTotal > 10 ? 1.2 : 1.8;

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
