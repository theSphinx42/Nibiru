import { useEffect } from 'react';
import { useRouter } from 'next/router';

// This is a simple redirect page
export default function ListingsIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/listings');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Redirecting...</h2>
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-indigo-500 rounded-full mx-auto"></div>
      </div>
    </div>
  );
} 