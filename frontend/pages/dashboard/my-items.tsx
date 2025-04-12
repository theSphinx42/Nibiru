import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import { FiPlus, FiPackage, FiShoppingBag, FiDownload, FiStar, FiEye, FiEdit, FiTrash2, FiAlertCircle, FiInbox } from 'react-icons/fi';
import { ListingStatus, ListingCategory } from '../../types/listing';
import ItemGlyph from '../../components/ItemGlyph';
import { GlyphImageKey } from '../../lib/glyphs';
import Image from 'next/image';

interface MyListing {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  downloads: number;
  status: string;
  quantum_score: number;
  created_at: string;
  is_visible: boolean;
  owner_email: string;
  creator_id: string;
  is_beer?: boolean;
  glyph?: GlyphImageKey;
  tier?: 'basic' | 'enhanced' | 'premium' | 'mythic';
  rank?: 'basic' | 'enhanced' | 'premium' | 'mythic';
  galatean?: boolean;
  thumbnail_url?: string;
}

const MyItemsPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [listings, setListings] = useState<MyListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyListings = async () => {
      // Wait for auth to be checked
      if (authLoading) return;

      // Redirect if not authenticated
      if (!isAuthenticated || !user) {
        router.push('/login?redirect=/dashboard/my-items');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // First try to get listings from API
        let data = [];
        
        try {
          const response = await fetch('/api/listings/me', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            data = await response.json();
            console.log('Fetched listings from API:', data);
          } else {
            throw new Error('Failed to fetch listings');
          }
        } catch (apiError) {
          console.log('API fetch failed, checking localStorage');
          
          // Try to get existing marketplace data first
          const marketplaceData = localStorage.getItem('marketplace_items');
          const userEmail = user?.email;
          
          if (marketplaceData && userEmail) {
            const allItems = JSON.parse(marketplaceData);
            data = allItems.filter((item: MyListing) => item.owner_email === userEmail);
            console.log('Using marketplace data:', data);
          }
          
          // If no marketplace data, use fallback mock data
          if (!data || data.length === 0) {
            console.log('No marketplace data, using fallback data');
            if (user) {
              data = [
                {
                  id: 'consciousness-mapper',
                  title: 'Consciousness Mapper',
                  description: 'Map and analyze consciousness patterns',
                  category: 'Analysis',
                  price: 499.00,
                  downloads: 567,
                  status: 'active',
                  quantum_score: 185,
                  created_at: new Date().toISOString(),
                  is_visible: true,
                  owner_email: user.email,
                  creator_id: user.id || '1',
                  is_beer: false,
                  tier: 'item' as 'basic' | 'enhanced' | 'premium' | 'mythic',
                  rank: 'mythic',
                  galatean: true
                },
                {
                  id: 'quantum-state-optimizer',
                  title: 'Quantum State Optimizer',
                  description: 'Optimize quantum states for maximum efficiency',
                  category: 'Optimization',
                  price: 299.00,
                  downloads: 789,
                  status: 'active',
                  quantum_score: 142,
                  created_at: new Date().toISOString(),
                  is_visible: true,
                  owner_email: user.email,
                  creator_id: user.id || '1',
                  is_beer: false,
                  glyph: 'aegis',
                  tier: 'item' as 'basic' | 'enhanced' | 'premium' | 'mythic',
                  rank: 'premium'
                },
                {
                  id: 'beer4',
                  title: 'Beer4',
                  description: '4th beer!',
                  category: 'Tools & Utilities',
                  price: 1.00,
                  downloads: 0,
                  status: 'testing',
                  quantum_score: 42,
                  created_at: new Date().toISOString(),
                  is_visible: true,
                  owner_email: user.email,
                  creator_id: user.id || '1',
                  is_beer: true,
                  glyph: 'wayfinder',
                  tier: 'item' as 'basic' | 'enhanced' | 'premium' | 'mythic',
                  rank: 'basic'
                },
                {
                  id: 'beer5',
                  title: 'Beer5',
                  description: 'More beer',
                  category: 'Tools & Utilities',
                  price: 1.00,
                  downloads: 0,
                  status: 'testing',
                  quantum_score: 42,
                  created_at: new Date().toISOString(),
                  is_visible: true,
                  owner_email: user.email,
                  creator_id: user.id || '1',
                  is_beer: true,
                  glyph: 'triune',
                  tier: 'item' as 'basic' | 'enhanced' | 'premium' | 'mythic',
                  rank: 'basic'
                },
                {
                  id: 'beer6',
                  title: 'Beer',
                  description: 'Beer6',
                  category: 'Tools & Utilities',
                  price: 0.00,
                  downloads: 0,
                  status: 'active',
                  quantum_score: 42,
                  created_at: new Date().toISOString(),
                  is_visible: true,
                  owner_email: user.email,
                  creator_id: user.id || '1',
                  is_beer: true,
                  glyph: 'seidr',
                  tier: 'item' as 'basic' | 'enhanced' | 'premium' | 'mythic',
                  rank: 'basic'
                },
                {
                  id: 'beer7',
                  title: 'Beer7',
                  description: 'another beer, we ride!',
                  category: 'Education',
                  price: 1.00,
                  downloads: 0,
                  status: 'active',
                  quantum_score: 42,
                  created_at: new Date().toISOString(),
                  is_visible: true,
                  owner_email: user.email,
                  creator_id: user.id || '1',
                  is_beer: true,
                  glyph: 'lion',
                  tier: 'item' as 'basic' | 'enhanced' | 'premium' | 'mythic',
                  rank: 'basic'
                }
              ];
            }
          }
        }
        
        // Save to localStorage for marketplace to access
        localStorage.setItem('user_listings', JSON.stringify(data));
        
        setListings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching your listings');
        console.error('Error fetching listings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyListings();
  }, [isAuthenticated, router, user, authLoading]);

  const handleEditItem = (id: string) => {
    console.log('Editing item:', id);
    router.push(`/dashboard/edit/${id}`);
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      // First try the API
      const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete item from API');
      }

      // If successful or if API fails, update local state
      setListings(prevListings => prevListings.filter(item => item.id !== id));
      
      // Also update localStorage
      const storedListings = JSON.parse(localStorage.getItem('user_listings') || '[]');
      const updatedListings = storedListings.filter((item: MyListing) => item.id !== id);
      localStorage.setItem('user_listings', JSON.stringify(updatedListings));

    } catch (err) {
      console.error('Error deleting item:', err);
      // Even if API fails, still update local state for demo
      setListings(prevListings => prevListings.filter(item => item.id !== id));
      
      // Update localStorage
      const storedListings = JSON.parse(localStorage.getItem('user_listings') || '[]');
      const updatedListings = storedListings.filter((item: MyListing) => item.id !== id);
      localStorage.setItem('user_listings', JSON.stringify(updatedListings));
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case ListingCategory.MODEL:
        return 'bg-purple-900/40 text-purple-300';
      case ListingCategory.PLUGIN:
        return 'bg-blue-900/40 text-blue-300';
      case ListingCategory.DATASET:
        return 'bg-green-900/40 text-green-300';
      case ListingCategory.TEMPLATE:
        return 'bg-yellow-900/40 text-yellow-300';
      default:
        return 'bg-gray-900/40 text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case ListingStatus.ACTIVE:
        return 'bg-green-900/40 text-green-300';
      case ListingStatus.DRAFT:
        return 'bg-yellow-900/40 text-yellow-300';
      case ListingStatus.ARCHIVED:
        return 'bg-red-900/40 text-red-300';
      case ListingStatus.TESTING:
        return 'bg-blue-900/40 text-blue-300';
      default:
        return 'bg-gray-900/40 text-gray-300';
    }
  };

  const getItemRank = (item: MyListing): 'basic' | 'enhanced' | 'premium' | 'mythic' => {
    if (item.rank) return item.rank;
    if (item.quantum_score >= 200) return 'mythic';
    if (item.quantum_score >= 100) return 'premium';
    if (item.quantum_score >= 50) return 'enhanced';
    return 'basic';
  };

  const formatPrice = (price: number | string | null | undefined) => {
    if (price === null || price === undefined) return '0.00';
    if (typeof price === 'string') return parseFloat(price).toFixed(2);
    return price.toFixed(2);
  };

  return (
    <Layout title="My Items - Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">My Items</h1>
            <p className="mt-2 text-gray-400">
              Manage your marketplace listings
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <motion.button
              onClick={() => router.push('/dashboard/create')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg 
                      flex items-center shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlus className="mr-2" />
              Create New Item
            </motion.button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-6 text-center">
            <FiAlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-300 mb-2">Error Loading Items</h3>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-12 text-center">
            <FiInbox className="h-16 w-16 text-gray-500 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-300 mb-3">No Items Yet</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              You haven't created any marketplace items yet. Create your first item to get started selling on the marketplace.
            </p>
            <Link 
              href="/dashboard/create"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg inline-flex items-center"
            >
              <FiPlus className="mr-2" />
              Create Your First Item
            </Link>
          </div>
        ) : (
          <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-2/5">
                      Item
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-24">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-32">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-24">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-24">
                      Downloads
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {listings.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 relative z-10">
                            <ItemGlyph
                              itemId={item.id}
                              itemName={item.title}
                              creatorId={item.creator_id || item.owner_email}
                              size={40}
                              complexity={item.quantum_score ? item.quantum_score / 100 : 0.6}
                              color={item.is_beer ? '#f59e0b' : '#6366f1'}
                              secondaryColor={item.is_beer ? '#fbbf24' : '#a5b4fc'}
                              animate={true}
                              className="opacity-90 hover:opacity-100 transition-opacity"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-200 truncate max-w-md">{item.title}</div>
                            <div className="text-sm text-gray-400 truncate max-w-md">{item.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        ${formatPrice(item.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {item.downloads}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-gray-800/50">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditItem(item.id)}
                            className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30 rounded-lg transition-colors"
                            title="Edit item"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete item"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/listings/${item.id}`}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-lg transition-colors inline-block"
                            title="View item"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyItemsPage; 