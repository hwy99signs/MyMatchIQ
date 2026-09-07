import { neon } from '@neondatabase/serverless';
import { createRemoteJWKSet, jwtVerify } from 'jose';

interface Env {
  DATABASE_URL: string;
  NEON_AUTH_JWKS_URL: string;
}

type AuthUser = { id: string };

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

async function requireUser(request: Request, env: Env): Promise<AuthUser> {
  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) throw new Response('Unauthorized', { status: 401 });
  const token = header.slice(7);
  const jwks = createRemoteJWKSet(new URL(env.NEON_AUTH_JWKS_URL));
  const { payload } = await jwtVerify(token, jwks);
  if (!payload.sub) throw new Response('Unauthorized', { status: 401 });
  return { id: payload.sub };
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const sql = neon(env.DATABASE_URL);

    try {
      if (url.pathname === '/api/health' && request.method === 'GET') {
        const db = await sql`select current_database() as database, now() as checked_at`;
        return json({ ok: true, service: 'MyMatchIQ', database: db[0]?.database, checkedAt: db[0]?.checked_at });
      }

      const user = await requireUser(request, env);

      if (url.pathname === '/api/me' && request.method === 'GET') {
        const rows = await sql`
          select u.id, u.name, u.email,
                 p.tier, p.locale, p.verification_status, p.onboarding_complete, p.privacy_config
          from neon_auth."user" u
          left join mymatchiq.profiles p on p.user_id = u.id
          where u.id = ${user.id}::uuid
        `;
        return rows.length ? json(rows[0]) : json({ error: 'User not found' }, 404);
      }

      if (url.pathname === '/api/passport' && request.method === 'GET') {
        const rows = await sql`
          select id, assessment_version, status, completed_at, created_at, updated_at
          from mymatchiq.compatibility_passports
          where user_id = ${user.id}::uuid
          order by created_at desc
          limit 1
        `;
        return json({ passport: rows[0] ?? null });
      }

      if (url.pathname === '/api/scans/dual' && request.method === 'POST') {
        const body = (await request.json()) as { inviteeUserId?: string; expiresHours?: number };
        if (!body.inviteeUserId || body.inviteeUserId === user.id) return json({ error: 'Invalid invitee' }, 400);

        const completeness = await sql`
          select
            mymatchiq.user_has_complete_passport(${user.id}::uuid) as requester_complete,
            mymatchiq.user_has_complete_passport(${body.inviteeUserId}::uuid) as invitee_complete
        `;
        if (!completeness[0]?.requester_complete || !completeness[0]?.invitee_complete) {
          return json({ error: 'Both users must complete their Compatibility Passport before Dual Scan.' }, 409);
        }

        const token = crypto.randomUUID() + crypto.randomUUID();
        const tokenHash = await sha256(token);
        const hours = Math.min(Math.max(Number(body.expiresHours || 72), 1), 168);
        const scan = await sql`
          insert into mymatchiq.scan_requests (scan_type, requester_user_id, counterpart_user_id, status)
          values ('dual', ${user.id}::uuid, ${body.inviteeUserId}::uuid, 'waiting_consent')
          returning id
        `;
        await sql`
          insert into mymatchiq.dual_scan_invitations
            (scan_id, inviter_user_id, invitee_user_id, token_hash, status, expires_at)
          values
            (${scan[0].id}::uuid, ${user.id}::uuid, ${body.inviteeUserId}::uuid, ${tokenHash}, 'pending', now() + (${hours} || ' hours')::interval)
        `;
        return json({ scanId: scan[0].id, invitationToken: token, status: 'waiting_consent' }, 201);
      }

      if (url.pathname === '/api/invitations/respond' && request.method === 'POST') {
        const body = (await request.json()) as { token?: string; action?: 'accept' | 'decline' };
        if (!body.token || !['accept', 'decline'].includes(body.action || '')) return json({ error: 'Invalid response' }, 400);
        const tokenHash = await sha256(body.token);
        const invitations = await sql`
          select id, scan_id, invitee_user_id, status, expires_at
          from mymatchiq.dual_scan_invitations
          where token_hash = ${tokenHash}
          limit 1
        `;
        const invitation = invitations[0];
        if (!invitation || invitation.invitee_user_id !== user.id) return json({ error: 'Invitation not found' }, 404);
        if (invitation.status !== 'pending') return json({ error: 'Invitation is no longer pending', status: invitation.status }, 409);
        if (new Date(invitation.expires_at as string).getTime() <= Date.now()) {
          await sql`update mymatchiq.dual_scan_invitations set status='expired', responded_at=now() where id=${invitation.id}::uuid`;
          await sql`update mymatchiq.scan_requests set status='expired' where id=${invitation.scan_id}::uuid`;
          return json({ error: 'Invitation expired' }, 410);
        }

        const accepted = body.action === 'accept';
        await sql`
          update mymatchiq.dual_scan_invitations
          set status=${accepted ? 'accepted' : 'declined'}, responded_at=now()
          where id=${invitation.id}::uuid
        `;
        await sql`
          insert into mymatchiq.consent_events (scan_id,user_id,consent_scope,action)
          values (${invitation.scan_id}::uuid, ${user.id}::uuid, 'dual_scan', ${accepted ? 'granted' : 'declined'})
        `;
        await sql`
          update mymatchiq.scan_requests
          set status=${accepted ? 'ready' : 'declined'}
          where id=${invitation.scan_id}::uuid
        `;
        return json({ scanId: invitation.scan_id, status: accepted ? 'ready' : 'declined' });
      }

      const readiness = url.pathname.match(/^\/api\/scans\/([0-9a-f-]+)\/readiness$/i);
      if (readiness && request.method === 'GET') {
        const scanId = readiness[1];
        const access = await sql`
          select id from mymatchiq.scan_requests
          where id=${scanId}::uuid and (${user.id}::uuid in (requester_user_id, counterpart_user_id))
        `;
        if (!access.length) return json({ error: 'Scan not found' }, 404);
        const rows = await sql`select mymatchiq.dual_scan_is_ready(${scanId}::uuid) as ready`;
        return json({ scanId, ready: Boolean(rows[0]?.ready) });
      }

      const resultMatch = url.pathname.match(/^\/api\/scans\/([0-9a-f-]+)\/result$/i);
      if (resultMatch && request.method === 'GET') {
        const scanId = resultMatch[1];
        const rows = await sql`
          select r.score, r.breakdown, r.algorithm_version, r.computed_at
          from mymatchiq.compatibility_results r
          join mymatchiq.scan_requests s on s.id=r.scan_id
          where r.scan_id=${scanId}::uuid
            and (${user.id}::uuid in (s.requester_user_id, s.counterpart_user_id))
        `;
        return rows.length ? json(rows[0]) : json({ error: 'Result not available' }, 404);
      }

      return json({ error: 'Not found' }, 404);
    } catch (error) {
      if (error instanceof Response) return error;
      console.error(error);
      return json({ error: 'Internal server error' }, 500);
    }
  },
};
