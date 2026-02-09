
import React from 'react';
import { GameState } from '../types';
import { HUD } from './ui/HUD';
import { MainMenu } from './ui/MainMenu';
import { PauseMenu } from './ui/PauseMenu';
import { GameOver } from './ui/GameOver';
import { ShopMenu } from './ui/ShopMenu';

interface UIOverlayProps {
  gameState: GameState;
  score: number;
  highScore: number;
  combo: number;
  coins: number;
  lives: number;
  isMuted: boolean;
  toggleMute: () => void;
  onStart: () => void;
  onRestart: () => void;
  onResume: () => void;
  onPause: () => void;
  onOpenShop: () => void;
  
  // Shop Props
  unlockedTrails: string[];
  selectedTrailId: string;
  onUnlockTrail: (id: string) => void;
  onSelectTrail: (id: string) => void;
  onCloseShop: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ 
  gameState, 
  score, 
  highScore, 
  combo, 
  coins,
  lives,
  isMuted,
  toggleMute,
  onStart, 
  onRestart,
  onResume,
  onPause,
  onOpenShop,
  unlockedTrails,
  selectedTrailId,
  onUnlockTrail,
  onSelectTrail,
  onCloseShop
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      <HUD 
        score={score} 
        highScore={highScore} 
        combo={combo} 
        coins={coins}
        lives={lives}
        onPause={onPause}
        isMuted={isMuted}
        toggleMute={toggleMute}
        visible={true} // Always render HUD layout, elements animate inside
        hideStats={gameState === GameState.MENU || gameState === GameState.SHOP}
      />

      {gameState === GameState.MENU && (
        <MainMenu onStart={onStart} onOpenShop={onOpenShop} />
      )}

      {gameState === GameState.PAUSED && (
        <PauseMenu onResume={onResume} onRestart={onRestart} />
      )}

      {gameState === GameState.GAMEOVER && (
        <GameOver score={score} highScore={highScore} coins={coins} onRestart={onRestart} />
      )}
      
      {gameState === GameState.SHOP && (
        <ShopMenu 
            coins={coins}
            unlockedTrails={unlockedTrails}
            selectedTrailId={selectedTrailId}
            onUnlockTrail={onUnlockTrail}
            onSelectTrail={onSelectTrail}
            onClose={onCloseShop}
        />
      )}
    </div>
  );
};
