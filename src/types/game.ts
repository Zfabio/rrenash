export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' | '2';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

export interface Player {
  id: number;
  name: string;
  hand: Card[];
  score: number;
  isHuman: boolean;
  isThinking?: boolean;
}

export interface Claim {
  rank: Rank;
  count: number;
  playerId: number;
}

export interface GameState {
  deck: Card[];
  pile: Card[];
  players: Player[];
  currentPlayer: number;
  claim: Claim | null;
  lastPlayedCards: Card[];
  gamePhase: 'setup' | 'playing' | 'roundEnd' | 'gameOver';
  roundWinner: number | null;
  finishedPlayers: number[]; // ordered list of player IDs who emptied their hand
  totalRounds: number;
  currentRound: number;
  log: string[];
  consecutivePasses: number;
  challengeResult?: {
    challenger: number;
    challenged: number;
    wasBluff: boolean;
    revealedCards: Card[];
  } | null;
}

export const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
export const RANKS: Rank[] = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];

export const RANK_VALUES: Record<Rank, number> = {
  '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14, '2': 15
};
