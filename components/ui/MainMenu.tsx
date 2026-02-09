
import React from 'react';
import { Button } from '../Button';

interface MainMenuProps {
  onStart: () => void;
  onOpenShop: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart, onOpenShop }) => {
  return (
    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center animate-in fade-in duration-700 pointer-events-auto backdrop-blur-sm">
      <div className="text-center mb-16 relative">
        <div className="absolute -inset-10 bg-blue-500/20 blur-[100px] rounded-full mix-blend-screen"></div>
        <h1 className="relative text-7xl md:text-9xl font-black italic tracking-tighter text-white mb-0 drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]"
            style={{ WebkitTextStroke: '2px rgba(255,255,255,0.1)' }}>
          NEON
        </h1>
        <h1 className="relative text-7xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 -mt-4 md:-mt-8 drop-shadow-[0_0_50px_rgba(139,92,246,0.5)]">
          ZIGZAG
        </h1>
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-cyan-500"></div>
          <p className="text-sm md:text-lg tracking-[0.5em] text-cyan-200 font-bold uppercase shadow-black drop-shadow-md">
            Hyper Arcade
          </p>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-cyan-500"></div>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
            <Button onClick={onStart} className="relative !bg-black !text-white border border-white/10 hover:!bg-white hover:!text-black w-64">
              Initialize
            </Button>
          </div>
          
          <Button onClick={onOpenShop} className="relative !bg-black !text-cyan-400 border border-cyan-500/50 hover:!bg-cyan-400 hover:!text-black w-64 text-sm py-4 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              Customize
          </Button>
      </div>

      <div className="mt-20 flex flex-col items-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
        <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-100/50">System Controls</p>
        <div className="flex gap-6 text-xs font-mono text-cyan-400">
          <div className="flex flex-col items-center gap-2">
            <span className="border border-cyan-500/30 bg-cyan-950/30 px-4 py-2 rounded shadow-[0_0_10px_rgba(34,211,238,0.1)]">HOLD CLICK</span>
            <span className="text-[9px] uppercase tracking-wider text-white/40">Turn Left</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="border border-purple-500/30 bg-purple-950/30 px-4 py-2 rounded shadow-[0_0_10px_rgba(168,85,247,0.1)]">RELEASE</span>
            <span className="text-[9px] uppercase tracking-wider text-white/40">Turn Right</span>
          </div>
        </div>
      </div>
    </div>
  );
};
