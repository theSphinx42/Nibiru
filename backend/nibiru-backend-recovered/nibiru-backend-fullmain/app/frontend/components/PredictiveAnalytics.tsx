import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

interface PredictiveAnalyticsProps {
  userId: string;
  scriptId?: string;
  backend?: string;
}

interface PredictionData {
  time_of_day: {
    hour: number;
    success_rate: number;
  }[];
  backend_health: {
    backend: string;
    health_score: number;
    trend: number[];
  }[];
  user_history: {
    date: string;
    success_rate: number;
  }[];
  suggestions: {
    best_time: string;
    recommended_backend: string;
    confidence: number;
    reasoning: string[];
  };
}

const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({
  userId,
  scriptId,
  backend,
}) => {
  const { data: predictions, isLoading } = useQuery(
    ['predictive-analytics', userId, scriptId, backend],
    () => fetch(
      `/api/analytics/predictions?user_id=${userId}${
        scriptId ? `&script_id=${scriptId}` : ''
      }${backend ? `&backend=${backend}` : ''}`
    ).then(res => res.json())
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

  const data = predictions as PredictionData;

  return (
    <div className="space-y-6">
      {/* Success Prediction Curve */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Success Rate Prediction
        </h3>
        <div className="h-64">
          <Line
            data={{
              labels: data.time_of_day.map(d => `${d.hour}:00`),
              datasets: [
                {
                  label: 'Predicted Success Rate',
                  data: data.time_of_day.map(d => d.success_rate),
                  borderColor: 'rgb(75, 192, 192)',
                  tension: 0.4,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                },
              },
            }}
          />
        </div>
      </div>

      {/* Backend Health Trends */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Backend Health Trends
        </h3>
        <div className="space-y-4">
          {data.backend_health.map((health) => (
            <div key={health.backend} className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {health.backend}
                </span>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Health Score: {health.health_score.toFixed(1)}
                </div>
              </div>
              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${health.health_score * 100}%`,
                    backgroundColor: getHealthColor(health.health_score),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions Box */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Recommendations
        </h3>
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Best Time to Run
            </h4>
            <p className="text-blue-800 dark:text-blue-200">
              {format(new Date(data.suggestions.best_time), 'h:mm a')} -{' '}
              {Math.round(data.suggestions.confidence * 100)}% confidence
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
              Recommended Backend
            </h4>
            <p className="text-green-800 dark:text-green-200">
              {data.suggestions.recommended_backend}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Reasoning
            </h4>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
              {data.suggestions.reasoning.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

function getHealthColor(score: number): string {
  if (score >= 0.8) return '#10B981'; // green
  if (score >= 0.6) return '#F59E0B'; // yellow
  if (score >= 0.4) return '#EF4444'; // red
  return '#7C3AED'; // purple
}

export default PredictiveAnalytics; 