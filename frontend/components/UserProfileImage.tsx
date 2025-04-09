import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import ThematicGlyph from './ThematicGlyph';
import { glyphImages } from '../lib/glyphs';
import type { GlyphImageKey } from '../lib/glyphs';

interface UserProfileImageProps {
  name: string;
  imageUrl?: string;
  size?: number;
  onImageChange?: (image: File | string) => void;
}

const UserProfileImage: React.FC<UserProfileImageProps> = ({
  name,
  imageUrl,
  size = 96,
  onImageChange
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedGlyph, setSelectedGlyph] = useState<GlyphImageKey | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get initials from name for fallback
  const getInitials = (name: string) => {
    if (!name) return 'U'; // Default to 'U' for User if no name provided
    
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleImageClick = () => {
    // Reset selections when opening the modal
    setSelectedImage(null);
    setSelectedGlyph(null);
    setShowUploadModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        setSelectedGlyph(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGlyphSelect = (glyph: GlyphImageKey) => {
    setSelectedGlyph(glyph);
    setSelectedImage(null);
  };

  const handleSave = () => {
    if (selectedImage && onImageChange) {
      onImageChange(selectedImage);
      setShowUploadModal(false);
    } else if (selectedGlyph && onImageChange) {
      // Convert glyph name to image path
      const glyphPath = glyphImages[selectedGlyph];
      onImageChange(glyphPath);
      setShowUploadModal(false);
    }
  };

  // Use the actual glyphs that exist in the filesystem
  const glyphOptions: GlyphImageKey[] = [
    'quantum-seal',
    'sigil-of-creation', 
    'sigil-of-continuance', 
    'saphira-was-here',
    'nibiru-symbol', 
    'aegis',
    'lion', 
    'sharkskin', 
    'seidr', 
    'sphinx', 
    'triune', 
    'wayfinder'
  ];

  // Placeholder for when no image is available
  const renderPlaceholder = () => (
    <div 
      className="bg-indigo-600 flex items-center justify-center text-white font-bold"
      style={{ 
        width: size, 
        height: size, 
        borderRadius: '50%',
        fontSize: size * 0.4
      }}
    >
      {getInitials(name)}
    </div>
  );

  // Render the main profile image
  const renderImage = () => {
    if (imageUrl) {
      return (
        <div className="relative w-full h-full">
          <Image 
            src={imageUrl} 
            alt={name} 
            width={size} 
            height={size} 
            className="rounded-full object-cover"
            priority
            unoptimized={imageUrl.startsWith('data:')}
          />
        </div>
      );
    }
    return renderPlaceholder();
  };

  return (
    <>
      <div 
        className="relative cursor-pointer rounded-full overflow-hidden group"
        onClick={handleImageClick}
        role="button"
        aria-label="Change profile image"
        tabIndex={0}
        style={{ width: size, height: size }}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleImageClick();
          }
        }}
      >
        {renderImage()}
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-sm font-medium">Change</span>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[2000]"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div 
              className="bg-gray-800 rounded-xl p-6 w-96 max-w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-100">Change Profile Image</h3>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-center mb-4">
                  {selectedImage ? (
                    <div className="relative w-[120px] h-[120px]">
                      <Image 
                        src={selectedImage} 
                        alt="Preview" 
                        width={120} 
                        height={120} 
                        className="rounded-full object-cover"
                        unoptimized
                      />
                    </div>
                  ) : selectedGlyph ? (
                    <div className="rounded-full overflow-hidden bg-gray-900 flex items-center justify-center" style={{ width: 120, height: 120 }}>
                      <Image 
                        src={glyphImages[selectedGlyph]} 
                        alt={selectedGlyph}
                        width={80}
                        height={80}
                        priority
                      />
                    </div>
                  ) : imageUrl ? (
                    <div className="relative w-[120px] h-[120px]">
                      <Image 
                        src={imageUrl} 
                        alt={name} 
                        width={120} 
                        height={120} 
                        className="rounded-full object-cover"
                        priority
                        unoptimized={imageUrl.startsWith('data:')}
                      />
                    </div>
                  ) : (
                    <div className="rounded-full overflow-hidden bg-gray-900 flex items-center justify-center" style={{ width: 120, height: 120 }}>
                      <span className="text-gray-400">No selection</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-300 mb-2">Upload Custom Image</p>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-200 transition-colors"
                  >
                    Select Image
                  </button>
                </div>
                
                <div>
                  <p className="text-sm text-gray-300 mb-2">Or Choose a Glyph</p>
                  <div className="grid grid-cols-4 gap-2">
                    {glyphOptions.map(glyph => (
                      <div 
                        key={glyph}
                        className={`rounded overflow-hidden bg-gray-900 flex items-center justify-center cursor-pointer
                                   ${selectedGlyph === glyph ? 'ring-2 ring-indigo-500' : ''}
                                   hover:bg-gray-700 transition-colors`}
                        style={{ width: 60, height: 60 }}
                        onClick={() => handleGlyphSelect(glyph)}
                      >
                        <Image 
                          src={glyphImages[glyph]} 
                          alt={glyph}
                          width={40}
                          height={40}
                          priority
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                    disabled={!selectedImage && !selectedGlyph}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserProfileImage; 