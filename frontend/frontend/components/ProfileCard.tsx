import React from 'react';
import { motion } from 'framer-motion';

interface ProfileCardProps {
  user: {
    name: string;
    image?: string; // Optional image
  };
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  return (
    <motion.div className="bg-gray-800/50 rounded-lg p-6">
      <img
        src={user.image || '/images/quantum-placeholder-3.png'} // Fallback for profile
        alt={user.name}
        className="w-full h-32 object-cover rounded-lg shadow-md"
      />
      <h3 className="text-xl font-semibold text-white mt-4">{user.name}</h3>
    </motion.div>
  );
};

export default ProfileCard; 