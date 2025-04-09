import React from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onCategoryChange }) => {
  return (
    <div className="flex space-x-4 mb-4">
      <input
        type="text"
        placeholder="Search services..."
        onChange={(e) => onSearch(e.target.value)}
        className="flex-grow px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
      />
      <select onChange={(e) => onCategoryChange(e.target.value)} className="px-4 py-2 rounded-lg bg-gray-700 border border-gray-600">
        <option value="all">All Categories</option>
        <option value="analytics">Analytics</option>
        <option value="tools">Tools</option>
        <option value="api">APIs</option>
        <option value="development">Development</option>
        <option value="security">Security</option>
        <option value="operations">Operations</option>
      </select>
    </div>
  );
};

export default SearchBar; 