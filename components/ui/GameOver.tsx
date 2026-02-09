

import React from 'react';
import { Button } from '../Button';

interface GameOverProps {
  score: number;
  highScore: number;
  coins: number;
  onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ score, highScore, coins, onRestart }) => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-auto overflow-hidden">
      {/* Red Tint Background */}
      <div className="absolute inset-0 bg-red-950/80 backdrop-blur-md animate-in fade-in duration-300"></div>
      
      {/* Striped overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:4px_4px]"></div>

      <div className="relative z-10 flex flex-col items-center">
        <h2 className="text-7xl md:text-8xl font-black mb-2 text-white italic tracking-tighter drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-pulse">
          CRASHED
        </h2>
        <div className="h-1 w-32 bg-red-500 rounded shadow-[0_0_20px_#ef4444] mb-12"></div>
        
        <div className="grid grid-cols-2 gap-12 mb-12">
            <div className="flex flex-col items-end border-r border-white/10 pr-12">
                <p className="text-xs font-bold text-red-300 uppercase tracking-widest mb-1 opacity-60">Session Score</p>
                <p className="text-6xl font-black text-white drop-shadow-lg">{score}</p>
            </div>
            <div className="flex flex-col items-start pl-2">
                <p className="text-xs font-bold text-red-300 uppercase tracking-widest mb-1 opacity-60">High Score</p>
                <p className="text-6xl font-black text-white/50">{highScore}</p>
            </div>
        </div>
        
        <div className="mb-12 flex items-center gap-3 bg-black/40 px-8 py-3 rounded-sm border border-red-500/30 shadow-lg">
           <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_#facc15]"></div>
           <p className="text-sm font-bold text-yellow-100 tracking-widest uppercase">
             Credits Earned <span className="text-white text-xl ml-3 font-mono">{coins}</span>
           </p>
        </div>

        <div className="relative group">
            <div className="absolute -inset-1 bg-red-500 rounded blur opacity-20 group-hover:opacity-60 transition duration-200"></div>
            <Button onClick={onRestart} className="relative hover:bg-red-600 hover:shadow-[0_0_40px_rgba(220,38,38,0.6)]">
            Reboot System
            </Button>
        </div>
      </div>
    </div>
  );
};