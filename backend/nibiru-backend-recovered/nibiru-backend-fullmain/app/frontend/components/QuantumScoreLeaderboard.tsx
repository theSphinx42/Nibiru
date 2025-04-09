import React from 'react';
import { LeaderboardEntry } from '../types/analytics';

interface QuantumScoreLeaderboardProps {
  users: LeaderboardEntry[];
}

const QuantumScoreLeaderboard: React.FC<QuantumScoreLeaderboardProps> = ({ users }) => {
  if (!users?.length) return null;

  return (
    <div className="p-6 bg-gradient-to-b from-zinc-900 to-black text-gold-300 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold mb-4">🌟 Quantum Score Leaderboard</h2>
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.user_id}
            className="bg-black/60 border border-gold-500 text-gold-200 rounded-lg p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-xl font-bold w-6 text-right">
                  #{user.rank}
                </span>
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <div className="flex space-x-1">
                    {user.medals.map((medal, index) => (
                      <span
                        key={index}
                        className="text-sm"
                        title={medal}
                      >
                        {getMedalEmoji(medal)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-mono">{user.quantum_score.toFixed(2)}</p>
                <p className="text-xs text-gold-500">
                  {user.total_jobs} jobs • {user.success_rate.toFixed(1)}% success
                </p>
              </div>
            </div>
          </div>
        ))}
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

export default QuantumScoreLeaderboard; 