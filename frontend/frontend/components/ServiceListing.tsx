import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Service } from '../types';
import { formatPrice } from '../utils/format';

interface ServiceListingProps {
  service: Service;
  showActions?: boolean;
}

const ServiceListing = ({ service, showActions = true }: ServiceListingProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 hover:bg-gray-800/70 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2">
            {service.title}
          </h3>
          <p className="text-gray-400 text-sm mb-4">{service.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {service.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs rounded-full bg-blue-900/50 text-blue-200"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div>
              <span className="font-medium text-white">{service.downloads}</span>{' '}
              downloads
            </div>
            <div>
              <span className="font-medium text-white">{service.rating}</span>{' '}
              rating ({service.reviewCount} reviews)
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 ml-4 text-right">
          <div className="text-2xl font-bold text-white mb-2">
            {formatPrice(service.price)}
          </div>
          {showActions && (
            <div className="space-x-2">
              <Link
                href={`/service/${service.id}/edit`}
                className="inline-block px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={() => {/* Implement unpublish logic */}}
                className="px-3 py-1 bg-red-600/50 hover:bg-red-600 rounded-lg text-sm transition-colors"
              >
                Unpublish
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceListing; 