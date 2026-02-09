
import React from 'react';
import { SoundManager } from '../../utils/sound';

interface HUDProps {
  score: number;
  highScore: number;
  combo: number;
  coins: number;
  lives: number;
  onPause: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  visible: boolean;
  hideStats?: boolean;
}

export const HUD: React.FC<HUDProps> = ({ score, highScore, combo, coins, lives, onPause, isMuted, toggleMute, visible, hideStats }) => {
  if (!visible) return null;

  return (
    <div className="absolute top-0 left-0 right-0 p-6 md:p-10 flex justify-between items-start pointer-events-none">
      
      {/* Score Panel */}
      <div className={`flex flex-col transition-all duration-500 ${hideStats ? 'opacity-0 -translate-y-10' : 'opacity-100 translate-y-0'}`}>
        <div className="relative pl-4">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-transparent"></div>
            <p className="text-[10px] text-cyan-300 font-bold uppercase tracking-[0.3em] mb-0 drop-shadow-md">Distance</p>
            <h2 className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-200 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] tracking-tighter leading-none">
            {score.toString().padStart(3, '0')}
            </h2>
        </div>
        
        {/* Combo Badge */}
        <div className={`mt-4 transition-all duration-300 transform origin-left ${combo > 1.2 ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-50 -translate-x-4'}`}>
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-900/80 to-transparent border-l-2 border-purple-400 px-3 py-1 backdrop-blur-md clip-path-slant">
              <span className="text-[10px] font-bold text-purple-200 tracking-wider">MULTIPLIER</span>
              <span className="text-2xl font-black text-white italic drop-shadow-[0_0_5px_#d8b4fe]">x{Math.floor(combo * 10) / 10}</span>
            </div>
        </div>
      </div>

      {/* Stats & Control Panel */}
      <div className="flex flex-col items-end gap-4 pointer-events-auto">
        
        <div className="flex gap-2">
            {/* Mute Button */}
            <button 
                onClick={toggleMute}
                className="p-3 rounded-sm border border-white/10 bg-black/40 text-white/60 hover:text-white hover:border-white/30 transition-all backdrop-blur-sm"
                aria-label="Toggle Sound"
            >
                {isMuted ? (
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                ) : (
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                )}
            </button>

            {/* Pause Button - Only show when alive and playing */}
            {!hideStats && lives > 0 && (
                <button 
                onClick={() => {
                    SoundManager.play('ui_click');
                    onPause();
                }}
                onMouseEnter={() => SoundManager.play('ui_hover')}
                className="p-3 rounded-sm border border-white/20 bg-black/40 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all group backdrop-blur-sm"
                aria-label="Pause Game"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="10" y1="5" x2="10" y2="19"></line>
                        <line x1="14" y1="5" x2="14" y2="19"></line>
                    </svg>
                </button>
            )}
        </div>

        {/* Stats Container */}
        <div className={`flex flex-col items-end gap-4 transition-all duration-500 ${hideStats ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>
            <div className="flex items-center gap-4">
            {/* Lives / Integrity */}
            <div className="flex items-center gap-1">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-[0.1em] mr-2">INTEGRITY</span>
                {[...Array(3)].map((_, i) => (
                    <div 
                    key={i} 
                    className={`w-3 h-3 rotate-45 border border-cyan-400 transition-all duration-300 ${
                        i < lives 
                        ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] scale-100' 
                        : 'bg-transparent border-white/20 scale-75'
                    }`}
                    />
                ))}
            </div>
            </div>

            <div className="text-right border-r-2 border-white/10 pr-4 mt-2">
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Best Run</p>
            <h2 className="text-2xl font-black italic text-white/80">{highScore}</h2>
            </div>
            
            <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)] backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,1)] animate-pulse"></div>
            <span className="text-lg font-black text-yellow-100 tracking-wider font-mono">{coins.toString().padStart(3, '0')}</span>
            </div>
        </div>
      </div>
    </div>
  );
};
