import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChallengeStampProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export function ChallengeStamp({ isVisible, onComplete }: ChallengeStampProps) {
  const { language } = useLanguage();
  const text = language === 'en' ? 'BLUFF!' : 'RRENASH!';

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden">
          <motion.div
            initial={{ scale: 5, opacity: 0, rotate: -20 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              rotate: -10,
              transition: { 
                type: 'spring', 
                damping: 12, 
                stiffness: 200 
              } 
            }}
            exit={{ 
              scale: 0.8, 
              opacity: 0, 
              rotate: 0,
              transition: { duration: 0.2 } 
            }}
            className="relative"
          >
            {/* Main Stamp Text */}
            <h2 className="text-8xl md:text-9xl font-black font-title tracking-tighter text-destructive drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] uppercase italic border-8 border-destructive px-8 py-2 rounded-lg rotate-[-5deg] bg-background/10 backdrop-blur-[2px]">
              {text}
            </h2>
            
            {/* Shaky impact effect */}
            <motion.div
              animate={{
                x: [0, -5, 5, -5, 5, 0],
                y: [0, 5, -5, 5, -5, 0],
              }}
              transition={{
                duration: 0.4,
                times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                repeat: 0
              }}
              className="absolute inset-0 border-8 border-destructive/30 rounded-lg scale-110"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
