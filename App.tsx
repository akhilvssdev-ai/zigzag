
import React, { useState, useCallback, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { UIOverlay } from './components/UIOverlay';
import { GameState } from './types';
import { SoundManager } from './utils/sound';
import { CONFIG, TRAIL_STYLES } from './constants';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [coins, setCoins] = useState(0);
  const [lives, setLives] = useState(CONFIG.STARTING_LIVES);
  const [isMuted, setIsMuted] = useState(false);
  
  // Customization State
  const [selectedTrailId, setSelectedTrailId] = useState<string>('default');
  const [unlockedTrails, setUnlockedTrails] = useState<string[]>(['default']);
  const [totalCoins, setTotalCoins] = useState(0);

  // Robust Initialization
  useEffect(() => {
    try {
        const savedScore = localStorage.getItem('nz_ultra_high');
        if (savedScore) setHighScore(parseInt(savedScore, 10));

        const savedCoins = localStorage.getItem('nz_ultra_total_coins');
        if (savedCoins) setTotalCoins(parseInt(savedCoins, 10));

        const savedTrail = localStorage.getItem('nz_ultra_selected_trail');
        if (savedTrail) setSelectedTrailId(savedTrail);

        const savedUnlocked = localStorage.getItem('nz_ultra_unlocked_trails');
        if (savedUnlocked) {
            const parsed = JSON.parse(savedUnlocked);
            if (Array.isArray(parsed)) setUnlockedTrails(parsed);
        }

        const savedMute = localStorage.getItem('nz_ultra_muted');
        if (savedMute) {
            const muted = savedMute === 'true';
            setIsMuted(muted);
            SoundManager.setMuted(muted);
        }
    } catch (e) {
        console.warn('Failed to load save data', e);
    }
  }, []);

  const toggleMute = useCallback(() => {
      const newState = !isMuted;
      setIsMuted(newState);
      SoundManager.setMuted(newState);
      localStorage.setItem('nz_ultra_muted', newState.toString());
      SoundManager.play('ui_click');
  }, [isMuted]);

  // Handle Pause/Resume via Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyP' || e.code === 'Escape') {
        setGameState(current => {
          if (current === GameState.PLAYING) {
            return GameState.PAUSED;
          }
          if (current === GameState.PAUSED) {
            return GameState.PLAYING;
          }
          if (current === GameState.SHOP) {
            return GameState.MENU;
          }
          return current;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleScoreUpdate = useCallback((newScore: number, newCombo: number, newCoinsCount: number, newLives: number) => {
    setScore(Math.floor(newScore));
    setCombo(newCombo);
    // newCoinsCount here is session coins
    setCoins(newCoinsCount);
    setLives(newLives);
  }, []);

  // We track session coins via ref because React state updates might be batched or too slow for the synchronous game over call if we relied on 'coins' state directly
  const sessionCoinsRef = React.useRef(0);

  const handleScoreUpdateWrapper = useCallback((s: number, c: number, coinsCollected: number, l: number) => {
    handleScoreUpdate(s, c, coinsCollected, l);
    sessionCoinsRef.current = coinsCollected;
  }, [handleScoreUpdate]);

  const saveTotalCoins = (val: number) => {
      setTotalCoins(val);
      localStorage.setItem('nz_ultra_total_coins', val.toString());
  };

  const handleGameOver = useCallback((finalScore: number) => {
    setGameState(GameState.GAMEOVER);
    setScore(Math.floor(finalScore));
    setLives(0);
    SoundManager.play('crash');
    
    // Save High Score
    if (finalScore > highScore) {
      setHighScore(Math.floor(finalScore));
      localStorage.setItem('nz_ultra_high', Math.floor(finalScore).toString());
      SoundManager.play('highscore');
    }

    // Add Session Coins to Total
    const earned = sessionCoinsRef.current;
    if (earned > 0) {
        setTotalCoins(prev => {
            const newVal = prev + earned;
            localStorage.setItem('nz_ultra_total_coins', newVal.toString());
            return newVal;
        });
    }
  }, [highScore]);

  const handleStart = useCallback(() => {
    SoundManager.resume(); // Ensure audio context is unlocked
    sessionCoinsRef.current = 0;
    setGameState(GameState.PLAYING);
    setScore(0);
    setCombo(1);
    setCoins(0); 
    setLives(CONFIG.STARTING_LIVES);
    SoundManager.play('start');
  }, []);

  const handleRestart = useCallback(() => {
    SoundManager.resume();
    sessionCoinsRef.current = 0;
    setGameState(GameState.PLAYING);
    setScore(0);
    setCombo(1);
    setCoins(0);
    setLives(CONFIG.STARTING_LIVES);
    SoundManager.play('start');
  }, []);

  const handleResume = useCallback(() => {
    setGameState(GameState.PLAYING);
  }, []);

  const handlePause = useCallback(() => {
    if (gameState === GameState.PLAYING) {
        setGameState(GameState.PAUSED);
    }
  }, [gameState]);

  const handleOpenShop = useCallback(() => {
      SoundManager.resume();
      setGameState(GameState.SHOP);
  }, []);

  const handleCloseShop = useCallback(() => {
      setGameState(GameState.MENU);
  }, []);

  const handleUnlockTrail = useCallback((trailId: string) => {
      const trail = TRAIL_STYLES.find(t => t.id === trailId);
      if (!trail) return;
      
      if (totalCoins >= trail.cost && !unlockedTrails.includes(trailId)) {
          const newTotal = totalCoins - trail.cost;
          saveTotalCoins(newTotal);
          
          const newUnlocked = [...unlockedTrails, trailId];
          setUnlockedTrails(newUnlocked);
          localStorage.setItem('nz_ultra_unlocked_trails', JSON.stringify(newUnlocked));
          
          // Auto select
          setSelectedTrailId(trailId);
          localStorage.setItem('nz_ultra_selected_trail', trailId);
          
          SoundManager.play('pickup'); 
      } else {
          SoundManager.play('crash'); 
      }
  }, [totalCoins, unlockedTrails]);

  const handleSelectTrail = useCallback((trailId: string) => {
      if (unlockedTrails.includes(trailId)) {
          setSelectedTrailId(trailId);
          localStorage.setItem('nz_ultra_selected_trail', trailId);
          SoundManager.play('score'); 
      }
  }, [unlockedTrails]);

  const currentTrailStyle = TRAIL_STYLES.find(t => t.id === selectedTrailId) || TRAIL_STYLES[0];

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div 
      className="relative w-full h-screen bg-[#050011] overflow-hidden"
      onContextMenu={handleContextMenu}
    >
      {/* Game Layer */}
      <GameCanvas 
        gameState={gameState}
        onScoreUpdate={handleScoreUpdateWrapper}
        onGameOver={handleGameOver}
        currentStyle={currentTrailStyle}
      />
      
      {/* CRT Scanline Effect */}
      <div 
        className="absolute inset-0 z-30 pointer-events-none opacity-20 mix-blend-overlay"
        style={{
          background: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))`
        , backgroundSize: '100% 2px, 3px 100%'
        }} 
      />
      <div className="absolute inset-0 z-30 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />

      {/* UI Layer */}
      <UIOverlay 
        gameState={gameState}
        score={score}
        highScore={highScore}
        combo={combo}
        coins={gameState === GameState.MENU || gameState === GameState.SHOP ? totalCoins : coins}
        lives={lives}
        isMuted={isMuted}
        toggleMute={toggleMute}
        onStart={handleStart}
        onRestart={handleRestart}
        onResume={handleResume}
        onPause={handlePause}
        onOpenShop={handleOpenShop}
        
        // Shop Props
        unlockedTrails={unlockedTrails}
        selectedTrailId={selectedTrailId}
        onUnlockTrail={handleUnlockTrail}
        onSelectTrail={handleSelectTrail}
        onCloseShop={handleCloseShop}
      />
    </div>
  );
}
