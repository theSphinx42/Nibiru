import React from 'react';
import { formatCurrency } from '../utils/formatters';

interface UserStatsProps {
  marketplaceStats: {
    total_sales: number;
    total_revenue: number;
    rank: number | null;
    top_selling_items: Array<{
      id: number;
      name: string;
      sales: number;
      revenue: number;
    }>;
  };
  impactMetrics: {
    total_views: number;
    total_downloads: number;
    total_interactions: number;
    unique_users: number;
  };
  timeStats: {
    daily: { contributions: number; engagement: number };
    weekly: { contributions: number; engagement: number };
    monthly: { contributions: number; engagement: number };
    yearly: { contributions: number; engagement: number };
  };
}

const UserStats: React.FC<UserStatsProps> = ({
  marketplaceStats,
  impactMetrics,
  timeStats,
}) => {
  return (
    <div className="space-y-6">
      {/* Marketplace Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Marketplace Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat-card">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Total Sales</h3>
            <p className="text-2xl font-bold">{marketplaceStats.total_sales}</p>
          </div>
          <div className="stat-card">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</h3>
            <p className="text-2xl font-bold">{formatCurrency(marketplaceStats.total_revenue)}</p>
          </div>
          <div className="stat-card">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Marketplace Rank</h3>
            <p className="text-2xl font-bold">
              {marketplaceStats.rank ? `#${marketplaceStats.rank}` : 'Not Ranked'}
            </p>
          </div>
        </div>
        
        {/* Top Selling Items */}
        {marketplaceStats.top_selling_items.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Top Selling Items</h3>
            <div className="space-y-2">
              {marketplaceStats.top_selling_items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span>{item.name}</span>
                  <div className="text-sm text-gray-500">
                    {item.sales} sales • {formatCurrency(item.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Impact Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Impact Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Total Views</h3>
            <p className="text-2xl font-bold">{impactMetrics.total_views}</p>
          </div>
          <div className="stat-card">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Downloads</h3>
            <p className="text-2xl font-bold">{impactMetrics.total_downloads}</p>
          </div>
          <div className="stat-card">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Interactions</h3>
            <p className="text-2xl font-bold">{impactMetrics.total_interactions}</p>
          </div>
          <div className="stat-card">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Unique Users</h3>
            <p className="text-2xl font-bold">{impactMetrics.unique_users}</p>
          </div>
        </div>
      </div>

      {/* Time-based Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Activity Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Daily</h3>
            <p className="text-lg font-semibold">
              {timeStats.daily.contributions} contributions
            </p>
            <p className="text-sm text-gray-500">
              {timeStats.daily.engagement} engagements
            </p>
          </div>
          <div className="stat-card">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Weekly</h3>
            <p className="text-lg font-semibold">
              {timeStats.weekly.contributions} contributions
            </p>
            <p className="text-sm text-gray-500">
              {timeStats.weekly.engagement} engagements
            </p>
          </div>
          <div className="stat-card">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Monthly</h3>
            <p className="text-lg font-semibold">
              {timeStats.monthly.contributions} contributions
            </p>
            <p className="text-sm text-gray-500">
              {timeStats.monthly.engagement} engagements
            </p>
          </div>
          <div className="stat-card">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Yearly</h3>
            <p className="text-lg font-semibold">
              {timeStats.yearly.contributions} contributions
            </p>
            <p className="text-sm text-gray-500">
              {timeStats.yearly.engagement} engagements
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats; 