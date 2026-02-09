
import React from 'react';
import { Button } from '../Button';
import { TRAIL_STYLES } from '../../constants';
import { SoundManager } from '../../utils/sound';

interface ShopMenuProps {
  coins: number;
  unlockedTrails: string[];
  selectedTrailId: string;
  onUnlockTrail: (id: string) => void;
  onSelectTrail: (id: string) => void;
  onClose: () => void;
}

export const ShopMenu: React.FC<ShopMenuProps> = ({ 
    coins, 
    unlockedTrails, 
    selectedTrailId, 
    onUnlockTrail, 
    onSelectTrail, 
    onClose 
}) => {
  return (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center animate-in fade-in duration-300 pointer-events-auto backdrop-blur-md">
      
      {/* Header */}
      <div className="w-full max-w-4xl px-8 flex justify-between items-center mb-10 border-b border-white/10 pb-6">
        <div>
            <h2 className="text-4xl font-black italic text-white tracking-tighter">CUSTOMIZE</h2>
            <p className="text-xs uppercase tracking-widest text-white/40">Select your signal signature</p>
        </div>
        
        <div className="flex items-center gap-3 bg-black/40 px-6 py-3 rounded border border-yellow-500/20">
           <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_10px_#facc15]"></div>
           <p className="text-xl font-mono font-bold text-yellow-100">{coins} <span className="text-[10px] text-yellow-500 uppercase tracking-widest ml-1">Credits</span></p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl px-8 h-[60vh] overflow-y-auto custom-scrollbar">
          {TRAIL_STYLES.map(style => {
              const isUnlocked = unlockedTrails.includes(style.id);
              const isSelected = selectedTrailId === style.id;
              const canAfford = coins >= style.cost;

              return (
                  <div key={style.id} className={`relative group border p-6 transition-all duration-300 ${
                      isSelected ? 'border-cyan-400 bg-cyan-950/20' : 
                      isUnlocked ? 'border-white/10 bg-white/5 hover:border-white/30' : 
                      'border-white/5 bg-black opacity-60'
                  }`}>
                      {/* Selection Indicator */}
                      {isSelected && (
                          <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
                      )}

                      {/* Preview Box */}
                      <div className="h-24 mb-6 relative rounded overflow-hidden bg-black/50 border border-white/5 flex items-center justify-center">
                          {/* Simulated Ball/Trail */}
                          <div className="absolute w-32 h-2 rounded-full transform -rotate-12 blur-sm" 
                               style={{ background: `linear-gradient(90deg, transparent, ${style.colors.glow})` }}></div>
                          <div className="relative w-6 h-6 rounded-full shadow-[0_0_20px_currentColor]"
                               style={{ backgroundColor: style.colors.core, color: style.colors.glow }}></div>
                      </div>

                      <div className="flex justify-between items-end mb-4">
                          <div>
                              <h3 className={`text-lg font-bold uppercase tracking-wider ${isSelected ? 'text-cyan-300' : 'text-white'}`}>{style.name}</h3>
                              <p className="text-[10px] text-white/30 uppercase">Signature ID: {style.id}</p>
                          </div>
                      </div>

                      {isUnlocked ? (
                          <button 
                            onClick={() => {
                                SoundManager.play('ui_click');
                                onSelectTrail(style.id);
                            }}
                            onMouseEnter={() => SoundManager.play('ui_hover')}
                            className={`w-full py-3 text-xs font-bold uppercase tracking-[0.2em] transition-all border ${
                                isSelected 
                                ? 'bg-cyan-500 text-black border-cyan-500 cursor-default'
                                : 'bg-transparent text-white border-white/20 hover:bg-white hover:text-black'
                            }`}
                          >
                              {isSelected ? 'Equipped' : 'Select'}
                          </button>
                      ) : (
                          <button 
                            onClick={() => {
                                SoundManager.play('ui_click');
                                onUnlockTrail(style.id);
                            }}
                            onMouseEnter={() => SoundManager.play('ui_hover')}
                            disabled={!canAfford}
                            className={`w-full py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] transition-all border ${
                                canAfford
                                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50 hover:bg-yellow-500 hover:text-black'
                                : 'bg-transparent text-white/20 border-white/10 cursor-not-allowed'
                            }`}
                          >
                              <span>Unlock</span>
                              <span>{style.cost}</span>
                          </button>
                      )}
                  </div>
              )
          })}
      </div>

      <div className="mt-8">
        <Button onClick={onClose} className="w-48 text-sm">Return</Button>
      </div>
    </div>
  );
};
