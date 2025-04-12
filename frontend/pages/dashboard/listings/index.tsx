import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import ListingsGrid from '../../../components/ListingsGrid';

// This is a simple redirect page
export default function ListingsIndexPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-indigo-500 rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-6">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">My Listings</h1>
        <div className="mb-6">
          <button 
            onClick={() => router.push('/dashboard/create')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-medium"
          >
            Create New Listing
          </button>
        </div>
        
        <ListingsGrid userOnly={true} />
      </div>
    </div>
  );
} 