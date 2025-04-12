import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaSpinner } from 'react-icons/fa';
import Layout from '../../components/Layout';
import { toast } from 'react-hot-toast';

interface CreateListingForm {
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

const CreateListing = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const { register, handleSubmit, formState: { errors }, watch } = useForm<CreateListingForm>({
    defaultValues: {
      visibility: 'testing',
      tier: 1,
      price: 0
    }
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUploadedFile(acceptedFiles[0]);
      }
    }
  });

  const onSubmit = async (data: CreateListingForm) => {
    if (!uploadedFile) {
      setError('Please upload a file for your listing');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('data', JSON.stringify(data));

      const response = await fetch('/api/listings/create', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to create listing');
      }

      const result = await response.json();
      
      // Show success message
      toast.success('Listing created successfully');
      
      // Redirect to the listings page instead of a specific listing
      router.push('/dashboard/listings');
    } catch (err) {
      console.error('Error creating listing:', err);
      setError('Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-200 mb-8">Create New Listing</h1>

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
                <label className="block text-sm font-medium text-gray-300 mb-1">File Upload</label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 hover:border-gray-600'}`}
                >
                  <input {...getInputProps()} />
                  <FaUpload className="mx-auto text-3xl text-gray-500 mb-4" />
                  {uploadedFile ? (
                    <p className="text-gray-300">{uploadedFile.name}</p>
                  ) : (
                    <p className="text-gray-400">
                      {isDragActive
                        ? 'Drop the file here'
                        : 'Drag and drop your file here, or click to select'}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">Maximum file size: 100MB</p>
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
                onClick={() => router.back()}
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
                    Creating...
                  </>
                ) : (
                  'Create Listing'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
};

export default CreateListing; 