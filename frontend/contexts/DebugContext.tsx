import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface DebugState {
  isDebugMode: boolean;
  logs: DebugLog[];
  addLog: (log: Omit<DebugLog, 'timestamp'>) => void;
  clearLogs: () => void;
}

export interface DebugLog {
  type: 'api' | 'file' | 'listing' | 'error';
  message: string;
  data?: any;
  timestamp: Date;
}

const DebugContext = createContext<DebugState | undefined>(undefined);

export function DebugProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [logs, setLogs] = useState<DebugLog[]>([]);

  useEffect(() => {
    setIsDebugMode(router.query.debug === 'true');
  }, [router.query.debug]);

  const addLog = (log: Omit<DebugLog, 'timestamp'>) => {
    const newLog = { ...log, timestamp: new Date() };
    setLogs(prev => [newLog, ...prev]);
    
    // Also log to console with color coding
    const logStyle = {
      api: 'color: #4f46e5',
      file: 'color: #059669',
      listing: 'color: #0ea5e9',
      error: 'color: #dc2626',
    }[log.type];

    console.group(`%c[${log.type.toUpperCase()}] ${log.message}`, logStyle);
    if (log.data) console.log(log.data);
    console.groupEnd();
  };

  const clearLogs = () => setLogs([]);

  return (
    <DebugContext.Provider value={{ isDebugMode, logs, addLog, clearLogs }}>
      {children}
      {isDebugMode && (
        <div className="fixed bottom-4 right-4 max-w-lg max-h-[60vh] overflow-auto bg-gray-900/90 
                      border border-gray-700 rounded-lg shadow-xl p-4 text-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-300 font-medium">Debug Console</h3>
            <button
              onClick={clearLogs}
              className="text-gray-400 hover:text-gray-300"
            >
              Clear
            </button>
          </div>
          <div className="space-y-2">
            {logs.map((log, i) => (
              <div key={i} className="text-gray-400">
                <span className="text-xs opacity-50">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                <span className={`ml-2 ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'api' ? 'text-indigo-400' :
                  log.type === 'file' ? 'text-emerald-400' :
                  'text-blue-400'
                }`}>
                  [{log.type.toUpperCase()}]
                </span>
                <span className="ml-2">{log.message}</span>
                {log.data && (
                  <pre className="mt-1 text-xs bg-gray-800/50 p-2 rounded overflow-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </DebugContext.Provider>
  );
}

export function useDebug() {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
} 