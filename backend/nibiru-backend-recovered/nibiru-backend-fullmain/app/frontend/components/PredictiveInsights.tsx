import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PredictiveInsights as PredictiveInsightsType } from '../types/analytics';

interface PredictiveInsightsProps {
  userId: string;
  backend?: string;
}

const PredictiveInsights: React.FC<PredictiveInsightsProps> = ({ userId, backend }) => {
  const { data: insights, isLoading } = useQuery(
    ['predictive-insights', userId, backend],
    () => fetch(`/api/analytics/predictive?user_id=${userId}${backend ? `&backend=${backend}` : ''}`)
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

  const data = insights as PredictiveInsightsType;

  return (
    <div className="space-y-6">
      {/* Failure Risk Assessment */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Failure Risk Assessment
        </h3>
        <div className="space-y-4">
          {data.failure_risk.map((risk) => (
            <div key={risk.backend} className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {risk.backend}
                </span>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {risk.factors.join(', ')}
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${risk.risk_score * 100}%`,
                      backgroundColor: getRiskColor(risk.risk_score),
                    }}
                  />
                </div>
                <span className="text-sm font-medium" style={{ color: getRiskColor(risk.risk_score) }}>
                  {Math.round(risk.risk_score * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Forecast */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Cost Forecast
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Weekly Forecast
            </h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${data.cost_forecast.weekly.toFixed(2)}
            </p>
            <div className="mt-2">
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${data.cost_forecast.confidence * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Confidence: {Math.round(data.cost_forecast.confidence * 100)}%
              </p>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Monthly Forecast
            </h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${data.cost_forecast.monthly.toFixed(2)}
            </p>
            <div className="mt-2">
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${data.cost_forecast.confidence * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Confidence: {Math.round(data.cost_forecast.confidence * 100)}%
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Factors Affecting Forecast
          </h4>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
            {data.cost_forecast.factors.map((factor, index) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

function getRiskColor(risk: number): string {
  if (risk < 0.3) return '#10B981'; // green
  if (risk < 0.6) return '#F59E0B'; // yellow
  if (risk < 0.8) return '#EF4444'; // red
  return '#7C3AED'; // purple
}

export default PredictiveInsights; 