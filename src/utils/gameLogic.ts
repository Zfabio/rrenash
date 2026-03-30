import { Card, Player, GameState, Claim, SUITS, RANKS, Rank } from '@/types/game';

export function createDeck(): Card[] {
  const deck: Card[] = [];
  let id = 0;
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, id: `card-${id++}` });
    }
  }
  return shuffleDeck(deck);
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(deck: Card[], numPlayers: number): { hands: Card[][], remainingDeck: Card[] } {
  const hands: Card[][] = Array.from({ length: numPlayers }, () => []);
  const cardsPerPlayer = Math.floor(deck.length / numPlayers);
  
  for (let i = 0; i < cardsPerPlayer * numPlayers; i++) {
    hands[i % numPlayers].push(deck[i]);
  }
  
  return {
    hands,
    remainingDeck: deck.slice(cardsPerPlayer * numPlayers)
  };
}

export function createPlayers(numPlayers: number, hands: Card[][]): Player[] {
  const names = ['You', 'Besa', 'Arben', 'Driton'];
  return Array.from({ length: numPlayers }, (_, i) => ({
    id: i,
    name: names[i],
    hand: sortHand(hands[i]),
    score: 0,
    isHuman: i === 0
  }));
}

export function sortHand(hand: Card[]): Card[] {
  return [...hand].sort((a, b) => {
    const rankOrder = RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank);
    if (rankOrder !== 0) return rankOrder;
    return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
  });
}

export function validatePlay(cards: Card[], claim: Claim | null): boolean {
  if (cards.length === 0) return false;
  
  // All cards must be the same rank
  const firstRank = cards[0].rank;
  if (!cards.every(c => c.rank === firstRank)) return false;
  
  // If there's an existing claim, must match the claimed rank
  if (claim && firstRank !== claim.rank) {
    // This is where bluffing happens - player claims a different rank
    // The actual cards don't match, but they can claim they do
  }
  
  return true;
}

export function checkForBluff(playedCards: Card[], claimedRank: Rank): boolean {
  return !playedCards.every(card => card.rank === claimedRank);
}

export function calculateRoundPoints(position: number): number {
  if (position === 1) return 3;
  if (position === 2) return 2;
  if (position === 3) return 1;
  return 0;
}

export function getNextPlayer(currentPlayer: number, numPlayers: number, finishedPlayers: number[] = []): number {
  let next = (currentPlayer + 1) % numPlayers;
  // Skip players who have finished (empty hand)
  let attempts = 0;
  while (finishedPlayers.includes(next) && attempts < numPlayers) {
    next = (next + 1) % numPlayers;
    attempts++;
  }
  return next;
}

export function aiSelectCards(hand: Card[], currentClaim: Claim | null): { cards: Card[], claimedRank: Rank, isBluff: boolean } {
  // AI strategy
  if (!currentClaim) {
    // First play - play the rank we have the most of
    const rankCounts: Record<Rank, Card[]> = {} as Record<Rank, Card[]>;
    for (const card of hand) {
      if (!rankCounts[card.rank]) rankCounts[card.rank] = [];
      rankCounts[card.rank].push(card);
    }
    
    let bestRank: Rank = hand[0].rank;
    let maxCount = 0;
    for (const [rank, cards] of Object.entries(rankCounts)) {
      if (cards.length > maxCount) {
        maxCount = cards.length;
        bestRank = rank as Rank;
      }
    }
    
    const cardsToPlay = rankCounts[bestRank];
    return { cards: cardsToPlay, claimedRank: bestRank, isBluff: false };
  }
  
  // Follow the claim
  const matchingCards = hand.filter(c => c.rank === currentClaim.rank);
  
  if (matchingCards.length > 0) {
    // We have matching cards - play them honestly
    const numToPlay = Math.min(matchingCards.length, Math.ceil(Math.random() * matchingCards.length));
    return { 
      cards: matchingCards.slice(0, numToPlay), 
      claimedRank: currentClaim.rank, 
      isBluff: false 
    };
  }
  
  // We need to bluff - decide if we should
  const bluffChance = Math.random();
  if (bluffChance > 0.4 && hand.length > 0) {
    // Bluff with random cards
    const numToBluff = Math.min(hand.length, Math.ceil(Math.random() * 2));
    const shuffled = [...hand].sort(() => Math.random() - 0.5);
    return { 
      cards: shuffled.slice(0, numToBluff), 
      claimedRank: currentClaim.rank, 
      isBluff: true 
    };
  }
  
  // Pass
  return { cards: [], claimedRank: currentClaim.rank, isBluff: false };
}

export function aiShouldChallenge(
  lastPlayedCount: number, 
  claimedRank: Rank,
  aiHand: Card[]
): boolean {
  // Count how many of the claimed rank the AI has
  const aiHasOfRank = aiHand.filter(c => c.rank === claimedRank).length;
  // If AI has most of the claimed rank, more likely to challenge
  
  // If AI has most of the claimed rank, more likely to challenge
  if (aiHasOfRank >= 3) return Math.random() > 0.2;
  if (aiHasOfRank >= 2 && lastPlayedCount >= 2) return Math.random() > 0.4;
  
  // Random challenge with low probability
  return Math.random() > 0.85;
}

export function initializeGame(numPlayers: number, totalRounds: number): GameState {
  const deck = createDeck();
  const { hands } = dealCards(deck, numPlayers);
  const players = createPlayers(numPlayers, hands);
  
  return {
    deck: [],
    pile: [],
    players,
    currentPlayer: 0,
    claim: null,
    lastPlayedCards: [],
    gamePhase: 'playing',
    roundWinner: null,
    finishedPlayers: [],
    totalRounds,
    currentRound: 1,
    log: ['Game started! You play first.'],
    consecutivePasses: 0,
    challengeResult: null
  };
}
