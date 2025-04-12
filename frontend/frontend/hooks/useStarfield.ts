import { useState, useCallback } from 'react';

export const useStarfield = (initialEnabled = true) => {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);

  const toggleStarfield = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  const enableStarfield = useCallback(() => {
    setIsEnabled(true);
  }, []);

  const disableStarfield = useCallback(() => {
    setIsEnabled(false);
  }, []);

  return {
    isEnabled,
    toggleStarfield,
    enableStarfield,
    disableStarfield,
  };
}; 