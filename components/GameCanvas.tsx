

import React, { useRef, useEffect } from 'react';
import { GameState, TrailStyle } from '../types';
import { GameEngine } from '../game/GameEngine';

interface GameCanvasProps {
  gameState: GameState;
  onScoreUpdate: (score: number, combo: number, coins: number, lives: number) => void;
  onGameOver: (finalScore: number) => void;
  currentStyle: TrailStyle;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, onScoreUpdate, onGameOver, currentStyle }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const engineRef = useRef<GameEngine | null>(null);

  // Initialize Engine once
  useEffect(() => {
    engineRef.current = new GameEngine({
      onScoreUpdate,
      onGameOver
    });
    
    // Initial resize to match window
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      engineRef.current.resize(window.innerWidth, window.innerHeight);
    }

    return () => {
        engineRef.current?.destroy();
        cancelAnimationFrame(requestRef.current);
    };
  }, []); // Run once on mount

  // Sync Callbacks to Engine to prevent stale closures
  useEffect(() => {
      if (engineRef.current) {
          engineRef.current.updateCallbacks({ onScoreUpdate, onGameOver });
      }
  }, [onScoreUpdate, onGameOver]);

  // Sync Game State
  useEffect(() => {
    if (engineRef.current) {
        engineRef.current.setState(gameState);
        // Reset timestamp on state change to prevent huge delta jumps
        lastTimeRef.current = performance.now();
    }
  }, [gameState]);

  // Sync Style
  useEffect(() => {
    if (engineRef.current) {
        engineRef.current.setTrailStyle(currentStyle);
    }
  }, [currentStyle]);

  // Main Loop
  const loop = (timestamp: number) => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    
    if (!canvas || !engine) return;

    // Calculate Delta Time
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const dt = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    const ctx = canvas.getContext('2d');
    if (ctx) {
        // Cap dt to prevent spiraling (e.g. if tab was inactive)
        const safeDt = Math.min(dt, 100); 
        engine.update(safeDt);
        engine.draw(ctx);
    }
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    // Start Loop
    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(loop);

    const handleResize = () => {
      if (canvasRef.current && engineRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        engineRef.current.resize(window.innerWidth, window.innerHeight);
      }
    };

    const setTurning = (isTurning: boolean) => engineRef.current?.setTurning(isTurning);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') setTurning(true);
    };
    const handleKeyUp = () => setTurning(false);
    const handlePointerDown = (e: PointerEvent) => {
      // Robust check: ignore clicks on buttons or interactive elements
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) return;
      setTurning(true);
    };
    const handlePointerUp = () => setTurning(false);

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};
