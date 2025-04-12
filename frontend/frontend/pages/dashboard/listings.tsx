import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/Layout';
import { Listing, ListingStatus } from '../../types/listing';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatCurrency } from '../../utils/format';
import ThematicGlyph from '../../components/ThematicGlyph';
import { toast } from 'react-hot-toast';
import { useDebug } from '../../contexts/DebugContext';
import ListingDebugOverlay from '../../components/ListingDebugOverlay';
import Link from 'next/link';

const ListingsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { addLog } = useDebug();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/listings/me');
      
      addLog({
        type: 'api',
        message: 'Fetching listings',
        data: { endpoint: '/api/listings/me' }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      
      addLog({
        type: 'api',
        message: 'Listings fetched successfully',
        data: { count: data.length }
      });

      setListings(data);
      setError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load listings';
      
      addLog({
        type: 'error',
        message: 'Failed to fetch listings',
        data: { error: message }
      });

      toast.error(message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async (listingId: string) => {
    try {
      // Optimistic update
      setListings(prev => 
        prev.map(listing => 
          listing.id === listingId 
            ? { ...listing, status: ListingStatus.ARCHIVED }
            : listing
        )
      );

      const response = await fetch(`/api/listings/${listingId}/archive`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to archive listing');
      }

      toast.success('Listing archived successfully');
    } catch (err) {
      // Revert optimistic update
      await fetchListings();
      toast.error('Failed to archive listing');
    }
  };

  const handleDelete = async (listingId: string) => {
    try {
      addLog({
        type: 'listing',
        message: 'Deleting listing',
        data: { listingId }
      });

      // First, let's optimistically update the UI
      setListings(prev => prev.filter(l => l.id !== listingId));
      
      // Then make the actual API call
      const response = await fetch(`/api/listings/delete?id=${listingId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        // If deletion failed, revert the UI and show error
        await fetchListings(); // Refresh listings from the server
        throw new Error('Failed to delete listing');
      }

      addLog({
        type: 'listing',
        message: 'Listing deleted successfully',
        data: { listingId }
      });

      // Also log file cleanup
      addLog({
        type: 'file',
        message: 'Listing files cleaned up',
        data: { listingId }
      });

      toast.success('Listing deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete listing';
      
      addLog({
        type: 'error',
        message: 'Failed to delete listing',
        data: { error: message, listingId }
      });

      toast.error(message);
    }
  };

  const getStatusColor = (status: ListingStatus) => {
    switch (status) {
      case ListingStatus.ACTIVE:
        return 'bg-green-500';
      case ListingStatus.DRAFT:
        return 'bg-yellow-500';
      case ListingStatus.ARCHIVED:
        return 'bg-gray-500';
      case ListingStatus.TESTING:
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-200">My Listings</h1>
          <motion.button
            onClick={() => router.push('/dashboard/create')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Create New Listing
          </motion.button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <ThematicGlyph glyph="quantum-seal" size={48} effect="pulse" />
            <span className="ml-4 text-gray-400">Loading listings...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchListings}
              className="mt-4 text-indigo-400 hover:text-indigo-300"
            >
              Try Again
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No listings found. Create your first listing!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <div key={listing.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
                <ListingDebugOverlay listing={listing} />
                
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-200 mb-2">
                    <Link href={`/listings/${listing.id}`} className="hover:text-indigo-400 transition-colors">
                      {listing.title}
                    </Link>
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {listing.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">
                      ${typeof listing.price === 'number' ? listing.price.toFixed(2) : Number(listing.price).toFixed(2)}
                    </span>
                    <div className="space-x-2">
                      <button
                        onClick={() => router.push(`/dashboard/edit/${listing.id}`)}
                        className="px-3 py-1 bg-gray-700 text-gray-200 rounded hover:bg-gray-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ListingsPage; 