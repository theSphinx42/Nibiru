import type { NextApiRequest, NextApiResponse } from 'next';
import { mockListingsStore } from './create';
import { Listing } from '../../../types/listing';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Listing | { error: string }>
) {
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid listing ID' });
    }

    // Check if the listing exists
    if (!mockListingsStore[id]) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Get the updates from the request body
    const updates = req.body;
    
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Invalid update data' });
    }

    // Update the listing in our mock store
    const updatedListing = {
      ...mockListingsStore[id],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    mockListingsStore[id] = updatedListing;
    
    // Log for debugging
    console.log(`Updated listing: ${id}`);
    console.log(JSON.stringify(updatedListing, null, 2));

    return res.status(200).json(updatedListing);
  } catch (error) {
    console.error('Error updating listing:', error);
    return res.status(500).json({ error: 'Failed to update listing' });
  }
} 