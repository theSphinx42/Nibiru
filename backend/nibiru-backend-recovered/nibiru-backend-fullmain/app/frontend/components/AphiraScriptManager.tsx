import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import AphiraEditor from './AphiraEditor';

interface Script {
  id: string;
  name: string;
  description: string;
  code: string;
  version: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  is_favorite: boolean;
  tags: string[];
}

interface Version {
  id: string;
  script_id: string;
  version: number;
  code: string;
  created_at: string;
  description: string;
}

interface AphiraScriptManagerProps {
  userId: number;
}

const AphiraScriptManager: React.FC<AphiraScriptManagerProps> = ({ userId }) => {
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newScriptName, setNewScriptName] = useState('');
  const [newScriptDescription, setNewScriptDescription] = useState('');
  const [newScriptTags, setNewScriptTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Fetch user's scripts
  const { data: scripts, isLoading: isLoadingScripts } = useQuery<Script[]>(
    ['scripts', userId],
    () => api.get(`/api/v1/aphira/scripts?user_id=${userId}`).then(res => res.data),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Fetch script versions
  const { data: versions, isLoading: isLoadingVersions } = useQuery<Version[]>(
    ['versions', selectedScript?.id],
    () => api.get(`/api/v1/aphira/scripts/${selectedScript?.id}/versions`).then(res => res.data),
    {
      enabled: !!selectedScript,
    }
  );

  // Create new script mutation
  const createScriptMutation = useMutation(
    async () => {
      const response = await api.post('/api/v1/aphira/scripts', {
        name: newScriptName,
        description: newScriptDescription,
        tags: newScriptTags.split(',').map(tag => tag.trim()).filter(Boolean),
        user_id: userId,
      });
      return response.data;
    }
  );

  // Update script mutation
  const updateScriptMutation = useMutation(
    async (script: Script) => {
      const response = await api.put(`/api/v1/aphira/scripts/${script.id}`, {
        name: script.name,
        description: script.description,
        tags: script.tags,
        is_favorite: script.is_favorite,
      });
      return response.data;
    }
  );

  // Create new version mutation
  const createVersionMutation = useMutation(
    async (code: string) => {
      if (!selectedScript) return null;
      const response = await api.post(`/api/v1/aphira/scripts/${selectedScript.id}/versions`, {
        code,
        description: 'New version',
      });
      return response.data;
    }
  );

  // Filter scripts based on search and tags
  const filteredScripts = scripts?.filter(script => {
    const matchesSearch = script.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         script.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.every(tag => script.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  // Handle script creation
  const handleCreateScript = async () => {
    try {
      const newScript = await createScriptMutation.mutateAsync();
      setSelectedScript(newScript);
      setIsCreatingNew(false);
      setNewScriptName('');
      setNewScriptDescription('');
      setNewScriptTags('');
    } catch (error) {
      console.error('Failed to create script:', error);
    }
  };

  // Handle script update
  const handleUpdateScript = async (script: Script) => {
    try {
      await updateScriptMutation.mutateAsync(script);
    } catch (error) {
      console.error('Failed to update script:', error);
    }
  };

  // Handle version creation
  const handleCreateVersion = async (code: string) => {
    try {
      const newVersion = await createVersionMutation.mutateAsync(code);
      if (newVersion) {
        setSelectedVersion(newVersion);
      }
    } catch (error) {
      console.error('Failed to create version:', error);
    }
  };

  // Get unique tags from all scripts
  const allTags = scripts?.reduce((tags: string[], script) => {
    script.tags.forEach(tag => {
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    });
    return tags;
  }, []) || [];

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Script Manager
        </h3>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          {/* Script List */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1 max-w-lg">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search scripts..."
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <button
                onClick={() => setIsCreatingNew(true)}
                className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                New Script
              </button>
            </div>

            {/* Tag Filters */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTags(prev =>
                        prev.includes(tag)
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedTags.includes(tag)
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Script List */}
            <div className="space-y-4">
              {isLoadingScripts ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : filteredScripts?.map(script => (
                <div
                  key={script.id}
                  className={`p-4 rounded-lg border ${
                    selectedScript?.id === script.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {script.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {script.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedScript(script)}
                        className="text-sm text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleUpdateScript({
                          ...script,
                          is_favorite: !script.is_favorite,
                        })}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        {script.is_favorite ? '★' : '☆'}
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {script.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Script Form */}
          {isCreatingNew && (
            <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Create New Script
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newScriptName}
                    onChange={(e) => setNewScriptName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    value={newScriptDescription}
                    onChange={(e) => setNewScriptDescription(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newScriptTags}
                    onChange={(e) => setNewScriptTags(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsCreatingNew(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateScript}
                    disabled={!newScriptName}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Script Editor */}
          {selectedScript && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedScript.name}
                </h4>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedVersion?.version || ''}
                    onChange={(e) => {
                      const version = versions?.find(v => v.version === parseInt(e.target.value));
                      setSelectedVersion(version || null);
                    }}
                    className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Latest Version</option>
                    {versions?.map(v => (
                      <option key={v.id} value={v.version}>
                        Version {v.version}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleCreateVersion(selectedVersion?.code || '')}
                    className="text-sm text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Save as New Version
                  </button>
                </div>
              </div>
              <AphiraEditor userId={userId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AphiraScriptManager; 