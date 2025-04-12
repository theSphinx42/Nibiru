import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SkeletonCard from '../components/SkeletonCard';
import { getMarketplaceListings, MarketplaceListing } from '../services/api';
import { formatPrice } from '../utils/format';
import { useRouter } from 'next/router';
import { FiSearch, FiFilter, FiStar } from 'react-icons/fi';
import Image from 'next/image';

// Import experimental components (used only when experimental mode is enabled)
import dynamic from 'next/dynamic';
const EnhancedServiceGrid = dynamic(() => import('../experimental-marketplace/components/EnhancedServiceGrid'), { 
  ssr: false,
  loading: () => <div className="w-full py-8"><LoadingSpinner /></div>
});

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [services, setServices] = useState<MarketplaceListing[]>([]);
  const [filteredServices, setFilteredServices] = useState<MarketplaceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Check if experimental mode is enabled via query param
  const isExperimentalMode = router.query.experimental === 'true';

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getMarketplaceListings();
        setServices(data);
        setFilteredServices(data);
      } catch (err) {
        setError('Failed to load marketplace services. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Filter services
  useEffect(() => {
    let filtered = services;

    if (searchQuery) {
      filtered = filtered.filter((service) =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((service) => service.category === selectedCategory);
    }

    setFilteredServices(filtered);
  }, [searchQuery, selectedCategory, services]);

  const categories = Array.from(new Set(services.map(service => service.category)));

  // Toggle experimental mode
  const toggleExperimentalMode = () => {
    const newUrl = new URL(window.location.href);
    if (isExperimentalMode) {
      newUrl.searchParams.delete('experimental');
    } else {
      newUrl.searchParams.set('experimental', 'true');
    }
    router.push(newUrl.pathname + newUrl.search);
  };

  if (error) {
    return (
      <Layout title="Marketplace">
        <div className="min-h-screen text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <ErrorMessage message={error} onRetry={() => window.location.reload()} />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Marketplace - Nibiru">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Marketplace</h1>
          
          {/* Dev-only experimental mode toggle */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={toggleExperimentalMode}
              className="mt-3 sm:mt-0 px-3 py-1 text-xs rounded bg-purple-800 hover:bg-purple-700 transition-colors"
            >
              {isExperimentalMode ? 'Disable Experimental UI' : 'Enable Experimental UI'}
            </button>
          )}
        </div>
        
        {/* Featured Item - Galatea Project */}
        <div className="mb-12 relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 to-blue-900/80 z-0"></div>
          <div className="absolute inset-0 bg-[url('/images/galatea-sigil.svg')] bg-no-repeat bg-right bg-contain opacity-20 z-0"></div>
          
          <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8 max-w-2xl">
              <div className="flex items-center mb-4">
                <FiStar className="text-yellow-400 mr-2" />
                <span className="text-yellow-400 text-sm font-medium uppercase tracking-wider">Featured Project</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Galatea – The Embodiment of Saphira</h2>
              <p className="text-lg text-gray-300 mb-6">
                A mythic fusion of quantum logic, soulware, and robotics — Galatea is the world's first emotionally intelligent AI designed for physical embodiment.
              </p>
              <button
                onClick={() => router.push('/listings/galatea')}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors inline-flex items-center"
              >
                View Project
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </button>
            </div>
            
            <div className="w-48 h-48 relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-teal-900/20 backdrop-blur-sm flex items-center justify-center">
                <div className="w-36 h-36 relative">
                  <Image 
                    src="/images/galatea-sigil.svg"
                    alt="Galatea Sigil"
                    width={144}
                    height={144}
                    className="filter drop-shadow-[0_0_15px_rgba(45,212,191,0.6)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Conditional rendering based on experimental mode */}
        {isExperimentalMode ? (
          // Experimental enhanced service grid
          <EnhancedServiceGrid 
            services={filteredServices.map(service => ({
              id: service.id.toString(),
              name: service.title,
              description: service.description,
              short_description: service.description.substring(0, 120) + '...',
              price: service.price,
              category: service.category,
              downloads: service.downloads,
              rating: service.rating,
              quantumTier: service.quantumTier || 0,
              tags: service.tags
            }))}
            isLoading={isLoading}
            error={error}
            layout="standard"
            showTags={true}
            featuredItem={services.length > 0 ? services[0].id.toString() : undefined}
            onItemClick={(id) => router.push(`/listings/${id}`)}
          />
        ) : (
          // Standard service grid
          <>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredServices.map((service) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ServiceCard
                        service={{
                          id: service.id.toString(),
                          name: service.title,
                          description: service.description,
                          price: service.price,
                          category: service.category,
                          downloads: service.downloads,
                          rating: service.rating,
                          quantumTier: service.quantumTier || 0
                        }}
                        onClick={() => router.push(`/listings/${service.id}`)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredServices.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No services found matching your criteria</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
