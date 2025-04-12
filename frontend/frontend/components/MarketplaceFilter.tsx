import { useState } from 'react';
import { motion } from 'framer-motion';

interface FilterOption {
  label: string;
  value: string;
}

interface MarketplaceFilterProps {
  categories: FilterOption[];
  tags: FilterOption[];
  onFilterChange: (filters: {
    category?: string;
    tags: string[];
    minPrice?: number;
    maxPrice?: number;
    minScore?: number;
  }) => void;
}

const MarketplaceFilter = ({
  categories,
  tags,
  onFilterChange,
}: MarketplaceFilterProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Rest of the component code...
}; 