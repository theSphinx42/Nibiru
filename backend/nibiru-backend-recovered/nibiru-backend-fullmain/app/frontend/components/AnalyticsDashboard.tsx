import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Line, Bar, Pie, Heatmap } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { AnalyticsData, TrendData, RetryStats } from '../types/analytics';
import PredictiveInsights from './PredictiveInsights';
import AnalyticsExport from './AnalyticsExport';
import UserScoreCard from './UserScoreCard';
import QuantumScoreLeaderboard from './QuantumScoreLeaderboard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsDashboardProps {
  userId: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ userId }) => {
  const [timeRange, setTimeRange] = useState(30);
  const [groupBy, setGroupBy] = useState('backend');
  const [selectedChart, setSelectedChart] = useState<string | null>(null);

  // Fetch analytics data
  const { data: trends, isLoading: isLoadingTrends } = useQuery(
    ['analytics', 'trends', timeRange, groupBy],
    () => fetch(`/api/analytics/trends?time_range=${timeRange}&group_by=${groupBy}`).then(res => res.json())
  );

  const { data: heatmap, isLoading: isLoadingHeatmap } = useQuery(
    ['analytics', 'heatmap', timeRange],
    () => fetch(`/api/analytics/retry-heatmap?time_range=${timeRange}`).then(res => res.json())
  );

  const { data: aggregate, isLoading: isLoadingAggregate } = useQuery(
    ['analytics', 'aggregate', timeRange],
    () => fetch(`/api/analytics/aggregate?time_range=${timeRange}`).then(res => res.json())
  );

  const { data: costs, isLoading: isLoadingCosts } = useQuery(
    ['analytics', 'costs', timeRange],
    () => fetch(`/api/analytics/costs?time_range=${timeRange}`).then(res => res.json())
  );

  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useQuery(
    ['analytics', 'leaderboard'],
    () => fetch('/api/analytics/leaderboard').then(res => res.json())
  );

  if (isLoadingTrends || isLoadingHeatmap || isLoadingAggregate || isLoadingCosts || isLoadingLeaderboard) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const analyticsData: AnalyticsData = {
    trends: trends || {},
    heatmap: heatmap || {},
    aggregate: aggregate || {
      total_jobs: 0,
      success_rate: 0,
      backend_usage: {},
      quantum_score: {
        average: 0,
        distribution: {
          excellent: 0,
          good: 0,
          fair: 0,
          poor: 0,
        },
      },
      cost_metrics: {
        total_cost: 0,
        by_backend: {},
        daily_costs: [],
      },
    },
    costs: costs || {
      total_cost: 0,
      by_backend: {},
      daily_costs: [],
    },
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics Dashboard
        </h2>
        <div className="flex space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="backend">By Backend</option>
            <option value="script">By Script</option>
            <option value="user">By User</option>
          </select>
        </div>
      </div>

      {/* User Scorecard and Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserScoreCard userId={userId} />
        <QuantumScoreLeaderboard users={leaderboard || []} />
      </div>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Jobs</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {analyticsData.aggregate.total_jobs}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {analyticsData.aggregate.success_rate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Quantum Score</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {analyticsData.aggregate.quantum_score.average.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cost</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${analyticsData.costs.total_cost.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Success/Failure Trends */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Success Rate Trends
        </h3>
        <div className="h-64">
          <Line
            id="success-trends"
            data={{
              labels: Object.values(analyticsData.trends)[0]?.dates || [],
              datasets: Object.entries(analyticsData.trends).map(([key, value]) => ({
                label: key,
                data: (value as TrendData).success_rates,
                borderColor: getRandomColor(),
                tension: 0.1,
              })),
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
              onClick: (event, elements) => {
                if (elements.length > 0) {
                  const datasetIndex = elements[0].datasetIndex;
                  const index = elements[0].index;
                  const label = Object.keys(analyticsData.trends)[datasetIndex];
                  setSelectedChart(`trend-${label}-${index}`);
                }
              },
            }}
          />
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Cost by Backend
          </h3>
          <div className="h-64">
            <Pie
              id="cost-breakdown"
              data={{
                labels: Object.keys(analyticsData.costs.by_backend),
                datasets: [
                  {
                    data: Object.values(analyticsData.costs.by_backend).map((b) => b.total),
                    backgroundColor: Object.keys(analyticsData.costs.by_backend).map(() => getRandomColor()),
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                onClick: (event, elements) => {
                  if (elements.length > 0) {
                    const index = elements[0].index;
                    const label = Object.keys(analyticsData.costs.by_backend)[index];
                    setSelectedChart(`cost-${label}`);
                  }
                },
              }}
            />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Daily Costs
          </h3>
          <div className="h-64">
            <Bar
              data={{
                labels: analyticsData.costs.daily_costs.map((d) => d.date),
                datasets: [
                  {
                    label: 'Gas Fees',
                    data: analyticsData.costs.daily_costs.map((d) => d.gas_fees),
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                  },
                  {
                    label: 'Backend Costs',
                    data: analyticsData.costs.daily_costs.map((d) => d.backend_costs),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    stacked: true,
                  },
                  y: {
                    stacked: true,
                  },
                },
                onClick: (event, elements) => {
                  if (elements.length > 0) {
                    const index = elements[0].index;
                    setSelectedChart(`daily-cost-${index}`);
                  }
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Retry Heatmap */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Retry Heatmap
        </h3>
        <div className="h-64">
          <Heatmap
            id="retry-heatmap"
            data={{
              labels: {
                x: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                y: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
              },
              datasets: [
                {
                  label: 'Retry Density',
                  data: Object.values(analyticsData.heatmap)[0]?.matrix || [],
                  backgroundColor: 'rgba(255, 99, 132, 0.5)',
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              onClick: (event, elements) => {
                if (elements.length > 0) {
                  const element = elements[0];
                  setSelectedChart(`heatmap-${element.index}-${element.datasetIndex}`);
                }
              },
            }}
          />
        </div>
        {Object.values(analyticsData.heatmap)[0] && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Retry Reasons
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries((Object.values(analyticsData.heatmap)[0] as RetryStats).retry_reasons).map(([reason, count]) => (
                <div key={reason} className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {reason}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    ({count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Predictive Insights */}
      <PredictiveInsights userId={userId} />

      {/* Export Options */}
      <AnalyticsExport data={analyticsData} userId={userId} />
    </div>
  );
};

// Helper function to generate random colors for charts
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export default AnalyticsDashboard; 