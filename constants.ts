

import { TrailStyle } from './types';

export const CONFIG = {
  BASE_SPEED: 6.0,
  MAX_SPEED: 22.0,
  ACCEL: 0.003, // Score-based speed multiplier
  STEER_FORCE: 0.11,
  FRICTION: 0.96,
  PATH_WIDTH: 140, // Slightly narrower for speed feel
  BALL_SIZE: 9,
  TRAIL_LENGTH: 20,
  COMBO_THRESHOLD: 30, 
  COIN_RADIUS: 12,
  COIN_PICKUP_DIST: 35, // Increased slightly for better feel
  FPS: 60,
  AMBIENT_PARTICLE_COUNT: 40,
  STARTING_LIVES: 3,
  INVULNERABILITY_TIME: 2000, // ms
  SHIELD_BOUNCE_PENALTY: 1000, // Time deducted from shield on impact
  ITEMS: {
      SHIELD_DURATION: 5000,
      MAGNET_DURATION: 10000,
      MAGNET_RANGE: 400,
      SPAWN_RATES: {
          COIN: 0.85,
          OBSTACLE: 0.1,
          POWERUP: 0.05
      }
  },
  COLORS: {
    // Deep Space Background
    BG_START: '#090014', // Deep Violet
    BG_END: '#020005',   // Pitch Black
    
    // The Player (Default Fallbacks)
    BALL_CORE: '#ffffff',
    BALL_GLOW: '#00ffff', // Cyan
    TRAIL_CORE: '#00ffff',
    TRAIL_FADE: '#8b5cf6', // Violet
    
    // The Road
    PATH_TOP: '#1e1b4b',   // Dark Indigo
    PATH_SIDE: '#312e81',  // Lighter Indigo (for 3D thickness)
    PATH_EDGE: '#22d3ee',  // Cyan Edge
    PATH_DANGER: '#ff0055', // Hot Pink
    
    // FX
    PARTICLE_DEATH: '#ff0055',
    PARTICLE_COMBO: '#22d3ee',
    PARTICLE_SCORE: '#e879f9',
    PARTICLE_COIN: '#fcd34d', 
    PARTICLE_NEAR_MISS: '#ffffff',
    PARTICLE_SHIELD: '#06b6d4',
    PARTICLE_MAGNET: '#d946ef',
    
    // Items
    COIN: '#fbbf24',
    COIN_GLOW: '#f59e0b',
    ITEM_SHIELD: '#06b6d4', // Cyan
    ITEM_MAGNET: '#d946ef', // Fuchsia
    ITEM_OBSTACLE: '#ef4444', // Red
    
    // Environment
    GRID_LINES: '#c026d3', // Magenta
    HORIZON_GLOW: '#4c1d95',
    AMBIENT_DUST: ['#22d3ee', '#e879f9', '#ffffff'],
    NEBULA_OPTS: ['#4c1d95', '#312e81', '#1e1b4b', '#581c87', '#0f172a']
  }
};

export const TRAIL_STYLES: TrailStyle[] = [
  {
    id: 'default',
    name: 'Neon Cyan',
    cost: 0,
    colors: {
      core: '#ffffff',
      glow: '#00ffff', 
      fade: '#8b5cf6',
      particle: '#22d3ee'
    }
  },
  {
    id: 'plasma',
    name: 'Plasma Red',
    cost: 100,
    colors: {
      core: '#ffffff',
      glow: '#ff0055',
      fade: '#fbbf24',
      particle: '#ff0055'
    }
  },
  {
    id: 'void',
    name: 'Void Purple',
    cost: 250,
    colors: {
      core: '#e9d5ff',
      glow: '#7c3aed',
      fade: '#4c1d95',
      particle: '#a855f7'
    }
  },
  {
    id: 'midas',
    name: 'Midas Gold',
    cost: 500,
    colors: {
      core: '#fffbeb',
      glow: '#fbbf24',
      fade: '#d97706',
      particle: '#fcd34d'
    }
  },
   {
    id: 'matrix',
    name: 'The Source',
    cost: 1000,
    colors: {
      core: '#f0fdf4',
      glow: '#22c55e',
      fade: '#14532d',
      particle: '#4ade80'
    }
  },
  {
    id: 'frost',
    name: 'Deep Frost',
    cost: 750,
    colors: {
      core: '#f0f9ff',
      glow: '#38bdf8',
      fade: '#0ea5e9',
      particle: '#7dd3fc'
    }
  }
];