import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage('sq')}
        className={cn(
          'text-2xl transition-all hover:scale-110',
          language === 'sq' ? 'opacity-100 scale-110' : 'opacity-50'
        )}
        aria-label="Shqip"
      >
        🇦🇱
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          'text-2xl transition-all hover:scale-110',
          language === 'en' ? 'opacity-100 scale-110' : 'opacity-50'
        )}
        aria-label="English"
      >
        🇬🇧
      </button>
    </div>
  );
}
