import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import Layout from '../../../components/Layout';
import { toast } from 'react-hot-toast';
import { Listing, ListingStatus } from '../../../types/listing';
import { FaSpinner } from 'react-icons/fa';

interface EditListingForm {
  title: string;
  description: string;
  category: string;
  price: number;
  tier: number;
  visibility: 'testing' | 'active';
}

const CATEGORIES = [
  'Tools & Utilities',
  'Art & Design',
  'Development',
  'Education',
  'Entertainment',
  'Productivity',
  'Other'
];

const TIERS = [
  { value: 1, label: 'Basic', description: 'Standard glyph with basic effects' },
  { value: 2, label: 'Enhanced', description: 'Advanced glyph with particle effects' },
  { value: 3, label: 'Premium', description: 'Premium glyph with advanced animations' },
  { value: 4, label: 'Mythic', description: 'Legendary glyph with unique effects' }
];

export default function EditListing() {
  const router = useRouter();
  const { id } = router.query;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [listing, setListing] = useState<Listing | null>(null);
  
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<EditListingForm>();

  // Fetch the listing data when the component mounts
  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/listings/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch listing: ${response.statusText}`);
      }
      
      const data = await response.json();
      setListing(data);
      
      // Pre-populate the form with listing data
      reset({
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        tier: data.tier,
        visibility: data.status === ListingStatus.TESTING ? 'testing' : 'active'
      });
      
      setError('');
    } catch (err) {
      console.error('Error fetching listing:', err);
      setError('Failed to load listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: EditListingForm) => {
    if (!id) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const updatedData = {
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        tier: data.tier,
        status: data.visibility === 'testing' ? ListingStatus.TESTING : ListingStatus.ACTIVE,
        is_visible: data.visibility === 'testing' ? false : true,
      };

      const response = await fetch(`/api/listings/edit?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update listing');
      }

      // Show success message
      toast.success('Listing updated successfully');
      
      // Redirect to listings page
      router.push('/dashboard/listings');
    } catch (err) {
      console.error('Error updating listing:', err);
      setError('Failed to update listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout title="Edit Listing">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-indigo-500 rounded-full"></div>
        </div>
      </Layout>
    );
  }

  if (error && !listing) {
    return (
      <Layout title="Edit Listing">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-gray-300">{error}</p>
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
    <Layout title="Edit Listing">
      <div className="p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-200 mb-8">Edit Listing</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter listing title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-32"
                  placeholder="Describe your listing..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-400">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('price', { required: 'Price is required', min: 0 })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-400">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Glyph Tier</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TIERS.map((tier) => (
                    <div
                      key={tier.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        watch('tier') === tier.value
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }`}
                      onClick={() => {
                        const tierInput = document.querySelector(`input[value="${tier.value}"]`) as HTMLInputElement;
                        if (tierInput) tierInput.checked = true;
                      }}
                    >
                      <input
                        type="radio"
                        {...register('tier')}
                        value={tier.value}
                        className="hidden"
                      />
                      <h3 className="font-medium text-gray-200">{tier.label}</h3>
                      <p className="text-sm text-gray-400 mt-1">{tier.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Visibility</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      {...register('visibility')}
                      value="testing"
                      className="form-radio text-indigo-500 focus:ring-indigo-500 h-4 w-4 bg-gray-800 border-gray-700"
                    />
                    <span className="ml-2 text-gray-300">Testing</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      {...register('visibility')}
                      value="active"
                      className="form-radio text-indigo-500 focus:ring-indigo-500 h-4 w-4 bg-gray-800 border-gray-700"
                    />
                    <span className="ml-2 text-gray-300">Active</span>
                  </label>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <motion.button
                type="button"
                onClick={() => router.push('/dashboard/listings')}
                className="px-6 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2
                  ${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
                whileHover={isSubmitting ? {} : { scale: 1.02 }}
                whileTap={isSubmitting ? {} : { scale: 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Listing'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
} 