import Image from 'next/image';
import { motion } from 'framer-motion';
import { Listing } from '@/types/listing';
import { formatDate, formatPrice } from '@/utils/format';

interface ListingCardProps {
  listing: Listing;
  onClick?: () => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onClick }) => {
  const thumbnailSrc = listing.thumbnail_url || '/images/placeholders/listing-placeholder.png';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer"
    >
      <div className="relative h-48 w-full">
        <Image
          src={thumbnailSrc}
          alt={listing.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{listing.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{listing.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-primary-600 font-medium">
            {formatPrice(listing.price)}
          </span>
          <span className="text-gray-500 text-sm">
            {formatDate(listing.created_at)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ListingCard; 