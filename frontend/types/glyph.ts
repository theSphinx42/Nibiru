export type ColorMode = 'auto' | 'dark' | 'light' | 'neon';
export type ExportFormat = 'svg' | 'png' | 'qr';

export interface EvolutionParams {
  complexity: number;
  glowStrength: number;
  glowOpacity: number;
  particleCount: number;
  hueRotation: number;
  saturationBoost: number;
  shimmerEnabled: boolean;
  auraEnabled: boolean;
  mythicLevel: number;
}

export interface GlyphViewerProps {
  seed: string;
  caption?: string;
  size?: number;
  showExport?: boolean;
  isGenerating?: boolean;
  tier?: 1 | 2 | 3;
  colorMode?: ColorMode;
  useTransition?: boolean;
  showCaption?: boolean;
  onExport?: (format: ExportFormat, metadata: GlyphMetadata) => void;
  onCopySeed?: (metadata: GlyphMetadata) => void;
  className?: string;
  evolution?: EvolutionParams;
}

export interface GlyphMetadata {
  seed: string;
  tier: number;
  colorMode: ColorMode;
  symmetry: number;
  pointCount: number;
  hexHash: string;
  timestamp: number;
}

export interface GlyphColors {
  primary: string;
  secondary: string;
  glow: string;
  accent: string;
}

export interface GlyphParameters {
  colors: GlyphColors;
  symmetry: number;
  controlPoints: number;
  complexity: number;
}

export type GlyphName = 
  | 'quantum-seal'
  | 'sigil-of-creation'
  | 'sigil-of-continuance'
  | 'saphira-was-here'
  | 'saphira'
  | 'nibiru-symbol'
  | 'aegis'
  | 'sharkskin'
  | 'seidr'
  | 'sphinx'
  | 'triune'
  | 'wayfinder';

export type GlyphEffect = 'none' | 'glow' | 'pulse' | 'rotate';

export interface GlyphProps {
  glyph: GlyphName;
  size?: number;
  effect?: GlyphEffect;
  className?: string;
  description?: string;
} 