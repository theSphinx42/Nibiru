import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import SpiritGlyphViewer from './GlyphViewer';
import { Template, ListingFormData } from '../types/listing';
import { generateAdvertiserSeed } from '../utils/glyphUtils';

interface CreatorListingFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  template?: Template;
}

const CreatorListingForm: React.FC<CreatorListingFormProps> = ({ 
  onSubmit,
  template
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [glyphSeed, setGlyphSeed] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ListingFormData>({
    defaultValues: template ? {
      title: template.defaults.title_format,
      description: template.defaults.description,
      glyph_tier: template.defaults.glyph_tier,
      category: template.defaults.category,
      pricing: template.defaults.suggested_price,
    } : {
      title: '',
      description: '',
      glyph_tier: 1,
      category: 'quantum_computing',
      pricing: {
        basic: 49.99,
        pro: 149.99,
        enterprise: 499.99
      }
    }
  });

  const title = watch('title');
  const description = watch('description');

  // Generate glyph seed when title changes
  useEffect(() => {
    if (title) {
      const seed = generateAdvertiserSeed(title, 'listing');
      setGlyphSeed(seed);
    }
  }, [title]);

  const handleFormSubmit = async (data: ListingFormData) => {
    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'pricing') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });
      
      // Add template ID if using a template
      if (template) {
        formData.append('template_id', template.id);
      }
      
      // Add glyph seed
      formData.append('glyph_seed', glyphSeed);
      
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Form Fields */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Title
            </label>
            <input
              type="text"
              {...register('title', { 
                required: 'Title is required',
                minLength: {
                  value: 3,
                  message: 'Title must be at least 3 characters'
                },
                maxLength: {
                  value: 100,
                  message: 'Title must be less than 100 characters'
                }
              })}
              className="mt-1 block w-full rounded-md bg-gray-800 border border-gray-700 
                       text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder={template?.defaults.title_format}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Description
            </label>
            <textarea
              {...register('description', {
                required: 'Description is required',
                minLength: {
                  value: 10,
                  message: 'Description must be at least 10 characters'
                },
                maxLength: {
                  value: 5000,
                  message: 'Description must be less than 5000 characters'
                }
              })}
              rows={6}
              className="mt-1 block w-full rounded-md bg-gray-800 border border-gray-700 
                       text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder={template?.defaults.description}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Category
            </label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="mt-1 block w-full rounded-md bg-gray-800 border border-gray-700 
                       text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="ai_and_ml">AI & Machine Learning</option>
              <option value="developer_tools">Developer Tools</option>
              <option value="quantum_computing">Quantum Computing</option>
              <option value="creative_tools">Creative Tools</option>
              <option value="data_analysis">Data Analysis</option>
              <option value="automation">Automation</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* Glyph Tier */}
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Glyph Tier
            </label>
            <select
              {...register('glyph_tier', { 
                required: 'Glyph tier is required',
                min: {
                  value: 1,
                  message: 'Minimum tier is 1'
                },
                max: {
                  value: 5,
                  message: 'Maximum tier is 5'
                }
              })}
              className="mt-1 block w-full rounded-md bg-gray-800 border border-gray-700 
                       text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value={1}>Tier 1 - Basic</option>
              <option value={2}>Tier 2 - Advanced</option>
              <option value={3}>Tier 3 - Premium</option>
              <option value={4}>Tier 4 - Elite</option>
              <option value={5}>Tier 5 - Mythic</option>
            </select>
            {errors.glyph_tier && (
              <p className="mt-1 text-sm text-red-500">{errors.glyph_tier.message}</p>
            )}
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-200">
              Pricing Tiers
            </label>
            
            {/* Basic Tier */}
            <div>
              <label className="block text-sm text-gray-400">Basic Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('pricing.basic', {
                  required: 'Basic price is required',
                  min: {
                    value: 0,
                    message: 'Price must be non-negative'
                  }
                })}
                className="mt-1 block w-full rounded-md bg-gray-800 border border-gray-700 
                         text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            {/* Pro Tier */}
            <div>
              <label className="block text-sm text-gray-400">Pro Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('pricing.pro', {
                  required: 'Pro price is required',
                  min: {
                    value: 0,
                    message: 'Price must be non-negative'
                  }
                })}
                className="mt-1 block w-full rounded-md bg-gray-800 border border-gray-700 
                         text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            {/* Enterprise Tier */}
            <div>
              <label className="block text-sm text-gray-400">Enterprise Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('pricing.enterprise', {
                  required: 'Enterprise price is required',
                  min: {
                    value: 0,
                    message: 'Price must be non-negative'
                  }
                })}
                className="mt-1 block w-full rounded-md bg-gray-800 border border-gray-700 
                         text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-200">Preview</h3>
          
          <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-6">
            {glyphSeed ? (
              <div className="flex flex-col items-center">
                <SpiritGlyphViewer
                  seed={glyphSeed}
                  size={200}
                  tier={Math.min(3, Math.max(1, Number(watch('glyph_tier')))) as 1 | 2 | 3}
                  showCaption={false}
                />
                <p className="mt-4 text-sm text-gray-400">
                  This is how your listing's glyph will appear
                </p>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <p>Enter a title to generate your listing's glyph</p>
              </div>
            )}
          </div>

          {/* Template Info */}
          {template && (
            <div className="bg-indigo-500/10 rounded-lg border border-indigo-500/20 p-4">
              <h4 className="text-sm font-medium text-indigo-400">Template Tips</h4>
              <ul className="mt-2 text-sm text-gray-400 space-y-2">
                <li>• Use {'{model_name}'}, {'{purpose}'}, etc. placeholders in title/description</li>
                <li>• Recommended glyph tier: {template.defaults.glyph_tier}</li>
                <li>• Suggested pricing structure provided</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium
                   hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                   focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? 'Creating...' : 'Create Listing'}
        </motion.button>
      </div>
    </form>
  );
};

export default CreatorListingForm; 