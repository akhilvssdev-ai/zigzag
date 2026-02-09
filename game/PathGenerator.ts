import { Point } from '../types';

export class PathGenerator {
  private direction: number = 1; // 1 or -1
  private segmentCount: number = 0;

  constructor() {
    this.reset();
  }

  reset() {
    this.direction = Math.random() > 0.5 ? 1 : -1;
    this.segmentCount = 0;
  }

  generateNextPoint(lastPoint: Point, canvasWidth: number): Point {
    const margin = 120;
    let dir = this.direction;
    let count = this.segmentCount;
    
    // 1. Check Bounds (Force turn if near edge)
    if (lastPoint.x < margin) {
        dir = 1;
        count = 0;
    } else if (lastPoint.x > canvasWidth - margin) {
        dir = -1;
        count = 0;
    } else {
        // 2. Direction Bias
        // The longer we go in one direction, the more likely we are to switch.
        const switchProbability = 0.1 + (count * 0.2);
        
        // Random switch
        if (Math.random() < switchProbability && count > 0) {
            dir *= -1;
            count = 0;
        }
    }

    // 3. Dynamic Segment Variation
    // High Y, Low X = "Straightaway", Low Y, High X = "Hard Turn"
    const isHardTurn = Math.random() > 0.6;
    
    // Calculate steps
    const xBase = isHardTurn ? 150 : 80;
    const yBase = isHardTurn ? 100 : 180;
    
    // Add randomness
    const xStep = (xBase + Math.random() * 100);
    const yStep = (yBase + Math.random() * 100);
    
    let nextX = lastPoint.x + (xStep * dir);
    
    // Soft clamp to bounds
    if (nextX < margin/2) nextX = margin/2 + Math.random() * 50;
    if (nextX > canvasWidth - margin/2) nextX = canvasWidth - margin/2 - Math.random() * 50;

    // Update State
    this.direction = dir;
    this.segmentCount = count + 1;

    return {
        x: nextX,
        y: lastPoint.y - yStep
    };
  }
}