import React from 'react';
import UserStats from './UserStats';
import BadgeDisplay from './BadgeDisplay';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

interface CreatorDashboardProps {
  userId: number;
}

const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ userId }) => {
  // Fetch user stats
  const { data: stats, isLoading: statsLoading } = useQuery(
    ['userStats', userId],
    () => api.get(`/api/v1/reputation/stats?user_id=${userId}`).then(res => res.data)
  );

  // Fetch user badges
  const { data: badges, isLoading: badgesLoading } = useQuery(
    ['userBadges', userId],
    () => api.get(`/api/v1/reputation/users/${userId}/badges`).then(res => res.data)
  );

  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } = useQuery(
    ['recentActivity', userId],
    () => api.get(`/api/v1/reputation/users/${userId}/activity`).then(res => res.data)
  );

  if (statsLoading || badgesLoading || activityLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Creator Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Track your progress and achievements
        </p>
      </div>

      {/* Stats and Badges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Stats */}
        <div className="lg:col-span-2">
          <UserStats
            marketplaceStats={stats.marketplace_stats}
            impactMetrics={stats.impact_metrics}
            timeStats={stats.time_stats}
          />
        </div>

        {/* Badges */}
        <div className="lg:col-span-1">
          <BadgeDisplay
            badges={badges}
            onBadgeClick={(badge) => {
              // Handle badge click - could show detailed info in a modal
              console.log('Badge clicked:', badge);
            }}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity: any) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <span className="text-2xl">
                    {activity.type === 'contribution' ? '🎯' : '🤝'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
                {activity.points && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      +{activity.points} points
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Premium Features Section */}
      <div className="mt-8">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow p-6 text-white">
          <h2 className="text-xl font-semibold mb-2">Unlock Premium Features</h2>
          <p className="text-sm opacity-90 mb-4">
            Get access to advanced analytics, priority support, and exclusive badges
          </p>
          <button className="bg-white text-primary-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard; 