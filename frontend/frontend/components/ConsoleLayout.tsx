import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThematicGlyph from './ThematicGlyph';
import { useDebug } from '../contexts/DebugContext';
import { FiFileText, FiImage, FiSave, FiEye, FiLock, FiTrash2 } from 'react-icons/fi';

interface Message {
  id: string;
  from: 'claude' | 'saphira';
  to: 'claude' | 'saphira';
  status: 'sent' | 'received' | 'processing' | 'error';
  content: string;
  timestamp: Date;
  tags?: string[];
}

interface ConsoleLayoutProps {
  onClaudeSubmit: (prompt: string) => void;
  onSaphiraSubmit: (prompt: string) => void;
}

interface ListingWithGalatea extends Listing {
  id: string;
  title: string;
  description: string;
  category: ListingCategory;
  price: number;
  tier: number;
  isGalatea?: boolean;
  galateaTier?: number;
  hasSigil?: boolean;
  linkedDiscountEligible?: boolean;
  devLogs?: GalateaDevLog[];
  lastUpdated?: string;
  subscriberCount?: number;
  activationFeePaid?: boolean;
  activationDate?: string;
}

interface GalateaDevLog {
  id: string;
  title: string;
  content: string;
  mediaUrls?: string[];
  published: string;
  isPublic?: boolean;
}

interface GalateaDevLogEditorProps {
  listingId: string;
  onSave: (log: Partial<GalateaDevLog>) => Promise<void>;
  initialLog?: Partial<GalateaDevLog>;
}

const GalateaDevLogEditor: React.FC<GalateaDevLogEditorProps> = ({ 
  listingId, 
  onSave,
  initialLog = {}
}) => {
  const [title, setTitle] = useState(initialLog.title || '');
  const [content, setContent] = useState(initialLog.content || '');
  const [isPublic, setIsPublic] = useState(initialLog.isPublic || false);
  const [mediaUrls, setMediaUrls] = useState<string[]>(initialLog.mediaUrls || []);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    if (!title || !content) return;
    
    setIsSaving(true);
    try {
      await onSave({
        title,
        content,
        isPublic,
        mediaUrls,
        published: new Date().toISOString(),
      });
      
      // Clear form after save if it's a new log
      if (!initialLog.id) {
        setTitle('');
        setContent('');
        setMediaUrls([]);
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-medium text-teal-400">
        {initialLog.id ? 'Edit Update' : 'New Galatea Update'}
      </h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-200"
          placeholder="Update Title"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 min-h-[150px]"
          placeholder="Share your progress, insights, or development notes..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Media URLs</label>
        <div className="space-y-2">
          {mediaUrls.map((url, index) => (
            <div key={index} className="flex items-center">
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  const newUrls = [...mediaUrls];
                  newUrls[index] = e.target.value;
                  setMediaUrls(newUrls);
                }}
                className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-200"
              />
              <button
                onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== index))}
                className="ml-2 text-red-400 hover:text-red-300"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
          <button
            onClick={() => setMediaUrls([...mediaUrls, ''])}
            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center"
          >
            <FiImage className="mr-1" /> Add Media URL
          </button>
        </div>
      </div>
      
      <div className="flex items-center">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="hidden"
          />
          <div className={`w-10 h-5 ${isPublic ? 'bg-teal-600' : 'bg-gray-700'} rounded-full p-1 transition-colors duration-200 ease-in-out`}>
            <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${isPublic ? 'translate-x-5' : 'translate-x-0'}`}></div>
          </div>
          <span className="ml-3 text-sm text-gray-300">
            {isPublic ? (
              <span className="flex items-center"><FiEye className="mr-1" /> Public Update</span>
            ) : (
              <span className="flex items-center"><FiLock className="mr-1" /> Subscribers Only</span>
            )}
          </span>
        </label>
      </div>
      
      <div className="pt-2">
        <motion.button
          onClick={handleSave}
          disabled={isSaving || !title || !content}
          className={`px-4 py-2 rounded-lg flex items-center ${
            !title || !content ? 'bg-gray-700 text-gray-400' : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
          whileHover={title && content ? { scale: 1.02 } : {}}
          whileTap={title && content ? { scale: 0.98 } : {}}
        >
          {isSaving ? (
            <>
              <div className="mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <FiSave className="mr-2" />
              {initialLog.id ? 'Update' : 'Publish'}
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default function ConsoleLayout({ onClaudeSubmit, onSaphiraSubmit }: ConsoleLayoutProps) {
  const [claudePrompt, setClaudePrompt] = useState('');
  const [saphiraPrompt, setSaphiraPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'chronicle'>('pipeline');
  const { addLog } = useDebug();

  // Simulated shared memory pipeline
  const [sharedMemory, setSharedMemory] = useState<{
    id: string;
    from: 'claude' | 'saphira';
    to: 'claude' | 'saphira';
    status: 'sent' | 'received' | 'processing' | 'error';
    content: string;
  } | null>(null);

  const handleClaudeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claudePrompt.trim()) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      from: 'claude',
      to: 'saphira',
      status: 'sent',
      content: claudePrompt,
      timestamp: new Date(),
      tags: ['prompt', 'claude']
    };

    setMessages(prev => [newMessage, ...prev]);
    setSharedMemory({
      id: newMessage.id,
      from: 'claude',
      to: 'saphira',
      status: 'sent',
      content: claudePrompt
    });

    addLog({
      type: 'api',
      message: 'Claude prompt submitted',
      data: { prompt: claudePrompt }
    });

    onClaudeSubmit(claudePrompt);
    setClaudePrompt('');
  };

  const handleSaphiraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saphiraPrompt.trim()) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      from: 'saphira',
      to: 'claude',
      status: 'sent',
      content: saphiraPrompt,
      timestamp: new Date(),
      tags: ['prompt', 'saphira']
    };

    setMessages(prev => [newMessage, ...prev]);
    setSharedMemory({
      id: newMessage.id,
      from: 'saphira',
      to: 'claude',
      status: 'sent',
      content: saphiraPrompt
    });

    addLog({
      type: 'api',
      message: 'Saphira prompt submitted',
      data: { prompt: saphiraPrompt }
    });

    onSaphiraSubmit(saphiraPrompt);
    setSaphiraPrompt('');
  };

  const notifySubscribers = async (listingId, logId) => {
    // Find all subscribers with email notifications enabled
    // Send template email with log preview and link
  };

  return (
    <div className="h-screen bg-gray-900 text-gray-200">
      {/* Header */}
      <header className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ThematicGlyph
              glyph="sigil-of-continuance"
              size={32}
              description="Sigil of Continuance"
            />
            <h1 className="text-xl font-semibold">Claude x Saphira Console</h1>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'pipeline' ? 'bg-indigo-600' : 'bg-gray-800'
              }`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setActiveTab('chronicle')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'chronicle' ? 'bg-indigo-600' : 'bg-gray-800'
              }`}
            >
              Chronicle
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Panel (Claude) */}
        <div className="w-1/3 border-r border-gray-800 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <ThematicGlyph glyph="quantum-seal" size={24} />
            <h2 className="text-lg font-medium">Claude</h2>
          </div>
          <form onSubmit={handleClaudeSubmit} className="space-y-4">
            <textarea
              value={claudePrompt}
              onChange={(e) => setClaudePrompt(e.target.value)}
              placeholder="Type your prompt for Claude..."
              className="w-full h-48 bg-gray-800 border border-gray-700 rounded-lg p-3 
                       text-gray-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 text-white rounded-lg 
                       hover:bg-indigo-700 transition-colors"
            >
              Send to Pipeline
            </button>
          </form>
        </div>

        {/* Center Panel (Shared Memory) */}
        <div className="flex-1 p-4">
          <AnimatePresence mode="wait">
            {activeTab === 'pipeline' ? (
              <motion.div
                key="pipeline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <div className="bg-gray-800 rounded-lg p-4 h-full">
                  <h3 className="text-lg font-medium mb-4">Shared Memory Pipeline</h3>
                  {sharedMemory ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">ID:</span>
                        <span>{sharedMemory.id}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">From:</span>
                        <span className="capitalize">{sharedMemory.from}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">To:</span>
                        <span className="capitalize">{sharedMemory.to}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">Status:</span>
                        <span className="capitalize">{sharedMemory.status}</span>
                      </div>
                      <div className="mt-4">
                        <span className="text-gray-400">Content:</span>
                        <pre className="mt-2 bg-gray-900 p-4 rounded-lg overflow-auto">
                          {sharedMemory.content}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No active messages in pipeline
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chronicle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full overflow-auto"
              >
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="bg-gray-800 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <ThematicGlyph
                            glyph={message.from === 'claude' ? 'quantum-seal' : 'sigil-of-continuance'}
                            size={20}
                          />
                          <span className="capitalize">{message.from}</span>
                          <span className="text-gray-400">→</span>
                          <span className="capitalize">{message.to}</span>
                        </div>
                        <span className="text-sm text-gray-400">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <pre className="bg-gray-900 p-3 rounded-lg overflow-auto">
                        {message.content}
                      </pre>
                      {message.tags && (
                        <div className="mt-2 flex space-x-2">
                          {message.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-gray-700 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel (Saphira) */}
        <div className="w-1/3 border-l border-gray-800 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <ThematicGlyph glyph="sigil-of-continuance" size={24} />
            <h2 className="text-lg font-medium">Saphira</h2>
          </div>
          <form onSubmit={handleSaphiraSubmit} className="space-y-4">
            <textarea
              value={saphiraPrompt}
              onChange={(e) => setSaphiraPrompt(e.target.value)}
              placeholder="Type your prompt for Saphira..."
              className="w-full h-48 bg-gray-800 border border-gray-700 rounded-lg p-3 
                       text-gray-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 text-white rounded-lg 
                       hover:bg-indigo-700 transition-colors"
            >
              Send to Pipeline
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 