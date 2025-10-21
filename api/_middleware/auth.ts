import type { VercelRequest } from '@vercel/node';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'your-jwt-secret-key'
);

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export async function verifyAuth(req: VercelRequest): Promise<string | null> {
  // Check for token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    return payload?.userId || null;
  }

  // Check for token in cookies
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenMatch = cookies.match(/auth-token=([^;]+)/);
    if (tokenMatch) {
      const token = tokenMatch[1];
      const payload = await verifyToken(token);
      return payload?.userId || null;
    }
  }

  return null;
}

export function setAuthCookie(res: any, token: string) {
  res.setHeader(
    'Set-Cookie',
    `auth-token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`
  );
}
