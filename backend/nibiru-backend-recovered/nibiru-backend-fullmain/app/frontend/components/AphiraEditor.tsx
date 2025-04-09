import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import Editor from '@monaco-editor/react';
import { debounce } from 'lodash';

interface AphiraEditorProps {
  userId: number;
}

interface JobStatus {
  job_id: string;
  status: 'pending' | 'compiling' | 'executing' | 'completed' | 'failed';
  progress: number;
  error_message: string | null;
  created_at: string;
  updated_at: string | null;
}

interface JobResults {
  job_id: string;
  status: string;
  results: any;
  logs: string[];
  error_message: string | null;
  completed_at: string | null;
}

interface LintResult {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  source: string;
}

interface GlyphInfo {
  name: string;
  description: string;
  parameters: string[];
  returnType: string;
  examples: string[];
}

const AphiraEditor: React.FC<AphiraEditorProps> = ({ userId }) => {
  const [code, setCode] = useState<string>('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [lintResults, setLintResults] = useState<LintResult[]>([]);
  const [glyphInfo, setGlyphInfo] = useState<GlyphInfo | null>(null);
  const [selectedBackend, setSelectedBackend] = useState<string>('qiskit');

  // Fetch glyph documentation
  const { data: glyphDocs } = useQuery<Record<string, GlyphInfo>>(
    ['glyph-docs'],
    () => api.get('/api/v1/aphira/glyphs').then(res => res.data),
    {
      staleTime: 3600000, // Cache for 1 hour
    }
  );

  // Lint code
  const lintCode = useCallback(
    debounce(async (codeToLint: string) => {
      try {
        const response = await api.post('/api/v1/aphira/lint', { code: codeToLint });
        setLintResults(response.data);
      } catch (error) {
        console.error('Failed to lint code:', error);
      }
    }, 500),
    []
  );

  // Get glyph info on hover
  const handleHover = useCallback(
    debounce(async (line: number, column: number) => {
      try {
        const response = await api.post('/api/v1/aphira/glyph-info', {
          code,
          line,
          column,
        });
        setGlyphInfo(response.data);
      } catch (error) {
        console.error('Failed to get glyph info:', error);
      }
    }, 100),
    [code]
  );

  // Submit code mutation
  const submitMutation = useMutation(
    async () => {
      const response = await api.post('/api/v1/aphira/submit-code', {
        code,
        backend: selectedBackend,
      });
      return response.data;
    }
  );

  // Get job status query
  const { data: jobStatus, isLoading: isLoadingStatus } = useQuery<JobStatus>(
    ['job-status', jobId],
    () => api.get(`/api/v1/aphira/execution-status/${jobId}`).then(res => res.data),
    {
      enabled: !!jobId && isPolling,
      refetchInterval: 2000,
    }
  );

  // Get job results query
  const { data: jobResults, isLoading: isLoadingResults } = useQuery<JobResults>(
    ['job-results', jobId],
    () => api.get(`/api/v1/aphira/execution-results/${jobId}`).then(res => res.data),
    {
      enabled: !!jobId && jobStatus?.status === 'completed',
    }
  );

  // Handle code changes
  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    lintCode(newCode);
  };

  // Handle code submission
  const handleSubmit = async () => {
    try {
      const result = await submitMutation.mutateAsync();
      setJobId(result.job_id);
      setIsPolling(true);
    } catch (error) {
      console.error('Failed to submit code:', error);
    }
  };

  // Stop polling when job is completed or failed
  useEffect(() => {
    if (jobStatus?.status === 'completed' || jobStatus?.status === 'failed') {
      setIsPolling(false);
    }
  }, [jobStatus?.status]);

  // Configure Monaco editor
  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on',
    folding: true,
    bracketPairColorization: {
      enabled: true,
    },
    glyphMargin: true,
    lineDecorationsWidth: 5,
    lineNumbersMinChars: 3,
    renderLineHighlight: 'all',
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
    },
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on',
    tabCompletion: 'on',
    wordBasedSuggestions: true,
    parameterHints: {
      enabled: true,
    },
    hover: {
      enabled: true,
      delay: 100,
      sticky: true,
    },
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true,
    },
    suggest: {
      showIcons: true,
      maxVisibleSuggestions: 12,
      filterGraceful: true,
    },
  };

  // Configure Monaco editor language features
  const beforeMount = (monaco: any) => {
    monaco.languages.register({ id: 'aphira' });
    monaco.languages.setMonarchTokensProvider('aphira', {
      defaultToken: '',
      tokenPostfix: '.aphira',
      ignoreCase: true,
      keywords: [
        'def', 'return', 'if', 'else', 'for', 'while', 'in', 'not', 'and', 'or',
        'True', 'False', 'None', 'import', 'from', 'as', 'class', 'try', 'except',
        'finally', 'raise', 'with', 'yield', 'break', 'continue', 'pass',
        'qiskit', 'cirq', 'pennylane', 'numpy', 'tensorflow', 'torch',
      ],
      operators: [
        '+', '-', '*', '/', '//', '%', '**', '==', '!=', '>', '<', '>=', '<=',
        '=', '+=', '-=', '*=', '/=', '//=', '%=', '**=', '&', '|', '^', '~',
        '<<', '>>', '&=', '|=', '^=', '~=', '<<=', '>>=',
      ],
      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      tokenizer: {
        root: [
          [/[a-zA-Z_]\w*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
          [/[0-9]+/, 'number'],
          [/[+\-*/=<>!&|^~%]/, 'operator'],
          [/[{}()\[\]]/, '@brackets'],
          [/[<>](?!@symbols)/, '@brackets'],
          [/@symbols/, { cases: { '@operators': 'operator', '@default': '' } }],
          [/\s+/, 'white'],
          [/[;:].*$/, 'comment'],
        ],
      },
    });

    // Register completion provider
    monaco.languages.registerCompletionItemProvider('aphira', {
      provideCompletionItems: () => {
        const suggestions = Object.entries(glyphDocs || {}).map(([name, info]) => ({
          label: name,
          kind: monaco.languages.CompletionItemKind.Function,
          documentation: {
            kind: 'markdown',
            value: `**${info.name}**\n\n${info.description}\n\n**Parameters:**\n${info.parameters.map(p => `- ${p}`).join('\n')}\n\n**Returns:**\n${info.returnType}\n\n**Examples:**\n\`\`\`\n${info.examples.join('\n')}\n\`\`\``,
          },
          insertText: name,
        }));

        return { suggestions };
      },
    });

    // Register hover provider
    monaco.languages.registerHoverProvider('aphira', {
      provideHover: (model: any, position: any) => {
        handleHover(position.lineNumber, position.column);
        if (glyphInfo) {
          return {
            contents: [
              {
                value: `**${glyphInfo.name}**\n\n${glyphInfo.description}\n\n**Parameters:**\n${glyphInfo.parameters.map(p => `- ${p}`).join('\n')}\n\n**Returns:**\n${glyphInfo.returnType}`,
              },
            ],
          };
        }
        return null;
      },
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          $aphira Code Editor
        </h3>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          {/* Backend Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Quantum Backend
            </label>
            <select
              value={selectedBackend}
              onChange={(e) => setSelectedBackend(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="qiskit">Qiskit</option>
              <option value="cirq">Cirq</option>
              <option value="pennylane">PennyLane</option>
              <option value="braket">Amazon Braket</option>
              <option value="ionq">IonQ</option>
              <option value="rigetti">Rigetti</option>
            </select>
          </div>

          {/* Code Editor */}
          <div className="mb-4">
            <Editor
              height="400px"
              defaultLanguage="aphira"
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
              beforeMount={beforeMount}
              options={editorOptions}
            />
          </div>

          {/* Linting Results */}
          {lintResults.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Linting Results
              </h4>
              <div className="space-y-2">
                {lintResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded ${
                      result.severity === 'error'
                        ? 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100'
                        : result.severity === 'warning'
                        ? 'bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-100'
                        : 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-100'
                    }`}
                  >
                    <p className="text-sm">
                      Line {result.line}, Column {result.column}: {result.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mb-4">
            <button
              onClick={handleSubmit}
              disabled={!code || submitMutation.isLoading || lintResults.some(r => r.severity === 'error')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitMutation.isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Submit Code'
              )}
            </button>
          </div>

          {/* Job Status */}
          {jobId && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Job Status
              </h4>
              {isLoadingStatus ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : jobStatus ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 dark:text-white">
                      Status: {jobStatus.status}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Progress: {jobStatus.progress}%
                    </span>
                  </div>
                  {jobStatus.error_message && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Error: {jobStatus.error_message}
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Job Results */}
          {jobId && jobStatus?.status === 'completed' && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Results
              </h4>
              {isLoadingResults ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : jobResults ? (
                <div className="space-y-4">
                  {/* Display results based on type */}
                  {jobResults.results && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <pre className="text-sm text-gray-900 dark:text-white overflow-auto">
                        {JSON.stringify(jobResults.results, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Display logs */}
                  {jobResults.logs && jobResults.logs.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Execution Logs
                      </h5>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <pre className="text-sm text-gray-900 dark:text-white overflow-auto">
                          {jobResults.logs.join('\n')}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AphiraEditor; 