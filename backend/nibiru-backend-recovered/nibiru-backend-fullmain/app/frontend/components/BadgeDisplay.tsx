import React from 'react';
import { BadgeType } from '../types/reputation';

interface Badge {
  id: number;
  badge_type: BadgeType;
  earned_at: string;
  metadata: Record<string, any>;
  is_featured: boolean;
}

interface BadgeDisplayProps {
  badges: Badge[];
  onBadgeClick?: (badge: Badge) => void;
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badges, onBadgeClick }) => {
  const featuredBadges = badges.filter(badge => badge.is_featured);
  const regularBadges = badges.filter(badge => !badge.is_featured);

  const getBadgeIcon = (badgeType: BadgeType) => {
    // Map badge types to their corresponding icons
    const iconMap: Record<BadgeType, string> = {
      PIONEER: '🎯',
      CONTRIBUTOR: '⭐',
      MASTER: '👑',
      GRANDMASTER: '🏆',
      ACTIVE_STREAK_7: '🔥',
      ACTIVE_STREAK_30: '⚡',
      ACTIVE_STREAK_90: '🌟',
      HIGH_SCORE_1000: '💫',
      HIGH_SCORE_5000: '✨',
      HIGH_SCORE_10000: '🌠',
      HELPER: '🤝',
      MENTOR: '👨‍🏫',
      EXPERT: '🎓',
      SELLER: '💰',
      TOP_SELLER: '💎',
      MARKETPLACE_LEADER: '🏅',
      INNOVATOR: '💡',
      COLLABORATOR: '🤝',
      TRENDING: '📈',
    };
    return iconMap[badgeType] || '🏆';
  };

  const getBadgeColor = (badgeType: BadgeType) => {
    // Map badge types to their corresponding colors
    const colorMap: Record<BadgeType, string> = {
      PIONEER: 'bg-blue-100 text-blue-800',
      CONTRIBUTOR: 'bg-green-100 text-green-800',
      MASTER: 'bg-purple-100 text-purple-800',
      GRANDMASTER: 'bg-yellow-100 text-yellow-800',
      ACTIVE_STREAK_7: 'bg-orange-100 text-orange-800',
      ACTIVE_STREAK_30: 'bg-red-100 text-red-800',
      ACTIVE_STREAK_90: 'bg-pink-100 text-pink-800',
      HIGH_SCORE_1000: 'bg-indigo-100 text-indigo-800',
      HIGH_SCORE_5000: 'bg-teal-100 text-teal-800',
      HIGH_SCORE_10000: 'bg-cyan-100 text-cyan-800',
      HELPER: 'bg-emerald-100 text-emerald-800',
      MENTOR: 'bg-violet-100 text-violet-800',
      EXPERT: 'bg-amber-100 text-amber-800',
      SELLER: 'bg-rose-100 text-rose-800',
      TOP_SELLER: 'bg-fuchsia-100 text-fuchsia-800',
      MARKETPLACE_LEADER: 'bg-sky-100 text-sky-800',
      INNOVATOR: 'bg-lime-100 text-lime-800',
      COLLABORATOR: 'bg-rose-100 text-rose-800',
      TRENDING: 'bg-cyan-100 text-cyan-800',
    };
    return colorMap[badgeType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Featured Badges */}
      {featuredBadges.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Featured Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredBadges.map((badge) => (
              <div
                key={badge.id}
                className={`flex flex-col items-center p-4 rounded-lg ${getBadgeColor(badge.badge_type)} cursor-pointer hover:scale-105 transition-transform`}
                onClick={() => onBadgeClick?.(badge)}
              >
                <span className="text-4xl mb-2">{getBadgeIcon(badge.badge_type)}</span>
                <span className="text-sm font-medium text-center">
                  {badge.badge_type.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(badge.earned_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Badges */}
      {regularBadges.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">All Achievements</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {regularBadges.map((badge) => (
              <div
                key={badge.id}
                className={`flex flex-col items-center p-3 rounded-lg ${getBadgeColor(badge.badge_type)} cursor-pointer hover:scale-105 transition-transform`}
                onClick={() => onBadgeClick?.(badge)}
              >
                <span className="text-2xl mb-1">{getBadgeIcon(badge.badge_type)}</span>
                <span className="text-xs font-medium text-center">
                  {badge.badge_type.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay; 