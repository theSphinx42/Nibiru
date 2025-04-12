import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useTierAccess } from '../../hooks/useTierAccess';
import TierAccessPrompt from '../../components/TierAccessPrompt';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { FiShoppingCart, FiHeart, FiDownload, FiShare2, FiCheckCircle, FiUser, FiStar, FiBarChart2, FiClock, FiMessageCircle } from 'react-icons/fi';
import ItemGlyph from '../../components/ItemGlyph';
import { Listing, ListingCategory, ListingStatus } from '../../types/listing';
import { formatPrice } from '../../utils/format';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const ListingDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { addItem } = useCart();
  const { user, followUser, unfollowUser } = useAuth();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [suggestedListings, setSuggestedListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inCart, setInCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Tier access hooks for premium content
  const {
    checkAccess,
    showPrompt,
    tierInfo,
    isChecking,
    handleUpgrade,
    handleUseKey,
    handleWatchAd,
    closePrompt,
  } = useTierAccess({
    onUpgrade: () => router.push('/upgrade'),
    onUseKey: () => router.reload(),
    onWatchAd: () => router.reload(),
  });

  useEffect(() => {
    if (id) {
      fetchListing();
      fetchSuggestedListings();
      checkAccess(id as string);
    }
  }, [id]);

  useEffect(() => {
    if (user && listing && user.following && listing.creator_id) {
      setIsFollowing(user.following.includes(listing.creator_id));
    }
  }, [user, listing]);

  const fetchListing = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      
      // First check if this is one of our beer listings from localStorage
      const isBeerListing = id.toString().includes('beer') || ['6', '7', '8', '9'].includes(id.toString());
      
      if (isBeerListing) {
        console.log('Fetching beer listing from mock data');
        
        // Try to find in mock data first
        const mockService = (await import('../../utils/mockData')).mockServices.find(
          service => service.id === id.toString()
        );
        
        if (mockService) {
          // Format as Listing type
          const beerListing: Listing = {
            id: mockService.id,
            title: mockService.title,
            description: mockService.description,
            price: mockService.price,
            status: 'active' as ListingStatus,
            category: mockService.category as ListingCategory,
            author: {
              id: user?.id || mockService.authorId,
              name: user?.displayName || user?.username || "Sphinx",
              avatar: user?.profileImage || '/images/avatar.png'
            },
            downloads: mockService.downloads,
            rating: mockService.rating || 4.2,
            reviews: mockService.reviewCount || 12,
            created_at: mockService.createdAt,
            updated_at: mockService.updatedAt,
            tags: mockService.tags,
            thumbnail_url: mockService.thumbnailUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${mockService.title}`,
            is_beer: true,
            tier: 1,
            creator_id: user?.id || mockService.authorId || '1',
            quantum_score: user?.quantumScore || 85,
            file_path: 'beer.zip',
            s3_file_key: 'uploads/beer.zip'
          };
          
          setListing(beerListing);
          setError(null);
          return;
        }
        
        // Try localStorage as fallback
        try {
          const userListingsStr = localStorage.getItem('user_listings');
          if (userListingsStr) {
            const userListings = JSON.parse(userListingsStr);
            const beerItem = userListings.find((item: any) => 
              item.id.toString() === id.toString() || 
              (item.id.includes && item.id.includes('beer'))
            );
            
            if (beerItem) {
              // Format as Listing type
              const beerListing: Listing = {
                id: beerItem.id,
                title: beerItem.title,
                description: beerItem.description || 'A delicious beer.zip file',
                price: beerItem.price || 1.00,
                status: beerItem.status as ListingStatus || 'active',
                category: beerItem.category as ListingCategory || 'Tools & Utilities',
                author: {
                  id: user?.id || '1',
                  name: user?.displayName || user?.username || "Sphinx",
                  avatar: user?.profileImage || '/images/avatar.png'
                },
                downloads: beerItem.downloads || 0,
                rating: beerItem.rating || 4.2,
                reviews: beerItem.reviewCount || 12,
                created_at: beerItem.created_at || new Date().toISOString(),
                updated_at: beerItem.updated_at || new Date().toISOString(),
                tags: beerItem.tags || ['beer', 'beverage'],
                thumbnail_url: beerItem.thumbnailUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${beerItem.title}`,
                is_beer: true,
                tier: 1,
                creator_id: user?.id || '1',
                quantum_score: user?.quantumScore || 85,
                file_path: 'beer.zip',
                s3_file_key: 'uploads/beer.zip'
              };
              
              setListing(beerListing);
              setError(null);
              return;
            }
          }
        } catch (storageErr) {
          console.error('Error accessing localStorage:', storageErr);
        }
      }
      
      // If not a beer listing or beer not found, try the API as normal
      const response = await fetch(`/api/listings/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch listing: ${response.statusText}`);
      }
      
      const data = await response.json();
      setListing(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching listing:', err);
      setError('Failed to load listing details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedListings = async () => {
    try {
      // In a real implementation, we would call an API that returns related listings
      // based on the current listing's category, etc.
      const response = await fetch(`/api/listings/suggested?excludeId=${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch suggested listings: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSuggestedListings(data.slice(0, 3)); // Limit to 3 suggestions
    } catch (err) {
      console.error('Error fetching suggested listings:', err);
      // We don't set an error state here since this is not critical
    }
  };

  const handleAddToCart = () => {
    if (!listing) return;
    
    addItem({
      id: listing.id,
      name: listing.title,
      price: listing.price,
      icon: <ItemGlyph itemId={listing.id} itemName={listing.title} size={24} />
    });
    
    setInCart(true);
    toast.success('Item added to cart!');
  };

  const handleBuyNow = () => {
    if (!listing) return;
    
    // Skip real payment processing and go directly to success
    toast.success('Processing purchase...');
    
    // Add to cart anyways to maintain state
    addItem({
      id: listing.id,
      name: listing.title,
      price: listing.price,
      icon: <ItemGlyph itemId={listing.id} itemName={listing.title} size={24} />
    });
    
    // Generate random order ID
    const randomOrderId = `ORD-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // Go directly to success page with the item ID as a parameter
    router.push(`/checkout/success?orderId=${randomOrderId}&itemId=${listing.id}`);
  };

  const handleToggleWishlist = () => {
    setInWishlist(!inWishlist);
    toast.success(inWishlist ? 'Removed from saved items' : 'Saved for later');
  };

  const handleShare = () => {
    // Copy current URL to clipboard
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleFollow = async () => {
    if (!user || !listing || !listing.creator_id) return;
    
    try {
      if (isFollowing) {
        await unfollowUser(listing.creator_id);
      } else {
        await followUser(listing.creator_id);
      }
      
      // Toggle the follow state
      setIsFollowing(!isFollowing);
      
      // Show success toast
      toast.success(isFollowing ? 'Unfollowed Sphinx' : 'Now following Sphinx (+5 points)');
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast.error('Failed to update follow status');
    }
  };

  if (isLoading || isChecking) {
    return (
      <Layout title="Loading...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center">
            <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-indigo-500 rounded-full mb-4"></div>
            <p className="text-gray-400">Loading details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !listing) {
    return (
      <Layout title="Error">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full text-center">
            <div className="text-red-500 text-5xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">Unable to Load Item</h2>
            <p className="text-gray-400 mb-6">{error || 'This item could not be found or is no longer available.'}</p>
            <Link href="/marketplace" className="px-4 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700">
              Return to Marketplace
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={listing.title}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Takes up 2/3 on large screens */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`rounded-lg p-6 ${listing.is_beer ? 'bg-gradient-to-br from-amber-900/30 to-yellow-900/30 border border-amber-700/30' : 'bg-gray-800'}`}>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Item Preview/Image */}
                <div className="w-full md:w-1/3 aspect-square rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center relative">
                  <div className="relative w-full h-full flex items-center justify-center">
                    {listing.is_beer && (
                      <div className="absolute inset-0 bg-amber-900/20 animate-pulse"></div>
                    )}
                    <ItemGlyph
                      itemId={listing.id}
                      itemName={listing.title}
                      creatorId={listing.creator_id}
                      complexity={listing.quantum_score ? listing.quantum_score / 100 : 0.6}
                      color={listing.is_beer ? '#f59e0b' : '#6366f1'}
                      secondaryColor={listing.is_beer ? '#fbbf24' : '#a5b4fc'}
                      size={200}
                      className="transform scale-110"
                    />
                    {listing.is_beer && (
                      <div className="absolute top-2 right-2 bg-yellow-600/80 text-white text-xs px-2 py-1 rounded-full">
                        Beer.zip
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Item Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className={`text-2xl font-bold mb-2 ${listing.is_beer ? 'text-amber-200' : 'text-gray-200'}`}>
                        {listing.title}
                      </h1>
                      <div className="flex items-center mb-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          listing.is_beer 
                            ? 'bg-amber-100 text-amber-800' 
                            : (listing.status === ListingStatus.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800')
                        }`}>
                          {listing.status}
                        </span>
                        <span className="mx-2 text-gray-500">•</span>
                        <span className="text-gray-400 text-sm">Category: {listing.category}</span>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${listing.is_beer ? 'text-amber-400' : 'text-indigo-400'}`}>
                      {formatPrice(listing.price)}
                    </div>
                  </div>
                  
                  <p className={`mb-6 ${listing.is_beer ? 'text-amber-100' : 'text-gray-300'}`}>{listing.description}</p>
                  
                  {listing.is_beer && (
                    <div className="bg-amber-900/20 p-4 rounded-lg mb-6 border border-amber-700/30">
                      <h3 className="text-amber-200 font-semibold mb-2">🍺 Beer.zip Product</h3>
                      <p className="text-amber-100 text-sm">This is a special beer.zip product created by you for testing purposes. It's a delicious digital beverage!</p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      onClick={handleBuyNow}
                      className={`px-6 py-2 text-white rounded-lg transition-colors flex-1 flex items-center justify-center ${
                        listing.is_beer ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      <span>Buy Now</span>
                    </button>
                    <button
                      onClick={handleAddToCart}
                      disabled={inCart}
                      className={`px-4 py-2 rounded-lg flex items-center justify-center transition-colors ${
                        inCart 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : (listing.is_beer ? 'bg-amber-700 text-white hover:bg-amber-800' : 'bg-gray-700 text-white hover:bg-gray-600')
                      }`}
                    >
                      {inCart ? <FiCheckCircle className="mr-2" /> : <FiShoppingCart className="mr-2" />}
                      {inCart ? 'Added' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={handleToggleWishlist}
                      className={`px-3 py-2 rounded-lg flex items-center justify-center transition-colors ${
                        inWishlist 
                          ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' 
                          : (listing.is_beer ? 'bg-amber-700 text-white hover:bg-amber-800' : 'bg-gray-700 text-white hover:bg-gray-600')
                      }`}
                    >
                      <FiHeart className={`${inWishlist ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={handleShare}
                      className={`px-3 py-2 text-white rounded-lg transition-colors ${
                        listing.is_beer ? 'bg-amber-700 hover:bg-amber-800' : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      <FiShare2 />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Item Specifications */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-200 mb-4">Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Format</h3>
                  <p className="text-gray-200">{listing.file_path ? listing.file_path.split('.').pop()?.toUpperCase() : 'ZIP'}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Version</h3>
                  <p className="text-gray-200">1.0</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Tier Level</h3>
                  <p className="text-gray-200">{listing.tier}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Creation Date</h3>
                  <p className="text-gray-200">{new Date(listing.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            {/* Creator Information */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-200 mb-4">About the Creator</h2>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                  <Link href="/profile">
                    {listing.author?.avatar ? (
                      <Image 
                        src={listing.author.avatar} 
                        alt={listing.author.name || 'Creator'} 
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser size={24} className="text-gray-400" />
                    )}
                  </Link>
                </div>
                <div>
                  <Link href="/profile" className="text-gray-200 font-medium hover:text-indigo-400 transition-colors">
                    {listing.author?.name || "Sphinx"}
                  </Link>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center text-yellow-400">
                      <FiStar className="fill-current" />
                      <FiStar className="fill-current" />
                      <FiStar className="fill-current" />
                      <FiStar className="fill-current" />
                      <FiStar />
                    </div>
                    <span className="ml-2 text-gray-400 text-sm">4.8 (125 reviews)</span>
                  </div>
                </div>
                <div className="ml-auto flex items-center space-x-2">
                  <button 
                    onClick={handleFollow}
                    className={`px-3 py-2 ${
                      isFollowing 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white rounded-lg transition-colors text-sm`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
                    Contact
                  </button>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center bg-gray-900/50 p-3 rounded-lg">
                  <FiBarChart2 className="text-indigo-400 mr-2" />
                  <div>
                    <h4 className="text-xs text-gray-400">Quantum Score</h4>
                    <p className="text-gray-200 font-medium">{listing.quantum_score}</p>
                  </div>
                </div>
                <div className="flex items-center bg-gray-900/50 p-3 rounded-lg">
                  <FiClock className="text-indigo-400 mr-2" />
                  <div>
                    <h4 className="text-xs text-gray-400">Response Time</h4>
                    <p className="text-gray-200 font-medium">Within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-center bg-gray-900/50 p-3 rounded-lg">
                  <FiMessageCircle className="text-indigo-400 mr-2" />
                  <div>
                    <h4 className="text-xs text-gray-400">Support</h4>
                    <p className="text-gray-200 font-medium">Included</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar - Takes up 1/3 on large screens */}
          <div className="space-y-6">
            {/* Download Information */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-200 mb-4">Downloads</h2>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Downloads</span>
                <span className="text-gray-200 font-medium">{listing.downloads}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Last Updated</span>
                <span className="text-gray-200 font-medium">{new Date(listing.updated_at).toLocaleDateString()}</span>
              </div>
              {listing.status === ListingStatus.ACTIVE && (
                <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center">
                  <FiDownload className="mr-2" />
                  Download Sample
                </button>
              )}
            </div>
            
            {/* Suggested Items */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-200 mb-4">You Might Also Like</h2>
              <div className="space-y-4">
                {suggestedListings.length > 0 ? (
                  suggestedListings.map((item) => (
                    <Link 
                      href={`/listings/${item.id}`} 
                      key={item.id}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="w-16 h-16 bg-gray-900 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.thumbnail_url ? (
                          <Image 
                            src={item.thumbnail_url} 
                            alt={item.title} 
                            width={64} 
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <ItemGlyph
                            itemId={item.id}
                            itemName={item.title}
                            creatorId={item.creator_id}
                            complexity={item.quantum_score ? item.quantum_score / 100 : 0.6}
                            color={item.is_beer ? '#f59e0b' : '#6366f1'}
                            secondaryColor={item.is_beer ? '#fbbf24' : '#a5b4fc'}
                            size={64}
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="text-gray-200 font-medium">{item.title}</h3>
                        <p className="text-gray-400 text-sm">{formatPrice(item.price)}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-400">No suggestions available</p>
                  </div>
                )}
                
                <Link href="/marketplace" className="block text-center text-indigo-400 hover:text-indigo-300 mt-4">
                  Browse more items
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tier Access Prompt */}
      {showPrompt && tierInfo && (
        <TierAccessPrompt
          tierInfo={tierInfo}
          onUpgrade={handleUpgrade}
          onUseKey={handleUseKey}
          onWatchAd={handleWatchAd}
          onClose={closePrompt}
        />
      )}
    </Layout>
  );
};

export default ListingDetailPage; 