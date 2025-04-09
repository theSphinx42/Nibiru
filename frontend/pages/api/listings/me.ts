import type { NextApiRequest, NextApiResponse } from 'next';
import { Listing, ListingCategory, ListingStatus } from '../../../types/listing';
import { mockListingsStore } from './create';
import fs from 'fs';
import path from 'path';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Listing[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initial mock listings
    const mockListings: Listing[] = [
      {
        id: "1a2b3c",
        title: "Premium AI Template",
        description: "A comprehensive template for AI applications",
        category: ListingCategory.TEMPLATE,
        price: 49.99,
        tier: 3,
        downloads: 127,
        status: ListingStatus.ACTIVE,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        quantum_score: 92,
        creator_id: "user123",
        file_path: "/uploads/premium-ai-template.zip",
        s3_file_key: "listings/premium-ai-template.zip",
        is_visible: true
      },
      {
        id: "4d5e6f",
        title: "Data Visualization Pack",
        description: "Beautiful charts and graphs for data-driven applications",
        category: ListingCategory.PLUGIN,
        price: 29.99,
        tier: 2,
        downloads: 89,
        status: ListingStatus.ACTIVE,
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        quantum_score: 85,
        creator_id: "user123",
        file_path: "/uploads/data-viz-pack.zip",
        s3_file_key: "listings/data-viz-pack.zip",
        is_visible: true
      },
      {
        id: "7g8h9i",
        title: "Authentication System",
        description: "Secure user authentication and authorization",
        category: ListingCategory.MODEL,
        price: 19.99,
        tier: 1,
        downloads: 42,
        status: ListingStatus.DRAFT,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        quantum_score: 73,
        creator_id: "user123",
        file_path: "/uploads/auth-system.zip",
        s3_file_key: "listings/auth-system.zip",
        is_visible: false
      }
    ];

    // Try to get user created listings from file first (most reliable)
    let userCreatedListings: Listing[] = [];
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const filePath = path.join(dataDir, 'mockListings.json');
      
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const storedListings = JSON.parse(fileContent);
        userCreatedListings = Object.values(storedListings);
        console.log(`Loaded ${userCreatedListings.length} listings from file storage`);
      }
    } catch (error) {
      console.error('Error loading listings from file:', error);
    }
    
    // If file loading failed, fall back to in-memory store
    if (userCreatedListings.length === 0) {
      userCreatedListings = Object.values(mockListingsStore || {}) as Listing[];
      console.log(`Using in-memory store with ${userCreatedListings.length} listings`);
    }
    
    // Combine both sets of listings
    const allListings = [...mockListings, ...userCreatedListings];
    
    // Log for debugging
    console.log(`Returning ${allListings.length} listings (${mockListings.length} default + ${userCreatedListings.length} user created)`);

    return res.status(200).json(allListings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return res.status(500).json({ error: 'Failed to fetch listings' });
  }
} 