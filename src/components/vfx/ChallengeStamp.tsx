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
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
              scale: [1.5, 1], 
              opacity: 1,
              transition: { 
                type: 'spring', 
                damping: 10, 
                stiffness: 300 
              } 
            }}
            exit={{ 
              scale: 2, 
              opacity: 0,
              transition: { duration: 0.3 } 
            }}
            className="relative flex items-center justify-center"
          >
            {/* Fire background effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, y: 0 }}
                  animate={{ 
                    opacity: [0, 0.8, 0],
                    scale: [1, 2, 0.5],
                    y: [-20, -120 - Math.random() * 100],
                    x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200]
                  }}
                  transition={{ 
                    duration: 0.8 + Math.random() * 0.4,
                    repeat: Infinity,
                    delay: i * 0.05
                  }}
                  className="absolute w-16 h-16 rounded-full blur-xl"
                  style={{ 
                    background: i % 3 === 0 ? 'rgba(239, 68, 68, 0.8)' : i % 3 === 1 ? 'rgba(245, 158, 11, 0.8)' : 'rgba(252, 211, 77, 0.8)',
                  }}
                />
              ))}
            </div>

            {/* Glowing Core */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                filter: ["blur(20px) brightness(1)", "blur(30px) brightness(1.5)", "blur(20px) brightness(1)"]
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="absolute w-64 h-64 bg-orange-500/40 rounded-full blur-3xl"
            />

            {/* Fire Text with Glow */}
            <div className="relative">
              <h2 className="text-8xl md:text-9xl font-black font-title tracking-tighter text-white drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] uppercase italic relative z-10">
                {text}
                <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 blur-[2px] opacity-80">
                  {text}
                </span>
              </h2>
              
              {/* Animated fire mask/gradient */}
              <motion.div 
                animate={{ 
                  y: [-2, 2, -2],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ duration: 0.2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-t from-red-600 via-orange-500 to-transparent bg-clip-text text-transparent blur-[1px]"
              >
                {text}
              </motion.div>
            </div>

            {/* Shockwave */}
            <motion.div
              initial={{ scale: 0.5, opacity: 1, border: '4px solid rgba(255,255,255,0.8)' }}
              animate={{ 
                scale: 3, 
                opacity: 0,
                border: '1px solid rgba(255,255,255,0)'
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute rounded-full w-40 h-40"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
