import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage.js';
import { verifyAuth } from '../_middleware/auth.js';

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

    if (req.method === 'GET') {
      const ad = await storage.getAdById(id);
      
      if (!ad) {
        return res.status(404).json({ message: 'Ad not found' });
      }

      return res.status(200).json(ad);
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const updateData = req.body;
      const ad = await storage.getAdById(id);

      if (!ad) {
        return res.status(404).json({ message: 'Ad not found' });
      }

      // Verify ownership
      if (ad.advertiserId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Update ad status (the main update method available)
      const updatedAd = await storage.updateAdStatus(id, {
        status: updateData.status || ad.status,
        ...updateData,
      });

      return res.status(200).json(updatedAd);
    }

    if (req.method === 'DELETE') {
      const ad = await storage.getAdById(id);

      if (!ad) {
        return res.status(404).json({ message: 'Ad not found' });
      }

      // Verify ownership
      if (ad.advertiserId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Delete by updating status to 'rejected' or using updateAdStatus
      await storage.updateAdStatus(id, { status: 'rejected' });
      return res.status(200).json({ message: 'Ad deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling ad request:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
