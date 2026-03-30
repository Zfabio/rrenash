import { useState } from 'react';
import { GameSetup } from '@/components/GameSetup';
import { GameBoard } from '@/components/GameBoard';
import { OnlineLobby } from '@/components/OnlineLobby';
import { OnlineGameBoard } from '@/components/OnlineGameBoard';
import { useMultiplayer } from '@/hooks/useMultiplayer';

type GameScreen = 'setup' | 'playing' | 'online-lobby' | 'online-playing';

interface GameConfig {
  numPlayers: number;
  totalRounds: number;
}

const Index = () => {
  const [screen, setScreen] = useState<GameScreen>('setup');
  const [config, setConfig] = useState<GameConfig>({ numPlayers: 4, totalRounds: 3 });
  const multiplayer = useMultiplayer();

  const handleStartGame = (numPlayers: number, totalRounds: number) => {
    setConfig({ numPlayers, totalRounds });
    setScreen('playing');
  };

  const handleBackToSetup = () => {
    setScreen('setup');
  };

  const handleOnlinePlay = () => {
    setScreen('online-lobby');
  };

  // Watch for game start in multiplayer
  if (screen === 'online-lobby' && multiplayer.room?.status === 'playing') {
    setScreen('online-playing');
  }

  return (
    <>
      {screen === 'setup' && (
        <GameSetup 
          onStartGame={handleStartGame} 
          onOnlinePlay={handleOnlinePlay}
        />
      )}
      {screen === 'playing' && (
        <GameBoard 
          numPlayers={config.numPlayers} 
          totalRounds={config.totalRounds}
          onBackToSetup={handleBackToSetup}
        />
      )}
      {screen === 'online-lobby' && (
        <OnlineLobby 
          multiplayer={multiplayer}
          onBack={handleBackToSetup}
        />
      )}
      {screen === 'online-playing' && (
        <OnlineGameBoard
          multiplayer={multiplayer}
          onLeave={handleBackToSetup}
        />
      )}
    </>
  );
};

export default Index;
