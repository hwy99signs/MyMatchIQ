import { getAccessToken } from './auth';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('authorization', `Bearer ${token}`);
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');

  const response = await fetch(path, { ...init, headers, cache: 'no-store' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error || `Request failed (${response.status})`) as Error & { status?: number; data?: any };
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data as T;
}

export const api = {
  health: () => request<any>('/api/health'),
  me: () => request<any>('/api/me'),
  initProfile: () => request<any>('/api/profile/init', { method: 'POST' }),
  settings: (body: any) => request<any>('/api/settings', { method: 'PATCH', body: JSON.stringify(body) }),
  questions: () => request<any>('/api/assessment/questions'),
  passport: () => request<any>('/api/passport'),
  saveAnswer: (questionId: string, code: string) => request<any>('/api/passport/answers', {
    method: 'POST',
    body: JSON.stringify({ questionId, answerValue: { code } }),
  }),
  completePassport: () => request<any>('/api/passport/complete', { method: 'POST' }),
  scans: () => request<any>('/api/scans'),
  singleScan: (counterpartUserId: string) => request<any>('/api/scans/single', {
    method: 'POST',
    body: JSON.stringify({ counterpartUserId }),
  }),
  dualScan: (inviteeUserId: string) => request<any>('/api/scans/dual', {
    method: 'POST',
    body: JSON.stringify({ inviteeUserId }),
  }),
  invitations: () => request<any>('/api/invitations'),
  respondInvitation: (invitationId: string, action: 'accept' | 'decline') => request<any>(`/api/invitations/${invitationId}/respond`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  }),
  scanResult: (scanId: string) => request<any>(`/api/scans/${scanId}/result`),
  shares: () => request<any>('/api/shares'),
  createShare: (viewerUserId: string, expiresAt?: string) => request<any>('/api/shares', { method: 'POST', body: JSON.stringify({ viewerUserId, expiresAt }) }),
  revokeShare: (viewerUserId: string) => request<any>(`/api/shares/${viewerUserId}`, { method: 'DELETE' }),
  privacyExport: () => request<any>('/api/privacy/export'),
  verification: () => request<any>('/api/verification'),
  connections: () => request<any>('/api/connections'),
  createConnection: (otherUserId: string, scanId: string) => request<any>('/api/connections', {
    method: 'POST',
    body: JSON.stringify({ otherUserId, scanId }),
  }),
  respondConnection: (connectionId: string, action: 'accept' | 'decline') => request<any>(`/api/connections/${connectionId}/respond`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  }),
  handoff: (connectionId: string) => request<any>(`/api/connections/${connectionId}/handoff`),
  acceptLegal: (documentType: 'terms' | 'privacy' | 'safety', documentVersion: string) => request<any>('/api/legal/accept', {
    method: 'POST',
    body: JSON.stringify({ documentType, documentVersion }),
  }),
};
