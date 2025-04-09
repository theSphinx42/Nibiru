import { ColorMode } from '../types/glyph';

// Deterministic random number generator
export const seededRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
};

// Generate a deterministic seed from a name or ID
export const generateSeedFromName = (input: string): string => {
  // Remove special characters and normalize spaces
  const normalized = input.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  
  // Generate a hash from the normalized string
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
    hash = hash & hash;
  }
  
  // Convert hash to a base-36 string and ensure minimum length
  const seed = Math.abs(hash).toString(36).padStart(8, '0');
  return `gen-${seed}`;
};

// Generate a unique glyph seed for services
export const generateServiceSeed = (serviceId: string, name?: string): string => {
  const input = name ? `${serviceId}-${name}` : serviceId;
  return `svc-${generateSeedFromName(input)}`;
};

/**
 * Generates a consistent seed for an advertiser based on their ID and name
 */
export const generateAdvertiserSeed = (advertiserId: string, advertiserName?: string): string => {
  const namePart = advertiserName ? advertiserName.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  const seed = `adv-${advertiserId}-${namePart}`;
  return seed;
};

// Generate control points for the stem pattern
export const generateControlPoints = (seed: string, count: number, maxRadius: number) => {
  const points: [number, number][] = [];
  const rng = (i: number) => seededRandom(seed + i);
  
  // Start from center
  points.push([0, 0]);
  
  let currentAngle = rng(0) * Math.PI * 2;
  let currentRadius = 0;
  
  for (let i = 1; i < count; i++) {
    // Vary the angle between 15° and 45°
    const angleChange = (Math.PI / 12) + (rng(i * 2) * Math.PI / 4);
    currentAngle += angleChange;
    
    // Gradually increase radius with some variation
    const radiusIncrease = (maxRadius / count) * (0.5 + rng(i * 3));
    currentRadius += radiusIncrease;
    
    const x = Math.cos(currentAngle) * currentRadius;
    const y = Math.sin(currentAngle) * currentRadius;
    points.push([x, y]);
  }
  
  return points;
};

// Generate color scheme based on seed and mode
export const generateColorScheme = (seed: string, mode: ColorMode) => {
  const rng = (i: number) => seededRandom(seed + i);
  const hue = Math.floor(rng(1) * 270) + 200; // Base hue in blue-purple range

  switch (mode) {
    case 'light':
      return {
        primary: `hsl(${hue}, 70%, 75%)`,
        secondary: `hsl(${(hue + 60) % 360}, 75%, 70%)`,
        glow: `hsl(${hue}, 80%, 85%)`,
        accent: `hsl(${(hue + 30) % 360}, 80%, 80%)`,
      };
    case 'dark':
      return {
        primary: `hsl(${hue}, 80%, 45%)`,
        secondary: `hsl(${(hue + 60) % 360}, 85%, 40%)`,
        glow: `hsl(${hue}, 90%, 55%)`,
        accent: `hsl(${(hue + 30) % 360}, 90%, 50%)`,
      };
    case 'neon':
      return {
        primary: `hsl(${hue}, 100%, 65%)`,
        secondary: `hsl(${(hue + 180) % 360}, 100%, 60%)`,
        glow: `hsl(${hue}, 100%, 75%)`,
        accent: `hsl(${(hue + 90) % 360}, 100%, 70%)`,
      };
    default: // 'auto' - use original cosmic palette
      return {
        primary: `hsl(${hue}, 80%, 65%)`,
        secondary: `hsl(${(hue + 60) % 360}, 85%, 60%)`,
        glow: `hsl(${hue}, 90%, 75%)`,
        accent: `hsl(${(hue + 30) % 360}, 90%, 70%)`,
      };
  }
};

// Generate the base stem pattern
export const generateStemPath = (
  points: [number, number][],
  complexity: number,
  seed: string
) => {
  const rng = (i: number) => seededRandom(seed + i);
  let path = `M ${points[0][0]} ${points[0][1]}`;
  
  for (let i = 1; i < points.length; i++) {
    // Randomly add curves or straight lines
    if (rng(i * 100) > 0.3) {
      // Curved line with control point offset
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      const controlX = (prevPoint[0] + currentPoint[0]) / 2 + (rng(i * 200) - 0.5) * 30 * complexity;
      const controlY = (prevPoint[1] + currentPoint[1]) / 2 + (rng(i * 300) - 0.5) * 30 * complexity;
      path += ` Q ${controlX} ${controlY}, ${currentPoint[0]} ${currentPoint[1]}`;
    } else {
      // Straight line
      path += ` L ${points[i][0]} ${points[i][1]}`;
    }
  }
  
  return path;
}; 