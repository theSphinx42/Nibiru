import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpiritGlyphViewer from './GlyphViewer';
import { formatPrice } from '../utils/format';

interface Listing {
  id: number;
  title: string;
  description: string;
  category: string;
  tier: 1 | 2 | 3;
  price: number;
  views: number;
  earnings: number;
  spiritglyph_id: string;
  visibility: string;
  created_at: string;
  updated_at: string;
}

interface CreatorDashboardProps {
  userId: number;
  onEditListing: (listing: Listing) => void;
  onArchiveListing: (listingId: number) => Promise<void>;
}

const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  userId,
  onEditListing,
  onArchiveListing,
}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Listing>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchListings();
  }, [userId]);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/listings/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch listings');
      const data = await response.json();
      setListings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: keyof Listing) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedListings = [...listings].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const modifier = sortDirection === 'asc' ? 1 : -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * modifier;
    }
    
    return ((aValue as number) - (bValue as number)) * modifier;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>Error: {error}</p>
        <button
          onClick={fetchListings}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <h3 className="text-sm font-medium text-gray-400">Active Listings</h3>
          <p className="mt-2 text-2xl font-semibold text-gray-100">
            {listings.filter(l => l.visibility === 'public').length}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <h3 className="text-sm font-medium text-gray-400">Total Views</h3>
          <p className="mt-2 text-2xl font-semibold text-gray-100">
            {listings.reduce((sum, l) => sum + l.views, 0)}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <h3 className="text-sm font-medium text-gray-400">Total Earnings</h3>
          <p className="mt-2 text-2xl font-semibold text-gray-100">
            {formatPrice(listings.reduce((sum, l) => sum + l.earnings, 0))}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <h3 className="text-sm font-medium text-gray-400">Average Rating</h3>
          <p className="mt-2 text-2xl font-semibold text-gray-100">
            4.8
          </p>
        </div>
      </div>

      {/* Listings Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Listing
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('created_at')}
              >
                Date
                {sortField === 'created_at' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('views')}
              >
                Views
                {sortField === 'views' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('earnings')}
              >
                Earnings
                {sortField === 'earnings' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900/50 divide-y divide-gray-800">
            <AnimatePresence>
              {sortedListings.map((listing) => (
                <motion.tr
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <SpiritGlyphViewer
                          seed={listing.spiritglyph_id}
                          size={40}
                          tier={listing.tier}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-200">{listing.title}</div>
                        <div className="text-sm text-gray-400">{listing.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {listing.views}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatPrice(listing.earnings)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEditListing(listing)}
                      className="text-indigo-400 hover:text-indigo-300 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onArchiveListing(listing.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Archive
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreatorDashboard; 