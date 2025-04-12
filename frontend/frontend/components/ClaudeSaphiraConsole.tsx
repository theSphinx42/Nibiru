import { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConsole } from '@/contexts/ConsoleContext';
import GlyphCommandBar, { GlyphCommand } from './GlyphCommandBar';
import ThematicGlyph from './ThematicGlyph';
import { Chronicle } from '@/utils/Chronicle';

const ClaudeSaphiraConsole: React.FC = () => {
  const { state, dispatch } = useConsole();
  const chronicle = Chronicle.getInstance();

  // Simulate initial exchange
  useEffect(() => {
    const simulateExchange = async () => {
      // User's initial request
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: crypto.randomUUID(),
          content: "I need a modern carousel component that displays NFT cards with quantum effects. It should support touch gestures and keyboard navigation.",
          sender: 'user',
          timestamp: new Date()
        }
      });

      // Simulate Saphira processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Saphira's structured response
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: crypto.randomUUID(),
          content: `Here's a structured approach for the NFT Carousel:

Requirements:
- Modern, touch-enabled carousel for NFT cards
- Quantum visual effects integration
- Accessibility: keyboard navigation
- Responsive design

Component Structure:
\`\`\`typescript
interface NFTCarouselProps {
  items: NFTItem[];
  quantumEffects?: QuantumEffects;
  autoplay?: boolean;
  interval?: number;
}
\`\`\`

Key Features:
1. Framer Motion for smooth animations
2. Quantum effect overlays from our existing system
3. Touch gesture handling with proper event delegation
4. Keyboard controls (←/→) for navigation
5. Auto-advance with pause on hover/focus

Would you like me to proceed with the implementation?`,
          sender: 'saphira',
          timestamp: new Date()
        }
      });
    };

    simulateExchange();
  }, [dispatch]);

  // Start a new cycle when the first user message is added
  useEffect(() => {
    const handleFirstMessage = (message: any) => {
      if (message.sender === 'user' && !chronicle.getCurrentCycle()) {
        chronicle.startCycle('NFT Carousel Implementation');
        chronicle.addMessage(message);
      }
    };

    if (state.messages.length === 1) {
      handleFirstMessage(state.messages[0]);
    }
  }, [state.messages]);

  // Record messages to Chronicle
  useEffect(() => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage && chronicle.getCurrentCycle()) {
      chronicle.addMessage(lastMessage);
    }
  }, [state.messages]);

  const handleCommand = useCallback(async (command: GlyphCommand) => {
    dispatch({ type: 'SET_ACTIVE_COMMAND', payload: command });
    dispatch({ type: 'SET_PROCESSING', payload: true });

    // Record glyph usage in Chronicle
    if (chronicle.getCurrentCycle()) {
      chronicle.recordGlyphUse(command);
    }

    try {
      switch (command) {
        case 'fire':
          if (state.lastSaphiraMessage) {
            // Simulate Claude processing time
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            dispatch({
              type: 'ADD_MESSAGE',
              payload: {
                id: crypto.randomUUID(),
                content: `Based on Saphira's requirements, here's the NFT Carousel implementation:

\`\`\`typescript
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useQuantumEffects } from '@/hooks/useQuantumEffects';
import { NFTCard } from './NFTCard';

interface NFTCarouselProps {
  items: NFTItem[];
  quantumEffects?: QuantumEffects;
  autoplay?: boolean;
  interval?: number;
}

export const NFTCarousel: React.FC<NFTCarouselProps> = ({
  items,
  quantumEffects,
  autoplay = true,
  interval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const { applyQuantumEffect } = useQuantumEffects();

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    })
  };

  // Navigation functions
  const navigate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => 
      (prev + newDirection + items.length) % items.length
    );
  }, [items.length]);

  // Touch handling
  const handleDragEnd = (info: PanInfo) => {
    const threshold = 50;
    if (Math.abs(info.offset.x) > threshold) {
      navigate(info.offset.x > 0 ? -1 : 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Autoplay
  useEffect(() => {
    if (autoplay && !isPaused) {
      const timer = setInterval(() => navigate(1), interval);
      return () => clearInterval(timer);
    }
  }, [autoplay, isPaused, interval, navigate]);

  return (
    <div 
      className="relative overflow-hidden w-full h-[500px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(_, info) => handleDragEnd(info)}
          className="absolute w-full h-full"
        >
          <NFTCard
            item={items[currentIndex]}
            quantumEffects={applyQuantumEffect(quantumEffects)}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={\`w-2 h-2 rounded-full transition-all
              \${index === currentIndex 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75'}
            \`}
            aria-label={\`Go to slide \${index + 1}\`}
          />
        ))}
      </div>
    </div>
  );
};
\`\`\`

This implementation includes:
- Smooth transitions with Framer Motion
- Touch/drag gestures with elastic feedback
- Keyboard accessibility
- Autoplay with pause on hover
- Quantum effects integration
- Responsive dot navigation

Would you like me to add any additional features or refinements?`,
                sender: 'claude',
                timestamp: new Date()
              }
            });
            dispatch({ type: 'PUSH_TO_QUEUE', payload: state.lastSaphiraMessage });
          }
          break;

        case 'air':
          if (state.lastClaudeMessage) {
            // Simulate Saphira processing time
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulate an error in Saphira's initial refinement
            dispatch({
              type: 'ADD_MESSAGE',
              payload: {
                id: crypto.randomUUID(),
                content: `ERROR: Detected potential memory leak in useEffect cleanup.
                quantum_effects_pipeline.validate() failed with code E_MEMORY_LEAK`,
                sender: 'system',
                timestamp: new Date()
              }
            });

            // Wait for error to be noticed
            await new Promise(resolve => setTimeout(resolve, 1500));

            dispatch({
              type: 'ADD_MESSAGE',
              payload: {
                id: crypto.randomUUID(),
                content: `I've analyzed Claude's carousel implementation and found some areas for enhancement:

1. Memory Leak Fix:
\`\`\`typescript
// Add cleanup for quantum effects
useEffect(() => {
  const cleanup = applyQuantumEffect(quantumEffects);
  return () => cleanup?.();
}, [quantumEffects, applyQuantumEffect]);
\`\`\`

2. Performance Optimizations:
- Memoize NFTCard components
- Use IntersectionObserver for autoplay
- Implement virtual rendering for large lists

3. Enhanced Accessibility:
- Add aria-live region for screen readers
- Implement swipe gestures for mobile
- Add touch feedback animations

4. Quantum Integration:
- Add quantum entropy for randomization
- Implement glow effects on active slide
- Add particle effects during transitions

Would you like me to implement these improvements?`,
                sender: 'saphira',
                timestamp: new Date()
              }
            });
          }
          break;

        case 'earth':
          // Validate syntax and structure
          dispatch({
            type: 'ADD_MESSAGE',
            payload: {
              id: crypto.randomUUID(),
              content: 'Validating message structure and quantum pipeline integrity...',
              sender: 'system',
              timestamp: new Date()
            }
          });

          // Simulate validation
          await new Promise(resolve => setTimeout(resolve, 2000));

          dispatch({
            type: 'ADD_MESSAGE',
            payload: {
              id: crypto.randomUUID(),
              content: 'Validation complete. All quantum pathways are stable. Memory leak patched. Safe to proceed.',
              sender: 'system',
              timestamp: new Date()
            }
          });
          break;

        case 'water':
          // Save to Chronicle
          const messageToSave = state.messages[state.messages.length - 1];
          if (messageToSave && chronicle.getCurrentCycle()) {
            // Simulate save operation
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // End the current cycle
            const entry = chronicle.endCycle(94); // Example quantum score

            dispatch({
              type: 'ADD_MESSAGE',
              payload: {
                id: crypto.randomUUID(),
                content: `Successfully archived to Chronicle:
- Cycle ID: ${entry.cycle.id}
- Messages: ${entry.cycle.messages.length}
- Glyphs Used: ${entry.cycle.glyphsUsed.join(', ')}
- Quantum Score: ${entry.cycle.quantumScore}
- Duration: ${Math.round((entry.cycle.endTime.getTime() - entry.cycle.startTime.getTime()) / 1000)}s
- Hash: ${entry.cycle.hash}
- Chronicle Hash: ${entry.metadata.chronicleHash}`,
                sender: 'system',
                timestamp: new Date()
              }
            });
          }
          break;

        case 'light':
          // Open diff viewer
          if (state.messages.length >= 2) {
            const lastTwo = state.messages.slice(-2);
            dispatch({
              type: 'ADD_MESSAGE',
              payload: {
                id: crypto.randomUUID(),
                content: 'Opening diff viewer...',
                sender: 'system',
                timestamp: new Date()
              }
            });
          }
          break;

        case 'dark':
          // Archive and clear
          if (chronicle.getCurrentCycle()) {
            chronicle.endCycle(0); // End with zero score for abandoned cycles
          }
          chronicle.clear();
          dispatch({ type: 'ARCHIVE_THREAD' });
          break;
      }
    } catch (error) {
      console.error('Command failed:', error);
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
      dispatch({ type: 'SET_ACTIVE_COMMAND', payload: null });
    }
  }, [state.lastSaphiraMessage, state.lastClaudeMessage, state.messages, dispatch]);

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Command Bar */}
      <GlyphCommandBar
        onCommand={handleCommand}
        activeCommand={state.activeCommand}
        className="sticky top-0 z-50 bg-gray-900/50 backdrop-blur-sm p-4 rounded-lg"
      />

      {/* Messages */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {state.messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`flex items-start gap-4 p-4 rounded-lg ${
                message.sender === 'claude'
                  ? 'bg-blue-900/20 border border-blue-500/20'
                  : message.sender === 'saphira'
                  ? 'bg-purple-900/20 border border-purple-500/20'
                  : message.sender === 'system'
                  ? 'bg-red-900/20 border border-red-500/20'
                  : 'bg-gray-800/20 border border-gray-700/20'
              }`}
            >
              <ThematicGlyph
                glyph={
                  message.sender === 'claude'
                    ? 'quantum-seal'
                    : message.sender === 'saphira'
                    ? 'sigil-of-creation'
                    : message.sender === 'system'
                    ? 'saphira-was-here'
                    : 'nibiru-symbol'
                }
                size={32}
                description={`${message.sender} glyph`}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium capitalize">{message.sender}</span>
                  <span className="text-xs text-gray-400">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm text-gray-300 whitespace-pre-wrap">{message.content}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Memory Queue Indicator */}
      {state.memoryQueue.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 right-4 px-3 py-1 bg-indigo-900/50 
                   border border-indigo-500/20 rounded-full text-xs text-indigo-300"
        >
          Queue: {state.memoryQueue.length} items
        </motion.div>
      )}
    </div>
  );
};

export default ClaudeSaphiraConsole; 