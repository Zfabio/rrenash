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

  // Dynamically pick card size based on count + device
  const cardSize = isMobile
    ? total > 18 ? 'xs' : total > 10 ? 'xs' : 'sm'
    : total > 18 ? 'sm' : total > 12 ? 'sm' : 'md';

  const cardW = cardSize === 'xs' ? 28 : cardSize === 'sm' ? 38 : 52;
  const cardH = cardSize === 'xs' ? 40 : cardSize === 'sm' ? 54 : 74;

  const maxWidth = isMobile ? window.innerWidth - 16 : Math.min(window.innerWidth - 40, 700);

  const idealSpacing = isMobile ? 22 : 30;
  const minSpacing = isMobile ? 11 : 15;
  const spacing = total <= 1
    ? idealSpacing
    : Math.max(minSpacing, Math.min(idealSpacing, (maxWidth - cardW) / (total - 1)));

  const containerWidth = total <= 1 ? cardW + 8 : spacing * (total - 1) + cardW;

  // Parabolic arc: more cards = deeper curve for better visibility
  const arcDepth = total > 14 ? 22 : total > 10 ? 16 : total > 6 ? 10 : 6;

  const getCardStyle = (idx: number): React.CSSProperties => {
    const centerIdx = (total - 1) / 2;
    const offset = idx - centerIdx;
    const normalized = total > 1 ? offset / ((total - 1) / 2) : 0;

    const anglePer = total > 14 ? 0.8 : total > 10 ? 1.2 : 1.8;
    const maxAngle = 18;
    const angle = Math.max(-maxAngle, Math.min(maxAngle, offset * anglePer));

    // Parabolic y: edges drop down, center stays up
    const yOffset = normalized * normalized * arcDepth;

    return {
      transform: `translateY(${yOffset}px) rotate(${angle}deg)`,
      transformOrigin: 'center 300%',
      zIndex: idx,
      position: 'absolute' as const,
      left: `${idx * spacing}px`,
    };
  };

  const containerHeight = cardH + arcDepth + 10;

  return (
    <div className="flex flex-col items-center w-full px-2">
      <div
        className="relative mx-auto"
        style={{
          width: `${containerWidth}px`,
          height: `${containerHeight}px`,
          maxWidth: '100%',
        }}
      >
        {player.hand.map((card, idx) => (
          <div key={card.id} style={getCardStyle(idx)}>
            <PlayingCard
              card={card}
              isSelected={selectedCards.some(c => c.id === card.id)}
              onClick={() => onCardSelect?.(card)}
              disabled={disabled || !isCurrentPlayer}
              size={cardSize}
            />
          </div>
        ))}
      </div>

      {player.hand.length === 0 && (
        <div className="text-foreground/70 text-sm italic py-4">
          No cards — finished! 🎉
        </div>
      )}
    </div>
  );
}
