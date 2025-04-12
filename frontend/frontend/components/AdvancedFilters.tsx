import { useState } from 'react';
import { motion } from 'framer-motion';

interface FilterState {
  priceRange: [number, number];
  categories: string[];
  sortBy: 'price' | 'name' | 'popularity';
  rating: number;
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AdvancedFilters = ({ onFilterChange, isOpen, onClose }: AdvancedFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 100],
    categories: [],
    sortBy: 'popularity',
    rating: 0
  });

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <motion.div
      initial={false}
      animate={{ height: isOpen ? 'auto' : 0 }}
      className="overflow-hidden bg-[#161B22] rounded-lg mb-6"
    >
      <div className="p-6 space-y-6">
        {/* Price Range */}
        <div>
          <label className="text-white font-medium mb-2 block">
            Price Range (${filters.priceRange[0]} - ${filters.priceRange[1]})
          </label>
          <div className="flex gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={filters.priceRange[0]}
              onChange={(e) => handleFilterChange('priceRange', 
                [Number(e.target.value), filters.priceRange[1]])}
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="100"
              value={filters.priceRange[1]}
              onChange={(e) => handleFilterChange('priceRange', 
                [filters.priceRange[0], Number(e.target.value)])}
              className="w-full"
            />
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="text-white font-medium mb-2 block">Categories</label>
          <div className="flex flex-wrap gap-2">
            {['Quantum', 'Sigils', 'Network', 'Automation'].map((category) => (
              <button
                key={category}
                onClick={() => {
                  const newCategories = filters.categories.includes(category)
                    ? filters.categories.filter(c => c !== category)
                    : [...filters.categories, category];
                  handleFilterChange('categories', newCategories);
                }}
                className={`px-3 py-1 rounded-full text-sm transition-colors
                           ${filters.categories.includes(category)
                             ? 'bg-[#2F81F7] text-white'
                             : 'bg-[#0D1117] text-gray-400 hover:text-white'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="text-white font-medium mb-2 block">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full bg-[#0D1117] border border-[#1C2128] rounded-lg 
                     py-2 px-3 text-white focus:outline-none focus:border-[#2F81F7]"
          >
            <option value="popularity">Popularity</option>
            <option value="price">Price</option>
            <option value="name">Name</option>
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="text-white font-medium mb-2 block">
            Minimum Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleFilterChange('rating', star)}
                className={`text-2xl ${filters.rating >= star 
                  ? 'text-yellow-400' 
                  : 'text-gray-600'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 