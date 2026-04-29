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

import { motion, AnimatePresence } from 'framer-motion';

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
      <motion.div 
        animate={isCurrentPlayer ? {
          boxShadow: [
            "0 0 0px hsla(46, 65%, 52%, 0)",
            "0 0 15px hsla(46, 65%, 52%, 0.8)",
            "0 0 0px hsla(46, 65%, 52%, 0)"
          ],
          scale: [1, 1.05, 1]
        } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
        className={cn(
          'rounded-full bg-primary flex items-center justify-center shadow-lg transition-transform',
          isCurrentPlayer && 'ring-2 ring-white/50 z-10',
          isMobile ? 'w-9 h-9' : 'w-12 h-12'
        )}
      >
        <span className={cn(
          'font-bold text-primary-foreground',
          isMobile ? 'text-sm' : 'text-lg'
        )}>
          {getInitial(name)}
        </span>
      </motion.div>

      {/* Name label */}
      <div className={cn(
        'name-label',
        isCurrentPlayer && 'name-label-active'
      )}>
        {name}
      </div>

      <AnimatePresence mode="wait">
        {finishPosition ? (
          <motion.div 
            key="finish"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-xs font-bold text-primary bg-background/80 rounded-full px-2 py-0.5 border border-primary/30 mt-1 shadow-sm"
          >
            {finishPosition === 1 ? '🥇 1st' : finishPosition === 2 ? '🥈 2nd' : '🥉 3rd'}
          </motion.div>
        ) : (
          <motion.div 
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 mt-0.5 opacity-80 bg-background/50 rounded-full px-2 py-0.5 text-xs shadow-sm"
          >
            <span>🃏</span>
            <span className="font-medium text-foreground">{cardCount}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thinking indicator */}
      {isThinking && (
        <motion.span 
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-xs text-foreground/80"
        >
          💭
        </motion.span>
      )}
    </div>
  );
}
