import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThematicGlyph from './ThematicGlyph';
import { GlyphName } from '../types/glyph';

interface Advertiser {
  id: string;
  name: string;
  glyph: GlyphName;
}

// Add Nibiru at both ends
const advertisers: Advertiser[] = [
  { id: 'nibiru-start', name: 'The Nibiru', glyph: 'nibiru-symbol' },
  { id: 'aegis', name: 'The Aegis', glyph: 'aegis' },
  { id: 'saphira', name: 'Saphira Core', glyph: 'saphira' },
  { id: 'shark', name: 'The Shark', glyph: 'sharkskin' },
  { id: 'seidr', name: 'The Seidr', glyph: 'seidr' },
  { id: 'sphinx', name: 'The Sphinx', glyph: 'sphinx' },
  { id: 'triune', name: 'The Triune', glyph: 'triune' },
  { id: 'wayfinder', name: 'The Wayfinder', glyph: 'wayfinder' },
  { id: 'nibiru-end', name: 'The Nibiru', glyph: 'nibiru-symbol' }
];

const AdvertiserScroll = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasActiveAdvertisers] = useState(advertisers.length > 0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading check
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (scrollRef.current) {
        e.preventDefault();
        scrollRef.current.scrollLeft += e.deltaY;
      }
    };

    const element = scrollRef.current;
    if (element) {
      element.addEventListener('wheel', handleWheel, { passive: false });
      return () => element.removeEventListener('wheel', handleWheel);
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (isLoading) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-black/30 backdrop-blur-sm border-t border-gray-800/30" />
    );
  }

  if (!hasActiveAdvertisers) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-black/10 backdrop-blur-sm border-t border-gray-800/30" />
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-md border-t border-gray-800/30">
      <div 
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide py-4 px-4 select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="flex items-center justify-start space-x-8 min-w-max px-4">
          {advertisers.map((advertiser) => (
            <div
              key={advertiser.id}
              className="flex flex-col items-center justify-center space-y-2 group cursor-pointer"
            >
              <div 
                className="relative w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center
                          border border-gray-700/50 backdrop-blur-sm overflow-hidden
                          group-hover:border-indigo-500/50 group-hover:bg-gray-800/70
                          transition-all duration-300"
              >
                <ThematicGlyph
                  glyph={advertiser.glyph}
                  size={32}
                  fallbackSize={24}
                />
              </div>
              <span className="text-sm text-gray-400 group-hover:text-gray-200
                             transition-colors duration-300 whitespace-nowrap">
                {advertiser.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvertiserScroll; 