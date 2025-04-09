# Visual Identity System

## Component Hierarchy

```
SpiritGlyphViewer (Core)
└── AdvertiserGlyph (Enhanced)
    └── ServiceCard (Container)
```

## Core Components

### 1. SpiritGlyphViewer
Base component for rendering quantum-inspired glyphs.

**Key Props:**
- `seed: string` - Unique identifier for glyph generation
- `tier: 1 | 2 | 3` - Visual complexity tier
- `colorMode: "auto" | "dark" | "light" | "neon"` - Theme adaptation
- `size: number` - Dimensions in pixels
- `evolution?: EvolutionParams` - Visual enhancement parameters
- `useTransition: boolean` - Animation toggle

**Tiers:**
- Tier 1: Full Experience (complex patterns, particles)
- Tier 2: Simplified (reduced complexity)
- Tier 3: Minimal (used for logos/watermarks)

### 2. AdvertiserGlyph
Handles logo display with glyph fallbacks.

**Key Props:**
```typescript
{
  advertiserId: string;
  advertiserName?: string;
  logo?: string | null;
  size?: number;
  showGlyphWatermark?: boolean;
  showGlow?: boolean;
  metrics?: {
    prominence?: number;  // 0-1 scale
    tier?: number;       // quantum tier
    activity?: number;   // 0-1 scale
  }
}
```

**Features:**
- Logo loading with 2 retries (2s delay)
- Graceful fallback to Tier 3 glyph
- Optional glow effects
- Watermark overlay capability
- Loading states with spinner

### 3. ServiceCard
Container component for marketplace services.

**Key Props:**
```typescript
{
  service: {
    id: string;
    name: string;
    description: string;
    price: string | number;
    category?: string;
    downloads?: number;
    rating?: number;
    quantumTier?: number;
    logo?: string;
  }
}
```

## Centralized Utilities

### Formatting (`utils/format.ts`)
```typescript
formatPrice(price: string | number): string    // Currency: $XX.XX
formatNumber(num: number): string              // 1,234,567
formatDate(date: string | Date): string        // Month DD, YYYY
```

### Error Handling
- Logo loading: 2 retries with 2s delay
- API failures: Graceful degradation to mock data
- Missing images: Automatic glyph fallback

### Loading States
1. Initial skeleton loading
2. Logo loading spinner
3. Smooth transitions (AnimatePresence)
4. Progressive enhancement

## Visual Evolution

Services evolve based on:
- Price tier (glow intensity)
- Download count (pattern complexity)
- Rating (special effects > 4.5)
- Quantum tier (mythic appearance)

## Usage Example

```typescript
<ServiceCard
  service={{
    id: "quantum-123",
    name: "Quantum Service",
    price: 299.99,
    rating: 4.8,
    quantumTier: 2,
    logo: "/path/to/logo.png" // Falls back to glyph if missing
  }}
/>
```

## Best Practices

1. Always use `colorMode="auto"` for theme consistency
2. Let the system handle logo failures gracefully
3. Provide complete service metrics for proper evolution
4. Use the centralized formatting utilities
5. Leverage AnimatePresence for smooth transitions 