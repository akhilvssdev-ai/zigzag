
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  PAUSED = 'PAUSED',
  SHOP = 'SHOP'
}

export enum ItemType {
  COIN = 'COIN',
  SHIELD = 'SHIELD',
  MAGNET = 'MAGNET',
  OBSTACLE = 'OBSTACLE'
}

export interface Point {
  x: number;
  y: number;
}

export interface GameItem {
  id: number;
  x: number;
  y: number;
  z: number; // For animation phase
  type: ItemType;
  collected: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  decay: number;
}

export interface AmbientParticle {
  x: number;
  y: number;
  z: number;
  size: number;
  alpha: number;
  vx: number;
  color: string;
}

export interface BallEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  isTurningLeft: boolean;
  trail: Point[];
  combo: number;
  isInvulnerable: boolean;
  visible: boolean;
}

export interface BackgroundShape {
  x: number;
  y: number;
  z: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  sides: number;
  color: string;
  opacity: number;
  pulsePhase: number;
}

export interface NebulaEntity {
  id: number;
  x: number;
  y: number;
  z: number;
  radius: number;
  baseRadius: number;
  color: string;
  opacity: number;
  pulsePhase: number;
  pulseSpeed: number;
}

export interface TrailStyle {
  id: string;
  name: string;
  cost: number;
  colors: {
    core: string;
    glow: string;
    fade: string;
    particle: string;
  };
}
