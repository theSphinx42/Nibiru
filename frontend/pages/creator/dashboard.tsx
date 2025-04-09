import { useRouter } from 'next/router';
import { useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import CreatorDashboard from '../../components/CreatorDashboard';

const DashboardPage = () => {
  const router = useRouter();
  const userId = 1; // TODO: Get from auth context

  const handleEditListing = useCallback((listing: any) => {
    router.push(`/creator/listing/${listing.id}/edit`);
  }, [router]);

  const handleArchiveListing = useCallback(async (listingId: number) => {
    try {
      const response = await fetch(`/api/listings/archive/${listingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to archive listing');
      }

      // TODO: Show success toast
      router.reload();
    } catch (error) {
      console.error('Error archiving listing:', error);
      // TODO: Show error toast
    }
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Creator Dashboard</h1>
          <p className="mt-2 text-gray-400">
            Manage your marketplace listings and track performance
          </p>
        </div>

        <Link href="/creator/new-listing">
          <motion.a
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md
                     shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Create New Listing
          </motion.a>
        </Link>
      </div>

      <CreatorDashboard
        userId={userId}
        onEditListing={handleEditListing}
        onArchiveListing={handleArchiveListing}
      />
    </div>
  );
};

export default DashboardPage; 