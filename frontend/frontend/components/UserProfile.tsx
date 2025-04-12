import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User } from '../types/user';
import QuantumScore from './QuantumScore';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface UserProfileProps {
  user: User;
  onUpdate: (updatedUser: Partial<User>) => Promise<void>;
  className?: string;
}

const UserProfile = ({ user, onUpdate, className = '' }: UserProfileProps) => {
  const { user: currentUser, unfollowUser, followUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username,
    bio: user.bio || '',
    website: user.website || '',
    twitter: user.twitter || '',
    github: user.github || '',
  });
  
  const isCurrentUser = currentUser?.id === user.id;
  const isFollowing = currentUser?.following?.includes(user.id);
  const followerCount = user.followerCount || 0;
  
  // Mock data for followers - in a real app this would come from the API
  const [followers, setFollowers] = useState<User[]>([]);
  
  useEffect(() => {
    // Mock loading followers - in a real app, this would be an API call
    if (showFollowers) {
      // Generate some mock followers
      const mockFollowers = Array(followerCount || 3).fill(null).map((_, i) => ({
        id: `follower-${i}`,
        username: `user${i}`,
        email: `user${i}@example.com`,
        quantumScore: Math.floor(Math.random() * 1000),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: 'USER' as const,
        spiritGlyphTier: Math.floor(Math.random() * 5),
        hasPaidOnboardingFee: false,
        isNewsletterSubscriber: false,
        unlockedPremiumAccess: {},
      }));
      
      setFollowers(mockFollowers);
    }
  }, [showFollowers, followerCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdate(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };
  
  const handleFollow = async () => {
    try {
      // Use the Auth context functions for following/unfollowing
      if (isFollowing) {
        // Access unfollowUser from the auth context directly
        await unfollowUser(user.id);
      } else {
        // Access followUser from the auth context directly
        await followUser(user.id);
      }
      
      // Mock updating the following state
      const updatedUser = {
        ...user,
        followerCount: isFollowing ? (followerCount - 1) : (followerCount + 1)
      };
      
      await onUpdate(updatedUser);
    } catch (error) {
      toast.error('Failed to update follow status');
      console.error('Failed to follow/unfollow:', error);
    }
  };
  
  const toggleFollowersList = () => {
    if (isCurrentUser || followerCount > 0) {
      setShowFollowers(!showFollowers);
    }
  };

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 ${className}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <img
            src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`}
            alt={user.username}
            className="w-16 h-16 rounded-full ring-2 ring-blue-500/20"
          />
          <div>
            {isEditing ? (
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="bg-gray-700 rounded px-2 py-1 text-xl font-bold"
              />
            ) : (
              <h2 className="text-xl font-bold">{user.username}</h2>
            )}
            <p className="text-gray-400">Member since {new Date(user.createdAt).getFullYear()}</p>
            
            {/* Followers count - clickable for current user */}
            <button 
              onClick={toggleFollowersList}
              className={`text-sm ${followerCount > 0 || isCurrentUser ? 'text-blue-400 hover:text-blue-300' : 'text-gray-500'}`}
            >
              {followerCount} {followerCount === 1 ? 'Follower' : 'Followers'}
            </button>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <QuantumScore score={user.quantumScore} />
          
          {/* Follow button - only show if not current user */}
          {!isCurrentUser && (
            <button
              onClick={handleFollow}
              className={`px-3 py-1 text-sm rounded-full ${
                isFollowing 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>
      
      {/* Followers list modal */}
      {showFollowers && (
        <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-200">
              {isCurrentUser ? 'Your Followers' : `${user.username}'s Followers`}
            </h3>
            <button 
              onClick={() => setShowFollowers(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          
          {followers.length > 0 ? (
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {followers.map(follower => (
                <li key={follower.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={`https://api.dicebear.com/7.x/identicon/svg?seed=${follower.username}`}
                      alt={follower.username}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span>{follower.username}</span>
                  </div>
                  {isCurrentUser && (
                    <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">
                      Follow Back
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm italic">No followers yet</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Bio
          </label>
          {isEditing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg"
              rows={3}
            />
          ) : (
            <p className="text-gray-300">{formData.bio || 'No bio yet'}</p>
          )}
        </div>

        {/* Social Links */}
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Twitter
              </label>
              <input
                type="text"
                value={formData.twitter}
                onChange={(e) =>
                  setFormData({ ...formData, twitter: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                GitHub
              </label>
              <input
                type="text"
                value={formData.github}
                onChange={(e) =>
                  setFormData({ ...formData, github: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 rounded-lg"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {formData.website && (
              <a
                href={formData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-400 hover:text-blue-300"
              >
                🌐 Website
              </a>
            )}
            {formData.twitter && (
              <a
                href={`https://twitter.com/${formData.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-400 hover:text-blue-300"
              >
                🐦 Twitter
              </a>
            )}
            {formData.github && (
              <a
                href={`https://github.com/${formData.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-400 hover:text-blue-300"
              >
                📦 GitHub
              </a>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Save Changes
              </button>
            </>
          ) : (
            <>
              {isCurrentUser && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Edit Profile
                </button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserProfile; 