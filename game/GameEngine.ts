
import { GameState, BallEntity, Point, Particle, BackgroundShape, AmbientParticle, GameItem, ItemType, TrailStyle, NebulaEntity } from '../types';
import { CONFIG, TRAIL_STYLES } from '../constants';
import { PathGenerator } from './PathGenerator';
import { Renderer } from './Renderer';
import { SoundManager } from '../utils/sound';

interface EngineCallbacks {
  onScoreUpdate: (score: number, combo: number, coins: number, lives: number) => void;
  onGameOver: (finalScore: number) => void;
}

export class GameEngine {
  public gameState: GameState = GameState.MENU;
  public width: number = 0;
  public height: number = 0;

  // Entities
  private ball!: BallEntity;
  private path: Point[] = [];
  private items: GameItem[] = [];
  private particles: Particle[] = [];
  private bgShapes: BackgroundShape[] = [];
  private ambientParticles: AmbientParticle[] = [];
  private nebulae: NebulaEntity[] = [];

  // State
  private score: number = 0;
  private lives: number = CONFIG.STARTING_LIVES;
  private coinsCollected: number = 0;
  private cameraY: number = 0;
  private lastScoreUpdate: number = 0;
  private lastCoinsUpdate: number = 0;
  private lastLivesUpdate: number = 0;
  private lastParticleScore: number = 0;
  
  // Powerups (Timers in milliseconds)
  private magnetTimer: number = 0;
  private invulnerableTimer: number = 0;
  
  // Crash / Respawn Logic
  private crashTimer: number = 0;
  private pendingRespawn: { x: number, y: number } | null = null;
  private waitingForInput: boolean = false;
  private gameOverTimer: any = null;
  private itemIdCounter: number = 0;
  
  // Customization
  private currentStyle: TrailStyle = TRAIL_STYLES[0];

  // Sub-systems
  private PathGenerator: PathGenerator;
  private renderer: Renderer;
  private callbacks: EngineCallbacks;

  constructor(callbacks: EngineCallbacks) {
    this.callbacks = callbacks;
    this.PathGenerator = new PathGenerator();
    this.renderer = new Renderer();
    
    // Initial Setup
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.initEntities();
  }

  public resize(w: number, h: number) {
    this.width = w;
    this.height = h;
  }
  
  public setTrailStyle(style: TrailStyle) {
      this.currentStyle = style;
  }

  public updateCallbacks(callbacks: EngineCallbacks) {
      this.callbacks = callbacks;
  }

  public destroy() {
      if (this.gameOverTimer) {
          clearTimeout(this.gameOverTimer);
          this.gameOverTimer = null;
      }
  }

  public setTurning(isTurning: boolean) {
    if (this.gameState === GameState.PLAYING) {
      // Resume from Respawn Wait
      if (this.waitingForInput) {
        if (isTurning) {
           this.waitingForInput = false;
           this.ball.vy = -CONFIG.BASE_SPEED;
           this.ball.angle = -Math.PI / 2;
           
           // Minimal invulnerability (200ms) just to clear spawn geometry physics
           this.invulnerableTimer = 200;
           this.ball.isInvulnerable = true;
           
           this.ball.isTurningLeft = isTurning;
           
           SoundManager.play('start');
        }
        return;
      }

      // Normal Turning
      if (this.ball.visible && this.crashTimer === 0) {
        this.ball.isTurningLeft = isTurning;
      }
    }
  }

  public setState(state: GameState) {
    const prev = this.gameState;
    this.gameState = state;

    if (state === GameState.PLAYING) {
        if (prev === GameState.MENU || prev === GameState.GAMEOVER) {
            this.resetGame();
        }
    }
  }

  public resetGame() {
    this.score = 0;
    this.lives = CONFIG.STARTING_LIVES;
    this.coinsCollected = 0;
    this.lastScoreUpdate = 0;
    this.lastCoinsUpdate = 0;
    this.lastLivesUpdate = CONFIG.STARTING_LIVES;
    this.lastParticleScore = 0;
    this.invulnerableTimer = 0;
    this.magnetTimer = 0;
    this.crashTimer = 0;
    this.pendingRespawn = null;
    this.waitingForInput = false;
    this.particles = [];
    this.items = [];
    this.PathGenerator.reset();
    
    if (this.gameOverTimer) clearTimeout(this.gameOverTimer);
    
    // Reset Ball
    this.ball = {
        x: this.width / 2,
        y: this.height * 0.7,
        vx: 0,
        vy: -CONFIG.BASE_SPEED,
        angle: -Math.PI / 2,
        isTurningLeft: false,
        trail: [],
        combo: 0,
        isInvulnerable: false,
        visible: true
    };
    this.cameraY = this.ball.y - this.height * 0.7;

    // Reset Path
    this.path = [];
    for (let i = 0; i < 5; i++) {
        this.path.push({ x: this.width / 2, y: this.ball.y - i * 150 });
    }
    let lastPoint = this.path[this.path.length - 1];
    for (let i = 0; i < 10; i++) {
        const next = this.PathGenerator.generateNextPoint(lastPoint, this.width);
        this.path.push(next);
        lastPoint = next;
    }
    
    // Initial callback to reset UI
    this.callbacks.onScoreUpdate(this.score, this.ball.combo, this.coinsCollected, this.lives);
  }

  private initEntities() {
    // Initial Dummy Ball
    this.ball = {
        x: 0, y: 0, vx: 0, vy: 0, angle: 0, isTurningLeft: false, trail: [], combo: 0, isInvulnerable: false, visible: true
    };

    // Background Shapes
    this.bgShapes = Array.from({ length: 25 }).map(() => ({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        z: 0.1 + Math.random() * 0.4,
        size: 50 + Math.random() * 200,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        sides: Math.floor(Math.random() * 3) + 3,
        color: Math.random() > 0.6 ? '#3b82f6' : '#8b5cf6',
        opacity: 0.02 + Math.random() * 0.04,
        pulsePhase: Math.random() * Math.PI * 2
    }));

    // Ambient Particles
    this.ambientParticles = Array.from({ length: CONFIG.AMBIENT_PARTICLE_COUNT }).map(() => ({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        z: Math.random() * 1.5 + 0.2,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        vx: (Math.random() - 0.5) * 0.2,
        color: CONFIG.COLORS.AMBIENT_DUST[Math.floor(Math.random() * CONFIG.COLORS.AMBIENT_DUST.length)]
    }));

    // Nebulae
    this.nebulae = Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      z: 0.05 + Math.random() * 0.1, // Very distant
      radius: 150 + Math.random() * 300,
      baseRadius: 150 + Math.random() * 300,
      color: CONFIG.COLORS.NEBULA_OPTS[Math.floor(Math.random() * CONFIG.COLORS.NEBULA_OPTS.length)],
      opacity: 0.1 + Math.random() * 0.2,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01 + Math.random() * 0.02
    }));
  }

  // Update loop with Delta Time (dt in ms)
  public update(dt: number) {
    if (this.gameState === GameState.PAUSED) return;

    // Normalize dt to ~60fps (16.66ms = 1.0)
    // This allows us to keep existing constants which were tuned for 60fps
    const dtFactor = dt / (1000 / 60);

    this.updateBackground(dtFactor);
    this.updateParticles(dtFactor);

    if (this.gameState === GameState.PLAYING) {
        // Handle Crash Sequence
        if (this.crashTimer > 0) {
            this.crashTimer -= dt;
            if (this.crashTimer <= 0 && this.pendingRespawn) {
                this.performRespawn(this.pendingRespawn.x, this.pendingRespawn.y);
            }
            return;
        }
        
        if (this.waitingForInput) return;

        // Update Timers
        if (this.invulnerableTimer > 0) {
            this.invulnerableTimer -= dt;
            this.ball.isInvulnerable = this.invulnerableTimer > 0;
        }
        
        if (this.magnetTimer > 0) {
            this.magnetTimer -= dt;
        }

        this.updatePhysics(dtFactor);
        this.updatePath();
        this.updateItems(dtFactor);
        this.checkCollisions(dtFactor);
        this.updateScore(dtFactor);
    }
  }

  private updateBackground(dtFactor: number) {
    const isPlaying = this.gameState === GameState.PLAYING && this.crashTimer === 0 && !this.waitingForInput;
    const bgSpeed = (isPlaying ? Math.abs(this.ball.vy) : CONFIG.BASE_SPEED * 0.1) * dtFactor;

    const speedRatio = Math.min(1, bgSpeed / CONFIG.MAX_SPEED);
    const parallaxX = (isPlaying ? this.ball.vx * 0.8 : 0) * dtFactor;
    
    // Use combo to influence environment intensity
    const comboFactor = this.ball ? (this.ball.combo - 1) * 0.5 : 0; // 0 to 2 approx

    // Update Nebulae
    this.nebulae.forEach(n => {
      n.y += bgSpeed * n.z;
      n.x -= parallaxX * n.z;
      
      // Pulse logic
      n.pulsePhase += (n.pulseSpeed + (speedRatio * 0.05)) * dtFactor;
      const pulse = Math.sin(n.pulsePhase);
      n.radius = n.baseRadius * (1 + pulse * 0.1 + comboFactor * 0.05);
      
      // Loop
      if (n.y > this.height + n.radius) {
          n.y = -n.radius;
          n.x = Math.random() * this.width;
      }
      if (n.x < -n.radius * 2) n.x = this.width + n.radius;
      if (n.x > this.width + n.radius * 2) n.x = -n.radius;
    });

    // Update Shapes
    this.bgShapes.forEach(shape => {
        shape.y += bgSpeed * shape.z;
        shape.x -= parallaxX * shape.z;
        
        // Spin faster with speed and combo
        shape.rotation += (shape.rotationSpeed * (1 + speedRatio * 3 + comboFactor)) * dtFactor;
        
        // Subtle pulse
        shape.pulsePhase += (0.05 + (speedRatio * 0.1)) * dtFactor;
        
        if (shape.y > this.height + shape.size) {
            shape.y = -shape.size;
            shape.x = Math.random() * this.width;
        }
        if (shape.x < -shape.size) shape.x = this.width + shape.size;
        if (shape.x > this.width + shape.size) shape.x = -shape.size;
    });

    this.ambientParticles.forEach(p => {
        p.y += bgSpeed * p.z;
        p.x += (p.vx - (parallaxX * p.z)) * dtFactor; // also apply dtFactor to internal vx
        if (p.y > this.height) {
            p.y = -10;
            p.x = Math.random() * this.width;
        }
        if (p.x > this.width) p.x = 0;
        else if (p.x < 0) p.x = this.width;
    });
  }

  private updateParticles(dtFactor: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dtFactor;
      p.y += p.vy * dtFactor;
      p.life -= p.decay * dtFactor;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  private updatePhysics(dtFactor: number) {
    if (this.crashTimer > 0) return;

    const ball = this.ball;
    
    // DYNAMIC DIFFICULTY
    const speedIncrease = this.score * CONFIG.ACCEL;
    const currentSpeed = Math.min(CONFIG.MAX_SPEED, CONFIG.BASE_SPEED + speedIncrease);
    
    // DYNAMIC STEERING
    const speedProgress = (currentSpeed - CONFIG.BASE_SPEED) / (CONFIG.MAX_SPEED - CONFIG.BASE_SPEED || 1);
    const steerBonus = speedProgress * 0.08; 
    const currentSteerForce = CONFIG.STEER_FORCE + steerBonus;

    const targetAngle = ball.isTurningLeft ? -Math.PI * 0.8 : -Math.PI * 0.2;
    const angleDiff = targetAngle - ball.angle;
    ball.angle += angleDiff * currentSteerForce * dtFactor;

    ball.vx = Math.cos(ball.angle) * currentSpeed;
    ball.vy = Math.sin(ball.angle) * currentSpeed;

    // Apply dtFactor to position updates
    ball.x += ball.vx * dtFactor;
    ball.y += ball.vy * dtFactor;

    // Only add trail points periodically or it gets too dense at low speeds/high fps
    // Simple distance check could be better, but frame-based with dt adjustment works ok for visual trail
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > CONFIG.TRAIL_LENGTH) ball.trail.shift();

    this.cameraY = ball.y - this.height * 0.7;
  }

  private updatePath() {
    const lastPoint = this.path[this.path.length - 1];
    if (lastPoint.y > this.ball.y - this.height * 1.5) {
      const nextPoint = this.PathGenerator.generateNextPoint(lastPoint, this.width);
      this.path.push(nextPoint);
      
      // Item Spawning
      if (Math.random() < 0.4) { 
          const midX = (lastPoint.x + nextPoint.x) / 2;
          const midY = (lastPoint.y + nextPoint.y) / 2;
          
          const roll = Math.random();
          let type = ItemType.COIN;
          
          // Spawn Logic
          if (roll < CONFIG.ITEMS.SPAWN_RATES.POWERUP) {
              type = Math.random() > 0.5 ? ItemType.SHIELD : ItemType.MAGNET;
          } else if (roll < CONFIG.ITEMS.SPAWN_RATES.POWERUP + CONFIG.ITEMS.SPAWN_RATES.OBSTACLE) {
              type = ItemType.OBSTACLE;
          }

          const offsetRange = type === ItemType.OBSTACLE ? 80 : 60;
          
          this.items.push({
              id: this.itemIdCounter++,
              x: midX + (Math.random() - 0.5) * offsetRange,
              y: midY,
              z: Math.random() * Math.PI * 2,
              type: type,
              collected: false
          });
      }
    }
    if (this.path.length > 50) this.path.shift();
  }

  private updateItems(dtFactor: number) {
    const killY = this.cameraY + this.height + 100;
    const magnetActive = this.magnetTimer > 0;
    
    for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i];
        
        // Remove off-screen items
        if (item.y > killY || item.collected) {
            this.items.splice(i, 1);
            continue;
        }

        // Animation
        item.z += 0.1 * dtFactor;

        // Magnet Effect (Only for Coins)
        if (magnetActive && item.type === ItemType.COIN) {
            const dx = this.ball.x - item.x;
            const dy = this.ball.y - item.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < CONFIG.ITEMS.MAGNET_RANGE) {
                // Move towards player
                item.x += dx * 0.15 * dtFactor;
                item.y += dy * 0.15 * dtFactor;
            }
        }

        // Collision Check (Independent of dt mostly, as positions are interpolated)
        const dx = this.ball.x - item.x;
        const dy = this.ball.y - item.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const hitDist = item.type === ItemType.OBSTACLE ? CONFIG.BALL_SIZE + 15 : CONFIG.COIN_PICKUP_DIST;
        
        if (dist < hitDist && this.ball.visible) {
            
            if (item.type === ItemType.OBSTACLE) {
                if (this.ball.isInvulnerable) {
                    // Destroy obstacle
                    item.collected = true;
                    this.spawnParticles(item.x, item.y, CONFIG.COLORS.ITEM_OBSTACLE, 10, { size: 4, speed: 8 });
                    SoundManager.play('crash'); 
                } else {
                    item.collected = true; 
                    this.handleLifeLost(this.ball.x, this.ball.y); 
                }
            } else {
                // Collect Good Item
                this.collectItem(item);
            }
        }
    }
  }

  private collectItem(item: GameItem) {
      item.collected = true;
      
      if (item.type === ItemType.COIN) {
          this.coinsCollected++;
          this.spawnParticles(item.x, item.y, CONFIG.COLORS.PARTICLE_COIN, 8, { size: 3, speed: 6, decay: 0.04 });
          SoundManager.play('pickup');
          this.score += 5;
      } else if (item.type === ItemType.SHIELD) {
          this.invulnerableTimer = CONFIG.ITEMS.SHIELD_DURATION;
          this.ball.isInvulnerable = true;
          this.spawnParticles(item.x, item.y, CONFIG.COLORS.PARTICLE_SHIELD, 15, { size: 4, speed: 8, decay: 0.02 });
          SoundManager.play('score'); 
      } else if (item.type === ItemType.MAGNET) {
          this.magnetTimer = CONFIG.ITEMS.MAGNET_DURATION;
          this.spawnParticles(item.x, item.y, CONFIG.COLORS.PARTICLE_MAGNET, 15, { size: 4, speed: 8, decay: 0.02 });
          SoundManager.play('score');
      }
  }

  private updateScore(dtFactor: number) {
    if (this.crashTimer > 0) return;
    
    // Scale score by dtFactor so high FPS doesn't give more score
    this.score += Math.abs(this.ball.vy) * 0.05 * (1 + (this.ball.combo > 1 ? this.ball.combo * 0.1 : 0)) * dtFactor;
    
    if (Math.floor(this.score) > this.lastParticleScore + 50) { 
        this.spawnParticles(this.ball.x, this.ball.y, CONFIG.COLORS.PARTICLE_SCORE, 1, { 
            size: 2, decay: 0.05, speed: 2 
        });
        this.lastParticleScore = Math.floor(this.score);
    }

    const coinChanged = this.coinsCollected !== this.lastCoinsUpdate;
    const livesChanged = this.lives !== this.lastLivesUpdate;
    if (coinChanged || livesChanged || this.score - this.lastScoreUpdate > 1 || Math.floor(this.score) > Math.floor(this.lastScoreUpdate)) {
      this.callbacks.onScoreUpdate(this.score, this.ball.combo, this.coinsCollected, this.lives);
      this.lastScoreUpdate = this.score;
      this.lastCoinsUpdate = this.coinsCollected;
      this.lastLivesUpdate = this.lives;
    }
  }

  private checkCollisions(dtFactor: number) {
    if (this.crashTimer > 0 || !this.ball.visible) return;

    let onPath = false;
    let minEdgeDist = 999;
    const ball = this.ball;
    
    // Safety Fallback Calculation
    let closestX = this.width/2;
    let closestY = this.height/2;
    let safeSegmentDir = { x: 0, y: 1 }; 
    let foundSegment = false; 

    for (let i = 0; i < this.path.length - 1; i++) {
      const p1 = this.path[i];
      const p2 = this.path[i + 1];

      // Expanded bounds check
      if (ball.y <= Math.max(p1.y, p2.y) + 100 && ball.y >= Math.min(p1.y, p2.y) - 100) {
        const totalDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const t = ((ball.x - p1.x) * (p2.x - p1.x) + (ball.y - p1.y) * (p2.y - p1.y)) / (totalDist * totalDist);
        const clampedT = Math.max(0, Math.min(1, t));
        
        const cx = p1.x + clampedT * (p2.x - p1.x);
        const cy = p1.y + clampedT * (p2.y - p1.y);
        const distFromCenter = Math.hypot(ball.x - cx, ball.y - cy);

        // Store the closest segment info that we are "alongside"
        if (t >= 0 && t <= 1) {
             closestX = cx;
             closestY = cy;
             safeSegmentDir = { x: p2.x - p1.x, y: p2.y - p1.y };
             foundSegment = true;
        }

        if (distFromCenter < CONFIG.PATH_WIDTH / 2) {
          onPath = true;
          minEdgeDist = (CONFIG.PATH_WIDTH / 2) - distFromCenter;
          break;
        }
      }
    }

    if (!onPath) {
      if (this.ball.isInvulnerable && foundSegment) {
          // --- SHIELD BOUNCE MECHANIC ---
          
          // 1. Calculate Wall Normal (from Wall Center TO Ball)
          let nx = ball.x - closestX;
          let ny = ball.y - closestY;
          const len = Math.hypot(nx, ny);

          // Handle dead-center edge case
          if (len === 0) {
              // Use perpendicular to segment
              nx = -safeSegmentDir.y;
              ny = safeSegmentDir.x;
          } else {
              nx /= len;
              ny /= len;
          }

          // 2. Reflect Velocity (R = V - 2(V.N)N)
          // Only reflect if we are moving INTO the wall (dot product < 0)
          // Normal points OUT from wall. Velocity points IN. Dot is negative.
          const dot = ball.vx * nx + ball.vy * ny;
          
          if (dot < 0) {
            ball.vx = ball.vx - 2 * dot * nx;
            ball.vy = ball.vy - 2 * dot * ny;
            
            // Maintain momentum
            const currentSpeed = Math.hypot(ball.vx, ball.vy);
            ball.vx = (ball.vx / currentSpeed) * currentSpeed;
            ball.vy = (ball.vy / currentSpeed) * currentSpeed;

            // Recalculate angle for steering logic
            ball.angle = Math.atan2(ball.vy, ball.vx);
          }

          // 3. Push out to safety (Path Edge - Padding)
          const targetDist = CONFIG.PATH_WIDTH / 2 - 8;
          ball.x = closestX + nx * targetDist;
          ball.y = closestY + ny * targetDist;

          // 4. Penalty and FX
          this.invulnerableTimer = Math.max(0, this.invulnerableTimer - CONFIG.SHIELD_BOUNCE_PENALTY);
          this.spawnParticles(this.ball.x, this.ball.y, CONFIG.COLORS.ITEM_SHIELD, 20, { size: 3, speed: 8, decay: 0.03 });
          SoundManager.play('pickup'); 

      } else {
         this.handleLifeLost(closestX, closestY);
      }
    } else if (minEdgeDist < CONFIG.COMBO_THRESHOLD) {
      // Use dtFactor for smooth combo gain/loss
      ball.combo = Math.min(ball.combo + 0.05 * dtFactor, 5.0);
      if (Math.random() < 0.4 * dtFactor) {
        this.spawnParticles(
            ball.x + (Math.random() - 0.5) * 10, 
            ball.y, 
            CONFIG.COLORS.PARTICLE_NEAR_MISS, 
            2, 
            { size: 4, decay: 0.03, speed: 6 }
        );
      }
    } else {
      ball.combo = Math.max(1, ball.combo - 0.02 * dtFactor);
    }
  }

  private handleLifeLost(safeX: number, safeY: number) {
      const color = this.currentStyle ? this.currentStyle.colors.glow : CONFIG.COLORS.PARTICLE_DEATH;
      
      this.spawnParticles(this.ball.x, this.ball.y, color, 40, { size: 6, decay: 0.015, speed: 10 });
      SoundManager.play('crash');
      
      this.ball.vx = 0;
      this.ball.vy = 0;
      this.ball.visible = false; 
      this.ball.trail = []; 

      this.lives--;
      this.ball.combo = 1;

      this.callbacks.onScoreUpdate(this.score, this.ball.combo, this.coinsCollected, this.lives);

      // Always block updates immediately
      this.crashTimer = 800;

      if (this.lives <= 0) {
          // No respawn for final death
          this.pendingRespawn = null;
          // Delay game over screen for impact
          this.gameOverTimer = setTimeout(() => {
              this.callbacks.onGameOver(this.score);
          }, 800);
      } else {
          // Prepare respawn
          this.pendingRespawn = { x: safeX, y: safeY };
      }
  }

  private performRespawn(x: number, y: number) {
      this.ball.x = x;
      this.ball.y = y;
      this.ball.vx = 0;
      this.ball.vy = 0; 
      this.ball.angle = -Math.PI / 2;
      this.ball.trail = [];
      this.ball.visible = true; 
      this.ball.isTurningLeft = false; 
      this.pendingRespawn = null;
      this.waitingForInput = true;
      this.ball.isInvulnerable = true;
      this.invulnerableTimer = 2000; // Reset full shield on spawn
      this.spawnParticles(x, y, '#ffffff', 20, { size: 4, decay: 0.05, speed: 5 });
  }

  private spawnParticles(x: number, y: number, color: string, count: number, options: any) {
    const { size = 4, decay = 0.02, speed = 4 } = options;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        life: 1.0,
        color,
        size: Math.max(1, size + (Math.random() - 0.5) * (size * 0.5)),
        decay: decay * (0.8 + Math.random() * 0.4)
      });
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    this.renderer.draw(ctx, this.width, this.height, {
        gameState: this.gameState,
        ball: this.ball,
        path: this.path,
        items: this.items,
        particles: this.particles,
        bgShapes: this.bgShapes,
        ambientParticles: this.ambientParticles,
        nebulae: this.nebulae,
        cameraY: this.cameraY,
        waitingForInput: this.waitingForInput,
        magnetActive: this.magnetTimer > 0
    }, this.currentStyle, this.invulnerableTimer);
  }
}
