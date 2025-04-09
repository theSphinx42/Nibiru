import React, { useState } from 'react';
import { AnalyticsData } from '../types/analytics';

interface AnalyticsExportProps {
  data: AnalyticsData;
  userId: string;
}

const AnalyticsExport: React.FC<AnalyticsExportProps> = ({ data, userId }) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportAsJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${userId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = () => {
    // Convert trends data to CSV
    const trendsCSV = Object.entries(data.trends)
      .map(([key, value]) => {
        const rows = value.dates.map((date, i) => [
          date,
          key,
          value.success_rates[i],
          value.total_jobs,
          value.success_count,
          value.failure_count,
        ]);
        return rows.map(row => row.join(',')).join('\n');
      })
      .join('\n');

    const headers = 'Date,Group,Success Rate,Total Jobs,Success Count,Failure Count\n';
    const blob = new Blob([headers + trendsCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${userId}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsProofStats = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/analytics/proofstats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          analytics_data: data,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate proofstats');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${userId}-${new Date().toISOString().split('T')[0]}.proofstats`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting proofstats:', error);
      alert('Failed to export proofstats. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadChartImage = (chartId: string) => {
    const canvas = document.getElementById(chartId) as HTMLCanvasElement;
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chartId}-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Export Analytics
      </h3>
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={exportAsJSON}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Export JSON
          </button>
          <button
            onClick={exportAsCSV}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={exportAsProofStats}
            disabled={isExporting}
            className={`px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors ${
              isExporting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isExporting ? 'Generating...' : 'Export .proofstats'}
          </button>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Download Chart Images
          </h4>
          <div className="flex space-x-4">
            <button
              onClick={() => downloadChartImage('success-trends')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Success Trends
            </button>
            <button
              onClick={() => downloadChartImage('cost-breakdown')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Cost Breakdown
            </button>
            <button
              onClick={() => downloadChartImage('retry-heatmap')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Retry Heatmap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsExport; 