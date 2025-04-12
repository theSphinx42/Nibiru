import type { NextApiRequest, NextApiResponse } from 'next';
import { mockListingsStore } from './create';
import { Listing, ListingCategory, ListingStatus } from '../../../types/listing';
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
    // First check if we have specific category to match
    const { category, excludeId } = req.query;
    
    // Try to get user created listings from file first
    let userCreatedListings: Listing[] = [];
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const filePath = path.join(dataDir, 'mockListings.json');
      
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const storedListings = JSON.parse(fileContent);
        userCreatedListings = Object.values(storedListings);
      }
    } catch (error) {
      console.error('Error loading listings from file:', error);
    }
    
    // If file loading failed, fall back to in-memory store
    if (userCreatedListings.length === 0) {
      userCreatedListings = Object.values(mockListingsStore || {});
    }
    
    // Add some default mock listings in case the store is empty
    const defaultMockListings: Listing[] = [
      {
        id: "sugg1",
        title: "Advanced Neural Network Package",
        description: "Complete neural network implementation with training examples",
        category: ListingCategory.MODEL,
        price: 79.99,
        tier: 3,
        status: ListingStatus.ACTIVE,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        downloads: 218,
        quantum_score: 88,
        creator_id: "user_234",
        file_path: "/uploads/neural-network.zip",
        s3_file_key: "listings/neural-network.zip",
        is_visible: true
      },
      {
        id: "sugg2",
        title: "Data Visualization Toolkit",
        description: "Comprehensive suite of data visualization components",
        category: ListingCategory.PLUGIN,
        price: 34.99,
        tier: 2,
        status: ListingStatus.ACTIVE,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        downloads: 186,
        quantum_score: 92,
        creator_id: "user_123",
        file_path: "/uploads/data-viz.zip",
        s3_file_key: "listings/data-viz.zip",
        is_visible: true
      },
      {
        id: "sugg3",
        title: "Machine Learning Starter Kit",
        description: "Everything you need to begin your ML journey",
        category: ListingCategory.TEMPLATE,
        price: 29.99,
        tier: 1,
        status: ListingStatus.ACTIVE,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        downloads: 321,
        quantum_score: 85,
        creator_id: "user_456",
        file_path: "/uploads/ml-starter.zip",
        s3_file_key: "listings/ml-starter.zip",
        is_visible: true
      }
    ];
    
    // Get all listings (combining user created and default)
    const allListings = [...userCreatedListings, ...defaultMockListings];
    
    // Filter active listings
    let suggestions = allListings.filter(l => l.status === ListingStatus.ACTIVE);
    
    // Exclude the current listing if specified
    if (excludeId && typeof excludeId === 'string') {
      suggestions = suggestions.filter(l => l.id !== excludeId);
    }
    
    // Filter by category if specified
    if (category && typeof category === 'string') {
      suggestions = suggestions.filter(l => l.category === category);
    }
    
    // Randomize order and limit to 5 items
    suggestions = suggestions
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);

    return res.status(200).json(suggestions);
  } catch (error) {
    console.error('Error fetching suggested listings:', error);
    return res.status(500).json({ error: 'Failed to fetch suggested listings' });
  }
} 