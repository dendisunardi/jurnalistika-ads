import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../server/storage.js';
import { signToken, setAuthCookie } from '../../_middleware/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ message: 'Missing authorization code' });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `https://${process.env.APP_DOMAINS?.split(',')[0] || req.headers.host}/api/auth/callback/google`,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      throw new Error('Failed to get access token');
    }

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const profile = await userInfoResponse.json();

    // Upsert user in database
    const googleId = `google_${profile.id}`;
    await storage.upsertUser({
      id: googleId,
      email: profile.email || '',
      firstName: profile.given_name || '',
      lastName: profile.family_name || '',
      profileImageUrl: profile.picture || '',
    });

    // Create JWT token
    const jwtToken = await signToken({
      userId: googleId,
      email: profile.email,
    });

    // Set cookie and redirect
    setAuthCookie(res, jwtToken);
    
    return res.redirect('/');
  } catch (error) {
    console.error('Google OAuth error:', error);
    return res.status(500).json({ message: 'Authentication failed' });
  }
}
