import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../../server/storage.js';
import { verifyAuth } from '../../../_middleware/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Ad ID is required' });
    }

    if (req.method !== 'PATCH') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // Check if user is admin
    const user = await storage.getUser(userId);
    if (user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status } = req.body;

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required (approved, rejected, pending)' });
    }

    await storage.updateAdStatus(id, { status });
    const updatedAd = await storage.getAdById(id);
    
    return res.status(200).json(updatedAd);
  } catch (error) {
    console.error('Error updating ad status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
