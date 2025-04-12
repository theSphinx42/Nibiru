import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { ListingStatus, Listing } from '../../../types/listing';
import { formatPrice } from '../../../utils/format';
import { toast } from 'react-hot-toast';
import { FiEdit, FiEye, FiArchive, FiTrash2, FiExternalLink, FiDownload, FiBarChart } from 'react-icons/fi';

export default function ListingDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListing = async () => {
    if (!id) return;

    setLoading(true);
    try {
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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  const handlePublish = async () => {
    try {
      // Placeholder for actual API call
      // await fetch(`/api/listings/${id}/publish`, { method: 'POST' });
      
      // Optimistic UI update
      if (listing) {
        setListing({
          ...listing,
          status: ListingStatus.ACTIVE,
          is_visible: true
        });
      }
      
      toast.success('Listing published successfully');
    } catch (err) {
      console.error('Error publishing listing:', err);
      toast.error('Failed to publish listing');
    }
  };

  const handleArchive = async () => {
    try {
      // Placeholder for actual API call
      // await fetch(`/api/listings/${id}/archive`, { method: 'POST' });
      
      // Optimistic UI update
      if (listing) {
        setListing({
          ...listing,
          status: ListingStatus.ARCHIVED,
          is_visible: false
        });
      }
      
      toast.success('Listing archived successfully');
    } catch (err) {
      console.error('Error archiving listing:', err);
      toast.error('Failed to archive listing');
    }
  };

  if (loading) {
    return (
      <Layout title="Listing Details">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-indigo-500 rounded-full"></div>
        </div>
      </Layout>
    );
  }

  if (error || !listing) {
    return (
      <Layout title="Listing Details">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-gray-300">{error || 'Listing not found'}</p>
          <button 
            onClick={() => router.push('/dashboard/listings')}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white"
          >
            Back to Listings
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Listing: ${listing.title}`}>
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-gray-800 p-6 rounded-lg">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{listing.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                {listing.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                listing.status === ListingStatus.ACTIVE 
                  ? 'bg-green-900 text-green-300' 
                  : listing.status === ListingStatus.DRAFT 
                  ? 'bg-yellow-900 text-yellow-300'
                  : 'bg-red-900 text-red-300'
              }`}>
                {listing.status}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => router.push(`/dashboard/edit/${listing.id}`)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white flex items-center"
            >
              <FiEdit className="mr-1" /> Edit
            </button>
            
            {listing.status !== ListingStatus.ACTIVE && (
              <button 
                onClick={handlePublish}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white flex items-center"
              >
                <FiEye className="mr-1" /> Publish
              </button>
            )}
            
            {listing.status !== ListingStatus.ARCHIVED && (
              <button 
                onClick={handleArchive}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white flex items-center"
              >
                <FiArchive className="mr-1" /> Archive
              </button>
            )}
          </div>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-4">Description</h2>
              <p className="text-gray-300 whitespace-pre-line">{listing.description}</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-4">File Information</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300">File: {listing.file_path.split('/').pop()}</p>
                  <p className="text-gray-400 text-sm">Storage Key: {listing.s3_file_key}</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white flex items-center">
                  <FiDownload className="mr-1" /> Download
                </button>
              </div>
            </div>
          </div>
          
          {/* Right column - Stats */}
          <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-4">Pricing</h2>
              <p className="text-2xl font-bold text-indigo-400 mb-2">{formatPrice(listing.price)}</p>
              <p className="text-gray-400">Tier Level: {listing.tier}</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-4">Statistics</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 flex items-center"><FiDownload className="mr-1" /> Downloads</span>
                  <span className="font-bold text-white">{listing.downloads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 flex items-center"><FiBarChart className="mr-1" /> Quantum Score</span>
                  <span className="font-bold text-white">{listing.quantum_score}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Created</span>
                  <span className="text-gray-400">{new Date(listing.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 