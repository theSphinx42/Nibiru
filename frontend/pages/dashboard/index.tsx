import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import ThematicGlyph from '../../components/ThematicGlyph';
import FloatingPanelSystem from '../../components/FloatingPanelSystem';
import UserProfileImage from '../../components/UserProfileImage';
import { useAuth } from '../../contexts/AuthContext';
import GlyphViewer from '../../components/GlyphViewer';
import { GlyphName, GlyphEffect } from '../../components/ThematicGlyph';
import Link from 'next/link';

interface DashboardStats {
  quantum_score: number;
  services_published: number;
  total_downloads: number;
  average_rating: number;
  weekly_stats: {
    views: number;
    interactions: number;
  };
  monthly_stats: {
    views: number;
    interactions: number;
  };
}

const USER_RANKS = [
  { min: 0, name: 'Newcomer', tier: 'basic' },
  { min: 100, name: 'Contributor', tier: 'basic' },
  { min: 250, name: 'Trusted', tier: 'enhanced' },
  { min: 500, name: 'Veteran', tier: 'enhanced' },
  { min: 1000, name: 'Expert', tier: 'premium' },
  { min: 2500, name: 'Master', tier: 'premium' },
  { min: 5000, name: 'Champion', tier: 'mythic' },
  { min: 10000, name: 'Legend', tier: 'mythic' }
];

// Get rank info based on points
function getUserRank(points: number) {
  for (let i = USER_RANKS.length - 1; i >= 0; i--) {
    if (points >= USER_RANKS[i].min) {
      return USER_RANKS[i];
    }
  }
  return USER_RANKS[0];
}

// Define slow pulse animation
const slowPulseAnimation = `
  @keyframes slowPulse {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.05); }
  }
  .slow-pulse {
    animation: slowPulse 4s ease-in-out infinite;
  }
  
  @keyframes slowGlow {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.2); }
  }
  .slow-glow {
    animation: slowGlow 5s ease-in-out infinite;
  }
  
  @keyframes dashboardGlow {
    0%, 100% { filter: brightness(1); opacity: 0.3; }
    50% { filter: brightness(1.3); opacity: 0.4; }
  }
  .dashboard-glow {
    animation: dashboardGlow 10s ease-in-out infinite;
  }
  
  /* Extra slow rotation for dashboard elements */
  .rotate-extra-slow {
    animation: spin 40s linear infinite;
  }
`;

// Create custom ultra-slow QuantumEffect for the dashboard
// This is 50% slower than the already slowed-down animations
const DASHBOARD_QUANTUM_EFFECT: GlyphEffect = 'quantum';

const Dashboard = () => {
  const router = useRouter();
  const { user, updateProfileImage } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    // Use user data from auth context for stats
    if (user) {
      // Extract properties safely from user
      const safeUser = {
        quantum_score: user.quantumScore || 0,
        services_published: user.services_published || 0,
        total_downloads: user.total_downloads || 0,
        average_rating: user.average_rating || 0,
        weekly_stats: {
          views: user.weekly_stats?.views || 0,
          interactions: user.weekly_stats?.interactions || 0
        },
        monthly_stats: {
          views: user.monthly_stats?.views || 0,
          interactions: user.monthly_stats?.interactions || 0
        }
      };
      
      // Set stats with the properly formatted object
      setStats(safeUser);
      setIsLoading(false);
    }
  }, [user]);

  const handleProfileImageChange = (image: File | string) => {
    // For simplicity, we're just storing the image URL in the auth context
    // In a real app, you'd upload the image to a server first
    if (typeof image === 'string') {
      updateProfileImage(image);
    }
  };

  // For demonstration, let's add some user points
  const userPoints = 5250; // Increased from 2750 to 5250 (Mythic rank)
  const userRank = getUserRank(userPoints);

  const StatCard = ({ title, value, statType }: { title: string; value: string | number; statType: string }) => {
    // Determine appropriate rank based on statType
    let cardRank: 'basic' | 'enhanced' | 'premium' | 'mythic' = 'basic';
    let glyphName: GlyphName;
    
    if (statType === 'quantum' && typeof value === 'number') {
      cardRank = value > 80 ? 'mythic' : value > 50 ? 'premium' : value > 20 ? 'enhanced' : 'basic';
      glyphName = 'quantum-seal';
    } else if (statType === 'rating' && typeof value === 'number') {
      cardRank = value >= 4.5 ? 'mythic' : value >= 3.5 ? 'premium' : value >= 2.5 ? 'enhanced' : 'basic';
      glyphName = 'wayfinder';
    } else if (statType === 'services' && typeof value === 'number') {
      cardRank = value >= 20 ? 'mythic' : value >= 10 ? 'premium' : value >= 5 ? 'enhanced' : 'basic';
      glyphName = 'sphinx';
    } else if (statType === 'downloads' && typeof value === 'number') {
      cardRank = value >= 1000 ? 'mythic' : value >= 500 ? 'premium' : value >= 100 ? 'enhanced' : 'basic';
      glyphName = 'triune';
    } else {
      glyphName = 'nibiru-symbol';
    }

    return (
      <motion.div
        className="relative bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm
                 border border-gray-700/30 overflow-hidden"
        whileHover={{ scale: 1.02 }}
      >
        <div className="relative z-10">
          <h3 className="text-lg font-medium text-gray-300">{title}</h3>
          <p className="text-4xl font-bold text-gray-100 mt-2">{value}</p>
        </div>
        {/* Static by default, animate only on hover/click */}
        <div className="absolute bottom-0 right-0 opacity-40 transform scale-110">
          <GlyphViewer
            glyph={glyphName}
            size={80}
            effect="none"
            isAnimated={false}
            dashboardMode={true}
            animateOnHover={true}
            animateOnClick={true}
          />
        </div>
        {/* Add an extra glow overlay with slower animation */}
        {(cardRank === 'mythic' || cardRank === 'premium') && (
          <div 
            className={`absolute inset-0 pointer-events-none ${cardRank === 'mythic' ? 'bg-purple-500/5' : 'bg-blue-500/5'} 
                      rounded-xl overflow-hidden`}
          >
            <div className={`absolute -inset-1 opacity-30 blur-xl ${cardRank === 'mythic' ? 'bg-purple-600' : 'bg-blue-600'}`}></div>
          </div>
        )}
      </motion.div>
    );
  };

  // Dashboard header component
  const DashboardHeader = ({ userPoints }: { userPoints: number }) => {
    const { user, updateProfileImage } = useAuth();
    const nickname = user?.displayName || 'Sphinx';
    
    // Helper functions for rank display
    const getRankColor = (points: number) => {
      return points >= 5000
        ? 'border-pink-500'
        : points >= 3000
          ? 'border-orange-500'
          : 'border-blue-500';
    };
    
    const getRankTitle = (points: number) => {
      return points >= 5000
        ? 'Mythic'
        : points >= 3000
          ? 'Champion'
          : 'Adept';
    };
    
    const handleProfileImageChange = (image: File | string) => {
      if (updateProfileImage && typeof image === 'string') {
        updateProfileImage(image);
      }
    };
    
    return (
      <div className="flex items-center mb-8">
        <div className="relative mr-6">
          <div 
            className={`rounded-full overflow-hidden border-2 ${
              getRankColor(userPoints)
            } p-1 w-32 h-32 relative`}
          >
            <UserProfileImage
              name={nickname}
              imageUrl={user?.profileImage}
              size={128}
              onImageChange={handleProfileImageChange}
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white text-xs rounded-full px-2 py-1 flex items-center animate-slow-pulse">
            <span className="mr-1">{userPoints}</span>
            <span>points</span>
          </div>
        </div>
        
        <div>
          <Link href="/profile" className="hover:text-indigo-300 transition-colors">
            <h1 className="text-3xl font-bold text-white mb-1">
              {nickname}
            </h1>
          </Link>
          <p className="text-gray-300 text-lg">
            {getRankTitle(userPoints)}
          </p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <GlyphViewer 
            glyph="quantum-seal"
            size={48} 
            effect="none" 
            isAnimated={false}
            dashboardMode={true}
            animateOnHover={true}
          />
          <span className="ml-4 text-gray-400">Loading dashboard...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Add the custom animation styles */}
      <style jsx global>{slowPulseAnimation}</style>
      
      <FloatingPanelSystem />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader userPoints={userPoints} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Quantum Score"
            value={stats?.quantum_score || 0}
            statType="quantum"
          />
          <StatCard
            title="Services Published"
            value={stats?.services_published || 0}
            statType="services"
          />
          <StatCard
            title="Total Downloads"
            value={stats?.total_downloads || 0}
            statType="downloads"
          />
          <StatCard
            title="Average Rating"
            value={(stats?.average_rating || 0).toFixed(1)}
            statType="rating"
          />
        </div>

        {/* Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly Performance */}
          <div className="bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm
                        border border-gray-700/30 relative overflow-hidden hover:bg-gray-800/40 hover:border-gray-600/40 transition-colors duration-300 cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full filter blur-xl opacity-50 -mr-10 -mt-10"></div>
            <h3 className="text-lg font-medium text-gray-300 mb-4 flex items-center">
              <span className="mr-2 w-2 h-2 bg-blue-400 rounded-full"></span>
              Weekly Performance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-700/30">
                <p className="text-sm text-gray-400">Views</p>
                <p className="text-2xl font-bold text-gray-100 mt-1">
                  {stats?.weekly_stats.views || 0}
                </p>
                <div className="h-1 w-full bg-gray-700 mt-2 rounded overflow-hidden">
                  <div className="h-full bg-blue-500 rounded" style={{ width: `${Math.min(100, (stats?.weekly_stats.views || 0) / 10)}%` }}></div>
                </div>
              </div>
              <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-700/30">
                <p className="text-sm text-gray-400">Interactions</p>
                <p className="text-2xl font-bold text-gray-100 mt-1">
                  {stats?.weekly_stats.interactions || 0}
                </p>
                <div className="h-1 w-full bg-gray-700 mt-2 rounded overflow-hidden">
                  <div className="h-full bg-purple-500 rounded" style={{ width: `${Math.min(100, (stats?.weekly_stats.interactions || 0) / 2)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Overview */}
     <div className="bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm border border-gray-700/30 relative overflow-hidden hover:bg-gray-800/40 hover:border-gray-600/40 transition-colors duration-300 cursor-pointer">

            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full filter blur-xl opacity-50 -mr-10 -mt-10"></div>
            <h3 className="text-lg font-medium text-gray-300 mb-4 flex items-center">
              <span className="mr-2 w-2 h-2 bg-purple-400 rounded-full"></span>
              Monthly Overview
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-700/30">
                <p className="text-sm text-gray-400">Views</p>
                <p className="text-2xl font-bold text-gray-100 mt-1">
                  {stats?.monthly_stats.views || 0}
                </p>
                <div className="h-1 w-full bg-gray-700 mt-2 rounded overflow-hidden">
                  <div className="h-full bg-blue-500 rounded" style={{ width: `${Math.min(100, (stats?.monthly_stats.views || 0) / 30)}%` }}></div>
                </div>
              </div>
              <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-700/30">
                <p className="text-sm text-gray-400">Interactions</p>
                <p className="text-2xl font-bold text-gray-100 mt-1">
                  {stats?.monthly_stats.interactions || 0}
                </p>
                <div className="h-1 w-full bg-gray-700 mt-2 rounded overflow-hidden">
                  <div className="h-full bg-purple-500 rounded" style={{ width: `${Math.min(100, (stats?.monthly_stats.interactions || 0) / 8)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard; 