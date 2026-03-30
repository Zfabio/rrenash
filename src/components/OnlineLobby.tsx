import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { MultiplayerContextType } from '@/types/multiplayer';
import { Users, Copy, Check, ArrowLeft, Loader2 } from 'lucide-react';

interface OnlineLobbyProps {
  multiplayer: MultiplayerContextType;
  onBack: () => void;
}

export function OnlineLobby({ multiplayer, onBack }: OnlineLobbyProps) {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [totalRounds, setTotalRounds] = useState(3);
  const [copied, setCopied] = useState(false);

  const { room, players, isHost, isLoading, error, createRoom, joinRoom, leaveRoom, startGame } = multiplayer;

  const translations = {
    en: {
      onlinePlay: 'Online Play',
      createRoom: 'Create Room',
      joinRoom: 'Join Room',
      nickname: 'Your Nickname',
      roomCodeLabel: 'Room Code',
      enterCode: 'Enter 6-digit code',
      create: 'Create',
      join: 'Join',
      back: 'Back',
      waitingForPlayers: 'Waiting for players...',
      shareCode: 'Share this code with friends:',
      players: 'Players',
      startGame: 'Start Game',
      leave: 'Leave Room',
      minPlayers: 'Need at least 2 players',
      host: 'Host',
      connected: 'Connected',
      maxPlayers: 'Max Players',
      rounds: 'Rounds'
    },
    sq: {
      onlinePlay: 'Lojë Online',
      createRoom: 'Krijo Dhomë',
      joinRoom: 'Bashkohu në Dhomë',
      nickname: 'Pseudonimi Yt',
      roomCodeLabel: 'Kodi i Dhomës',
      enterCode: 'Shkruaj kodin 6-shifror',
      create: 'Krijo',
      join: 'Bashkohu',
      back: 'Kthehu',
      waitingForPlayers: 'Duke pritur lojtarët...',
      shareCode: 'Ndaje këtë kod me miqtë:',
      players: 'Lojtarët',
      startGame: 'Fillo Lojën',
      leave: 'Largohu nga Dhoma',
      minPlayers: 'Duhen të paktën 2 lojtarë',
      host: 'Nikoqiri',
      connected: 'I lidhur',
      maxPlayers: 'Lojtarë Maks',
      rounds: 'Raunde'
    }
  };

  const txt = translations[language];

  const handleCreate = async () => {
    if (!nickname.trim()) return;
    await createRoom(nickname.trim(), maxPlayers, totalRounds);
  };

  const handleJoin = async () => {
    if (!nickname.trim() || !roomCode.trim()) return;
    await joinRoom(roomCode.trim(), nickname.trim());
  };

  const copyCode = () => {
    if (room?.room_code) {
      navigator.clipboard.writeText(room.room_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // In waiting room
  if (room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-between items-center mb-2">
              <Button variant="ghost" size="sm" onClick={leaveRoom}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {txt.leave}
              </Button>
              <LanguageToggle />
            </div>
            <CardTitle className="text-2xl">🃏 {t.gameTitle}</CardTitle>
            <CardDescription>{txt.waitingForPlayers}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Room code display */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">{txt.shareCode}</p>
              <div className="flex items-center justify-center gap-2">
                <div className="text-3xl font-mono font-bold tracking-widest bg-muted px-4 py-2 rounded-lg">
                  {room.room_code}
                </div>
                <Button variant="outline" size="icon" onClick={copyCode}>
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Players list */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                {txt.players} ({players.length}/{room.max_players})
              </h3>
              <div className="space-y-2">
                {players.map((player) => (
                  <div 
                    key={player.id} 
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <span className="font-medium">{player.nickname}</span>
                    <div className="flex items-center gap-2">
                      {player.is_host && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                          {txt.host}
                        </span>
                      )}
                      <span className="text-xs text-primary">{txt.connected}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Game settings */}
            <div className="text-sm text-muted-foreground text-center">
              {txt.rounds}: {room.total_rounds} | {txt.maxPlayers}: {room.max_players}
            </div>

            {/* Start button (host only) */}
            {isHost && (
              <Button 
                className="w-full" 
                size="lg"
                onClick={startGame}
                disabled={players.length < 2}
              >
                {players.length < 2 ? txt.minPlayers : txt.startGame}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Menu
  if (mode === 'menu') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-between items-center mb-2">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {txt.back}
              </Button>
              <LanguageToggle />
            </div>
            <CardTitle className="text-3xl">🃏 {t.gameTitle}</CardTitle>
            <CardDescription>{txt.onlinePlay}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full" 
              size="lg" 
              onClick={() => setMode('create')}
            >
              {txt.createRoom}
            </Button>
            <Button 
              className="w-full" 
              size="lg" 
              variant="outline"
              onClick={() => setMode('join')}
            >
              {txt.joinRoom}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Create room form
  if (mode === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-between items-center mb-2">
              <Button variant="ghost" size="sm" onClick={() => setMode('menu')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {txt.back}
              </Button>
              <LanguageToggle />
            </div>
            <CardTitle>{txt.createRoom}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">{txt.nickname}</label>
              <Input 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">{txt.maxPlayers}</label>
              <div className="flex gap-2 mt-1">
                {[2, 3, 4].map((n) => (
                  <Button
                    key={n}
                    variant={maxPlayers === n ? 'default' : 'outline'}
                    onClick={() => setMaxPlayers(n)}
                    className="flex-1"
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">{txt.rounds}</label>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3, 5].map((n) => (
                  <Button
                    key={n}
                    variant={totalRounds === n ? 'default' : 'outline'}
                    onClick={() => setTotalRounds(n)}
                    className="flex-1"
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleCreate}
              disabled={!nickname.trim() || isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {txt.create}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Join room form
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-between items-center mb-2">
            <Button variant="ghost" size="sm" onClick={() => setMode('menu')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {txt.back}
            </Button>
            <LanguageToggle />
          </div>
          <CardTitle>{txt.joinRoom}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">{txt.nickname}</label>
            <Input 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">{txt.roomCodeLabel}</label>
            <Input 
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder={txt.enterCode}
              maxLength={6}
              className="font-mono text-center text-xl tracking-widest"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button 
            className="w-full" 
            size="lg"
            onClick={handleJoin}
            disabled={!nickname.trim() || roomCode.length !== 6 || isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {txt.join}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
