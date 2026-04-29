import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'sq';

interface Translations {
  // Game setup
  gameTitle: string;
  gameSubtitle: string;
  howToPlay: string;
  rules: string[];
  scoring: string;
  scoringDetails: string[];
  players: string;
  rounds: string;
  startGame: string;
  
  // Game board
  round: string;
  of: string;
  newGame: string;
  roundOver: string;
  winsRound: string;
  nextRound: string;
  gameOver: string;
  winner: string;
  
  // Controls
  selectRank: string;
  play: string;
  challenge: string;
  pass: string;
  mixedCardsWarning: string;
  selectCardsFirst: string;
  
  // Central pile
  centralPile: string;
  empty: string;
  currentClaim: string;
  cardsPlayed: string;
  
  // Players
  you: string;
  cards: string;
  thinking: string;
  yourTurn: string;
  
  // Challenge
  wasBluffing: string;
  wasHonest: string;
  takePile: string;
  challenged: string;
  
  // Actions
  played: string;
  passed: string;
  allPassed: string;
  pileDiscarded: string;
  finishedHand: string;
  gameStarted: string;
  youPlayFirst: string;
  
  // UI Elements
  pileCount: string;
  playACard: string;
  turnOf: string;
  
  // Online
  playOnline: string;
}

const translations: Record<Language, Translations> = {
  en: {
    gameTitle: 'Rrenash',
    gameSubtitle: 'The Albanian Bluff Card Game',
    howToPlay: 'How to Play:',
    rules: [
      'First player chooses any rank and plays cards face-down',
      'Other players must play (or bluff!) the same rank',
      'Call "Rren!" to challenge the last play',
      'If challenged and caught bluffing, take the pile!',
      'First to empty their hand wins the round'
    ],
    scoring: 'Scoring:',
    scoringDetails: ['🥇 1st: 3 pts', '🥈 2nd: 2 pts', '🥉 3rd: 1 pt'],
    players: 'Players',
    rounds: 'Rounds',
    startGame: 'Start Game',
    
    round: 'Round',
    of: 'of',
    newGame: 'New Game',
    roundOver: 'Round Over!',
    winsRound: 'wins the round!',
    nextRound: 'Next Round',
    gameOver: 'Game Over!',
    winner: 'Winner',
    
    selectRank: 'Claim rank',
    play: 'Play',
    challenge: 'Rren!',
    pass: 'Pass',
    mixedCardsWarning: 'Mixed cards selected - this is a bluff!',
    selectCardsFirst: 'Select cards to play',
    
    centralPile: 'Central Pile',
    empty: 'Empty',
    currentClaim: 'Current claim',
    cardsPlayed: 'cards played',
    
    you: 'You',
    cards: 'cards',
    thinking: 'Thinking...',
    yourTurn: 'Your turn',
    
    wasBluffing: 'was bluffing!',
    wasHonest: 'was honest!',
    takePile: 'takes the pile',
    challenged: 'challenged',
    
    played: 'played',
    passed: 'passed',
    allPassed: 'All players passed',
    pileDiscarded: 'pile discarded!',
    finishedHand: 'finished their hand!',
    gameStarted: 'Game started!',
    youPlayFirst: 'You play first.',
    
    pileCount: 'Pile',
    playACard: 'PLAY A CARD',
    turnOf: 'Turn: ',
    
    playOnline: 'Play Online'
  },
  sq: {
    gameTitle: 'Rrenash',
    gameSubtitle: '',
    howToPlay: 'Si të Luhet:',
    rules: [
      'Lojtari i parë zgjedh një numër dhe hedh letrat me fytyrë poshtë',
      'Lojtarët e tjerë duhet të luajnë (ose të blofojnë!) të njëjtin numër',
      'Thirr "Rren!" për të sfiduar hedhjen e fundit',
      'Nëse sfidohesh dhe të kapin duke blofuar, merr grumbullin!',
      'I pari që zbraz dorën fiton raundin'
    ],
    scoring: 'Pikët:',
    scoringDetails: ['🥇 I pari: 3 pikë', '🥈 I dyti: 2 pikë', '🥉 I treti: 1 pikë'],
    players: 'Lojtarë',
    rounds: 'Raunde',
    startGame: 'Fillo Lojën',
    
    round: 'Raundi',
    of: 'nga',
    newGame: 'Lojë e Re',
    roundOver: 'Raundi Mbaroi!',
    winsRound: 'fitoi raundin!',
    nextRound: 'Raundi Tjetër',
    gameOver: 'Loja Mbaroi!',
    winner: 'Fituesi',
    
    selectRank: 'Zgjidh numrin',
    play: 'Luaj',
    challenge: 'Rren!',
    pass: 'Pas',
    mixedCardsWarning: 'Letra të përziera - kjo është blof!',
    selectCardsFirst: 'Zgjidh letrat për të luajtur',
    
    centralPile: 'Grumbulli Qendror',
    empty: 'Bosh',
    currentClaim: 'Deklarimi aktual',
    cardsPlayed: 'letra të luajtura',
    
    you: 'Ti',
    cards: 'letra',
    thinking: 'Po mendon...',
    yourTurn: 'Radha jote',
    
    wasBluffing: 'po blofonte!',
    wasHonest: 'ishte i ndershëm!',
    takePile: 'merr grumbullin',
    challenged: 'sfidoi',
    
    played: 'luajti',
    passed: 'kaloi',
    allPassed: 'Të gjithë lojtarët kaluan',
    pileDiscarded: 'grumbulli u hodh!',
    finishedHand: 'mbaroi dorën!',
    gameStarted: 'Loja filloi!',
    youPlayFirst: 'Ti luan i pari.',
    
    pileCount: 'Grumbulli',
    playACard: 'LUAJ NJË LETËR',
    turnOf: 'Radha e ',
    
    playOnline: 'Luaj Online'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('sq');
  
  const value = {
    language,
    setLanguage,
    t: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
