import React, { useState } from 'react';
import { format } from 'date-fns';
import { InvocationKeyCreateRequest } from '../types/invocation';
import { useToast } from '../hooks/useToast';

interface KeyCreationFormProps {
  onSubmit: (data: InvocationKeyCreateRequest) => Promise<void>;
  onCancel: () => void;
  codeListings: Array<{
    id: number;
    title: string;
    description: string;
  }>;
}

export const KeyCreationForm: React.FC<KeyCreationFormProps> = ({
  onSubmit,
  onCancel,
  codeListings
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<InvocationKeyCreateRequest>({
    code_listing_id: codeListings[0]?.id || 0,
    usage_limit: undefined,
    expiration_days: undefined,
    metadata: {}
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      showToast('Key created successfully', 'success');
    } catch (error) {
      showToast('Error creating key', 'error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="code_listing_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Code Listing
        </label>
        <select
          id="code_listing_id"
          name="code_listing_id"
          value={formData.code_listing_id}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          required
        >
          {codeListings.map(listing => (
            <option key={listing.id} value={listing.id}>
              {listing.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="usage_limit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Usage Limit
        </label>
        <input
          type="number"
          id="usage_limit"
          name="usage_limit"
          value={formData.usage_limit || ''}
          onChange={handleChange}
          min="1"
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          placeholder="Leave empty for unlimited"
        />
      </div>

      <div>
        <label htmlFor="expiration_days" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Expiration (days)
        </label>
        <input
          type="number"
          id="expiration_days"
          name="expiration_days"
          value={formData.expiration_days || ''}
          onChange={handleChange}
          min="1"
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          placeholder="Leave empty for no expiration"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Key
        </button>
      </div>
    </form>
  );
}; 