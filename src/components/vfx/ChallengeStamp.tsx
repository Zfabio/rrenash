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
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              transition: { 
                duration: 0.3,
                ease: "easeOut"
              } 
            }}
            exit={{ 
              scale: 1.1, 
              opacity: 0,
              transition: { duration: 0.2 } 
            }}
            className="relative flex items-center justify-center"
          >
            {/* Very Soft Color Splash */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.2], 
                opacity: [0, 0.3, 0] 
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute w-48 h-48 bg-primary/20 rounded-full blur-2xl"
            />

            {/* Subtle Particles */}
            <div className="absolute inset-0">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 0, y: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    x: (Math.random() - 0.5) * 100,
                    y: (Math.random() - 0.5) * 100,
                    scale: [0, 1, 0]
                  }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-primary/30 blur-[1px]"
                />
              ))}
            </div>

            {/* Smaller Text with subtle glow */}
            <div className="relative">
              <h2 className="text-5xl md:text-6xl font-black font-title tracking-tighter text-white drop-shadow-[0_0_10px_rgba(239,68,68,0.4)] uppercase italic relative z-10">
                {text}
              </h2>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: [0, 0.7, 0], scale: [0.9, 1.05] }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 text-primary blur-sm pointer-events-none"
              >
                <span className="text-5xl md:text-6xl font-black font-title tracking-tighter uppercase italic">
                  {text}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
