import { createAuthClient } from '@neondatabase/auth';

export const NEON_AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL || '';

if (!NEON_AUTH_URL) {
  console.warn('MyMatchIQ: VITE_NEON_AUTH_URL is not configured. Authenticated product routes will remain unavailable until deployment configuration is supplied.');
}

export const authClient = createAuthClient(NEON_AUTH_URL) as any;

export async function signUp(name: string, email: string, password: string) {
  if (!NEON_AUTH_URL) throw new Error('MyMatchIQ authentication is not configured for this environment.');
  return authClient.signUp.email({ name, email, password });
}

export async function signIn(email: string, password: string) {
  if (!NEON_AUTH_URL) throw new Error('MyMatchIQ authentication is not configured for this environment.');
  return authClient.signIn.email({ email, password });
}

export async function signOut() {
  if (!NEON_AUTH_URL) return;
  return authClient.signOut();
}

export async function getSession() {
  if (!NEON_AUTH_URL) return null;
  const result = await authClient.getSession();
  return result?.data ?? result ?? null;
}

export async function getAccessToken(): Promise<string | null> {
  if (!NEON_AUTH_URL) return null;
  if (typeof authClient.getJWTToken === 'function') {
    const tokenResult = await authClient.getJWTToken();
    if (typeof tokenResult === 'string') return tokenResult;
    if (typeof tokenResult?.data === 'string') return tokenResult.data;
    if (typeof tokenResult?.data?.token === 'string') return tokenResult.data.token;
    if (typeof tokenResult?.token === 'string') return tokenResult.token;
  }

  const session = await getSession();
  return (
    session?.session?.token ||
    session?.token ||
    session?.accessToken ||
    session?.access_token ||
    null
  );
}
