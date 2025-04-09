import { useState } from 'react';
import { useRouter } from 'next/router';
import ListingTemplateSelector from '../../components/ListingTemplateSelector';
import CreatorListingForm from '../../components/CreatorListingForm';
import { Template } from '../../types/listing';

const NewListingPage = () => {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      // Add template ID to form data if a template was used
      if (selectedTemplate) {
        formData.append('template_id', selectedTemplate.id);
      }

      const response = await fetch('/api/listings/create', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to create listing');
      }

      const data = await response.json();
      router.push(`/creator/dashboard`);
    } catch (error) {
      console.error('Error creating listing:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {!selectedTemplate ? (
            <ListingTemplateSelector onSelect={handleTemplateSelect} />
          ) : (
            <>
              <div className="mb-8">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center space-x-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Choose Different Template</span>
                </button>
              </div>

              <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-6">
                <h1 className="text-2xl font-bold text-gray-100 mb-2">
                  Create New {selectedTemplate.name}
                </h1>
                <p className="text-gray-400 mb-6">
                  {selectedTemplate.description}
                </p>

                <CreatorListingForm
                  onSubmit={handleSubmit}
                  template={selectedTemplate}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewListingPage; 