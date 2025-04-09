import { motion } from 'framer-motion';
import Image from 'next/image';

const AdvertiserLogos: React.FC = () => {
  const logos = [
    '/images/quantum-placeholder-2.png',
    '/images/quantum-placeholder-3.png',
    '/images/quantum-placeholder-4.png',
    // Add more logo paths as needed
  ];

  return (
    <div className="w-full overflow-hidden bg-gray-900/50 backdrop-blur-sm py-4">
      <motion.div
        className="flex space-x-8 whitespace-nowrap"
        animate={{
          x: [0, -1920], // Adjust based on total width of logos
        }}
        transition={{
          x: {
            repeat: Infinity,
            duration: 30,
            ease: "linear",
          },
        }}
      >
        {/* Double the logos to create seamless loop */}
        {[...logos, ...logos].map((logo, index) => (
          <div
            key={index}
            className="inline-block w-32 h-16 relative flex-shrink-0"
          >
            <Image
              src={logo}
              alt={`Advertiser ${index + 1}`}
              fill
              className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default AdvertiserLogos; 