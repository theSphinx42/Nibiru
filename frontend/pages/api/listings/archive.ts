import type { NextApiRequest, NextApiResponse } from 'next';
import { mockListingsStore } from './create';
import { ListingStatus } from '../../../types/listing';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success: boolean } | { error: string }>
) {
  if (req.method !== 'POST') {
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

    // Update the listing status to archived
    mockListingsStore[id] = {
      ...mockListingsStore[id],
      status: ListingStatus.ARCHIVED,
      is_visible: false,
      updated_at: new Date().toISOString()
    };
    
    // Log for debugging
    console.log(`Archived listing: ${id}`);
    console.log(JSON.stringify(mockListingsStore[id], null, 2));

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error archiving listing:', error);
    return res.status(500).json({ error: 'Failed to archive listing' });
  }
} 