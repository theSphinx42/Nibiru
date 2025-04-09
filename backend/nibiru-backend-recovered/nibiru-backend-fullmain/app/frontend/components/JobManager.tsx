import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { formatDuration } from '../utils/formatters';
import { Line, Bar, Pie } from 'react-chartjs-2';
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
import ResourceMonitor from './ResourceMonitor';

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

interface Job {
  id: string;
  script_id: string;
  script_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  backend: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  duration: number | null;
  error_message: string | null;
  logs: string[];
  metrics: {
    memory_usage: number;
    cpu_usage: number;
    qubit_count: number;
    gate_count: number;
    error_rate: number;
  };
}

interface JobManagerProps {
  userId: number;
}

interface FilterOptions {
  status: string;
  backend: string;
  script: string;
  dateRange: {
    start: string;
    end: string;
  };
}

const JobManager: React.FC<JobManagerProps> = ({ userId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    status: '',
    backend: '',
    script: '',
    dateRange: {
      start: '',
      end: '',
    },
  });

  // Fetch jobs
  const { data: jobs, isLoading: isLoadingJobs } = useQuery<Job[]>(
    ['jobs', userId],
    () => api.get(`/api/v1/aphira/jobs?user_id=${userId}`).then(res => res.data),
    {
      refetchInterval: 5000, // Refresh every 5 seconds
    }
  );

  // Retry job mutation
  const retryJobMutation = useMutation(
    async (jobId: string) => {
      const response = await api.post(`/api/v1/aphira/jobs/${jobId}/retry`);
      return response.data;
    }
  );

  // Cancel job mutation
  const cancelJobMutation = useMutation(
    async (jobId: string) => {
      const response = await api.post(`/api/v1/aphira/jobs/${jobId}/cancel`);
      return response.data;
    }
  );

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    if (!jobs) return [];

    let filtered = [...jobs];

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(job => job.status === filters.status);
    }

    // Apply backend filter
    if (filters.backend) {
      filtered = filtered.filter(job => job.backend === filters.backend);
    }

    // Apply script filter
    if (filters.script) {
      filtered = filtered.filter(job => job.script_id === filters.script);
    }

    // Apply date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      filtered = filtered.filter(job => {
        const jobDate = new Date(job.created_at);
        return jobDate >= startDate && jobDate <= endDate;
      });
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.id.toLowerCase().includes(query) ||
        job.script_name.toLowerCase().includes(query) ||
        job.backend.toLowerCase().includes(query) ||
        (job.error_message?.toLowerCase().includes(query) ?? false)
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return filtered;
  }, [jobs, filters, searchQuery]);

  // Get unique scripts for filter
  const scripts = useMemo(() => {
    if (!jobs) return [];
    return Array.from(new Set(jobs.map(job => job.script_id)));
  }, [jobs]);

  // Get unique backends for filter
  const backends = useMemo(() => {
    if (!jobs) return [];
    return Array.from(new Set(jobs.map(job => job.backend)));
  }, [jobs]);

  // Prepare data for charts
  const chartData = useMemo(() => {
    if (!filteredJobs) return null;

    const timeLabels = filteredJobs.map(job => new Date(job.created_at).toLocaleString());
    const durations = filteredJobs.map(job => job.duration || 0);
    const memoryUsage = filteredJobs.map(job => job.metrics.memory_usage);
    const errorRates = filteredJobs.map(job => job.metrics.error_rate);

    const backendUsage = filteredJobs.reduce((acc, job) => {
      acc[job.backend] = (acc[job.backend] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      executionTime: {
        labels: timeLabels,
        datasets: [
          {
            label: 'Execution Duration (s)',
            data: durations,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
        ],
      },
      memoryUsage: {
        labels: timeLabels,
        datasets: [
          {
            label: 'Memory Usage (MB)',
            data: memoryUsage,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1,
          },
        ],
      },
      errorRates: {
        labels: timeLabels,
        datasets: [
          {
            label: 'Error Rate (%)',
            data: errorRates.map(rate => rate * 100),
            borderColor: 'rgb(255, 159, 64)',
            tension: 0.1,
          },
        ],
      },
      backendUsage: {
        labels: Object.keys(backendUsage),
        datasets: [
          {
            data: Object.values(backendUsage),
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(153, 102, 255)',
              'rgb(255, 159, 64)',
            ],
          },
        ],
      },
    };
  }, [filteredJobs]);

  if (isLoadingJobs) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Job Manager
          </h3>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            {/* Filters */}
            <div className="mb-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="running">Running</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Backend
                  </label>
                  <select
                    value={filters.backend}
                    onChange={(e) => setFilters({ ...filters, backend: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">All Backends</option>
                    {backends.map(backend => (
                      <option key={backend} value={backend}>
                        {backend}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Script
                  </label>
                  <select
                    value={filters.script}
                    onChange={(e) => setFilters({ ...filters, script: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">All Scripts</option>
                    {scripts.map(scriptId => (
                      <option key={scriptId} value={scriptId}>
                        {scriptId}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Search
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Search jobs..."
                  />
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, start: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, end: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Analytics Charts */}
            {chartData && (
              <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Execution Duration
                  </h4>
                  <Line
                    data={chartData.executionTime}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                      },
                    }}
                  />
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Memory Usage
                  </h4>
                  <Line
                    data={chartData.memoryUsage}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                      },
                    }}
                  />
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Error Rates
                  </h4>
                  <Line
                    data={chartData.errorRates}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                      },
                    }}
                  />
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Backend Usage
                  </h4>
                  <Pie
                    data={chartData.backendUsage}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {/* Job List */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                Jobs
              </h4>
              <div className="space-y-4">
                {filteredJobs.map(job => (
                  <div
                    key={job.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                          {job.script_name}
                        </h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Job ID: {job.id}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          job.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                            : job.status === 'failed'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                            : job.status === 'running'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                            : job.status === 'cancelled'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                        }`}>
                          {job.status}
                        </span>
                        {job.status === 'failed' && (
                          <button
                            onClick={() => retryJobMutation.mutate(job.id)}
                            disabled={retryJobMutation.isLoading}
                            className="text-sm text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            Retry
                          </button>
                        )}
                        {job.status === 'running' && (
                          <button
                            onClick={() => cancelJobMutation.mutate(job.id)}
                            disabled={cancelJobMutation.isLoading}
                            className="text-sm text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Backend</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {job.backend}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Created</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(job.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Duration</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {job.duration ? formatDuration(job.duration) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Memory Usage</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {job.metrics.memory_usage.toFixed(2)} MB
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">CPU Usage</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {job.metrics.cpu_usage.toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Error Rate</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {(job.metrics.error_rate * 100).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    {job.error_message && (
                      <div className="mt-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Error</span>
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {job.error_message}
                        </p>
                      </div>
                    )}
                    {job.logs && job.logs.length > 0 && (
                      <div className="mt-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Logs</span>
                        <pre className="mt-1 text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-32">
                          {job.logs.join('\n')}
                        </pre>
                      </div>
                    )}
                    <div className="mt-4">
                      <a
                        href={`/api/v1/aphira/jobs/${job.id}/glyphproof`}
                        className="text-sm text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download Glyphproof
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedJob && (
        <div className="mt-6">
          <ResourceMonitor jobId={selectedJob.id} />
        </div>
      )}
    </div>
  );
};

export default JobManager; 