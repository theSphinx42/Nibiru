import { motion } from 'framer-motion';

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 2, bounce: 0 },
      opacity: { duration: 0.5 }
    }
  }
};

export const QuantumChartIcon = () => (
  <motion.svg
    initial="hidden"
    animate="visible"
    viewBox="0 0 50 50"
    className="w-full h-full"
    stroke="currentColor"
    fill="none"
  >
    <motion.circle cx="25" cy="25" r="20" variants={draw} strokeWidth="2" />
    <motion.path
      d="M15 25 H35 M25 15 V35"
      variants={draw}
      strokeWidth="2"
    />
    <motion.circle cx="25" cy="25" r="5" variants={draw} strokeWidth="2" />
  </motion.svg>
);

export const SigilCreatorIcon = () => (
  <motion.svg
    initial="hidden"
    animate="visible"
    viewBox="0 0 50 50"
    className="w-full h-full"
    stroke="currentColor"
    fill="none"
  >
    <motion.path
      d="M25 10 L40 40 L10 40 Z"
      variants={draw}
      strokeWidth="2"
    />
    <motion.circle cx="25" cy="25" r="5" variants={draw} strokeWidth="2" />
    <motion.path
      d="M25 10 V40"
      variants={draw}
      strokeWidth="2"
    />
  </motion.svg>
);

export const NetworkIcon = () => (
  <motion.svg
    initial="hidden"
    animate="visible"
    viewBox="0 0 50 50"
    className="w-full h-full"
    stroke="currentColor"
    fill="none"
  >
    <motion.circle cx="25" cy="25" r="5" variants={draw} strokeWidth="2" />
    <motion.circle cx="15" cy="15" r="3" variants={draw} strokeWidth="2" />
    <motion.circle cx="35" cy="15" r="3" variants={draw} strokeWidth="2" />
    <motion.circle cx="15" cy="35" r="3" variants={draw} strokeWidth="2" />
    <motion.circle cx="35" cy="35" r="3" variants={draw} strokeWidth="2" />
    <motion.path
      d="M25 25 L15 15 M25 25 L35 15 M25 25 L15 35 M25 25 L35 35"
      variants={draw}
      strokeWidth="2"
    />
  </motion.svg>
);

export const AutomationIcon = () => (
  <motion.svg
    initial="hidden"
    animate="visible"
    viewBox="0 0 50 50"
    className="w-full h-full"
    stroke="currentColor"
    fill="none"
  >
    <motion.path
      d="M10 25 C10 15 25 15 25 25 C25 35 40 35 40 25"
      variants={draw}
      strokeWidth="2"
    />
    <motion.circle cx="10" cy="25" r="3" variants={draw} strokeWidth="2" />
    <motion.circle cx="40" cy="25" r="3" variants={draw} strokeWidth="2" />
  </motion.svg>
);

export const QuantumScoreIcon = () => (
  <motion.div className="relative w-full h-full">
    <motion.div
      className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }}
    />
    <motion.div
      className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
      style={{ filter: 'blur(10px)' }}
      animate={{
        scale: [1.1, 1.3, 1.1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        delay: 0.5
      }}
    />
  </motion.div>
);

export const SearchIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" />
  </svg>
); 