import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage.js';
import { verifyAuth } from '../_middleware/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      // Get all ads for the advertiser
      const ads = await storage.getAdsByAdvertiser(userId);
      return res.status(200).json(ads);
    }

    if (req.method === 'POST') {
      // Create new ad
      const adData = req.body;
      
      if (!adData.title || !adData.description) {
        return res.status(400).json({ message: 'Title and description are required' });
      }

      const newAd = await storage.createAd({
        ...adData,
        advertiserId: userId,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return res.status(201).json(newAd);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling ads request:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
