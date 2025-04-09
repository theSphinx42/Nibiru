import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UserScoreData {
  totalScore: number;
  ranks: {
    creativity: string;
    knowledge: string;
    wisdom: string;
    overall: string;
  };
  scores: {
    creativity: number;
    knowledge: number;
    wisdom: number;
  };
}

export function useUserScores() {
  const { data: session } = useSession();
  const [scoreData, setScoreData] = useState<UserScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    const fetchUserScores = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/user/scores');
        
        if (!response.ok) {
          throw new Error('Failed to fetch user scores');
        }
        
        const data = await response.json();
        setScoreData(data);
      } catch (err) {
        console.error('Error fetching user scores:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserScores();
  }, [session]);

  return {
    scoreData,
    isLoading,
    error,
    hasScore: !!scoreData?.totalScore
  };
} 