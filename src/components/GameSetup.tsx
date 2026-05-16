import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Play, ArrowLeft, Globe, GraduationCap } from 'lucide-react';
import { ViewportScaler } from './ViewportScaler';
import { FullscreenToggle } from './FullscreenToggle';

interface GameSetupProps {
  onStartGame: (numPlayers: number, targetScore: number) => void;
  onOnlinePlay?: () => void;
}

export function GameSetup({ onStartGame, onOnlinePlay }: GameSetupProps) {
  const [numPlayers, setNumPlayers] = useState(4);
  const [totalRounds, setTotalRounds] = useState(3);
  const [showRules, setShowRules] = useState(false);
  const [showPlayerSetup, setShowPlayerSetup] = useState(false);
  const { t, language } = useLanguage();

  const rulesTitle = language === 'en' ? 'How to Play' : 'Si të Luash';
  const onlineText = language === 'en' ? 'Play Online' : 'Luaj Online';
  const backText = language === 'en' ? 'Back' : 'Kthehu';
  const selectPlayersTitle = language === 'en' ? 'Game Settings' : 'Cilësimet e Lojës';

  if (showPlayerSetup) {
    return (
      <div className="min-h-screen felt-bg flex flex-col items-center justify-center p-4">
        <div className="absolute top-6 right-6">
          <LanguageToggle />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-wide">
          {selectPlayersTitle}
        </h1>
        <p className="text-foreground/50 mb-10 text-sm">{t.gameSubtitle}</p>

        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-8 w-full max-w-sm space-y-6 shadow-xl">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">{t.players}</label>
            <Select value={numPlayers.toString()} onValueChange={(v) => setNumPlayers(parseInt(v))}>
              <SelectTrigger className="bg-secondary border-border text-secondary-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 {language === 'en' ? 'Players' : 'Lojtarë'}</SelectItem>
                <SelectItem value="3">3 {language === 'en' ? 'Players' : 'Lojtarë'}</SelectItem>
                <SelectItem value="4">4 {language === 'en' ? 'Players' : 'Lojtarë'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">{t.rounds}</label>
            <Select value={totalRounds.toString()} onValueChange={(v) => setTotalRounds(parseInt(v))}>
              <SelectTrigger className="bg-secondary border-border text-secondary-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 {language === 'en' ? 'Round' : 'Raund'}</SelectItem>
                <SelectItem value="2">2 {language === 'en' ? 'Rounds' : 'Raunde'}</SelectItem>
                <SelectItem value="3">3 {language === 'en' ? 'Rounds' : 'Raunde'}</SelectItem>
                <SelectItem value="5">5 {language === 'en' ? 'Rounds' : 'Raunde'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={() => onStartGame(numPlayers, totalRounds)}
              className="w-full py-3.5 text-lg font-semibold text-primary-foreground bg-primary rounded-full hover:brightness-110 transition-all shadow-md"
            >
              <Play className="w-5 h-5 inline mr-2" />
              {t.startGame}
            </button>
            <button
              onClick={() => setShowPlayerSetup(false)}
              className="w-full py-3 text-base text-foreground/60 border border-border rounded-full hover:bg-secondary/50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              {backText}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ViewportScaler baseWidth={1000} baseHeight={600}>
      <div className="h-full w-full felt-bg flex flex-col items-center justify-center p-4 relative">
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <FullscreenToggle />
          <LanguageToggle />
        </div>

        {/* Logo */}
        <div className="mb-12 text-center animate-in fade-in zoom-in duration-700">
          <img 
            src="logo.png" 
            alt="RRENASH" 
            className="w-64 md:w-80 h-auto drop-shadow-2xl brightness-110 mix-blend-multiply"
          />
          <p className="text-foreground/70 -mt-4 text-sm md:text-base font-medium">
            {t.gameSubtitle}
          </p>
        </div>

        {/* Menu buttons */}
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          {onOnlinePlay && (
            <button
              onClick={onOnlinePlay}
              className="w-full py-4 text-xl font-bold text-primary-foreground bg-primary rounded-full hover:brightness-110 transition-all shadow-lg hover:scale-105 flex items-center justify-center"
            >
              <Globe className="w-6 h-6" />
              {onlineText}
            </button>
          )}

          <button
            onClick={() => setShowRules(true)}
            className="w-full py-3.5 text-lg font-semibold text-foreground/80 bg-secondary/30 border border-border rounded-full hover:bg-secondary/50 transition-all hover:scale-105 flex items-center justify-center"
          >
            <GraduationCap className="w-5 h-5" />
            {rulesTitle}
          </button>
        </div>

        {/* Rules Dialog */}
        <Dialog open={showRules} onOpenChange={setShowRules}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">{t.howToPlay}</DialogTitle>
            <DialogDescription className="text-foreground/50">
              {t.gameSubtitle}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <ul className="list-disc list-inside space-y-2 text-foreground text-sm">
              {t.rules.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
            <div className="bg-secondary/50 rounded-lg p-4 border border-border">
              <h4 className="font-semibold text-primary mb-2">{t.scoring}</h4>
              <div className="flex justify-center gap-6 text-foreground/60 text-sm">
                {t.scoringDetails.map((detail, i) => (
                  <span key={i}>{detail}</span>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
        </Dialog>
      </div>
    </ViewportScaler>
  );
}
