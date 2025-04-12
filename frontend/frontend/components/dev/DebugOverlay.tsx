import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

interface PageComponent {
  name: string;
  testId: string;
  required: boolean;
}

interface RouteConfig {
  path: string;
  icon: string;
  label: string;
  requiresAuth: boolean;
  components: PageComponent[];
}

const routes: RouteConfig[] = [
  {
    path: '/',
    icon: '🧿',
    label: 'Landing',
    requiresAuth: false,
    components: [
      { name: 'WelcomeSection', testId: 'welcome-section', required: true },
      { name: 'Starfield', testId: 'starfield', required: true },
      { name: 'AuthButtons', testId: 'auth-buttons', required: true }
    ]
  },
  {
    path: '/marketplace',
    icon: '🛒',
    label: 'Marketplace',
    requiresAuth: false,
    components: [
      { name: 'ServiceGrid', testId: 'service-grid', required: true },
      { name: 'SearchBar', testId: 'search-bar', required: true },
      { name: 'CategoryFilter', testId: 'category-filter', required: true }
    ]
  },
  {
    path: '/dashboard',
    icon: '📊',
    label: 'Dashboard',
    requiresAuth: true,
    components: [
      { name: 'QuantumScore', testId: 'quantum-score', required: true },
      { name: 'MetricsGrid', testId: 'metrics-grid', required: true },
      { name: 'UserNav', testId: 'user-nav', required: true }
    ]
  },
  {
    path: '/sales',
    icon: '💸',
    label: 'Sales',
    requiresAuth: true,
    components: [
      { name: 'SalesMetrics', testId: 'sales-metrics', required: true },
      { name: 'TransactionHistory', testId: 'transaction-history', required: true }
    ]
  },
  {
    path: '/advertiser',
    icon: '📢',
    label: 'Advertiser',
    requiresAuth: false,
    components: [
      { name: 'AdvertiserDashboard', testId: 'advertiser-dashboard', required: true },
      { name: 'CampaignMetrics', testId: 'campaign-metrics', required: true }
    ]
  }
];

export const DebugOverlay = () => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [verificationResults, setVerificationResults] = useState<Map<string, boolean>>(new Map());
  const [lastChecked, setLastChecked] = useState<string>('');

  useEffect(() => {
    verifyCurrentPage();
  }, [router.pathname]);

  const verifyCurrentPage = () => {
    const currentRoute = routes.find(r => r.path === router.pathname);
    if (!currentRoute) return;

    const results = new Map<string, boolean>();
    let allComponentsPresent = true;

    currentRoute.components.forEach(component => {
      const isPresent = !!document.querySelector(`[data-testid="${component.testId}"]`);
      results.set(component.name, isPresent);
      
      if (component.required && !isPresent) {
        allComponentsPresent = false;
      }
    });

    setVerificationResults(results);
    setLastChecked(new Date().toLocaleTimeString());

    // Console output
    console.group(`🔍 Page Verification: ${currentRoute.label}`);
    console.log(`Time: ${lastChecked}`);
    console.log(`Path: ${router.pathname}`);
    results.forEach((isPresent, component) => {
      console.log(
        `${isPresent ? '✅' : '❌'} ${component}${isPresent ? ' rendered' : ' missing'}`
      );
    });
    console.groupEnd();

    return allComponentsPresent;
  };

  const handleNavigation = async (route: RouteConfig) => {
    if (route.requiresAuth && !localStorage.getItem('token')) {
      console.log('🔐 Auth required, simulating dev login...');
      await simulateDevLogin();
    }

    await router.push(route.path);
  };

  const simulateDevLogin = async () => {
    localStorage.setItem('token', 'dev-token');
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'Dev User',
      email: 'dev@nibiru.com',
      quantumScore: 1000
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-4 left-4 z-50"
    >
      <motion.div
        className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 
                   rounded-lg shadow-lg overflow-hidden"
        animate={{ width: isExpanded ? 'auto' : '40px' }}
      >
        {/* Header */}
        <div className="px-4 py-2 bg-purple-500/20 border-b border-gray-700 
                      flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-xs font-medium text-purple-300">
              Debug Console
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>

        {/* Navigation Links */}
        {isExpanded && (
          <div className="p-4 space-y-2">
            {routes.map((route) => (
              <motion.button
                key={route.path}
                onClick={() => handleNavigation(route)}
                className={`w-full px-3 py-2 rounded text-sm flex items-center
                  gap-2 transition-colors
                  ${router.pathname === route.path
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                whileHover={{ x: 4 }}
              >
                <span>{route.icon}</span>
                <span>{route.label}</span>
                {route.requiresAuth && (
                  <span className="ml-auto text-xs text-gray-500">🔐</span>
                )}
              </motion.button>
            ))}

            {/* Verification Results */}
            {verificationResults.size > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-400 mb-2">
                  Last checked: {lastChecked}
                </div>
                {Array.from(verificationResults).map(([component, isPresent]) => (
                  <div
                    key={component}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-gray-400">{component}</span>
                    <span className={isPresent ? 'text-green-400' : 'text-red-400'}>
                      {isPresent ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}; 