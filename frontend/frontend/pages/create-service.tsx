import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import UploadWidget from '../components/UploadWidget';
import { useToast } from '../components/Toast';
import { withAuth } from '../components/withAuth';
import ServicePreview from '../components/ServicePreview';

interface ServiceForm {
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  thumbnailUrl?: string;
}

const CreateServicePage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<ServiceForm>({
    title: '',
    description: '',
    price: 0,
    category: '',
    tags: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('Service created successfully', 'success');
      router.push('/dashboard');
    } catch (error) {
      showToast('Failed to create service', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      // Replace with actual upload logic
      const fakeUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, thumbnailUrl: fakeUrl }));
      showToast('Image uploaded successfully', 'success');
    } catch (error) {
      showToast('Failed to upload image', 'error');
    }
  };

  const handleTagInput = (input: string) => {
    const tags = input.split(',').map(tag => tag.trim());
    setFormData(prev => ({ ...prev, tags }));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Create New Service
              </h1>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span>Preview</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
                {/* Title */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500"
                    placeholder="Enter service title"
                  />
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500"
                    rows={4}
                    placeholder="Describe your service"
                  />
                </div>

                {/* Price */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500"
                  />
                </div>

                {/* Category */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Category
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="quantum">Quantum Analysis</option>
                    <option value="pattern">Pattern Recognition</option>
                    <option value="data">Data Processing</option>
                    <option value="ml">Machine Learning</option>
                  </select>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => handleTagInput(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500"
                    placeholder="quantum, analysis, etc."
                  />
                </div>

                {/* Thumbnail Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Thumbnail Image
                  </label>
                  <UploadWidget
                    onUpload={handleUpload}
                    accept="image/*"
                    maxSize={5 * 1024 * 1024}
                    label="Upload thumbnail"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Service'}
                </button>
              </div>
            </form>

            {/* Preview Modal */}
            <ServicePreview
              isOpen={showPreview}
              onClose={() => setShowPreview(false)}
              data={formData}
            />
          </motion.div>

          {/* Live Preview Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden lg:block sticky top-8"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Live Preview</h2>
              
              {/* Preview Card */}
              <div className="space-y-4">
                {/* Thumbnail */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
                  {formData.thumbnailUrl ? (
                    <img
                      src={formData.thumbnailUrl}
                      alt={formData.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      <svg
                        className="w-12 h-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold">
                  {formData.title || 'Your Service Title'}
                </h3>

                {/* Price and Category */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-green-400">
                    ${formData.price.toFixed(2)} USD
                  </div>
                  {formData.category && (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                      {formData.category}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300">
                    {formData.description || 'No description provided'}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                  {formData.tags.length === 0 && (
                    <span className="text-sm text-gray-500">No tags added</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(CreateServicePage); 