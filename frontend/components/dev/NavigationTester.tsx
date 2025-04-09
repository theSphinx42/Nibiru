import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

interface RouteTest {
  path: string;
  name: string;
  expectedComponents: string[];
  requiresAuth: boolean;
  status: 'pending' | 'success' | 'fail';
  error?: string;
}

export const NavigationTester = () => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [testResults, setTestResults] = useState<RouteTest[]>([]);

  const routes: RouteTest[] = [
    {
      path: '/',
      name: 'Landing',
      expectedComponents: ['WelcomeSection', 'Starfield'],
      requiresAuth: false,
      status: 'pending'
    },
    {
      path: '/marketplace',
      name: 'Marketplace',
      expectedComponents: ['ServiceCard', 'SearchBar', 'Layout'],
      requiresAuth: false,
      status: 'pending'
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      expectedComponents: ['UserMetrics', 'QuantumScore', 'Layout'],
      requiresAuth: true,
      status: 'pending'
    },
    {
      path: '/glyph',
      name: 'Spirit Glyph',
      expectedComponents: ['GlyphViewer', 'Layout'],
      requiresAuth: false,
      status: 'pending'
    }
  ];

  const verifyComponentMount = (componentNames: string[]): boolean => {
    // Get all rendered components in the current page
    const renderedElements = document.querySelectorAll('[data-testid]');
    const renderedComponents = Array.from(renderedElements).map(el => 
      el.getAttribute('data-testid')
    );

    return componentNames.every(name => 
      renderedComponents.includes(name)
    );
  };

  const runTest = async (route: RouteTest) => {
    setCurrentTest(route.name);
    
    try {
      // If route requires auth and we're not authenticated, simulate login
      if (route.requiresAuth && !localStorage.getItem('token')) {
        await simulateDevLogin();
      }

      // Navigate to route
      await router.push(route.path);

      // Wait for navigation and component mounting
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify components mounted correctly
      const componentsVerified = verifyComponentMount(route.expectedComponents);

      if (!componentsVerified) {
        throw new Error(`Expected components not found: ${route.expectedComponents.join(', ')}`);
      }

      // Update test results
      setTestResults(prev => prev.map(t => 
        t.path === route.path 
          ? { ...t, status: 'success' }
          : t
      ));

      console.log(`✅ ${route.name} navigation test passed`);
    } catch (error) {
      setTestResults(prev => prev.map(t => 
        t.path === route.path 
          ? { ...t, status: 'fail', error: error instanceof Error ? error.message : 'Unknown error' }
          : t
      ));

      console.error(`❌ ${route.name} navigation test failed:`, error);
    }
  };

  const simulateDevLogin = async () => {
    localStorage.setItem('token', 'dev-token');
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'Test User',
      email: 'test@nibiru.com',
      quantumScore: 1000
    }));
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults(routes);

    for (const route of routes) {
      await runTest(route);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Delay between tests
    }

    setIsRunning(false);
    setCurrentTest('');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 right-4 z-50"
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
                Navigation Tester
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isExpanded ? '−' : '+'}
            </button>
          </div>

          {/* Test Controls */}
          {isExpanded && (
            <div className="p-4 space-y-4">
              <button
                onClick={runAllTests}
                disabled={isRunning}
                className={`w-full py-2 rounded text-sm font-medium
                  ${isRunning 
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
              >
                {isRunning ? 'Testing...' : 'Run All Tests'}
              </button>

              {/* Test Results */}
              <div className="space-y-2">
                {testResults.map((test) => (
                  <div
                    key={test.path}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-400">{test.name}</span>
                    <span className={
                      test.status === 'success' ? 'text-green-400' :
                      test.status === 'fail' ? 'text-red-400' :
                      'text-gray-500'
                    }>
                      {test.status === 'success' ? '✓' :
                       test.status === 'fail' ? '✗' :
                       '○'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Current Test Indicator */}
              {currentTest && (
                <div className="text-xs text-gray-400">
                  Testing: {currentTest}...
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 