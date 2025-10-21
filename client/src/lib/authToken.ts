// Vercel-compatible auth utilities
export function getAuthToken(): string | null {
  // Check for token in localStorage (for Bearer token approach)
  const token = localStorage.getItem('auth-token');
  if (token) {
    return token;
  }
  
  // Token might be in HTTP-only cookie (handled by browser automatically)
  return null;
}

export function setAuthToken(token: string) {
  localStorage.setItem('auth-token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('auth-token');
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
  return {
    'Content-Type': 'application/json',
  };
}
