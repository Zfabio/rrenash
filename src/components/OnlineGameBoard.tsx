import { useState, useCallback, useEffect, useRef } from 'react';
import { Card as CardType, Rank } from '@/types/game';
import { MultiplayerContextType } from '@/types/multiplayer';
import { MyHand } from './MyHand';
import { GameControls } from './GameControls';
import { GameLog } from './GameLog';
import { RoundEndOverlay } from './RoundEndOverlay';
import { CardBack, PlayingCard } from './PlayingCard';
import { PlayerAvatar } from './PlayerAvatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSound } from '@/hooks/useSound';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { LogOut, MessageSquare, X } from 'lucide-react';

interface OnlineGameBoardProps {
  multiplayer: MultiplayerContextType;
  onLeave: () => void;
}

function getOpponentPositions(count: number): Array<'top' | 'left' | 'right'> {
  if (count === 1) return ['top'];
  if (count === 2) return ['left', 'right'];
  return ['left', 'top', 'right'];
}

export function OnlineGameBoard({ multiplayer, onLeave }: OnlineGameBoardProps) {
  const { playYourTurn, playWin, playSelect, playCardPlay } = useSound();
  const isMobile = useIsMobile();
  const prevPlayerRef = useRef<number | null>(null);
  const prevPileRef = useRef<number>(0);

  const { room, players, gameState, myPlayer, isMyTurn, isHost, playCards, challenge, pass, nextRound, leaveRoom } = multiplayer;

  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [showChallengeResult, setShowChallengeResult] = useState(false);
  const [showLog, setShowLog] = useState(false);

  useEffect(() => {
    if (gameState?.game_phase === 'playing' && prevPlayerRef.current !== null && prevPlayerRef.current !== gameState.current_player) {
      if (isMyTurn) {
        playYourTurn();
      } else {
        playSelect();
      }
    }
    // Automatically clear selections when a new round starts
    if (gameState?.game_phase === 'playing' && prevPlayerRef.current === null && room?.current_round) {
      setSelectedCards([]);
    }
    prevPlayerRef.current = gameState?.current_player ?? null;
  }, [gameState?.current_player, isMyTurn, gameState?.game_phase, playYourTurn, playSelect, room?.current_round]);

  useEffect(() => {
    if (gameState?.pile && gameState.pile.length > prevPileRef.current) {
      playCardPlay();
    }
    prevPileRef.current = gameState?.pile?.length || 0;
  }, [gameState?.pile?.length, playCardPlay]);

  useEffect(() => {
    if (gameState?.challenge_result) {
      setShowChallengeResult(true);
      const timer = setTimeout(() => setShowChallengeResult(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState?.challenge_result]);

  const handleCardSelect = useCallback((card: CardType) => {
    if (!isMyTurn) return;
    playSelect();
    setSelectedCards(prev => {
      const isSelected = prev.some(c => c.id === card.id);
      if (isSelected) return prev.filter(c => c.id !== card.id);
      return [...prev, card];
    });
  }, [isMyTurn, playSelect]);

  const handlePlay = useCallback(async (claimedRank: Rank) => {
    if (selectedCards.length === 0) return;
    await playCards(selectedCards, claimedRank);
    setSelectedCards([]);
  }, [selectedCards, playCards]);

  const handleChallenge = useCallback(async () => {
    await challenge();
  }, [challenge]);

  const handlePass = useCallback(async () => {
    await pass();
    setSelectedCards([]);
  }, [pass]);

  const handleNextRound = useCallback(async () => {
    playWin();
    await nextRound();
    setSelectedCards([]);
  }, [nextRound, playWin]);

  const handleLeave = useCallback(async () => {
    await leaveRoom();
    onLeave();
  }, [leaveRoom, onLeave]);

  if (!room || !gameState || !myPlayer) {
    return (
      <div className="h-screen flex items-center justify-center felt-bg">
        <div className="text-foreground/70 animate-pulse text-lg">Loading game...</div>
      </div>
    );
  }

  const finishedList = gameState.finished_players || [];
  const gamePlayers = players.map(p => {
    const finishedIndex = finishedList.indexOf(p.player_order);
    return {
      id: p.player_order,
      name: p.nickname,
      hand: p.hand,
      score: p.score,
      finishPosition: finishedIndex !== -1 ? finishedIndex + 1 : undefined,
      isHuman: p.session_id === myPlayer.session_id,
      isThinking: gameState.current_player === p.player_order && p.session_id !== myPlayer.session_id,
    };
  });

  const myGamePlayer = gamePlayers.find(p => p.isHuman)!;
  const opponents = gamePlayers.filter(p => !p.isHuman);
  const opponentPositions = getOpponentPositions(opponents.length);

  const canPlay = isMyTurn && selectedCards.length > 0 && gameState.game_phase === 'playing';
  const canChallenge = isMyTurn &&
    gameState.claim !== null &&
    gameState.last_played_cards.length > 0 &&
    gameState.claim.playerId !== myPlayer.player_order &&
    gameState.game_phase === 'playing';
  const canPass = isMyTurn && gameState.claim !== null && gameState.game_phase === 'playing';

  return (
    <div className="h-screen w-screen overflow-hidden felt-bg relative select-none">
      {/* Round end / Game over overlay */}
      {(gameState.game_phase === 'roundEnd' || gameState.game_phase === 'gameOver') && (
        <RoundEndOverlay
          players={players}
          gameState={gameState}
          isHost={isHost}
          isGameOver={gameState.game_phase === 'gameOver'}
          currentRound={room.current_round}
          totalRounds={room.total_rounds}
          onNextRound={handleNextRound}
          onLeave={handleLeave}
        />
      )}

      {/* === TOP BAR === */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3">
        {/* Left: Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLeave}
            className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-foreground/20 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
          <span className={cn(
            'font-bold text-foreground tracking-wide',
            isMobile ? 'text-sm' : 'text-lg',
          )}>
            RRENASH
          </span>
        </div>

        {/* Right: Pile + Log */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLog(!showLog)}
            className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-foreground/20 transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </button>
          <div className="pile-badge">
            Pile: {gameState.pile.length}
          </div>
        </div>
      </div>

      {/* Game log - floating panel */}
      {showLog && (
        <div className={cn(
          'absolute z-30 bg-card/95 backdrop-blur-sm rounded-lg border border-border shadow-xl',
          isMobile ? 'top-12 right-2 w-56' : 'top-14 right-4 w-72',
        )}>
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
            <span className="text-xs text-foreground/70 font-medium">Game Log</span>
            <button onClick={() => setShowLog(false)} className="text-foreground/50 hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </div>
          <GameLog logs={gameState.log} />
        </div>
      )}

      {/* === OPPONENTS === */}
      {opponents.map((opp, idx) => {
        const pos = opponentPositions[idx];
        const posClass = pos === 'top'
          ? 'absolute top-14 left-1/2 -translate-x-1/2 z-10'
          : pos === 'left'
          ? 'absolute left-4 top-1/2 -translate-y-1/2 z-10'
          : 'absolute right-4 top-1/2 -translate-y-1/2 z-10';

        return (
          <div key={opp.id} className={posClass}>
            <PlayerAvatar
              name={opp.name}
              cardCount={opp.hand.length}
              score={opp.score}
              isCurrentPlayer={gameState.current_player === opp.id}
              isThinking={opp.isThinking}
              position={pos}
              finishPosition={opp.finishPosition}
            />
          </div>
        );
      })}

      {/* === CENTER PLAY AREA === */}
      <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1">
        {/* Claim display */}
        {gameState.claim && (() => {
          const claimer = gamePlayers.find(p => p.id === gameState.claim!.playerId);
          return (
            <div className="bg-card/80 backdrop-blur-sm rounded-lg px-5 py-2 text-center border border-border">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                {claimer && (
                  <span className={cn(
                    'inline-flex items-center justify-center rounded-full bg-primary font-bold text-primary-foreground',
                    isMobile ? 'w-5 h-5 text-[8px]' : 'w-6 h-6 text-[10px]',
                  )}>
                    {claimer.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className={cn(
                  'text-foreground/70 font-medium',
                  isMobile ? 'text-[10px]' : 'text-xs',
                )}>
                  {claimer?.name || 'Unknown'}
                </span>
              </div>
              <div className={cn(
                'font-bold text-primary',
                isMobile ? 'text-lg' : 'text-2xl',
              )}>
                {gameState.claim.count}× {gameState.claim.rank}
              </div>
            </div>
          );
        })()}

        {/* Played cards / Pile area */}
        <div className={cn(
          'flex items-center justify-center',
          isMobile ? 'min-h-[54px]' : 'min-h-[74px]',
        )}>
          {gameState.pile.length === 0 && gameState.last_played_cards.length === 0 ? (
            <div className={cn(
              'text-foreground/30 font-semibold uppercase tracking-wider',
              isMobile ? 'text-xs' : 'text-sm',
            )}>
              PLAY A CARD
            </div>
          ) : showChallengeResult && gameState.challenge_result ? (
            <div className={cn(
              'flex gap-1 p-2 rounded-xl',
              gameState.challenge_result.wasBluff ? 'bg-destructive/20' : 'bg-green-700/40',
            )}>
              {gameState.challenge_result.revealedCards.map((card, idx) => (
                <PlayingCard
                  key={card.id}
                  card={card}
                  size={isMobile ? 'xs' : 'sm'}
                  animationDelay={idx * 100}
                />
              ))}
            </div>
          ) : gameState.last_played_cards.length > 0 ? (
            <div className="flex gap-1">
              {gameState.last_played_cards.map((card) => (
                <CardBack key={card.id} size={isMobile ? 'xs' : 'sm'} />
              ))}
            </div>
          ) : (
            <div className="relative">
              {gameState.pile.slice(-Math.min(5, gameState.pile.length)).map((_, idx) => (
                <div
                  key={idx}
                  className="absolute"
                  style={{
                    transform: `rotate(${(idx - 2) * 12}deg) translate(${(idx - 2) * 3}px, ${(idx - 2) * 2}px)`,
                    zIndex: idx,
                  }}
                >
                  <CardBack size={isMobile ? 'xs' : 'sm'} />
                </div>
              ))}
              <div className="relative z-10">
                <CardBack size={isMobile ? 'xs' : 'sm'} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* === BOTTOM: Turn info + Controls + Hand === */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center',
        isMobile ? 'gap-1' : 'gap-2',
      )}>
        {/* Controls */}
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

        {/* My hand */}
        <MyHand
          player={myGamePlayer}
          isCurrentPlayer={isMyTurn}
          selectedCards={selectedCards}
          onCardSelect={handleCardSelect}
          disabled={!isMyTurn || gameState.game_phase !== 'playing'}
        />

        {/* Bottom bar with turn info */}
        <div className={cn(
          'bottom-bar w-full flex items-center justify-center',
          isMobile ? 'py-2' : 'py-3',
        )}>
          <div className={cn(
            'bg-card/60 rounded-lg px-6 py-1.5 text-center border border-border/50',
            isMobile ? 'text-xs' : 'text-sm',
          )}>
            <span className="text-foreground font-medium">
              {isMyTurn ? "Your Turn" : `${gamePlayers.find(p => p.id === gameState.current_player)?.name || ''}'s Turn`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
