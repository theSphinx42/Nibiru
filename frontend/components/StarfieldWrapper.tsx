import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import RankedStarField from './RankedStarField';
import MinimalStarfield from './MinimalStarfield';
import Loader from './Loader';

/**
 * StarfieldWrapper
 * 
 * A component that displays the appropriate starfield background based on the route
 * and user rank. It supports different variants of starfields.
 */
const StarfieldWrapper: React.FC<{
  userRank?: number;
  isLoading?: boolean;
}> = ({ userRank = 1, isLoading = false }) => {
  const router = useRouter();
  const [activeVariant, setActiveVariant] = useState<string>('minimal');
  
  useEffect(() => {
    // Logic to determine which variant to show based on route
    if (router.pathname.startsWith('/auth')) {
      setActiveVariant('minimal');
    } else if (router.pathname === '/') {
      setActiveVariant('welcome');
    } else if (router.pathname.startsWith('/dashboard')) {
      setActiveVariant('dashboard');
    } else {
      setActiveVariant('standard');
    }
  }, [router.pathname]);
  
  if (isLoading) {
    return <Loader fullScreen />;
  }
  
  // Render the appropriate starfield variant
  switch (activeVariant) {
    case 'welcome':
      return <RankedStarField rank={userRank} mode="animated" />;
      
    case 'dashboard':
      return <RankedStarField rank={userRank} mode="ranked" />;
      
    case 'minimal':
      return <MinimalStarfield />;
      
    default:
      return <RankedStarField rank={userRank} mode="static" />;
  }
};

export default StarfieldWrapper; 