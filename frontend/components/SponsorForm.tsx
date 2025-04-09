import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import SpiritGlyphViewer from './GlyphViewer';
import { generateAdvertiserSeed } from '../utils/glyphUtils';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || '');

interface SponsorFormProps {
  onSubmit: (data: FormData) => Promise<void>;
}

const durations = [
  { days: 7, price: 50, label: '7 Days' },
  { days: 14, price: 100, label: '14 Days' },
  { days: 30, price: 150, label: '30 Days' },
];

const SponsorForm: React.FC<SponsorFormProps> = ({ onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewGlyph, setPreviewGlyph] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'crypto'>('stripe');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      display_name: '',
      link_url: '',
      duration_days: 7,
      payment_method: 'stripe',
      sponsor_wallet: '',
    }
  });

  const displayName = watch('display_name');

  // Generate preview when display name changes
  const updatePreview = useCallback(() => {
    if (displayName && !selectedFile) {
      const glyphId = generateAdvertiserSeed(displayName, 'sponsor');
      setPreviewGlyph(glyphId);
    }
  }, [displayName, selectedFile]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewGlyph('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      if (selectedFile) {
        formData.append('logo', selectedFile);
      }
      
      // Add glyph ID if no logo
      if (!selectedFile && previewGlyph) {
        formData.append('glyph_seed', previewGlyph);
      }
      
      // Add all form fields
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      
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
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Display Name
            </label>
            <input
              type="text"
              {...register('display_name', { required: 'Display name is required' })}
              onChange={(e) => {
                register('display_name').onChange(e);
                updatePreview();
              }}
              className="mt-1 block w-full rounded-md bg-gray-800 border border-gray-700 
                       text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.display_name && (
              <p className="mt-1 text-sm text-red-500">{errors.display_name.message}</p>
            )}
          </div>

          {/* External URL */}
          <div>
            <label className="block text-sm font-medium text-gray-200">
              External URL
            </label>
            <input
              type="url"
              {...register('link_url', { 
                required: 'URL is required',
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Must be a valid URL starting with http:// or https://'
                }
              })}
              className="mt-1 block w-full rounded-md bg-gray-800 border border-gray-700 
                       text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.link_url && (
              <p className="mt-1 text-sm text-red-500">{errors.link_url.message}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Duration
            </label>
            <div className="mt-1 grid grid-cols-3 gap-3">
              {durations.map(({ days, price, label }) => (
                <label
                  key={days}
                  className={`
                    relative flex cursor-pointer rounded-lg border p-4 focus:outline-none
                    ${watch('duration_days') === days 
                      ? 'border-indigo-500 bg-gray-800/70' 
                      : 'border-gray-700 bg-gray-800/30'}
                  `}
                >
                  <input
                    type="radio"
                    {...register('duration_days')}
                    value={days}
                    className="sr-only"
                  />
                  <div className="flex flex-col">
                    <span className="block text-sm font-medium text-gray-200">
                      {label}
                    </span>
                    <span className="mt-1 flex items-center text-sm text-gray-400">
                      ${price}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Payment Method
            </label>
            <div className="mt-1 grid grid-cols-2 gap-3">
              <label
                className={`
                  relative flex cursor-pointer rounded-lg border p-4 focus:outline-none
                  ${paymentMethod === 'stripe' 
                    ? 'border-indigo-500 bg-gray-800/70' 
                    : 'border-gray-700 bg-gray-800/30'}
                `}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="stripe"
                  checked={paymentMethod === 'stripe'}
                  onChange={(e) => setPaymentMethod('stripe')}
                  className="sr-only"
                />
                <div className="flex flex-col">
                  <span className="block text-sm font-medium text-gray-200">
                    Credit Card
                  </span>
                  <span className="mt-1 flex items-center text-sm text-gray-400">
                    Via Stripe
                  </span>
                </div>
              </label>

              <label
                className={`
                  relative flex cursor-pointer rounded-lg border p-4 focus:outline-none
                  ${paymentMethod === 'crypto' 
                    ? 'border-indigo-500 bg-gray-800/70' 
                    : 'border-gray-700 bg-gray-800/30'}
                `}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="crypto"
                  checked={paymentMethod === 'crypto'}
                  onChange={(e) => setPaymentMethod('crypto')}
                  className="sr-only"
                />
                <div className="flex flex-col">
                  <span className="block text-sm font-medium text-gray-200">
                    Crypto
                  </span>
                  <span className="mt-1 flex items-center text-sm text-gray-400">
                    ETH/USDC
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Wallet Address (for crypto) */}
          {paymentMethod === 'crypto' && (
            <div>
              <label className="block text-sm font-medium text-gray-200">
                Ethereum Wallet Address
              </label>
              <input
                type="text"
                {...register('sponsor_wallet', {
                  required: paymentMethod === 'crypto' ? 'Wallet address is required' : false,
                  pattern: {
                    value: /^0x[a-fA-F0-9]{40}$/,
                    message: 'Invalid Ethereum address'
                  }
                })}
                className="mt-1 block w-full rounded-md bg-gray-800 border border-gray-700 
                         text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.sponsor_wallet && (
                <p className="mt-1 text-sm text-red-500">{errors.sponsor_wallet.message}</p>
              )}
            </div>
          )}

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Logo (Optional)
            </label>
            <input
              type="file"
              accept=".png,.svg"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-400
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-gray-700 file:text-gray-200
                       hover:file:bg-gray-600"
            />
            <p className="mt-1 text-sm text-gray-400">
              PNG or SVG only. Will use generated glyph if no logo provided.
            </p>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-200">Preview</h3>
          
          <div className="aspect-square max-w-xs mx-auto bg-gray-800/50 rounded-lg p-4
                        border border-gray-700/50 flex items-center justify-center">
            {selectedFile && previewUrl ? (
              <img
                src={previewUrl}
                alt="Logo preview"
                className="max-w-full max-h-full object-contain"
              />
            ) : previewGlyph ? (
              <SpiritGlyphViewer
                seed={previewGlyph}
                size={200}
                tier={3}
                showCaption={false}
              />
            ) : (
              <div className="text-gray-400 text-center">
                <p>Upload a logo or</p>
                <p>enter a display name</p>
                <p>to see preview</p>
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-400 text-center">
            This is how your ad will appear in the sponsor scroll
          </p>
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
          {isSubmitting ? 'Processing...' : 'Continue to Payment'}
        </motion.button>
      </div>
    </form>
  );
};

export default SponsorForm; 