import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';

interface VisualSeed {
  shapeCount: number;
  symmetry: number;
  rotation: number;
  colors: string[];
  matrix: number[][];
  asciiPattern: string[];
  hash: string;
  salt?: string;
  creatorSignature?: string;
}

interface GlyphRendererProps {
  hash: string;
  size?: number;
  className?: string;
  darkMode?: boolean;
  salt?: string;
  creatorSignature?: string;
  showControls?: boolean;
}

const GLYPH_CHARS = ['⧉', '⨀', '✶', '⨁', '✹', '⟐', '⟡', '║', '──'];
const DEFAULT_SIZE = 200;

// Utility function to generate a deterministic hash from multiple inputs
const generateDeterministicHash = (hash: string, salt?: string, creatorSignature?: string): string => {
  const inputs = [hash, salt, creatorSignature].filter(Boolean);
  return inputs.join('|');
};

// Utility function to copy text to clipboard
const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
};

const generateVisualSeedFromHash = (hash: string, salt?: string, creatorSignature?: string): VisualSeed => {
  const deterministicHash = generateDeterministicHash(hash, salt, creatorSignature);
  const hashValues = deterministicHash.split('').map(char => char.charCodeAt(0));
  
  // Generate shape count (3-7) - deterministic based on first byte
  const shapeCount = 3 + (hashValues[0] % 5);
  
  // Generate symmetry (2-8) - deterministic based on second byte
  const symmetry = 2 + (hashValues[1] % 7);
  
  // Generate rotation (0-360) - deterministic based on third byte
  const rotation = (hashValues[2] * 360) / 256;
  
  // Generate color palette - deterministic based on next three bytes
  const colors = hashValues.slice(3, 6).map(value => {
    const hue = (value * 360) / 256;
    return `hsl(${hue}, 70%, 50%)`;
  });
  
  // Generate 5x5 matrix for ASCII pattern - deterministic based on remaining bytes
  const matrix = Array(5).fill(0).map((_, i) => 
    Array(5).fill(0).map((_, j) => 
      hashValues[(i * 5 + j) % hashValues.length] % GLYPH_CHARS.length
    )
  );
  
  // Generate ASCII pattern
  const asciiPattern = matrix.map(row => 
    row.map(value => GLYPH_CHARS[value]).join(' ')
  );
  
  return {
    shapeCount,
    symmetry,
    rotation,
    colors,
    matrix,
    asciiPattern,
    hash: deterministicHash,
    salt,
    creatorSignature
  };
};

const generateSVGGlyph = (seed: VisualSeed, size: number): string => {
  const center = size / 2;
  const radius = size * 0.4;
  
  // Generate base shapes with deterministic positions
  const shapes = Array(seed.shapeCount).fill(0).map((_, i) => {
    const angle = (i * 360) / seed.shapeCount;
    const x = center + radius * Math.cos(angle * Math.PI / 180);
    const y = center + radius * Math.sin(angle * Math.PI / 180);
    
    return `
      <circle
        cx="${x}"
        cy="${y}"
        r="${radius * 0.2}"
        fill="${seed.colors[i % seed.colors.length]}"
        opacity="0.8"
      />
    `;
  });
  
  // Generate connecting lines with deterministic positions
  const lines = Array(seed.shapeCount).fill(0).map((_, i) => {
    const nextIndex = (i + 1) % seed.shapeCount;
    const startAngle = (i * 360) / seed.shapeCount;
    const endAngle = (nextIndex * 360) / seed.shapeCount;
    
    const x1 = center + radius * Math.cos(startAngle * Math.PI / 180);
    const y1 = center + radius * Math.sin(startAngle * Math.PI / 180);
    const x2 = center + radius * Math.cos(endAngle * Math.PI / 180);
    const y2 = center + radius * Math.sin(endAngle * Math.PI / 180);
    
    return `
      <line
        x1="${x1}"
        y1="${y1}"
        x2="${x2}"
        y2="${y2}"
        stroke="${seed.colors[i % seed.colors.length]}"
        stroke-width="2"
        opacity="0.6"
      />
    `;
  });
  
  return `
    <svg
      viewBox="0 0 ${size} ${size}"
      width="${size}"
      height="${size}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="rotate(${seed.rotation}, ${center}, ${center})">
        ${shapes.join('')}
        ${lines.join('')}
      </g>
    </svg>
  `;
};

export const GlyphRenderer: React.FC<GlyphRendererProps> = ({
  hash,
  size = DEFAULT_SIZE,
  className = '',
  darkMode = false,
  salt,
  creatorSignature,
  showControls = false
}) => {
  const [seed, setSeed] = useState<VisualSeed | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [useAscii, setUseAscii] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const visualSeed = generateVisualSeedFromHash(hash, salt, creatorSignature);
      setSeed(visualSeed);
      setSvgContent(generateSVGGlyph(visualSeed, size));
      setUseAscii(false);
    } catch (error) {
      console.error('Error generating glyph:', error);
      setUseAscii(true);
    }
  }, [hash, size, salt, creatorSignature]);

  const handleExportPNG = async () => {
    if (!containerRef.current || !seed) return;
    
    setIsExporting(true);
    try {
      const svgElement = containerRef.current.querySelector('svg');
      if (!svgElement) return;

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0, size, size);
        const link = document.createElement('a');
        link.download = `glyph-${seed.hash.slice(0, 8)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };

      img.src = url;
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSVG = () => {
    if (!seed) return;
    
    const link = document.createElement('a');
    link.download = `glyph-${seed.hash.slice(0, 8)}.svg`;
    link.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent);
    link.click();
  };

  const handleExportASCII = () => {
    if (!seed) return;
    
    const asciiContent = seed.asciiPattern.join('\n');
    const link = document.createElement('a');
    link.download = `glyph-${seed.hash.slice(0, 8)}.txt`;
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(asciiContent);
    link.click();
  };

  const handleCopyHash = async () => {
    if (!seed) return;
    const success = await copyToClipboard(seed.hash);
    if (success) {
      // You might want to show a toast notification here
    }
  };

  if (!seed) {
    return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" style={{ width: size, height: size }} />;
  }

  const renderControls = () => {
    if (!showControls) return null;

    return (
      <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-2 p-2 bg-black bg-opacity-50 rounded-b-lg">
        <button
          onClick={handleExportPNG}
          disabled={isExporting}
          className="p-1 text-white hover:text-indigo-300 disabled:opacity-50"
          title="Export as PNG"
        >
          📷
        </button>
        <button
          onClick={handleExportSVG}
          className="p-1 text-white hover:text-indigo-300"
          title="Export as SVG"
        >
          🎨
        </button>
        <button
          onClick={handleExportASCII}
          className="p-1 text-white hover:text-indigo-300"
          title="Export as ASCII"
        >
          📝
        </button>
        <button
          onClick={handleCopyHash}
          className="p-1 text-white hover:text-indigo-300"
          title="Copy Glyph Hash"
        >
          🔑
        </button>
      </div>
    );
  };

  if (useAscii) {
    return (
      <div
        ref={containerRef}
        className={`font-mono text-center relative ${className}`}
        style={{
          width: size,
          height: size,
          color: darkMode ? '#E5E7EB' : '#374151'
        }}
      >
        {seed.asciiPattern.map((line, i) => (
          <div key={i} className="leading-tight">
            {line}
          </div>
        ))}
        {renderControls()}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    >
      {renderControls()}
    </div>
  );
};
 