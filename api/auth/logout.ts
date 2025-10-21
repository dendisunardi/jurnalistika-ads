import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Clear auth cookie
  res.setHeader(
    'Set-Cookie',
    'auth-token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/'
  );

  return res.status(200).json({ message: 'Logged out successfully' });
}
