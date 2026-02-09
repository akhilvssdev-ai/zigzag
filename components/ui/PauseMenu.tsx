
import React from 'react';
import { Button } from '../Button';
import { SoundManager } from '../../utils/sound';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onRestart }) => {
  return (
    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center animate-in fade-in duration-200 pointer-events-auto backdrop-blur-sm">
      <h2 className="text-6xl font-black mb-8 text-white italic tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
        SYSTEM PAUSED
      </h2>
      <Button onClick={onResume} className="mb-8">Resume</Button>
      <button 
        onClick={() => {
          SoundManager.play('ui_click');
          onRestart();
        }}
        onMouseEnter={() => SoundManager.play('ui_hover')}
        className="text-white/40 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors border-b border-transparent hover:border-white pb-1"
      >
        Restart Session
      </button>
    </div>
  );
};
