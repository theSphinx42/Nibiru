import { motion } from 'framer-motion';
import Link from 'next/link';
import SpiritGlyphViewer from './GlyphViewer';
import { generateAdvertiserSeed } from '../utils/glyphUtils';

const footerLinks = [
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Privacy', href: '/privacy' },
  { name: 'Terms', href: '/terms' },
];

const Footer = () => {
  // Create two sets of logos for seamless loop
  const logoSet = Array.from({ length: 12 });
  
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900/60 backdrop-blur-md border-t border-gray-800/50">
      {/* Partner Logos */}
      <div className="w-full overflow-hidden bg-gray-900/50 backdrop-blur-sm py-2 relative">
        {/* Left Logo Overlay */}
        <div className="absolute left-0 top-0 bottom-0 z-10 w-32 flex items-center justify-center bg-gradient-to-r from-gray-900 via-gray-900/95 to-transparent">
          <div className="w-[4.2rem] h-[4.2rem] rounded-full overflow-hidden bg-gray-800/50 flex items-center justify-center">
            <div className="w-[135%] h-[135%] relative">
              <img
                src="/images/nibiru-symbol.png"
                alt="Nibiru Logo"
                className="absolute inset-0 w-full h-full object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>
        </div>

        {/* Right Logo Overlay */}
        <div className="absolute right-0 top-0 bottom-0 z-10 w-32 flex items-center justify-center bg-gradient-to-l from-gray-900 via-gray-900/95 to-transparent">
          <div className="w-[4.2rem] h-[4.2rem] rounded-full overflow-hidden bg-gray-800/50 flex items-center justify-center">
            <div className="w-[135%] h-[135%] relative">
              <img
                src="/images/nibiru-symbol.png"
                alt="Nibiru Logo"
                className="absolute inset-0 w-full h-full object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>
        </div>

        <div className="flex">
          {/* First set of scrolling logos */}
          <motion.div
            className="flex space-x-4 whitespace-nowrap px-32"
            animate={{
              x: [0, -1920],
            }}
            transition={{
              x: {
                repeat: Infinity,
                duration: 150, // Slowed down by 20%
                ease: "linear",
                repeatType: "loop"
              },
            }}
          >
            {logoSet.map((_, index) => (
              <div
                key={index}
                className="inline-block w-16 h-16 relative flex-shrink-0 rounded-full overflow-hidden bg-gray-800/50 flex items-center justify-center"
              >
                {index % 3 === 0 || index % 3 === 1 ? (
                  <div className="w-[125%] h-[125%] relative">
                    <img
                      src={index % 3 === 0 ? "/images/lion.png" : "/images/nibiru-symbol.png"}
                      alt={`Partner ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-[125%] h-[125%] group">
                    <div className="filter grayscale hover:grayscale-0 transition-all duration-300">
                      <SpiritGlyphViewer
                        seed={generateAdvertiserSeed(`advertiser-${index}`, `Advertiser ${index}`)}
                        size={80}
                        tier={2}
                        className="scale-125"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </motion.div>

          {/* Second set of scrolling logos (exact duplicate for seamless loop) */}
          <motion.div
            className="flex space-x-4 whitespace-nowrap px-32"
            animate={{
              x: [-1920, -3840],
            }}
            transition={{
              x: {
                repeat: Infinity,
                duration: 150, // Slowed down by 20%
                ease: "linear",
                repeatType: "loop"
              },
            }}
          >
            {logoSet.map((_, index) => (
              <div
                key={`duplicate-${index}`}
                className="inline-block w-16 h-16 relative flex-shrink-0 rounded-full overflow-hidden bg-gray-800/50 flex items-center justify-center"
              >
                {index % 3 === 0 || index % 3 === 1 ? (
                  <div className="w-[125%] h-[125%] relative">
                    <img
                      src={index % 3 === 0 ? "/images/lion.png" : "/images/nibiru-symbol.png"}
                      alt={`Partner ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-[125%] h-[125%] group">
                    <div className="filter grayscale hover:grayscale-0 transition-all duration-300">
                      <SpiritGlyphViewer
                        seed={generateAdvertiserSeed(`advertiser-${index}`, `Advertiser ${index}`)}
                        size={80}
                        tier={2}
                        className="scale-125"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center space-x-6 py-3">
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 