import type { NextApiRequest, NextApiResponse } from 'next';
import { mockListingsStore } from './create';
import { Listing } from '../../../types/listing';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Listing | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid listing ID' });
    }

    // Get the listing from our mock store
    const listing = mockListingsStore[id];

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    return res.status(200).json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    return res.status(500).json({ error: 'Failed to fetch listing' });
  }
} 