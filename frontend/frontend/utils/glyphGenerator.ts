import { createHash } from 'crypto';

// Glyph = singular tier token representing a specific aspect (user, item, etc.)
// Sigil = glyph composition combining multiple aspects (e.g. user + listing + internal validator)

export interface GlyphSeed {
  userId: string;
  timestamp: number;
}

export interface GlyphMetrics {
  resonance: number;
  complexity: number;
  harmony: number;
  stability: number;
}

export interface SpiritGlyph {
  id: string;
  pattern: string;
  resonance: number;
  timestamp: string;
  userId: string;
  metadata: {
    complexity: number;
    harmony: number;
    stability: number;
  };
}

export class GlyphGenerator {
  private static instance: GlyphGenerator;

  public static getInstance(): GlyphGenerator {
    if (!GlyphGenerator.instance) {
      GlyphGenerator.instance = new GlyphGenerator();
    }
    return GlyphGenerator.instance;
  }

  /**
   * Generates a basic user glyph (single-layer representation)
   * @param seed The seed data for glyph generation
   */
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

  /**
   * Generates a sigil by compositing multiple glyphs and data sources
   * Creates a ceremonial, composite symbol with unlockable properties
   * @param userGlyph Base user glyph
   * @param additionalData Additional data for compositing
   */
  generateSigil(userGlyph: SpiritGlyph, additionalData: any): SpiritGlyph {
    // Enhanced version of glyph that combines multiple sources
    const enhancedSeed: GlyphSeed = {
      userId: userGlyph.userId,
      timestamp: Date.now()
    };
    
    const metrics = this.calculateEnhancedMetrics(userGlyph.metadata, additionalData);
    const pattern = this.generateSVGPattern(enhancedSeed, metrics);

    return {
      id: `sigil-${userGlyph.userId}-${enhancedSeed.timestamp}`,
      pattern,
      resonance: metrics.resonance,
      timestamp: new Date(enhancedSeed.timestamp).toISOString(),
      userId: userGlyph.userId,
      metadata: {
        complexity: metrics.complexity,
        harmony: metrics.harmony,
        stability: metrics.stability
      }
    };
  }

  private calculateMetrics(seed: GlyphSeed): GlyphMetrics {
    const hash = this.hashString(seed.userId + seed.timestamp.toString());
    
    // Create deterministic metrics from the hash
    const values = new Uint8Array(hash.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    const sum = values.reduce((a, b) => a + b, 0);
    const max = values.length * 255;
    
    return {
      resonance: (sum / max) * 0.8 + 0.2, // 0.2 - 1.0
      complexity: (values[0] / 255) * 0.8 + 0.2, // 0.2 - 1.0
      harmony: (values[1] / 255) * 0.8 + 0.2, // 0.2 - 1.0
      stability: (values[2] / 255) * 0.8 + 0.2 // 0.2 - 1.0
    };
  }

  private calculateEnhancedMetrics(baseMetrics: any, additionalData: any): GlyphMetrics {
    // Enhanced version for sigil generation
    return {
      resonance: Math.min(baseMetrics.resonance * 1.5, 1.0),
      complexity: Math.min(baseMetrics.complexity * 1.3, 1.0),
      harmony: Math.min(baseMetrics.harmony * 1.2, 1.0),
      stability: Math.min(baseMetrics.stability * 1.1, 1.0)
    };
  }

  private generateSVGPattern(seed: GlyphSeed, metrics: GlyphMetrics): string {
    const hash = this.hashString(seed.userId + seed.timestamp.toString());
    const points = this.generatePoints(hash, metrics);
    
    return this.constructSVGPath(points, metrics);
  }

  private hashString(input: string): string {
    return createHash('sha256').update(input).digest('hex');
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
}

export const glyphGenerator = GlyphGenerator.getInstance(); 