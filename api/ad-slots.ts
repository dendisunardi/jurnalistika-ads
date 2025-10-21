import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage.js';
import { verifyAuth } from './_middleware/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      const slots = await storage.getAdSlots();
      return res.status(200).json(slots);
    }

    if (req.method === 'POST') {
      const slotData = req.body;
      
      if (!slotData.name || !slotData.pricePerView) {
        return res.status(400).json({ message: 'Name and price per view are required' });
      }

      const newSlot = await storage.createAdSlot(slotData);
      return res.status(201).json(newSlot);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling ad slots request:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
