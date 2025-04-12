import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserScoreCard as UserScoreCardType } from '../types/analytics';

interface UserScoreCardProps {
  userId: string;
}

const UserScoreCard: React.FC<UserScoreCardProps> = ({ userId }) => {
  const { data: scoreCard, isLoading } = useQuery(
    ['user-scorecard', userId],
    () => fetch(`/api/analytics/scorecard?user_id=${userId}`)
      .then(res => res.json())
  );

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  const data = scoreCard as UserScoreCardType;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            User Scorecard
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Rank #{data.rank}
          </p>
        </div>
        <div className="flex space-x-2">
          {data.medals.map((medal, index) => (
            <span
              key={index}
              className="text-2xl"
              title={medal}
            >
              {getMedalEmoji(medal)}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Jobs
          </h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.total_jobs}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Success Rate
          </h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.success_rate.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Quantum Score
        </h4>
        <div className="flex items-center">
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{
                width: `${(data.avg_quantum_score / 100) * 100}%`,
              }}
            />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {data.avg_quantum_score.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Glyph Affinity
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(data.glyph_affinity).map(([glyph, affinity]) => (
            <div key={glyph} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {glyph}
              </span>
              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className="h-full rounded-full bg-purple-500"
                  style={{
                    width: `${affinity * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Recent Achievements
        </h4>
        <ul className="space-y-2">
          {data.recent_achievements.map((achievement, index) => (
            <li
              key={index}
              className="flex items-center text-sm text-gray-600 dark:text-gray-300"
            >
              <span className="mr-2">🏆</span>
              {achievement}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

function getMedalEmoji(medal: string): string {
  const medalMap: Record<string, string> = {
    'gold': '🥇',
    'silver': '🥈',
    'bronze': '🥉',
    'platinum': '💎',
    'diamond': '💫',
    'master': '👑',
  };
  return medalMap[medal.toLowerCase()] || '🏅';
}

export default UserScoreCard; 