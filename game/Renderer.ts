

import { GameState, BallEntity, Point, Particle, BackgroundShape, AmbientParticle, GameItem, ItemType, TrailStyle, NebulaEntity } from '../types';
import { CONFIG } from '../constants';

export class Renderer {
  
  draw(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    state: {
      gameState: GameState;
      ball: BallEntity;
      path: Point[];
      items: GameItem[];
      particles: Particle[];
      bgShapes: BackgroundShape[];
      ambientParticles: AmbientParticle[];
      nebulae: NebulaEntity[];
      cameraY: number;
      waitingForInput?: boolean;
      magnetActive?: boolean;
    },
    style: TrailStyle, // Current style
    invulnerableTimer: number = 0 // Remaining time in ms
  ) {
    const { gameState, ball, path, items, particles, bgShapes, ambientParticles, nebulae, cameraY, waitingForInput, magnetActive } = state;

    // Clear and Draw Background
    this.drawBackground(ctx, canvasWidth, canvasHeight);

    // Dynamic Nebulae
    this.drawNebulae(ctx, nebulae);

    // Retro Perspective Grid
    this.drawRetroGrid(ctx, canvasWidth, canvasHeight, cameraY, ball.vy);

    // Background Shapes (Debris)
    this.drawBGShapes(ctx, bgShapes);

    ctx.save();
    // Apply Camera translation
    ctx.translate(0, -cameraY);

    // Draw the Path (3D Extrusion + Surface)
    this.drawPath(ctx, path);

    // Objects on Path
    this.drawItems(ctx, items);

    // The Player
    if (ball.visible) {
        this.drawTrail(ctx, ball.trail, style);
        this.drawBall(ctx, ball, gameState, style, magnetActive, invulnerableTimer);
        
        // Draw Ready Hint
        if (waitingForInput) {
             this.drawReadyHint(ctx, ball.x, ball.y);
        }
    }

    // FX
    this.drawParticles(ctx, particles);

    ctx.restore();

    // Foreground overlay particles (Dust)
    this.drawAmbientParticles(ctx, ambientParticles);
  }

  private drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
    // Deep gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, CONFIG.COLORS.BG_START);
    grad.addColorStop(1, CONFIG.COLORS.BG_END);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Horizon Glow
    const horizonY = h * 0.2;
    const glow = ctx.createRadialGradient(w/2, horizonY, 0, w/2, horizonY, w * 0.8);
    glow.addColorStop(0, 'rgba(76, 29, 149, 0.4)'); // Purple haze
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.globalCompositeOperation = 'screen';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
  }

  private drawNebulae(ctx: CanvasRenderingContext2D, nebulae: NebulaEntity[]) {
      ctx.globalCompositeOperation = 'lighter';
      nebulae.forEach(n => {
          const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
          // Pulse opacity slightly
          const alpha = n.opacity * (0.8 + Math.sin(n.pulsePhase) * 0.2);
          
          grad.addColorStop(0, n.color);
          grad.addColorStop(1, 'transparent');
          
          ctx.fillStyle = grad;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
  }

  private drawRetroGrid(ctx: CanvasRenderingContext2D, w: number, h: number, cameraY: number, speed: number) {
    ctx.save();
    ctx.beginPath();
    
    // We want a grid that moves *down* the screen as we move *up* the track
    const horizon = 0;
    const gridSpacing = 80;
    const timeOffset = (-cameraY * 0.5) % gridSpacing;
    
    ctx.strokeStyle = CONFIG.COLORS.GRID_LINES;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.15;
    
    // Draw horizontal lines moving down
    for (let i = 0; i < h; i+= gridSpacing) {
        let y = i + timeOffset;
        if(y > h) y -= h;
        
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
    }

    // Vertical lines
    for(let x = 0; x <= w; x += w/8) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
    }
    
    ctx.stroke();

    // Vignette for the grid
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(0,0,0,1)'); // Fade out at top
    grad.addColorStop(0.2, 'rgba(0,0,0,0)');
    grad.addColorStop(0.8, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.8)'); // Darken at bottom
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
  }

  private drawBGShapes(ctx: CanvasRenderingContext2D, shapes: BackgroundShape[]) {
    ctx.save();
    shapes.forEach(shape => {
      ctx.translate(shape.x, shape.y);
      ctx.rotate(shape.rotation);
      
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = 2;
      
      // Dynamic Opacity based on pulse phase
      const pulse = Math.sin(shape.pulsePhase);
      ctx.globalAlpha = shape.opacity * (1 + pulse * 0.3); // Pulse intensity
      
      // Additive blend for neon look
      ctx.globalCompositeOperation = 'lighter';

      ctx.beginPath();
      // Draw hollow polygons
      // Scale pulse
      const scale = 1 + pulse * 0.1;
      ctx.scale(scale, scale);
      
      for(let i=0; i<shape.sides; i++) {
          const angle = (i / shape.sides) * Math.PI * 2;
          const px = Math.cos(angle) * shape.size;
          const py = Math.sin(angle) * shape.size;
          if(i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      // Reset transform
      ctx.scale(1/scale, 1/scale);
      ctx.rotate(-shape.rotation);
      ctx.translate(-shape.x, -shape.y);
    });
    ctx.restore();
  }

  private drawPath(ctx: CanvasRenderingContext2D, path: Point[]) {
    if (path.length <= 1) return;

    // 1. Draw "Thickness" (Extrusion)
    const shiftX = 10;
    const shiftY = 15;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Extrusion Layer (Darker side of the block)
    ctx.beginPath();
    ctx.moveTo(path[0].x + shiftX, path[0].y + shiftY);
    for(let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x + shiftX, path[i].y + shiftY);
    }
    // Connect back to end of main path
    ctx.lineTo(path[path.length-1].x, path[path.length-1].y);
    // Trace back main path
    for(let i = path.length - 2; i >= 0; i--) {
        ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = CONFIG.COLORS.PATH_SIDE;
    ctx.fill();

    // 2. Main Surface Glow (Under the road)
    ctx.shadowBlur = 30;
    ctx.shadowColor = CONFIG.COLORS.PATH_EDGE;
    ctx.beginPath();
    ctx.lineWidth = CONFIG.PATH_WIDTH;
    ctx.strokeStyle = CONFIG.COLORS.PATH_EDGE;
    ctx.moveTo(path[0].x, path[0].y);
    for(let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset

    // 3. Main Surface (Dark Asphalt)
    ctx.lineWidth = CONFIG.PATH_WIDTH - 6; // Leave a 3px border of the glowing edge
    ctx.strokeStyle = CONFIG.COLORS.PATH_TOP;
    ctx.stroke();

    // 4. Center Strip
    ctx.globalCompositeOperation = 'overlay';
    ctx.lineWidth = 4;
    ctx.setLineDash([40, 60]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalCompositeOperation = 'source-over';
  }

  private drawTrail(ctx: CanvasRenderingContext2D, trail: Point[], style: TrailStyle) {
    if (trail.length <= 1) return;
    
    ctx.globalCompositeOperation = 'lighter';
    
    // Draw Ribbon
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);
    
    for (let i = 1; i < trail.length; i++) {
        // Curve through points for smoothness
        const xc = (trail[i].x + trail[i - 1].x) / 2;
        const yc = (trail[i].y + trail[i - 1].y) / 2;
        ctx.quadraticCurveTo(trail[i - 1].x, trail[i - 1].y, xc, yc);
    }
    ctx.lineTo(trail[trail.length-1].x, trail[trail.length-1].y);

    // Outer Glow - Uses style fade/glow color
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 8;
    ctx.shadowBlur = 20;
    ctx.shadowColor = style.colors.glow;
    ctx.strokeStyle = style.colors.fade;
    ctx.stroke();

    // Inner Core - Uses style core color
    ctx.lineWidth = 3;
    ctx.shadowBlur = 0;
    ctx.strokeStyle = style.colors.core;
    ctx.stroke();

    ctx.globalCompositeOperation = 'source-over';
  }

  private drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    ctx.globalCompositeOperation = 'lighter';
    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      
      const size = p.size * p.life;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - size);
      ctx.lineTo(p.x + size, p.y);
      ctx.lineTo(p.x, p.y + size);
      ctx.lineTo(p.x - size, p.y);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  private drawAmbientParticles(ctx: CanvasRenderingContext2D, particles: AmbientParticle[]) {
    ctx.globalCompositeOperation = 'lighter';
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * 0.6;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  private drawBall(
      ctx: CanvasRenderingContext2D, 
      ball: BallEntity, 
      gameState: GameState, 
      style: TrailStyle, 
      magnetActive?: boolean,
      invulnerableTimer: number = 0
  ) {
    if (gameState === GameState.GAMEOVER) return;

    const time = Date.now();
    const radius = CONFIG.BALL_SIZE + 15;

    // Additive blending makes the ball look like pure light
    ctx.globalCompositeOperation = 'lighter';

    // 1. Big Glow - uses style glow
    ctx.shadowBlur = 40;
    ctx.shadowColor = style.colors.glow;
    ctx.fillStyle = style.colors.glow;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, CONFIG.BALL_SIZE + 4, 0, Math.PI * 2);
    ctx.fill();

    // 2. White Hot Core - uses style core
    // Strobe effect when invulnerable
    // Uses 60ms cycle approximation for strobing
    const isStrobe = ball.isInvulnerable && (Math.floor(time / 60) % 2 === 0);
    
    ctx.shadowBlur = isStrobe ? 20 : 10;
    ctx.shadowColor = isStrobe ? '#ffffff' : style.colors.glow;
    ctx.fillStyle = isStrobe ? '#ffffff' : style.colors.core;
    
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, CONFIG.BALL_SIZE, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;

    // 3. Magnet Visual (Purple pulse)
    if (magnetActive) {
        ctx.save();
        ctx.translate(ball.x, ball.y);
        ctx.strokeStyle = CONFIG.COLORS.ITEM_MAGNET;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5 + Math.sin(time * 0.01) * 0.2;
        
        ctx.beginPath();
        // Drawing magnet field lines
        ctx.arc(0, 0, radius + 10 + Math.sin(time * 0.01) * 5, -Math.PI/2, Math.PI/2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, radius + 10 + Math.sin(time * 0.01) * 5, Math.PI/2, -Math.PI/2);
        ctx.stroke();
        
        ctx.restore();
    }

    // 4. Enhanced Invulnerability Shield
    if (ball.isInvulnerable) {
        ctx.save();
        ctx.translate(ball.x, ball.y);
        
        // --- FLICKER LOGIC ---
        // If remaining time is < 1000ms, strobe alpha
        let shieldAlpha = 1.0;
        if (invulnerableTimer < 1000 && invulnerableTimer > 0) {
            shieldAlpha = 0.5 + 0.5 * Math.sin(time * 0.03); // Fast flicker
        }
        ctx.globalAlpha = shieldAlpha;

        // Enable additive blending for energy look
        ctx.globalCompositeOperation = 'lighter';
        
        // Pulsing Gradient Background (Aura)
        const pulse = Math.sin(time * 0.01);
        const shieldRadius = radius + (pulse * 2);
        
        const grad = ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, shieldRadius);
        grad.addColorStop(0, 'rgba(6, 182, 212, 0)'); // Transparent center
        grad.addColorStop(0.6, 'rgba(6, 182, 212, 0.15)'); // Soft Cyan
        grad.addColorStop(1, 'rgba(165, 243, 252, 0.5)'); // Bright White/Cyan Edge
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
        ctx.fill();

        // Rotating Rings
        ctx.shadowBlur = 15;
        ctx.shadowColor = CONFIG.COLORS.ITEM_SHIELD;
        ctx.strokeStyle = CONFIG.COLORS.ITEM_SHIELD;
        
        // Ring 1: Outer dashed, slow rotation
        ctx.save();
        ctx.rotate(time * 0.002);
        ctx.lineWidth = 2;
        ctx.setLineDash([20, 40]);
        ctx.beginPath();
        ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Ring 2: Inner dashed, fast counter-rotation
        ctx.save();
        ctx.rotate(-time * 0.005);
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 15]);
        ctx.globalAlpha = 0.8 * shieldAlpha;
        ctx.beginPath();
        ctx.arc(0, 0, shieldRadius - 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        
        // Ring 3: Solid thin line, scaling
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5 * shieldAlpha;
        ctx.arc(0, 0, shieldRadius - 3, 0, Math.PI * 2);
        ctx.stroke();

        // Random Sparkles on the shield
        if (Math.random() > 0.7) {
             const angle = Math.random() * Math.PI * 2;
             const dist = shieldRadius + Math.random() * 5;
             const px = Math.cos(angle) * dist;
             const py = Math.sin(angle) * dist;
             
             ctx.fillStyle = '#fff';
             ctx.globalAlpha = 1 * shieldAlpha;
             ctx.beginPath();
             ctx.arc(px, py, 1.5, 0, Math.PI * 2);
             ctx.fill();
        }

        ctx.restore();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
    }
  }

  private drawReadyHint(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y - 60);
    const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.1;
    ctx.scale(pulse, pulse);
    
    ctx.font = '900 14px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    
    // Glow
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('TAP TO ENGAGE', 0, 0);
    
    ctx.restore();
  }

  private drawItems(ctx: CanvasRenderingContext2D, items: GameItem[]) {
    items.forEach(c => {
        const bob = Math.sin(c.z) * 5;
        const scale = 1 + Math.sin(c.z * 3) * 0.1;

        ctx.save();
        ctx.translate(c.x, c.y + bob);
        ctx.scale(scale, scale);

        if (c.type === ItemType.COIN) {
            // Gold Glow
            ctx.shadowBlur = 20;
            ctx.shadowColor = CONFIG.COLORS.COIN_GLOW;
            
            // Outer Ring
            ctx.strokeStyle = CONFIG.COLORS.COIN;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, CONFIG.COIN_RADIUS, 0, Math.PI * 2);
            ctx.stroke();

            // Inner Diamond
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            const r = CONFIG.COIN_RADIUS * 0.5;
            ctx.moveTo(0, -r);
            ctx.lineTo(r, 0);
            ctx.lineTo(0, r);
            ctx.lineTo(-r, 0);
            ctx.fill();

        } else if (c.type === ItemType.SHIELD) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = CONFIG.COLORS.ITEM_SHIELD;
            ctx.strokeStyle = CONFIG.COLORS.ITEM_SHIELD;
            ctx.lineWidth = 2;
            
            // Draw Shield Shape
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.quadraticCurveTo(10, -10, 10, 0);
            ctx.quadraticCurveTo(10, 15, 0, 15);
            ctx.quadraticCurveTo(-10, 15, -10, 0);
            ctx.quadraticCurveTo(-10, -10, 0, -10);
            ctx.stroke();
            
            ctx.fillStyle = '#e0f2fe';
            ctx.globalAlpha = 0.5;
            ctx.fill();
            ctx.globalAlpha = 1;

        } else if (c.type === ItemType.MAGNET) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = CONFIG.COLORS.ITEM_MAGNET;
            ctx.strokeStyle = CONFIG.COLORS.ITEM_MAGNET;
            ctx.lineWidth = 3;
            
            // U Shape
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI, false);
            ctx.lineTo(-8, -8);
            ctx.moveTo(8, 0);
            ctx.lineTo(8, -8);
            ctx.stroke();
            
            // Tips
            ctx.fillStyle = '#fff';
            ctx.fillRect(-9, -10, 3, 3);
            ctx.fillRect(6, -10, 3, 3);

        } else if (c.type === ItemType.OBSTACLE) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = CONFIG.COLORS.ITEM_OBSTACLE;
            ctx.fillStyle = CONFIG.COLORS.ITEM_OBSTACLE;
            
            // Spiked Mine
            const spikes = 6;
            const outerRadius = 12;
            const innerRadius = 6;
            
            ctx.beginPath();
            for(let i=0; i<spikes*2; i++) {
                const r = (i % 2 === 0) ? outerRadius : innerRadius;
                const a = (Math.PI * i) / spikes;
                ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            }
            ctx.closePath();
            ctx.fill();
            
            // Center glow
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(0,0, 3, 0, Math.PI*2);
            ctx.fill();
        }

        ctx.restore();
    });
  }
}
