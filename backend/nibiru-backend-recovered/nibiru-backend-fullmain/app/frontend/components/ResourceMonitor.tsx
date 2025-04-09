import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ResourceMetrics {
  cpu: {
    current: number;
    average: number;
    peak: number;
    history: number[];
  };
  memory: {
    current: number;
    average: number;
    peak: number;
    history: number[];
  };
  io: {
    read_total: number;
    write_total: number;
  };
  network: {
    sent_total: number;
    recv_total: number;
  };
}

interface ResourceEvent {
  type: 'cpu_peak' | 'memory_peak' | 'throttling' | 'error';
  timestamp: string;
  details: Record<string, any>;
}

interface ResourceMonitorProps {
  jobId: string;
}

const ResourceMonitor: React.FC<ResourceMonitorProps> = ({ jobId }) => {
  const [timeLabels, setTimeLabels] = useState<string[]>([]);

  const { data: metrics, isLoading } = useQuery<{
    metrics: ResourceMetrics;
    events: ResourceEvent[];
  }>({
    queryKey: ['resourceMetrics', jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}/metrics`);
      if (!response.ok) {
        throw new Error('Failed to fetch resource metrics');
      }
      return response.json();
    },
    refetchInterval: 1000, // Update every second
  });

  useEffect(() => {
    if (metrics?.metrics.cpu.history) {
      const labels = metrics.metrics.cpu.history.map((_, index) => {
        const date = new Date();
        date.setSeconds(date.getSeconds() - (metrics.metrics.cpu.history.length - index));
        return date.toLocaleTimeString();
      });
      setTimeLabels(labels);
    }
  }, [metrics?.metrics.cpu.history]);

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    animation: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const cpuChartData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'CPU Usage',
        data: metrics?.metrics.cpu.history || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const memoryChartData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Memory Usage',
        data: metrics?.metrics.memory.history || [],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Resource Usage
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            CPU Usage
          </h4>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics?.metrics.cpu.current.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Peak: {metrics?.metrics.cpu.peak.toFixed(1)}%
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Memory Usage
          </h4>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics?.metrics.memory.current.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Peak: {metrics?.metrics.memory.peak.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            CPU Usage Trend
          </h4>
          <div className="h-48">
            <Line options={chartOptions} data={cpuChartData} />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Memory Usage Trend
          </h4>
          <div className="h-48">
            <Line options={chartOptions} data={memoryChartData} />
          </div>
        </div>
      </div>

      {metrics?.events && metrics.events.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Recent Events
          </h4>
          <div className="space-y-2">
            {metrics.events.slice(-5).map((event, index) => (
              <div
                key={index}
                className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {event.type}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {Object.entries(event.details).map(([key, value]) => (
                    <div key={key}>
                      {key}: {value}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceMonitor; 