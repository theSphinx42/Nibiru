export const glyphImages = {
  'quantum-seal': '/images/glyphs/quantum-seal.png',
  'sigil-of-creation': '/images/glyphs/sigil-of-creation.png',
  'sigil-of-continuance': '/images/glyphs/sigil-of-continuance.png',
  'saphira-was-here': '/images/glyphs/saphira-was-here.png',
  'nibiru-symbol': '/images/glyphs/nibiru-symbol.svg',
  'aegis': '/images/glyphs/aegis.png',
  'lion': '/images/glyphs/lion.png',  
  'sharkskin': '/images/glyphs/sharkskin.png',
  'seidr': '/images/glyphs/seidr.png',
  'sphinx': '/images/glyphs/sphinx.png',
  'triune': '/images/glyphs/triune.png',
  'wayfinder': '/images/glyphs/wayfinder.png'
} as const;

export type GlyphImageKey = keyof typeof glyphImages;

// Fallback image if a glyph fails to load
export const FALLBACK_GLYPH = '/images/glyphs/nibiru-symbol.svg';

// Brand logos
export const BRAND_IMAGES = {
  symbol: '/images/glyphs/nibiru-symbol.svg',
  full: '/images/brand/nibiru-logo-full.png',
  hover: '/images/brand/Nibiru-hoverover.png'
} as const;

// Ensure all glyphs have corresponding images
export const validateGlyphImages = () => {
  const missingGlyphs = Object.keys(glyphImages).filter(glyph => {
    const img = new Image();
    img.src = glyphImages[glyph as GlyphImageKey];
    return !img.complete;
  });
  
  if (missingGlyphs.length > 0) {
    console.warn('Missing glyph images:', missingGlyphs);
  }
  
  return missingGlyphs.length === 0;
}; 