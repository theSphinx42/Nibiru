import Image from 'next/image';
import { motion } from 'framer-motion';
import UserAvatar from './UserAvatar';
import ThematicGlyph from './ThematicGlyph';

interface ProfileHeaderProps {
  user: {
    name: string;
    bio?: string;
    avatar?: string;
    coverImage?: string;
  };
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const coverImage = user.coverImage || '/images/backgrounds/profile-cover.jpg';

  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80">
        <Image
          src={coverImage}
          alt="Profile cover"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
      </div>

      {/* Profile Info */}
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative -mt-24 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="relative">
              <UserAvatar
                src={user.avatar}
                alt={user.name}
                size={160}
              />
              <div className="absolute -bottom-2 -right-2">
                <ThematicGlyph
                  glyph="quantum-seal"
                  size={40}
                />
              </div>
            </div>

            <div className="text-center md:text-left text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {user.name}
              </h1>
              {user.bio && (
                <p className="text-gray-300 max-w-2xl">
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileHeader; 