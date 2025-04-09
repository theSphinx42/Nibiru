import { Listing } from '../types/listing';
import { useDebug } from '../contexts/DebugContext';

interface ListingDebugOverlayProps {
  listing: Listing;
}

const REQUIRED_FIELDS = [
  'title',
  'description',
  'price',
  'category',
  'tier',
  'file_path'
] as const;

export default function ListingDebugOverlay({ listing }: ListingDebugOverlayProps) {
  const { isDebugMode } = useDebug();

  if (!isDebugMode) return null;

  const missingFields = REQUIRED_FIELDS.filter(field => !listing[field]);
  const isTestMode = listing.title.toLowerCase().includes('test') || 
                    listing.description.toLowerCase().includes('test');

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Border overlay */}
      <div className={`absolute inset-0 border-2 ${
        missingFields.length > 0 ? 'border-red-500/50' :
        isTestMode ? 'border-yellow-500/50' :
        'border-green-500/50'
      }`} />

      {/* Debug info */}
      <div className="absolute top-2 right-2 bg-gray-900/90 rounded p-2 text-xs space-y-1">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${
            missingFields.length > 0 ? 'bg-red-500' :
            isTestMode ? 'bg-yellow-500' :
            'bg-green-500'
          }`} />
          <span className="text-gray-300">
            {missingFields.length > 0 ? 'Missing Fields' :
             isTestMode ? 'Test Mode' :
             'Valid'}
          </span>
        </div>

        {missingFields.length > 0 && (
          <div className="text-red-400">
            Missing: {missingFields.join(', ')}
          </div>
        )}

        <div className="text-gray-400">
          ID: {listing.id.slice(0, 8)}...
        </div>

        <div className="text-gray-400">
          Created: {new Date(listing.created_at).toLocaleString()}
        </div>

        {listing.updated_at && (
          <div className="text-gray-400">
            Updated: {new Date(listing.updated_at).toLocaleString()}
          </div>
        )}

        <div className="text-gray-400">
          Status: {listing.status}
        </div>

        {listing.quantum_score && (
          <div className="text-gray-400">
            Q-Score: {listing.quantum_score}
          </div>
        )}
      </div>
    </div>
  );
} 