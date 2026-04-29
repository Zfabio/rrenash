import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations_supabase/client';
import { GameRoom, GamePlayer, OnlineGameState, MultiplayerContextType } from '@/types/multiplayer';
import { Card, Rank, SUITS, RANKS } from '@/types/game';
import { RealtimeChannel } from '@supabase/supabase-js';

// Generate a persistent session ID for this browser
function getSessionId(): string {
  let sessionId = localStorage.getItem('rrenash_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('rrenash_session_id', sessionId);
  }
  return sessionId;
}

// Shuffle deck
function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, id: crypto.randomUUID() });
    }
  }
  return shuffleDeck(deck);
}

function sortHand(hand: Card[]): Card[] {
  return [...hand].sort((a, b) => {
    const rankOrder = RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank);
    if (rankOrder !== 0) return rankOrder;
    return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
  });
}

export function useMultiplayer(): MultiplayerContextType {
  const sessionId = useMemo(() => getSessionId(), []);
  
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [gameState, setGameState] = useState<OnlineGameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const myPlayer = useMemo(() => 
    players.find(p => p.session_id === sessionId) || null,
    [players, sessionId]
  );

  const isHost = useMemo(() => myPlayer?.is_host || false, [myPlayer]);
  
  const isMyTurn = useMemo(() => {
    if (!gameState || !myPlayer) return false;
    return gameState.current_player === myPlayer.player_order;
  }, [gameState, myPlayer]);

  // Subscribe to room changes
  useEffect(() => {
    if (!room?.id) return;

    const newChannel = supabase
      .channel(`room-${room.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_rooms', filter: `id=eq.${room.id}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setRoom(null);
            setPlayers([]);
            setGameState(null);
          } else {
            setRoom(payload.new as GameRoom);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_players', filter: `room_id=eq.${room.id}` },
        async () => {
          // Refetch all players using secure RPC that hides opponents' hands
          const { data } = await supabase
            .rpc('get_room_players', { p_room_id: room.id, p_session_id: sessionId });
          if (data) {
            setPlayers(data.map((p: any) => ({
              ...p,
              hand: Array.isArray(p.hand) ? (p.hand as unknown as Card[]) : []
            })));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_state', filter: `room_id=eq.${room.id}` },
        (payload) => {
          const newState = payload.new as any;
          setGameState({
            ...newState,
            game_phase: newState.game_phase as 'waiting' | 'playing' | 'roundEnd' | 'gameOver',
            pile: Array.isArray(newState.pile) ? (newState.pile as unknown as Card[]) : [],
            last_played_cards: Array.isArray(newState.last_played_cards) ? (newState.last_played_cards as unknown as Card[]) : [],
            log: Array.isArray(newState.log) ? (newState.log as unknown as string[]) : [],
            claim: newState.claim || null,
            challenge_result: newState.challenge_result || null,
            finished_players: Array.isArray(newState.finished_players) ? (newState.finished_players as number[]) : []
          });
        }
      )
      .subscribe();

    setChannel(newChannel);

    return () => {
      supabase.removeChannel(newChannel);
    };
  }, [room?.id]);

  // Handle picking up cards when you lose a challenge
  useEffect(() => {
    if (!gameState?.challenge_result || !room?.id || !myPlayer) return;
    
    const { challenger, challenged, wasBluff, pileCards, timestamp } = gameState.challenge_result;
    const loserOrder = wasBluff ? challenged : challenger;
    
    if (myPlayer.player_order === loserOrder) {
      // Use sessionStorage to prevent duplicate updates on the same challenge
      // Fallback to log length if timestamp doesn't exist
      const pickedUpKey = `picked_up_${room.id}_${timestamp || gameState.log.length}`;
      if (sessionStorage.getItem(pickedUpKey)) return;
      sessionStorage.setItem(pickedUpKey, 'true');

      // Use the snapshot of the pile from the challenge result, falling back to current pile
      const cardsToPickUp = pileCards || gameState.pile;
      const newHand = sortHand([...myPlayer.hand, ...cardsToPickUp]);
      supabase
        .from('game_players')
        .update({ hand: newHand as any })
        .eq('id', myPlayer.id);
    }
  }, [gameState?.challenge_result, room?.id, myPlayer]);

  // Fetch initial data when room is set
  useEffect(() => {
    if (!room?.id) return;

    const fetchData = async () => {
      const [playersRes, stateRes] = await Promise.all([
        supabase.rpc('get_room_players', { p_room_id: room.id, p_session_id: sessionId }),
        supabase.from('game_state').select('*').eq('room_id', room.id).single()
      ]);

      if (playersRes.data) {
        setPlayers(playersRes.data.map((p: any) => ({
          ...p,
          hand: Array.isArray(p.hand) ? (p.hand as unknown as Card[]) : []
        })));
      }

      if (stateRes.data) {
        const s = stateRes.data;
        setGameState({
          ...s,
          game_phase: s.game_phase as 'waiting' | 'playing' | 'roundEnd' | 'gameOver',
          pile: Array.isArray(s.pile) ? (s.pile as unknown as Card[]) : [],
          last_played_cards: Array.isArray(s.last_played_cards) ? (s.last_played_cards as unknown as Card[]) : [],
          log: Array.isArray(s.log) ? (s.log as unknown as string[]) : [],
          claim: s.claim as any || null,
          challenge_result: s.challenge_result as any || null,
          finished_players: Array.isArray((s as any).finished_players) ? ((s as any).finished_players as number[]) : []
        });
      }
    };

    fetchData();
  }, [room?.id]);

  const createRoom = useCallback(async (nickname: string, maxPlayers: number, totalRounds: number): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate unique room code
      const { data: codeData } = await supabase.rpc('generate_room_code');
      const roomCode = codeData as string;

      // Create room
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .insert({
          room_code: roomCode,
          host_id: sessionId,
          max_players: maxPlayers,
          total_rounds: totalRounds,
          status: 'waiting'
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add host as first player
      const { error: playerError } = await supabase
        .from('game_players')
        .insert({
          room_id: roomData.id,
          session_id: sessionId,
          nickname,
          player_order: 0,
          is_host: true
        });

      if (playerError) throw playerError;

      // Create initial game state
      const { error: stateError } = await supabase
        .from('game_state')
        .insert({
          room_id: roomData.id,
          game_phase: 'waiting',
          log: ['Waiting for players...']
        });

      if (stateError) throw stateError;

      setRoom(roomData as GameRoom);
      return roomCode;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const joinRoom = useCallback(async (roomCode: string, nickname: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Find room
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .eq('status', 'waiting')
        .single();

      if (roomError || !roomData) {
        setError('Room not found or game already started');
        return false;
      }

      // Check player count
      const { data: existingPlayers } = await supabase
        .from('game_players')
        .select('*')
        .eq('room_id', roomData.id);

      if (existingPlayers && existingPlayers.length >= roomData.max_players) {
        setError('Room is full');
        return false;
      }

      // Check if already in room
      const alreadyJoined = existingPlayers?.find(p => p.session_id === sessionId);
      if (alreadyJoined) {
        setRoom(roomData as GameRoom);
        return true;
      }

      // Join as new player
      const playerOrder = existingPlayers?.length || 0;
      const { error: playerError } = await supabase
        .from('game_players')
        .insert({
          room_id: roomData.id,
          session_id: sessionId,
          nickname,
          player_order: playerOrder,
          is_host: false
        });

      if (playerError) throw playerError;

      setRoom(roomData as GameRoom);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const leaveRoom = useCallback(async () => {
    if (!room || !myPlayer) return;

    await supabase
      .from('game_players')
      .delete()
      .eq('id', myPlayer.id);

    // If host leaves and game hasn't started, delete the room
    if (isHost && room.status === 'waiting') {
      await supabase.from('game_rooms').delete().eq('id', room.id);
    }

    setRoom(null);
    setPlayers([]);
    setGameState(null);
    if (channel) {
      supabase.removeChannel(channel);
    }
  }, [room, myPlayer, isHost, channel]);

  const startGame = useCallback(async () => {
    if (!room || !isHost || players.length < 2) return;

    // Create and deal cards
    const deck = createDeck();
    const numPlayers = players.length;
    const cardsPerPlayer = Math.floor(52 / numPlayers);
    
    // Deal cards to each player
    const dealPromises = players.map((player, idx) => {
      const startIdx = idx * cardsPerPlayer;
      const hand = sortHand(deck.slice(startIdx, startIdx + cardsPerPlayer));
      return supabase
        .from('game_players')
        .update({ hand: hand as any })
        .eq('id', player.id);
    });

    await Promise.all(dealPromises);

    // Update room and game state
    await Promise.all([
      supabase
        .from('game_rooms')
        .update({ status: 'playing' })
        .eq('id', room.id),
      supabase
        .from('game_state')
        .update({
          game_phase: 'playing',
          current_player: 0,
          pile: [],
          claim: null,
          last_played_cards: [],
          consecutive_passes: 0,
          finished_players: [],
          log: ['Game started! ' + players[0].nickname + ' plays first.']
        })
        .eq('room_id', room.id)
    ]);
  }, [room, isHost, players]);

  const playCards = useCallback(async (cards: Card[], claimedRank: Rank) => {
    if (!room || !gameState || !myPlayer) return;
    // Don't check isMyTurn here - it can be stale from closure.
    // The UI already gates this via canPlay prop.

    const newHand = myPlayer.hand.filter(c => !cards.some(sc => sc.id === c.id));
    const newPile = [...gameState.pile, ...cards];
    const newClaim = {
      rank: gameState.claim?.rank || claimedRank,
      count: cards.length,
      playerId: myPlayer.player_order
    };
    
    const isBluff = cards.some(c => c.rank !== newClaim.rank);
    const playLog = `${myPlayer.nickname} played ${cards.length} card(s) as ${newClaim.rank}${isBluff ? ' 🎭' : ''}`;
    const newLog = [...gameState.log, playLog];
    
    // Find the next player who still has cards (or hasn't finished)
    const finishedPlayers = gameState.finished_players || [];
    let nextPlayer = (gameState.current_player + 1) % players.length;
    
    // Skip players who have already finished
    let attempts = 0;
    while (finishedPlayers.includes(nextPlayer) && attempts < players.length) {
      nextPlayer = (nextPlayer + 1) % players.length;
      attempts++;
    }
    
    const justFinishedHand = newHand.length === 0;

    // Update player's hand
    await supabase
      .from('game_players')
      .update({ hand: newHand as any })
      .eq('id', myPlayer.id);

    // If player just emptied their hand, DON'T end round yet
    // The next player still gets a chance to challenge
    if (justFinishedHand) {
      newLog.push(`🎉 ${myPlayer.nickname} played their last card! Next player can challenge or pass.`);
    }

    await supabase
      .from('game_state')
      .update({
        pile: newPile as any,
        claim: newClaim as any,
        last_played_cards: cards as any,
        current_player: nextPlayer,
        consecutive_passes: 0,
        log: newLog as any
      })
      .eq('room_id', room.id);
  }, [room, gameState, myPlayer, isMyTurn, players.length]);

  const challenge = useCallback(async () => {
    if (!room || !gameState || !myPlayer || !gameState.claim) return;

    const challengedPlayerId = gameState.claim.playerId;
    const challengedPlayer = players.find(p => p.player_order === challengedPlayerId);
    if (!challengedPlayer) return;

    const wasBluff = !gameState.last_played_cards.every(c => c.rank === gameState.claim!.rank);
    
    const challengeLog = `🔥 ${myPlayer.nickname} challenged ${challengedPlayer.nickname}!`;
    const newLog = [...gameState.log, challengeLog];

    const loserOrder = wasBluff ? challengedPlayerId : myPlayer.player_order;
    const loser = players.find(p => p.player_order === loserOrder);
    
    if (!loser) return;

    const resultLog = wasBluff
      ? `${challengedPlayer.nickname} was bluffing! They take the pile (${gameState.pile.length} cards)`
      : `${challengedPlayer.nickname} was honest! ${myPlayer.nickname} takes the pile (${gameState.pile.length} cards)`;

    // ONE ATOMIC UPDATE: Show the challenge result, but clear the pile instantly. 
    // The UI handles showing the result for 2s independently. The Loser picks up `pileCards` from this snapshot.
    await supabase
      .from('game_state')
      .update({
        challenge_result: {
          challenger: myPlayer.player_order,
          challenged: challengedPlayerId,
          wasBluff,
          revealedCards: gameState.last_played_cards,
          pileCards: gameState.pile, // Snapshot preserved internally inside the result!
          timestamp: Date.now()
        } as any,
        log: [...newLog, resultLog] as any,
        pile: [], // Clear table immediately!
        claim: null,
        last_played_cards: [],
        current_player: loserOrder, // Turn passes to loser immediately!
        consecutive_passes: 0
      })
      .eq('room_id', room.id);

    // Completely removed the `setTimeout` which was causing race conditions 
    // and randomly deleting the game state cards!
  }, [room, gameState, myPlayer, isMyTurn, players]);

  const pass = useCallback(async () => {
    if (!room || !gameState || !myPlayer) return;

    const finishedPlayers = gameState.finished_players || [];
    const activePlayers = players.filter(p => !finishedPlayers.includes(p.player_order));
    
    // Check if the player who just played finished their hand (has 0 cards)
    const lastPlayer = players.find(p => p.player_order === gameState.claim?.playerId);
    const lastPlayerFinishedHand = lastPlayer && lastPlayer.hand.length === 0;
    
    const newConsecutivePasses = gameState.consecutive_passes + 1;
    
    // Find next active player
    let nextPlayer = (gameState.current_player + 1) % players.length;
    let attempts = 0;
    while (finishedPlayers.includes(nextPlayer) && attempts < players.length) {
      nextPlayer = (nextPlayer + 1) % players.length;
      attempts++;
    }
    
    // If the last player finished their hand and current player passes (doesn't challenge),
    // that player officially wins their position
    if (lastPlayerFinishedHand && lastPlayer) {
      const newFinishedPlayers = [...finishedPlayers, lastPlayer.player_order];
      const activePlayersRemaining = players.filter(p => !newFinishedPlayers.includes(p.player_order));
      
      // Points: 3 for 1st, 2 for 2nd, 1 for 3rd (0 for last)
      const position = newFinishedPlayers.length;
      const points = position === 1 ? 3 : position === 2 ? 2 : position === 3 ? 1 : 0;
      
      // Update the finished player's score
      await supabase
        .from('game_players')
        .update({ score: lastPlayer.score + points })
        .eq('id', lastPlayer.id);
      
      const positionText = position === 1 ? '1st 🥇' : position === 2 ? '2nd 🥈' : position === 3 ? '3rd 🥉' : 'Last';
      const passLog = `${myPlayer.nickname} passed`;
      const finishLog = `🏆 ${lastPlayer.nickname} finished in ${positionText} place! (+${points} points)`;
      
      // Check if round should end (only 1 player left with cards)
      if (activePlayersRemaining.length <= 1) {
        // Last player remaining gets 0 points
        const lastPlayerRemaining = activePlayersRemaining[0];
        const finalFinishedPlayers = [...newFinishedPlayers, lastPlayerRemaining?.player_order].filter(p => p !== undefined);
        
        await supabase
          .from('game_state')
          .update({
            pile: [],
            claim: null,
            last_played_cards: [],
            consecutive_passes: 0,
            finished_players: finalFinishedPlayers as any,
            round_winner: newFinishedPlayers[0], // First to finish wins
            game_phase: 'roundEnd',
            log: [...gameState.log, passLog, finishLog, '🏁 Round Over!'] as any
          })
          .eq('room_id', room.id);
      } else {
        // Continue game with remaining players
        // Find next player among active ones
        let newNextPlayer = nextPlayer;
        attempts = 0;
        while (newFinishedPlayers.includes(newNextPlayer) && attempts < players.length) {
          newNextPlayer = (newNextPlayer + 1) % players.length;
          attempts++;
        }
        
        await supabase
          .from('game_state')
          .update({
            pile: [],
            claim: null,
            last_played_cards: [],
            consecutive_passes: 0,
            current_player: newNextPlayer,
            finished_players: newFinishedPlayers as any,
            log: [...gameState.log, passLog, finishLog] as any
          })
          .eq('room_id', room.id);
      }
      return;
    }
    
    // Normal pass logic (when no one just finished)
    const allActivePassed = newConsecutivePasses >= activePlayers.length;

    if (allActivePassed && gameState.pile.length > 0) {
      // DON'T discard the pile when everyone passes, just reset passes and allow a fresh claim
      await supabase
        .from('game_state')
        .update({
          claim: null,
          last_played_cards: [],
          consecutive_passes: 0,
          current_player: nextPlayer,
          log: [...gameState.log, `${myPlayer.nickname} passed`, '✨ All players passed - new claim can be made!'] as any
        })
        .eq('room_id', room.id);
    } else {
      await supabase
        .from('game_state')
        .update({
          consecutive_passes: newConsecutivePasses,
          current_player: nextPlayer,
          log: [...gameState.log, `${myPlayer.nickname} passed`] as any
        })
        .eq('room_id', room.id);
    }
  }, [room, gameState, myPlayer, isMyTurn, players]);

  const nextRound = useCallback(async () => {
    if (!room || !isHost) return;

    const currentRound = room.current_round + 1;
    
    if (currentRound > room.total_rounds) {
      // Game over
      await supabase
        .from('game_state')
        .update({ game_phase: 'gameOver' })
        .eq('room_id', room.id);
      return;
    }

    // Deal new cards (don't update scores here - they were updated when players finished)
    const deck = createDeck();
    const numPlayers = players.length;
    const cardsPerPlayer = Math.floor(52 / numPlayers);

    // Deal new hands only
    const updatePromises = players.map((player, idx) => {
      const startIdx = idx * cardsPerPlayer;
      const hand = sortHand(deck.slice(startIdx, startIdx + cardsPerPlayer));
      return supabase
        .from('game_players')
        .update({ hand: hand as any })
        .eq('id', player.id);
    });

    await Promise.all(updatePromises);

    // Reset game state
    await Promise.all([
      supabase
        .from('game_rooms')
        .update({ current_round: currentRound })
        .eq('id', room.id),
      supabase
        .from('game_state')
        .update({
          game_phase: 'playing',
          current_player: 0,
          pile: [],
          claim: null,
          last_played_cards: [],
          consecutive_passes: 0,
          round_winner: null,
          challenge_result: null,
          finished_players: [],
          log: [`Round ${currentRound} started! ${players[0].nickname} plays first.`]
        })
        .eq('room_id', room.id)
    ]);
  }, [room, isHost, players, gameState]);

  return {
    sessionId,
    room,
    players,
    gameState,
    myPlayer,
    isHost,
    isMyTurn,
    error,
    isLoading,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    playCards,
    challenge,
    pass,
    nextRound
  };
}
