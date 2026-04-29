import { Card as CardType } from '@/types/game';
import { cn } from '@/lib/utils';
import React from 'react';
import { motion } from 'framer-motion';

interface PlayingCardProps {
  card: CardType;
  isSelected?: boolean;
  isHidden?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  animationDelay?: number;
  style?: React.CSSProperties;
}

const sizeConfig = {
  xs: {
    card: 'w-[28px] h-[40px]',
    rank: 'text-[7px]',
    suit: 'text-[6px]',
    center: 'text-xs',
    cornerGap: 'gap-0',
    corner: 'top-[1px] left-[1px]',
    cornerB: 'bottom-[1px] right-[1px]',
  },
  sm: {
    card: 'w-[38px] h-[54px]',
    rank: 'text-[10px]',
    suit: 'text-[8px]',
    center: 'text-base',
    cornerGap: 'gap-0',
    corner: 'top-[2px] left-[2px]',
    cornerB: 'bottom-[2px] right-[2px]',
  },
  md: {
    card: 'w-[52px] h-[74px]',
    rank: 'text-xs',
    suit: 'text-[10px]',
    center: 'text-xl',
    cornerGap: 'gap-0',
    corner: 'top-[2px] left-[3px]',
    cornerB: 'bottom-[2px] right-[3px]',
  },
  lg: {
    card: 'w-[68px] h-[98px]',
    rank: 'text-sm',
    suit: 'text-xs',
    center: 'text-3xl',
    cornerGap: 'gap-0',
    corner: 'top-[3px] left-[5px]',
    cornerB: 'bottom-[3px] right-[5px]',
  },
};

export function PlayingCard({
  card,
  isSelected,
  isHidden = false,
  onClick,
  disabled,
  size = 'md',
  animationDelay = 0,
  style,
}: PlayingCardProps) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  const cfg = sizeConfig[size];
  const colorClass = isRed ? 'text-red-600' : 'text-gray-900';

  if (isHidden) {
    return <CardBack size={size} animationDelay={animationDelay} style={style} />;
  }

  return (
    <motion.button
      layout
      initial={{ scale: 0.5, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.5, opacity: 0, y: -50 }}
      whileHover={{ scale: disabled ? 1 : 1.05, y: isSelected ? -20 : -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        cfg.card,
        'rounded-lg bg-white relative overflow-hidden flex-shrink-0',
        'cursor-pointer border border-gray-300',
        isSelected && 'ring-2 ring-primary shadow-[0_0_16px_hsla(36,90%,55%,0.5)]',
        disabled && 'cursor-not-allowed grayscale-[0.2]',
        'shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
      )}
      style={{ ...style }}
    >
      {/* Top-left corner */}
      <div className={cn('absolute flex flex-col items-center leading-none', cfg.cornerGap, cfg.corner)}>
        <span className={cn('font-bold font-card', cfg.rank, colorClass)}>{card.rank}</span>
        <span className={cn(cfg.suit, colorClass)}>{card.suit}</span>
      </div>

      {/* Center suit */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(cfg.center, colorClass, 'drop-shadow-sm')}>{card.suit}</span>
      </div>

      {/* Bottom-right corner (rotated) */}
      <div className={cn('absolute flex flex-col items-center leading-none rotate-180', cfg.cornerGap, cfg.cornerB)}>
        <span className={cn('font-bold font-card', cfg.rank, colorClass)}>{card.rank}</span>
        <span className={cn(cfg.suit, colorClass)}>{card.suit}</span>
      </div>
    </motion.button>
  );
}

export function CardBack({
  size = 'md',
  animationDelay = 0,
  style,
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  animationDelay?: number;
  style?: React.CSSProperties;
}) {
  const cfg = sizeConfig[size];

  // Blue diagonal stripe card back
  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className={cn(cfg.card, 'rounded-lg overflow-hidden flex-shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.3)]')}
      style={{ ...style }}
    >
      <div className="w-full h-full bg-blue-600 rounded-lg border-2 border-blue-400/60 relative overflow-hidden">
        {/* Diagonal stripes */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.3) 3px, rgba(255,255,255,0.3) 5px)',
          }}
        />
        {/* Inner border */}
        <div className="absolute inset-[3px] border border-white/20 rounded-md" />
      </div>
    </motion.div>
  );
}
