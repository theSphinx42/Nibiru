import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { Listing, ListingStatus } from '../../../types/listing';

export const config = {
  api: {
    bodyParser: false,
  },
};

// This would normally be in a real database, but for this mock we'll use a combination of in-memory and file storage
// Each listing is keyed by ID
interface MockListingsStore {
  [key: string]: Listing;
}

// In-memory store
export const mockListingsStore: MockListingsStore = {};

// Initialize mock data from file if it exists
try {
  const dataDir = path.join(process.cwd(), 'data');
  const filePath = path.join(dataDir, 'mockListings.json');
  
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const storedListings = JSON.parse(fileContent);
    
    // Populate the in-memory store
    Object.assign(mockListingsStore, storedListings);
    console.log(`Loaded ${Object.keys(storedListings).length} listings from mockListings.json`);
  }
} catch (error) {
  console.error('Error loading mock listings from file:', error);
}

// Helper function to persist listings to file
export const persistListingsToFile = () => {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filePath = path.join(dataDir, 'mockListings.json');
    fs.writeFileSync(filePath, JSON.stringify(mockListingsStore, null, 2));
    console.log(`Persisted ${Object.keys(mockListingsStore).length} listings to mockListings.json`);
  } catch (error) {
    console.error('Error persisting mock listings to file:', error);
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB
      uploadDir: path.join(process.cwd(), 'public/uploads'),
      keepExtensions: true,
    });

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const [fields, files] = await new Promise<[formidable.Fields<string>, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err: Error | null, fields: formidable.Fields<string>, files: formidable.Files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const listingData = JSON.parse(fields.data?.[0] || '{}');
    const uploadedFile = files.file?.[0];
    
    if (!uploadedFile) {
      throw new Error('No file uploaded');
    }

    // Generate a random ID
    const listingId = Math.random().toString(36).substring(7);
    
    // Create the listing
    const newListing: Listing = {
      id: listingId,
      title: listingData.title,
      description: listingData.description,
      category: listingData.category,
      price: Number(listingData.price),
      tier: Number(listingData.tier),
      status: listingData.visibility === 'testing' ? ListingStatus.TESTING : ListingStatus.ACTIVE,
      file_path: `/uploads/${uploadedFile.newFilename}`,
      s3_file_key: `listings/${uploadedFile.newFilename}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      downloads: 0,
      quantum_score: Math.floor(Math.random() * 100),
      creator_id: 'user_123', // This would come from the authenticated session
      is_visible: listingData.visibility === 'testing' ? false : true,
    };
    
    // Store the listing in our mock store
    mockListingsStore[listingId] = newListing;
    
    // Persist to file for better durability
    persistListingsToFile();
    
    // For debugging, let's log what listings we've created
    console.log(`Created listing: ${listingId}`);
    console.log(`Store now contains ${Object.keys(mockListingsStore).length} listings`);
    console.log(`Store keys: ${Object.keys(mockListingsStore).join(', ')}`);

    // Return the newly created listing
    res.status(201).json(newListing);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
} 