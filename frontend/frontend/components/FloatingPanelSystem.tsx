import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import ThematicGlyph from './ThematicGlyph';
import UserProfileImage from './UserProfileImage';
import { GlyphName } from '../types/glyph';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

interface PanelConfig {
  id: string;
  title: string;
  glyph: GlyphName;
  initialTop: number; // Vertical position when expanded
  minimizedIndex: number; // Position index when minimized (0 = top)
}

const PANEL_CONFIGS: PanelConfig[] = [
  {
    id: 'marketplace',
    title: 'Marketplace',
    glyph: 'sigil-of-creation',
    initialTop: 100,
    minimizedIndex: 0
  },
  {
    id: 'analytics',
    title: 'Analytics',
    glyph: 'quantum-seal',
    initialTop: 180,
    minimizedIndex: 1
  },
  {
    id: 'profile',
    title: 'Profile',
    glyph: 'saphira-was-here',
    initialTop: 260,
    minimizedIndex: 2
  },
  {
    id: 'integrations',
    title: 'Integrations',
    glyph: 'sigil-of-continuance',
    initialTop: 340,
    minimizedIndex: 3
  }
];

interface FloatingPanelProps {
  config: PanelConfig;
  isMinimized: boolean;
  onMinimize: () => void;
  children: React.ReactNode;
}

const FloatingPanel: React.FC<FloatingPanelProps> = ({
  config,
  isMinimized,
  onMinimize,
  children
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ top: config.initialTop, left: window.innerWidth - 360 });
  
  // Reset position when panel is minimized
  useEffect(() => {
    if (isMinimized) {
      setPosition({ top: config.initialTop, left: window.innerWidth - 360 });
    }
  }, [isMinimized, config.initialTop]);
  
  // If panel is minimized, render it in a fixed position
  if (isMinimized) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 24 + (config.minimizedIndex * 60),
          right: 16,
          width: 48,
          height: 48,
          zIndex: 1100
        }}
        data-panel-id={config.id}
      >
        <div className="bg-gray-800/90 backdrop-blur-md rounded-xl border border-indigo-500/20 overflow-hidden w-12 h-12">
          <div className="flex items-center justify-between p-2 bg-indigo-600/10">
            <div className="flex items-center space-x-2">
              <ThematicGlyph glyph={config.glyph} size={18} effect="pulse" />
            </div>
            <button
              onClick={onMinimize}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Otherwise, render the draggable panel
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={{
        top: -100,
        left: -100,
        right: window.innerWidth - 100,
        bottom: window.innerHeight - 100
      }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e, info) => {
        setIsDragging(false);
        setPosition({
          top: info.point.y,
          left: info.point.x
        });
      }}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        top: position.top,
        left: position.left,
        width: '320px',
        height: 'auto',
        zIndex: 900
      }}
      transition={{
        type: 'spring',
        damping: 20
      }}
      style={{ position: 'fixed' }}
      data-panel-id={config.id}
    >
      <div className="bg-gray-800/90 backdrop-blur-md rounded-xl border border-indigo-500/30 shadow-lg overflow-hidden w-full">
        <div className="flex items-center justify-between p-3 bg-indigo-600/20 border-b border-indigo-500/30">
          <div className="flex items-center space-x-2">
            <ThematicGlyph glyph={config.glyph} size={20} effect="glow" />
            <span className="text-sm font-medium text-gray-200">{config.title}</span>
          </div>
          <button
            onClick={onMinimize}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

const FloatingPanelSystem = () => {
  const router = useRouter();
  const { isAuthenticated, user, logout, updateProfileImage, updateDisplayName } = useAuth();
  
  // Add state for nickname
  const [nickname, setNickname] = useState<string>('');
  const [isEditingNickname, setIsEditingNickname] = useState<boolean>(false);
  
  // Initialize all panels as minimized by default
  const [minimizedPanels, setMinimizedPanels] = useState<Set<string>>(
    () => new Set(PANEL_CONFIGS.map(config => config.id))
  );

  // Initialize nickname from user data
  useEffect(() => {
    if (user) {
      // Use the displayName or username as the initial nickname
      setNickname(user.displayName || user.name || user.username || '');
    }
  }, [user]);

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  const toggleMinimize = (panelId: string) => {
    setMinimizedPanels(prev => {
      const next = new Set(prev);
      if (next.has(panelId)) {
        next.delete(panelId); // Maximize the panel
      } else {
        next.add(panelId); // Minimize the panel
      }
      return next;
    });
  };

  // This resets all panels to minimized state
  const resetAllPanels = () => {
    setMinimizedPanels(new Set(PANEL_CONFIGS.map(config => config.id)));
  };

  const handleLogout = () => {
    logout();
    router.push('/marketplace');
  };

  const handleProfileImageChange = (image: File | string) => {
    if (typeof image === 'string') {
      updateProfileImage(image);
    }
  };

  // Check if any panels are open
  const hasPanelsOpen = minimizedPanels.size < PANEL_CONFIGS.length;

  // Function to save nickname
  const saveNickname = () => {
    if (updateDisplayName && nickname.trim()) {
      updateDisplayName(nickname.trim());
    }
    setIsEditingNickname(false);
  };

  return (
    <>
      {/* Restore button - only appears when at least one panel is open */}
      {hasPanelsOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 24 + (PANEL_CONFIGS.length * 60),
            right: 16,
            zIndex: 1050
          }}
        >
          <button
            onClick={resetAllPanels}
            className="bg-gray-800/90 backdrop-blur-md rounded-xl border border-indigo-500/20 w-12 h-12 flex items-center justify-center hover:bg-gray-700/90 transition-colors"
            title="Restore all panels to default positions"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      )}

      {/* Marketplace Panel */}
      <FloatingPanel
        config={PANEL_CONFIGS[0]}
        isMinimized={minimizedPanels.has('marketplace')}
        onMinimize={() => toggleMinimize('marketplace')}
      >
        <div className="space-y-4">
          <motion.button
            onClick={() => router.push('/dashboard/create')}
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg 
                     hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl
                     flex items-center justify-center space-x-2 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ThematicGlyph 
              glyph="sigil-of-creation" 
              size={24} 
              effect="glow"
              className="group-hover:animate-spin-slow" 
            />
            <span className="text-lg">Create New Item</span>
          </motion.button>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-300">My Items</h3>
            <div className="space-y-2">
              {/* Add list of user's marketplace items here */}
              <motion.button
                onClick={() => router.push('/dashboard/my-items')}
                className="w-full px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg 
                         hover:bg-gray-700 transition-colors shadow-sm
                         flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span className="text-sm">View All Items</span>
              </motion.button>
            </div>
          </div>
        </div>
      </FloatingPanel>

      {/* Analytics Panel */}
      <FloatingPanel
        config={PANEL_CONFIGS[1]}
        isMinimized={minimizedPanels.has('analytics')}
        onMinimize={() => toggleMinimize('analytics')}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-300">Quick Stats</h3>
            {/* Add quick analytics stats here */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-700/30 p-2 rounded">
                <p className="text-gray-400">Quantum Score</p>
                <p className="text-xl font-bold text-white">{user.quantumScore || 0}</p>
              </div>
              <div className="bg-gray-700/30 p-2 rounded">
                <p className="text-gray-400">Downloads</p>
                <p className="text-xl font-bold text-white">{0}</p>
              </div>
            </div>
          </div>
        </div>
      </FloatingPanel>

      {/* Profile Panel */}
      <FloatingPanel
        config={PANEL_CONFIGS[2]}
        isMinimized={minimizedPanels.has('profile')}
        onMinimize={() => toggleMinimize('profile')}
      >
        <div className="space-y-4">
          <div className="flex flex-col items-center mb-4">
            <UserProfileImage 
              name={user.username || 'User'} 
              imageUrl={user.profileImage}
              size={80}
              onImageChange={handleProfileImageChange}
            />
            <Link href="/profile" className="hover:text-indigo-300 transition-colors">
              <h2 className="text-lg font-semibold text-gray-200 mt-2">
                {nickname || user.username || 'User'}
              </h2>
            </Link>
            <p className="text-sm text-gray-400">{user.email}</p>
            
            {/* Social stats */}
            <div className="mt-2 flex items-center justify-center space-x-4 text-sm">
              <div className="text-center">
                <span className="block text-indigo-400 font-semibold">{user.followerCount || 0}</span>
                <span className="text-gray-400">Followers</span>
              </div>
              <div className="text-center">
                <span className="block text-indigo-400 font-semibold">{user.following?.length || 0}</span>
                <span className="text-gray-400">Following</span>
              </div>
              <div className="text-center">
                <span className="block text-indigo-400 font-semibold">{user.quantumScore}</span>
                <span className="text-gray-400">Score</span>
              </div>
            </div>
            
            {/* Nickname editor */}
            <div className="mt-2 w-full">
              {isEditingNickname ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Enter nickname"
                    className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white w-full"
                  />
                  <button 
                    onClick={saveNickname}
                    className="bg-blue-500 hover:bg-blue-600 p-1 rounded text-xs text-white"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setIsEditingNickname(false)}
                    className="bg-gray-600 hover:bg-gray-700 p-1 rounded text-xs text-white"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsEditingNickname(true)}
                  className="text-blue-400 hover:text-blue-300 text-xs flex items-center mx-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Assign Nickname
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-300">
              <Link href="/profile" className="hover:text-indigo-300 transition-colors flex items-center">
                Account Settings
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </h3>
            <div className="text-sm text-gray-400">
              <div className="mb-2">
                <span className="font-medium text-gray-300">Username:</span> {user.username || 'User'}
              </div>
              <div className="mb-2">
                <span className="font-medium text-gray-300">Role:</span> {user.role || 'User'}
              </div>
              <div className="mb-2">
                <span className="font-medium text-gray-300">Member Since:</span> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
          
          <motion.button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg 
                     hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl
                     flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </motion.button>
        </div>
      </FloatingPanel>

      {/* Integrations Panel */}
      <FloatingPanel
        config={PANEL_CONFIGS[3]}
        isMinimized={minimizedPanels.has('integrations')}
        onMinimize={() => toggleMinimize('integrations')}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-300">External Links</h3>
            <div className="space-y-2">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                </svg>
                GitHub
              </a>
              <a 
                href="https://discord.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 00-.079.036c-.21.39-.444.885-.608 1.278a18.566 18.566 0 00-5.487 0 12.57 12.57 0 00-.617-1.278.077.077 0 00-.079-.036A19.496 19.496 0 003.677 4.492a.07.07 0 00-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 00.031.055 19.602 19.602 0 005.919 3.059.077.077 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 12.996 12.996 0 01-1.84-.883.077.077 0 01-.008-.128 11.526 11.526 0 00.978-.57.074.074 0 01.078-.01c3.927 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.307.2.647.39.978.57a.077.077 0 01.01.127 12.836 12.836 0 01-1.85.885.077.077 0 00-.041.106c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.029 19.498 19.498 0 005.92-3.059.077.077 0 00.032-.055c.5-5.177-.838-9.674-3.549-13.442a.061.061 0 00-.031-.029zM8.02 15.278c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" />
                </svg>
                Discord
              </a>
            </div>
          </div>
        </div>
      </FloatingPanel>
    </>
  );
};

export default FloatingPanelSystem; 