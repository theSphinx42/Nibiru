import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Supported audio file extensions
const SUPPORTED_FORMATS = ['.aaf', '.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const musicDir = path.join(process.cwd(), 'public', 'sounds', 'music');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(musicDir)) {
      fs.mkdirSync(musicDir, { recursive: true });
    }

    const files = fs.readdirSync(musicDir);

    if (files.length === 0) {
      return res.status(200).json([]);
    }

    const tracks = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return SUPPORTED_FORMATS.includes(ext);
      })
      .map((file, index) => ({
        name: `Track ${index + 1}`,
        displayName: path.basename(file), // Keep original name for tooltip
        path: `/sounds/music/${file}`
      }));

    if (tracks.length === 0) {
      console.log('No supported audio files found in directory');
    }

    res.status(200).json(tracks);
  } catch (error) {
    console.error('Error reading music directory:', error);
    res.status(500).json({ message: 'Failed to load music tracks' });
  }
} 