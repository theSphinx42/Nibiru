import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthProvider } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { AnimatePresence } from 'framer-motion';
import { DebugProvider } from '../contexts/DebugContext';
import { CartProvider } from '../contexts/CartContext';
import { SessionProvider } from 'next-auth/react';

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Force re-render on route change
  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo(0, 0); // Scroll to top on route change
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  useEffect(() => {
    const handleStart = (url: string) => {
      // Only show loading screen for page transitions, not for shallow routing
      if (url !== router.asPath) {
        setIsLoading(true);
      }
    };

    const handleComplete = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleError);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleError);
    };
  }, [router]);

  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <CartProvider>
          <DebugProvider>
            <AnimatePresence mode="wait">
              <Component {...pageProps} key={router.route} loading={isLoading} />
            </AnimatePresence>
          </DebugProvider>
        </CartProvider>
      </AuthProvider>
    </SessionProvider>
  );
} 