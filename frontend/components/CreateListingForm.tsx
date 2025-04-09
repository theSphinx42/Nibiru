import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiLock } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { galateaService } from '../services/galatea';
import { GalateaAccessModal } from './GalateaAccessModal';
import ThematicGlyph, { GlyphTier, GlyphRank, GlyphEffect } from './ThematicGlyph';
import { toast } from 'react-hot-toast';

interface ListingFormData {
  title: string;
  description: string;
  price: string;
  category: string;
  isGalatea: boolean;
  glyphRank: GlyphRank;
  galateaTier?: number;
}

interface CreateListingFormProps {
  onSubmit: (data: ListingFormData) => Promise<void>;
  initialData?: Partial<ListingFormData>;
}

export const CreateListingForm: React.FC<CreateListingFormProps> = ({
  onSubmit,
  initialData
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ListingFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    category: initialData?.category || '',
    glyphRank: (initialData?.glyphRank as GlyphRank) || 'basic',
    isGalatea: initialData?.isGalatea || false,
    galateaTier: initialData?.galateaTier
  });
  
  const [isGalateaModalOpen, setIsGalateaModalOpen] = useState(false);
  const [hasGalateaAccess, setHasGalateaAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkGalateaAccess = async () => {
      if (user) {
        const access = await galateaService.checkAccess(user.id);
        setHasGalateaAccess(!!access?.enabled);
      }
      setIsLoading(false);
    };

    checkGalateaAccess();
  }, [user]);

  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    const isGalatea = newCategory === 'galatea';

    if (isGalatea && !hasGalateaAccess) {
      setIsGalateaModalOpen(true);
      return;
    }

    setFormData(prev => ({
      ...prev,
      category: newCategory,
      isGalatea,
      glyphRank: isGalatea ? ('mythic' as const) : prev.glyphRank,
      galateaTier: isGalatea ? 1 : undefined
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.isGalatea && !hasGalateaAccess) {
      setIsGalateaModalOpen(true);
      return;
    }

    try {
      await onSubmit(formData);
      toast.success('Listing created successfully!');
    } catch (error) {
      toast.error('Failed to create listing');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-2xl text-orange-500"
        >
          ◈
        </motion.span>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={handleCategoryChange}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          >
            <option value="">Select a category</option>
            <option value="model">Model</option>
            <option value="dataset">Dataset</option>
            <option value="tool">Tool</option>
            <option value="galatea" className="text-orange-400">
              ✧ Galatea Vision Project
            </option>
          </select>
        </div>

        {/* Glyph Rank */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Glyph Rank
          </label>
          <select
            value={formData.glyphRank}
            onChange={e => setFormData(prev => ({ ...prev, glyphRank: e.target.value as GlyphRank }))}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={formData.isGalatea}
          >
            <option value="basic">Basic - Standard glyph with basic effects</option>
            <option value="enhanced">Enhanced - Advanced glyph with particle effects</option>
            <option value="premium">Premium - Advanced animations</option>
            <option value="mythic">Mythic - Legendary glyph with unique effects</option>
          </select>
          {formData.isGalatea && (
            <p className="mt-1 text-sm text-orange-400">
              Galatea listings automatically use mythic-tier glyphs with special effects
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={6}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Price (USD)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>

        {/* Preview Card */}
        {formData.title && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-300 mb-4">Preview</h3>
            <motion.div
              className={`relative bg-gray-800 rounded-xl p-6 ${
                formData.isGalatea ? 'border-2 border-orange-500/50' : ''
              }`}
            >
              {formData.isGalatea && (
                <div className="absolute -top-3 -right-3">
                  <div className="bg-orange-500 rounded-full p-2">
                    <ThematicGlyph
                      tier="item"
                      rank="mythic"
                      size={16}
                      effect="glow"
                      isGalatea={true}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <ThematicGlyph
                    tier="item"
                    rank={formData.glyphRank}
                    size={48}
                    effect={formData.isGalatea ? 'particles' : formData.glyphRank === 'mythic' ? 'pulse' : 'none'}
                    isGalatea={formData.isGalatea}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {formData.title}
                  </h3>
                  {formData.isGalatea && (
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-sm rounded-full">
                        Galatea Vision Project
                      </span>
                    </div>
                  )}
                  <p className="text-gray-400 line-clamp-2">
                    {formData.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className={`px-6 py-2 rounded-lg font-medium ${
              formData.isGalatea
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            Create Listing
          </button>
        </div>
      </form>

      {/* Galatea Access Modal */}
      <GalateaAccessModal
        isOpen={isGalateaModalOpen}
        onClose={() => setIsGalateaModalOpen(false)}
        onAccessGranted={() => {
          setHasGalateaAccess(true);
          setIsGalateaModalOpen(false);
        }}
      />
    </>
  );
}; 