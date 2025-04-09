import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { seededRandom, generateServiceSeed } from '../utils/glyphUtils';

export interface ItemGlyphProps {
  itemId: string;
  itemName?: string;
  creatorId?: string;
  size?: number;
  className?: string;
  animate?: boolean;
  complexity?: number; // 0-1 complexity factor
  color?: string;
  secondaryColor?: string;
  onClick?: () => void;
}

// SVG Glyph generator for marketplace items
const ItemGlyph: React.FC<ItemGlyphProps> = ({
  itemId,
  itemName,
  creatorId,
  size = 64,
  className = '',
  animate = true,
  complexity = 0.6,
  color = '#6366f1', // Indigo default
  secondaryColor = '#a5b4fc',
  onClick
}) => {
  // Generate a consistent seed for this item
  const seed = useMemo(() => {
    // Combine item attributes to create a unique but consistent seed
    const baseSeed = generateServiceSeed(itemId, itemName);
    return creatorId ? `${baseSeed}-${creatorId}` : baseSeed;
  }, [itemId, itemName, creatorId]);

  // Generate SVG elements based on the seed
  const svgElements = useMemo(() => {
    // Deterministic random number generator based on seed
    const rng = (salt: string) => seededRandom(seed + salt);
    
    // Define SVG viewBox and center point
    const viewBoxSize = 100;
    const center = viewBoxSize / 2;
    
    // Generate core shape segments
    const segments = Math.floor(rng('segments') * 4) + 4; // 4-8 segments
    const corePoints: [number, number][] = [];
    const outerPoints: [number, number][] = [];
    
    // Generate symmetric points around center
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      // Core radius with some variation but maintaining symmetry
      const segmentVariation = rng(`segment-${i % (segments/2)}`) * 0.2 + 0.9;
      const radius = center * 0.4 * segmentVariation;
      
      corePoints.push([
        center + Math.cos(angle) * radius,
        center + Math.sin(angle) * radius
      ]);
      
      // Outer points for decorative elements
      const outerRadius = center * 0.7 * (rng(`outer-${i}`) * 0.3 + 0.85);
      outerPoints.push([
        center + Math.cos(angle) * outerRadius,
        center + Math.sin(angle) * outerRadius
      ]);
    }
    
    // Generate SVG paths
    const corePath = corePoints.map((point, i) => 
      i === 0 ? `M ${point[0]},${point[1]}` : `L ${point[0]},${point[1]}`
    ).join(' ') + ' Z';
    
    // Generate decorative elements
    const decorations: JSX.Element[] = [];
    
    // Add inner decorative lines based on complexity
    const numLines = Math.floor(complexity * 8) + 1;
    for (let i = 0; i < numLines; i++) {
      const startIdx = Math.floor(rng(`line-start-${i}`) * segments);
      const endIdx = (startIdx + Math.floor(rng(`line-end-${i}`) * (segments - 2)) + 1) % segments;
      
      decorations.push(
        <path
          key={`line-${i}`}
          d={`M ${corePoints[startIdx][0]},${corePoints[startIdx][1]} L ${corePoints[endIdx][0]},${corePoints[endIdx][1]}`}
          stroke={secondaryColor}
          strokeWidth={0.5}
          strokeOpacity={0.7}
          fill="none"
        />
      );
    }
    
    // Add outer decorative elements
    if (complexity > 0.4) {
      for (let i = 0; i < segments; i++) {
        if (rng(`outer-decoration-${i}`) > 0.3) {
          const nextIdx = (i + 1) % segments;
          decorations.push(
            <path
              key={`outer-${i}`}
              d={`M ${outerPoints[i][0]},${outerPoints[i][1]} L ${outerPoints[nextIdx][0]},${outerPoints[nextIdx][1]}`}
              stroke={secondaryColor}
              strokeWidth={0.8}
              strokeOpacity={0.5}
              fill="none"
            />
          );
        }
      }
      
      // Connect some core points to outer points
      const connections = Math.floor(rng('connections') * 3) + 1;
      for (let i = 0; i < connections; i++) {
        const idx = Math.floor(rng(`connection-idx-${i}`) * segments);
        decorations.push(
          <path
            key={`connection-${i}`}
            d={`M ${corePoints[idx][0]},${corePoints[idx][1]} L ${outerPoints[idx][0]},${outerPoints[idx][1]}`}
            stroke={secondaryColor}
            strokeWidth={0.7}
            strokeDasharray={rng(`dash-${i}`) > 0.5 ? "1,1" : ""}
            strokeOpacity={0.6}
            fill="none"
          />
        );
      }
    }
    
    // Add central element
    decorations.push(
      <circle
        key="center"
        cx={center}
        cy={center}
        r={center * 0.1 * (rng('center-size') * 0.5 + 0.75)}
        fill={secondaryColor}
        fillOpacity={0.8}
      />
    );
    
    return {
      viewBox: `0 0 ${viewBoxSize} ${viewBoxSize}`,
      corePath,
      decorations
    };
  }, [seed, complexity, secondaryColor]);
  
  // Animation variants for subtle effects
  const glowVariants = {
    idle: {
      filter: 'drop-shadow(0 0 2px rgba(99, 102, 241, 0.3))',
      opacity: 0.95
    },
    animate: {
      filter: [
        'drop-shadow(0 0 2px rgba(99, 102, 241, 0.3))',
        'drop-shadow(0 0 4px rgba(99, 102, 241, 0.5))',
        'drop-shadow(0 0 2px rgba(99, 102, 241, 0.3))'
      ],
      opacity: [0.95, 1, 0.95]
    }
  };
  
  const pulseVariants = {
    idle: {
      scale: 1
    },
    animate: {
      scale: [1, 1.02, 1]
    }
  };

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox={svgElements.viewBox}
        xmlns="http://www.w3.org/2000/svg"
        initial="idle"
        animate={animate ? "animate" : "idle"}
        variants={pulseVariants}
        transition={{ 
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        {/* Background pulse effect */}
        {animate && (
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeOpacity={0.2}
            strokeWidth="0.5"
            initial={{ scale: 0.95, opacity: 0.2 }}
            animate={{ 
              scale: [0.95, 1.05, 0.95],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ 
              duration: 5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        )}
        
        {/* Core Glyph Shape */}
        <motion.path
          d={svgElements.corePath}
          fill="none"
          stroke={color}
          strokeWidth="1.2"
          fillOpacity="0.1"
          variants={glowVariants}
          transition={{ 
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        {/* Decorative Elements */}
        {svgElements.decorations}
      </motion.svg>
    </motion.div>
  );
};

export default ItemGlyph; 