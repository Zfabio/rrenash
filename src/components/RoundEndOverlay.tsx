import { Button } from '@/components/ui/button';
import { GamePlayer, OnlineGameState } from '@/types/multiplayer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface RoundEndOverlayProps {
  players: GamePlayer[];
  gameState: OnlineGameState;
  isHost: boolean;
  isGameOver: boolean;
  currentRound: number;
  totalRounds: number;
  onNextRound: () => void;
  onLeave: () => void;
}

export function RoundEndOverlay({
  players,
  gameState,
  isHost,
  isGameOver,
  currentRound,
  totalRounds,
  onNextRound,
  onLeave
}: RoundEndOverlayProps) {
  const { language } = useLanguage();
  const isMobile = useIsMobile();

  const translations = {
    en: {
      roundOver: 'Round Over!',
      gameOver: 'Game Over!',
      congratulations: 'Congratulations!',
      finalStandings: 'Final Standings',
      roundStandings: 'Round Standings',
      nextRound: 'Next Round',
      newGame: 'New Game',
      waitingForHost: 'Waiting for host...',
      points: 'pts',
      round: 'Round'
    },
    sq: {
      roundOver: 'Raundi Mbaroi!',
      gameOver: 'Loja Mbaroi!',
      congratulations: 'Urime!',
      finalStandings: 'Renditja Përfundimtare',
      roundStandings: 'Renditja e Raundit',
      nextRound: 'Raundi Tjetër',
      newGame: 'Lojë e Re',
      waitingForHost: 'Duke pritur nikoqirin...',
      points: 'pikë',
      round: 'Raund'
    }
  };

  const txt = translations[language];

  // Sort players by score (descending) for standings
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  // Get position medals
  const getMedal = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '4️⃣';
    }
  };

  // Find round winner name
  const roundWinnerPlayer = players.find(p => p.player_order === gameState.round_winner);

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={cn(
        "bg-card rounded-xl text-center shadow-2xl border border-primary/30 animate-fade-in",
        isMobile ? "p-4 mx-2 w-full max-w-sm" : "p-8 max-w-md w-full"
      )}>
        {/* Header */}
        <div className="mb-4">
          <div className={cn(
            "font-bold text-primary mb-1",
            isMobile ? "text-xl" : "text-3xl"
          )}>
            {isGameOver ? '🎊' : '🏆'} {isGameOver ? txt.gameOver : txt.roundOver}
          </div>
          {!isGameOver && (
            <p className="text-muted-foreground text-sm">
              {txt.round} {currentRound} / {totalRounds}
            </p>
          )}
          {isGameOver && (
            <p className={cn(
              "text-primary font-medium",
              isMobile ? "text-sm" : "text-lg"
            )}>
              {txt.congratulations}
            </p>
          )}
        </div>

        {/* Round winner highlight */}
        {roundWinnerPlayer && !isGameOver && (
          <div className={cn(
            "bg-primary/10 rounded-lg mb-4",
            isMobile ? "p-3" : "p-4"
          )}>
            <p className="text-sm text-muted-foreground">1st Place</p>
            <p className={cn(
              "font-bold text-primary",
              isMobile ? "text-lg" : "text-xl"
            )}>
              🥇 {roundWinnerPlayer.nickname}
            </p>
          </div>
        )}

        {/* Standings */}
        <div className="mb-6">
          <h3 className={cn(
            "font-semibold mb-3 text-left",
            isMobile ? "text-sm" : "text-base"
          )}>
            {isGameOver ? txt.finalStandings : txt.roundStandings}
          </h3>
          <div className="space-y-2">
            {sortedPlayers.map((player, idx) => (
              <div 
                key={player.id} 
                className={cn(
                  "flex items-center justify-between rounded-lg transition-all",
                  isMobile ? "p-2" : "p-3",
                  idx === 0 ? "bg-primary/20 border border-primary/30" : "bg-muted/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn(isMobile ? "text-lg" : "text-xl")}>
                    {getMedal(idx)}
                  </span>
                  <span className={cn(
                    "font-medium",
                    isMobile ? "text-sm" : "text-base",
                    idx === 0 && "text-primary"
                  )}>
                    {player.nickname}
                  </span>
                  {player.is_host && (
                    <span className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                      Host
                    </span>
                  )}
                </div>
                <span className={cn(
                  "font-bold",
                  isMobile ? "text-sm" : "text-base",
                  idx === 0 && "text-primary"
                )}>
                  {player.score} {txt.points}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          {isGameOver ? (
            <Button 
              onClick={onLeave} 
              size="lg" 
              className="w-full"
            >
              {txt.newGame}
            </Button>
          ) : isHost ? (
            <Button 
              onClick={onNextRound} 
              size="lg" 
              className="w-full"
            >
              {txt.nextRound} →
            </Button>
          ) : (
            <p className="text-muted-foreground text-sm py-2">
              {txt.waitingForHost}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}