import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Card as CardType, Rank } from '@/types/game';
import { GameControls } from './GameControls';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSound } from '@/hooks/useSound';
import { PlayerAvatar } from './PlayerAvatar';
import { MyHand } from './MyHand';
import { PlayingCard, CardBack } from './PlayingCard';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { LogOut } from 'lucide-react';
import { FullscreenToggle } from './FullscreenToggle';
import { ViewportScaler } from './ViewportScaler';
import { 
  initializeGame, 
  getNextPlayer, 
  checkForBluff, 
  sortHand,
  aiSelectCards,
  aiShouldChallenge,
  calculateRoundPoints
} from '@/utils/gameLogic';

interface GameBoardProps {
  numPlayers: number;
  totalRounds: number;
  onBackToSetup: () => void;
}

export function GameBoard({ numPlayers, totalRounds, onBackToSetup }: GameBoardProps) {
  const { t, language } = useLanguage();
  const { playYourTurn, playWin, playSelect, playCardPlay, playTick } = useSound();
  const isMobile = useIsMobile();
  const prevPlayerRef = useRef<number | null>(null);
  const prevPileRef = useRef<number>(0);
  const turnStartTimeRef = useRef<number>(0);
  
  const [gameState, setGameState] = useState<GameState>(() => 
    initializeGame(numPlayers, totalRounds)
  );
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [showChallengeResult, setShowChallengeResult] = useState(false);

  const currentPlayer = gameState.players[gameState.currentPlayer];
  const isHumanTurn = currentPlayer?.isHuman;

  // Reset turn start time
  useEffect(() => {
    if (gameState.gamePhase === 'playing') {
      turnStartTimeRef.current = Date.now();
    }
  }, [gameState.currentPlayer, gameState.gamePhase]);

  // Ticking sound effect - only for human turn, after 5 seconds
  useEffect(() => {
    if (gameState.gamePhase === 'playing' && isHumanTurn) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - turnStartTimeRef.current;
        if (elapsed > 5000) {
          playTick();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isHumanTurn, gameState.gamePhase, playTick]);
  
  // Play sound for turn changes
  useEffect(() => {
    if (gameState.gamePhase === 'playing' && prevPlayerRef.current !== null && prevPlayerRef.current !== gameState.currentPlayer) {
      if (isHumanTurn) {
        playYourTurn();
      } else {
        playSelect();
      }
    }
    prevPlayerRef.current = gameState.currentPlayer;
  }, [gameState.currentPlayer, isHumanTurn, gameState.gamePhase, playYourTurn, playSelect]);

  // Play sound when cards are thrown
  useEffect(() => {
    if (gameState.pile.length > prevPileRef.current) {
      playCardPlay();
    }
    prevPileRef.current = gameState.pile.length;
  }, [gameState.pile.length, playCardPlay]);

  // Handle card selection
  const handleCardSelect = useCallback((card: CardType) => {
    if (!isHumanTurn) return;
    playSelect();
    setSelectedCards(prev => {
      const isSelected = prev.some(c => c.id === card.id);
      if (isSelected) return prev.filter(c => c.id !== card.id);
      return [...prev, card];
    });
  }, [isHumanTurn, playSelect]);

  // Play cards
  const handlePlay = useCallback((claimedRank: Rank) => {
    if (selectedCards.length === 0) return;

    setGameState(prev => {
      const player = prev.players[prev.currentPlayer];
      const newHand = player.hand.filter(c => !selectedCards.some(sc => sc.id === c.id));
      
      let newPlayers = prev.players.map((p, idx) => 
        idx === prev.currentPlayer 
          ? { ...p, hand: newHand }
          : p
      );

      const newClaim = {
        rank: prev.claim?.rank || claimedRank,
        count: selectedCards.length,
        playerId: prev.currentPlayer
      };

      const isBluff = selectedCards.some(c => c.rank !== newClaim.rank);
      const playedLog = `${player.name} played ${selectedCards.length} card(s) as ${newClaim.rank}${isBluff && player.isHuman ? ' (bluffing!)' : ''}`;

      const logs = [...prev.log, playedLog];
      const newFinished = [...(prev.finishedPlayers || [])];

      if (newHand.length === 0 && !newFinished.includes(prev.currentPlayer)) {
        const position = newFinished.length + 1;
        newFinished.push(prev.currentPlayer);
        const points = calculateRoundPoints(position);
        newPlayers = newPlayers.map((p, idx) =>
          idx === prev.currentPlayer ? { ...p, score: p.score + points } : p
        );
        logs.push(`🎉 ${player.name} finished ${position === 1 ? '1st' : position === 2 ? '2nd' : '3rd'}! (+${points} pts)`);
      }

      const activePlayers = newPlayers.filter((p, idx) => p.hand.length > 0 && !newFinished.includes(idx));
      if (activePlayers.length <= 1) {
        return {
          ...prev,
          players: newPlayers,
          pile: [...prev.pile, ...selectedCards],
          claim: newClaim,
          lastPlayedCards: selectedCards,
          finishedPlayers: newFinished,
          log: [...logs, `📋 Round over!`],
          roundWinner: newFinished[0] ?? prev.currentPlayer,
          gamePhase: 'roundEnd'
        };
      }

      return {
        ...prev,
        players: newPlayers,
        pile: [...prev.pile, ...selectedCards],
        claim: newClaim,
        lastPlayedCards: selectedCards,
        finishedPlayers: newFinished,
        consecutivePasses: 0,
        log: logs,
        currentPlayer: getNextPlayer(prev.currentPlayer, prev.players.length, newFinished)
      };
    });

    setSelectedCards([]);
  }, [selectedCards]);

  // Challenge
  const handleChallenge = useCallback(() => {
    if (!gameState.claim || gameState.lastPlayedCards.length === 0) return;

    const challengedPlayerId = gameState.claim.playerId;
    const wasBluff = checkForBluff(gameState.lastPlayedCards, gameState.claim.rank);
    const challengerId = gameState.currentPlayer;
    const challengerName = gameState.players[challengerId].name;
    const challengedName = gameState.players[challengedPlayerId].name;

    setGameState(prev => ({
      ...prev,
      challengeResult: {
        challenger: challengerId,
        challenged: challengedPlayerId,
        wasBluff,
        revealedCards: prev.lastPlayedCards,
        timestamp: Date.now()
      },
      log: [...prev.log, `🔥 ${challengerName} challenged ${challengedName}!`]
    }));

    setShowChallengeResult(true);

    setTimeout(() => {
      setGameState(prev => {
        const loserIdx = wasBluff ? challengedPlayerId : challengerId;
        const newFinished = [...(prev.finishedPlayers || [])].filter(id => id !== loserIdx);
        const newPlayers = prev.players.map((p, idx) => {
          if (idx === loserIdx) {
            return { ...p, hand: sortHand([...p.hand, ...prev.pile]) };
          }
          return p;
        });

        const resultLog = wasBluff 
          ? `${challengedName} was bluffing! They take the pile (${prev.pile.length} cards)`
          : `${challengedName} was honest! ${challengerName} takes the pile (${prev.pile.length} cards)`;

        return {
          ...prev,
          players: newPlayers,
          pile: [],
          claim: null,
          lastPlayedCards: [],
          challengeResult: null,
          finishedPlayers: newFinished,
          log: [...prev.log, resultLog],
          currentPlayer: loserIdx
        };
      });
      setShowChallengeResult(false);
    }, 2000);
  }, [gameState]);

  // Pass
  const handlePass = useCallback(() => {
    setGameState(prev => {
      const newConsecutivePasses = (prev.consecutivePasses || 0) + 1;
      const activeCount = prev.players.filter((p, idx) => p.hand.length > 0 && !(prev.finishedPlayers || []).includes(idx)).length;
      const allPassed = newConsecutivePasses >= activeCount;
      
      if (allPassed && prev.pile.length > 0) {
        return {
          ...prev,
          pile: [],
          claim: null,
          lastPlayedCards: [],
          consecutivePasses: 0,
          currentPlayer: getNextPlayer(prev.currentPlayer, prev.players.length, prev.finishedPlayers || []),
          log: [...prev.log, `${prev.players[prev.currentPlayer].name} passed`, `🗑️ All players passed - pile discarded!`]
        };
      }
      
      return {
        ...prev,
        consecutivePasses: newConsecutivePasses,
        currentPlayer: getNextPlayer(prev.currentPlayer, prev.players.length, prev.finishedPlayers || []),
        log: [...prev.log, `${prev.players[prev.currentPlayer].name} passed`]
      };
    });
    setSelectedCards([]);
  }, []);

  // AI turn
  useEffect(() => {
    if (isHumanTurn || gameState.gamePhase !== 'playing' || showChallengeResult) return;

    const aiPlayer = currentPlayer;
    
    setGameState(prev => ({
      ...prev,
      players: prev.players.map((p, idx) => 
        idx === prev.currentPlayer ? { ...p, isThinking: true } : p
      )
    }));

    const thinkTime = 1500 + Math.random() * 1000;

    const timeout = setTimeout(() => {
      if (gameState.claim && gameState.lastPlayedCards.length > 0) {
        if (aiShouldChallenge(gameState.lastPlayedCards.length, gameState.claim.rank, aiPlayer.hand)) {
          handleChallenge();
          return;
        }
      }

      const { cards, claimedRank } = aiSelectCards(aiPlayer.hand, gameState.claim);

      if (cards.length === 0) {
        handlePass();
        setGameState(prev => ({
          ...prev,
          players: prev.players.map((p, idx) => 
            idx === prev.currentPlayer ? { ...p, isThinking: false } : p
          )
        }));
      } else {
        setGameState(prev => {
          const newHand = aiPlayer.hand.filter(c => !cards.some(pc => pc.id === c.id));
          let newPlayers = prev.players.map((p, idx) => 
            idx === prev.currentPlayer ? { ...p, hand: newHand, isThinking: false } : p
          );

          const newClaim = {
            rank: prev.claim?.rank || claimedRank,
            count: cards.length,
            playerId: prev.currentPlayer
          };

          const playLog = `${aiPlayer.name} played ${cards.length} card(s) as ${newClaim.rank}`;
          const logs = [...prev.log, playLog];
          const newFinished = [...(prev.finishedPlayers || [])];

          if (newHand.length === 0 && !newFinished.includes(prev.currentPlayer)) {
            const position = newFinished.length + 1;
            newFinished.push(prev.currentPlayer);
            const points = calculateRoundPoints(position);
            newPlayers = newPlayers.map((p, idx) =>
              idx === prev.currentPlayer ? { ...p, score: p.score + points } : p
            );
            logs.push(`🎉 ${aiPlayer.name} finished ${position === 1 ? '1st' : position === 2 ? '2nd' : '3rd'}! (+${points} pts)`);
          }

          const activePlayers = newPlayers.filter((p, idx) => p.hand.length > 0 && !newFinished.includes(idx));
          if (activePlayers.length <= 1) {
            return {
              ...prev,
              players: newPlayers,
              pile: [...prev.pile, ...cards],
              claim: newClaim,
              lastPlayedCards: cards,
              finishedPlayers: newFinished,
              log: [...logs, `📋 Round over!`],
              roundWinner: newFinished[0] ?? prev.currentPlayer,
              gamePhase: 'roundEnd'
            };
          }

          return {
            ...prev,
            players: newPlayers,
            pile: [...prev.pile, ...cards],
            claim: newClaim,
            lastPlayedCards: cards,
            finishedPlayers: newFinished,
            consecutivePasses: 0,
            log: logs,
            currentPlayer: getNextPlayer(prev.currentPlayer, prev.players.length, newFinished)
          };
        });
      }
    }, thinkTime);

    return () => clearTimeout(timeout);
  }, [gameState.currentPlayer, gameState.gamePhase, isHumanTurn, showChallengeResult, currentPlayer, gameState.claim, gameState.lastPlayedCards.length, handleChallenge, handlePass]);

  const handleNewRound = useCallback(() => {
    playWin();
    setGameState(prev => {
      const newRound = prev.currentRound + 1;
      if (newRound > prev.totalRounds) return { ...prev, gamePhase: 'gameOver' };
      
      const scores = prev.players.map(p => p.score);
      const newState = initializeGame(numPlayers, totalRounds);
      return {
        ...newState,
        currentRound: newRound,
        players: newState.players.map((p, i) => ({ ...p, score: scores[i] || 0 }))
      };
    });
    setSelectedCards([]);
  }, [numPlayers, totalRounds, playWin]);

  const myPlayer = gameState.players[0];
  const isSpectator = (gameState.finishedPlayers || []).includes(0);

  const canPlay = isHumanTurn && !isSpectator && selectedCards.length > 0 && gameState.gamePhase === 'playing';
  const canChallenge = isHumanTurn && !isSpectator && gameState.claim !== null && 
    gameState.lastPlayedCards.length > 0 &&
    gameState.claim.playerId !== 0 &&
    gameState.gamePhase === 'playing';
  const canPass = isHumanTurn && !isSpectator && gameState.claim !== null && gameState.gamePhase === 'playing';

  const opponents = gameState.players.filter(p => !p.isHuman);
  const getOpponentPositions = (count: number): Array<'top' | 'left' | 'right'> => {
    if (count === 1) return ['top'];
    if (count === 2) return ['left', 'right'];
    return ['left', 'top', 'right'];
  };
  const opponentPositions = getOpponentPositions(opponents.length);

  return (
    <ViewportScaler baseWidth={1000} baseHeight={600}>
      <div className="h-full w-full overflow-hidden felt-bg relative select-none">
        {/* Round end overlay */}
        {gameState.gamePhase === 'roundEnd' && (
          <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card p-8 rounded-2xl text-center shadow-2xl border border-border max-w-sm w-full">
              <h2 className="text-3xl font-bold text-primary mb-4">{t.roundOver}</h2>
              <div className="space-y-2 mb-6">
                {(gameState.finishedPlayers || []).map((playerId, idx) => (
                  <div key={playerId} className="flex items-center justify-between px-4 py-2 rounded-lg bg-muted/50">
                    <span className="text-foreground font-medium">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'} {gameState.players[playerId].name}
                    </span>
                    <span className="text-primary font-bold">+{calculateRoundPoints(idx + 1)}</span>
                  </div>
                ))}
              </div>
              <Button onClick={handleNewRound} size="lg" className="bg-primary text-primary-foreground">
                {t.nextRound}
              </Button>
            </div>
          </div>
        )}

        {/* === TOP BAR === */}
        <div className={cn(
          "absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-card/60 backdrop-blur-md border-b border-border/50",
          "landscape:py-1 landscape:px-3 h-auto"
        )}>
          <div className="flex items-center gap-3">
            <button onClick={onBackToSetup} className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-foreground/20 transition-colors">
              <LogOut className="h-3.5 w-3.5" />
            </button>
            <span className={cn(
              'font-bold font-title text-foreground tracking-wide transition-all',
              isMobile ? 'text-lg landscape:text-base' : 'text-xl',
            )}>
              RRENASH
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FullscreenToggle />
            <LanguageToggle />
            <div className="pile-badge bg-primary/20 border-primary/30 text-primary font-bold">
              {t.pileCount}: {gameState.pile.length}
            </div>
          </div>
        </div>

        {/* === OPPONENTS === */}
        {opponents.map((opp, idx) => {
          const pos = opponentPositions[idx];
          const posClass = pos === 'top'
            ? 'absolute top-20 landscape:top-[5.5rem] left-1/2 -translate-x-1/2 z-10'
            : pos === 'left'
            ? 'absolute left-6 top-[45%] landscape:top-[42%] -translate-y-1/2 z-10'
            : 'absolute right-6 top-[45%] landscape:top-[42%] -translate-y-1/2 z-10';

          return (
            <div key={opp.id} className={cn(posClass, "landscape:scale-75 transition-transform origin-center")}>
              <PlayerAvatar
                playerId={opp.id}
                name={opp.name}
                cardCount={opp.hand.length}
                score={opp.score}
                isCurrentPlayer={gameState.currentPlayer === opp.id}
                isThinking={opp.isThinking}
                position={pos}
                finishPosition={(gameState.finishedPlayers || []).indexOf(opp.id) !== -1 ? (gameState.finishedPlayers || []).indexOf(opp.id) + 1 : undefined}
                challengeResult={showChallengeResult ? gameState.challengeResult : undefined}
                language={language}
              />
            </div>
          );
        })}

        {/* === CENTER PLAY AREA === */}
        <div className={cn(
          "absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1 transition-transform",
          "landscape:scale-90 landscape:top-[40%]"
        )}>
          {gameState.claim && (() => {
            const claimer = gameState.players.find(p => p.id === gameState.claim!.playerId);
            return (
              <div className="bg-card/80 backdrop-blur-sm rounded-lg px-5 py-2 text-center border border-border">
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  {claimer && (
                    <span className="inline-flex items-center justify-center rounded-full bg-primary font-bold text-primary-foreground w-6 h-6 text-[10px]">
                      {claimer.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="text-foreground/70 font-medium text-xs">
                    {claimer?.name || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center justify-center font-bold text-primary text-2xl gap-2 mt-1 font-card">
                  <span>{gameState.claim.count}×</span>
                  <div className="flex items-center justify-center bg-white text-gray-900 rounded-md shadow-sm border border-gray-300 leading-none w-8 h-11 text-lg relative">
                    <span className="font-bold font-card">{gameState.claim.rank}</span>
                    <div className="absolute inset-[2px] border border-gray-200/60 rounded-sm pointer-events-none" />
                  </div>
                </div>
              </div>
            );
          })()}

          <div className={cn(
            'flex items-center justify-center',
            isMobile ? 'min-h-[54px]' : 'min-h-[74px]',
          )}>
            {gameState.pile.length === 0 && gameState.lastPlayedCards.length === 0 ? (
              <div className="text-foreground/30 font-semibold uppercase tracking-wider text-sm" />
            ) : showChallengeResult && gameState.challengeResult ? (
              <div className={cn(
                'flex gap-1 p-2 rounded-xl',
                gameState.challengeResult.wasBluff ? 'bg-destructive/20' : 'bg-green-700/40',
              )}>
                {gameState.challengeResult.revealedCards.map((card, idx) => (
                  <PlayingCard key={card.id} card={card} size="sm" />
                ))}
              </div>
            ) : gameState.lastPlayedCards.length > 0 ? (
              <div className="flex gap-1">
                {gameState.lastPlayedCards.map((card) => (
                  <CardBack key={card.id} size="sm" />
                ))}
              </div>
            ) : (
              <div className="relative">
                {gameState.pile.slice(-5).map((_, idx) => (
                  <div key={idx} className="absolute" style={{
                    transform: `rotate(${(idx - 2) * 12}deg) translate(${(idx - 2) * 3}px, ${(idx - 2) * 2}px)`,
                    zIndex: idx,
                  }}>
                    <CardBack size="sm" />
                  </div>
                ))}
                <div className="relative z-10"><CardBack size="sm" /></div>
              </div>
            )}
          </div>
        </div>

        {/* === BOTTOM: Controls + Hand === */}
        <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center gap-2">
          <GameControls
            selectedCards={selectedCards}
            currentClaim={gameState.claim}
            canPlay={canPlay}
            canChallenge={canChallenge}
            canPass={canPass}
            onPlay={handlePlay}
            onChallenge={handleChallenge}
            onPass={handlePass}
          />

          <MyHand
            player={myPlayer}
            isCurrentPlayer={gameState.currentPlayer === 0}
            selectedCards={selectedCards}
            onCardSelect={handleCardSelect}
            disabled={!isHumanTurn || gameState.gamePhase !== 'playing' || isSpectator}
          />

          <div className="bottom-bar w-full flex items-center justify-center relative min-h-[70px] landscape:min-h-[50px]">
            <div className="absolute inset-0 flex items-center justify-center landscape:scale-90 landscape:-translate-y-1">
              <PlayerAvatar
                playerId={0}
                name={myPlayer.name}
                cardCount={myPlayer.hand.length}
                score={myPlayer.score}
                isCurrentPlayer={gameState.currentPlayer === 0}
                position="top"
                finishPosition={(gameState.finishedPlayers || []).includes(0) ? (gameState.finishedPlayers || []).indexOf(0) + 1 : undefined}
                challengeResult={showChallengeResult ? gameState.challengeResult : undefined}
                language={language}
              />
            </div>
          </div>
        </div>
      </div>
    </ViewportScaler>
  );
}
