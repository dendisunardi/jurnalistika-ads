import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage.js';
import { verifyAuth } from '../_middleware/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // Check if user is admin
    const user = await storage.getUser(userId);
    if (user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Get all ads for admin review
    const allAds = await storage.getAllAds();
    return res.status(200).json(allAds);
  } catch (error) {
    console.error('Error fetching all ads:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
