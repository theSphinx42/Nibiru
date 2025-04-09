import { SpiritGlyph } from '../types';

interface GlyphSeed {
  userId: string;
  timestamp: number;
  entropy: number;
}

interface GlyphMetrics {
  complexity: number;
  harmony: number;
  stability: number;
  resonance: number;
}

export class GlyphGenerator {
  private static instance: GlyphGenerator;
  
  private constructor() {}

  static getInstance(): GlyphGenerator {
    if (!this.instance) {
      this.instance = new GlyphGenerator();
    }
    return this.instance;
  }

  generateUserGlyph(seed: GlyphSeed): SpiritGlyph {
    const metrics = this.calculateMetrics(seed);
    const pattern = this.generateSVGPattern(seed, metrics);

    return {
      id: `glyph-${seed.userId}-${seed.timestamp}`,
      pattern,
      resonance: metrics.resonance,
      timestamp: new Date(seed.timestamp).toISOString(),
      userId: seed.userId,
      metadata: {
        complexity: metrics.complexity,
        harmony: metrics.harmony,
        stability: metrics.stability
      }
    };
  }

  generateProjectGlyph(projectId: string, scope: 'tool' | 'system' | 'quantum'): string {
    const seed = this.hashString(projectId);
    return this.generateScopedPattern(seed, scope);
  }

  generateQuantumGlyph(fileHash: string, timestamp: number): string {
    const seed = this.hashString(fileHash + timestamp.toString());
    return this.generateQuantumPattern(seed);
  }

  private calculateMetrics(seed: GlyphSeed): GlyphMetrics {
    const hash = this.hashString(seed.userId + seed.timestamp.toString());
    const values = new Uint8Array(hash.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    
    return {
      complexity: values[0] / 255,
      harmony: values[1] / 255,
      stability: values[2] / 255,
      resonance: (values[3] / 255) * 100
    };
  }

  private generateSVGPattern(seed: GlyphSeed, metrics: GlyphMetrics): string {
    const hash = this.hashString(seed.userId + seed.timestamp.toString());
    const points = this.generatePoints(hash, metrics);
    
    return this.constructSVGPath(points, metrics);
  }

  private generateScopedPattern(seed: string, scope: 'tool' | 'system' | 'quantum'): string {
    const complexity = scope === 'tool' ? 4 : scope === 'system' ? 6 : 8;
    const points = this.generatePoints(seed, { complexity: complexity / 8 });
    
    return this.constructSVGPath(points);
  }

  private generateQuantumPattern(seed: string): string {
    const points = this.generatePoints(seed, { complexity: 1 });
    return this.constructSVGPath(points, { resonance: 100 });
  }

  private generatePoints(seed: string, metrics: Partial<GlyphMetrics>): [number, number][] {
    const hash = this.hashString(seed);
    const values = new Uint8Array(hash.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    const points: [number, number][] = [];
    
    const complexity = metrics.complexity || 0.5;
    const numPoints = Math.floor(complexity * 16) + 4;
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const radius = 50 + (values[i % values.length] / 255) * 30;
      points.push([
        150 + Math.cos(angle) * radius,
        150 + Math.sin(angle) * radius
      ]);
    }
    
    return points;
  }

  private constructSVGPath(points: [number, number][], metrics?: Partial<GlyphMetrics>): string {
    const commands: string[] = [];
    
    // Start at the first point
    commands.push(`M ${points[0][0]},${points[0][1]}`);
    
    // Create the main shape
    for (let i = 1; i < points.length; i++) {
      const [x, y] = points[i];
      commands.push(`L ${x},${y}`);
    }
    
    // Close the path
    commands.push('Z');
    
    // Add internal details based on metrics
    if (metrics?.resonance) {
      const center: [number, number] = [150, 150];
      points.forEach(([x, y]) => {
        commands.push(`M ${center[0]},${center[1]}`);
        commands.push(`L ${x},${y}`);
      });
    }
    
    return commands.join(' ');
  }

  private hashString(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(32, '0');
  }
}

export const glyphGenerator = GlyphGenerator.getInstance(); 