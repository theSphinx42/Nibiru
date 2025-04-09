import type { NextApiRequest, NextApiResponse } from 'next';
import { mockListingsStore } from './create';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success: boolean } | { error: string }>
) {
  if (req.method !== 'DELETE') {
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

    // Delete the listing from our mock store
    delete mockListingsStore[id];
    
    // Log for debugging
    console.log(`Deleted listing: ${id}`);
    console.log(`Remaining listings: ${Object.keys(mockListingsStore).length}`);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return res.status(500).json({ error: 'Failed to delete listing' });
  }
} 