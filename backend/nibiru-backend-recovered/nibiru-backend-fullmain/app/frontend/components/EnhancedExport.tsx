import React, { useState } from 'react';
import { AnalyticsData, UserScoreCard } from '../types/analytics';

interface EnhancedExportProps {
  data: AnalyticsData;
  scoreCard: UserScoreCard;
  userId: string;
}

const EnhancedExport: React.FC<EnhancedExportProps> = ({ data, scoreCard, userId }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeGlyphs: true,
    includeProfile: true,
    includeVisuals: true,
  });

  const exportAsPDF = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/analytics/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          analytics_data: data,
          score_card: scoreCard,
          options: exportOptions,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${userId}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
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
          score_card: scoreCard,
          include_glyphs: exportOptions.includeGlyphs,
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

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Enhanced Export Options
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={exportOptions.includeGlyphs}
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                includeGlyphs: e.target.checked,
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Include Glyphs
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={exportOptions.includeProfile}
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                includeProfile: e.target.checked,
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Include Profile
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={exportOptions.includeVisuals}
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                includeVisuals: e.target.checked,
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Include Visuals
            </span>
          </label>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={exportAsPDF}
            disabled={isExporting}
            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ${
              isExporting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isExporting ? 'Generating...' : 'Export PDF'}
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

        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>PDF export includes:</p>
          <ul className="list-disc list-inside mt-1">
            <li>Analytics dashboard with all charts</li>
            <li>User scorecard and achievements</li>
            <li>Risk profile and recommendations</li>
            {exportOptions.includeGlyphs && <li>Personalized glyph renderings</li>}
            {exportOptions.includeProfile && <li>User profile and quote</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EnhancedExport; 