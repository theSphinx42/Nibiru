import { useState } from 'react';
import Image from 'next/image';

interface UserAvatarProps {
  src?: string;
  alt?: string;
  size?: number;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  src,
  alt = 'User avatar',
  size = 40 
}) => {
  const [imageError, setImageError] = useState(false);
  const defaultImage = '/images/quantum-placeholder-3.png';
  const actualSrc = imageError || !src ? defaultImage : src;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Image
        src={actualSrc}
        alt={alt}
        width={size}
        height={size}
        className="rounded-full object-cover"
        onError={() => setImageError(true)}
        priority
      />
    </div>
  );
};

export default UserAvatar; 