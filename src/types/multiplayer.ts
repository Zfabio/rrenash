import { Card, Rank, Claim } from './game';

export interface GameRoom {
  id: string;
  room_code: string;
  host_id: string;
  status: 'waiting' | 'playing' | 'finished';
  max_players: number;
  total_rounds: number;
  current_round: number;
  created_at: string;
  updated_at: string;
}

export interface GamePlayer {
  id: string;
  room_id: string;
  session_id: string;
  nickname: string;
  player_order: number;
  hand: Card[];
  score: number;
  is_host: boolean;
  is_connected: boolean;
  created_at: string;
}

export interface OnlineGameState {
  id: string;
  room_id: string;
  pile: Card[];
  current_player: number;
  claim: Claim | null;
  last_played_cards: Card[];
  game_phase: 'waiting' | 'playing' | 'roundEnd' | 'gameOver';
  round_winner: number | null;
  consecutive_passes: number;
  challenge_result: {
    challenger: number;
    challenged: number;
    wasBluff: boolean;
    revealedCards: Card[];
    pileCards?: Card[];
    timestamp?: number;
  } | null;
  log: string[];
  updated_at: string;
  // New: Track finished players in order (1st, 2nd, 3rd place)
  finished_players: number[];
}

export interface MultiplayerContextType {
  sessionId: string;
  room: GameRoom | null;
  players: GamePlayer[];
  gameState: OnlineGameState | null;
  myPlayer: GamePlayer | null;
  isHost: boolean;
  isMyTurn: boolean;
  error: string | null;
  isLoading: boolean;
  
  createRoom: (nickname: string, maxPlayers: number, totalRounds: number) => Promise<string | null>;
  joinRoom: (roomCode: string, nickname: string) => Promise<boolean>;
  leaveRoom: () => Promise<void>;
  startGame: () => Promise<void>;
  
  playCards: (cards: Card[], claimedRank: Rank) => Promise<void>;
  challenge: () => Promise<void>;
  pass: () => Promise<void>;
  nextRound: () => Promise<void>;
}
