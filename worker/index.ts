import { neon } from '@neondatabase/serverless';
import { createRemoteJWKSet, jwtVerify } from 'jose';

interface Env { DATABASE_URL: string; NEON_AUTH_JWKS_URL: string; }
type AuthUser = { id: string };
type Sql = ReturnType<typeof neon>;

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

async function requireUser(request: Request, env: Env): Promise<AuthUser> {
  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
  const token = header.slice(7);
  const jwks = createRemoteJWKSet(new URL(env.NEON_AUTH_JWKS_URL));
  const { payload } = await jwtVerify(token, jwks);
  if (!payload.sub) throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
  return { id: payload.sub };
}

async function sha256(value: string) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function ensureProfile(sql: Sql, userId: string) {
  await sql`insert into mymatchiq.profiles (user_id, privacy_config) values (${userId}::uuid, '{"passportPrivate":true,"shareResultsOnlyWithConsent":true}'::jsonb) on conflict (user_id) do nothing`;
  await sql`insert into mymatchiq.notification_preferences (user_id, preferences) values (${userId}::uuid, '{}'::jsonb) on conflict (user_id) do nothing`;
}

async function getTier(sql: Sql, userId: string) {
  const rows = await sql`select tier from mymatchiq.profiles where user_id=${userId}::uuid`;
  return String(rows[0]?.tier || 'free');
}

async function currentAssessmentVersion(sql: Sql) {
  const rows = await sql`select assessment_version from mymatchiq.assessment_questions where active=true order by created_at desc limit 1`;
  return rows[0]?.assessment_version ? String(rows[0].assessment_version) : null;
}

async function tierQuestions(sql: Sql, userId: string) {
  const tier = await getTier(sql, userId);
  const version = await currentAssessmentVersion(sql);
  if (!version) return { tier, version: null, questions: [] };
  const rows = await sql`
    select id, question_key, position, tier_scope, prompt_i18n, answer_options
    from mymatchiq.assessment_questions
    where assessment_version=${version} and active=true and (
      tier_scope='free' or
      (${tier} in ('premier','elite') and tier_scope='premier') or
      (${tier}='elite' and tier_scope='elite')
    )
    order by case tier_scope when 'free' then 1 when 'premier' then 2 else 3 end, position
  `;
  return { tier, version, questions: rows };
}

class ScoringUnavailable extends Error {}

async function computeCompatibility(sql: Sql, scanId: string) {
  const scanRows = await sql`select id, requester_user_id, counterpart_user_id, status from mymatchiq.scan_requests where id=${scanId}::uuid`;
  const scan = scanRows[0];
  if (!scan?.counterpart_user_id) throw new ScoringUnavailable('A counterpart is required.');

  const passports = await sql`
    select user_id, id, assessment_version from mymatchiq.compatibility_passports
    where status='complete' and user_id in (${scan.requester_user_id}::uuid, ${scan.counterpart_user_id}::uuid)
    order by completed_at desc
  `;
  const requesterPassport = passports.find((p:any) => String(p.user_id) === String(scan.requester_user_id));
  const counterpartPassport = passports.find((p:any) => String(p.user_id) === String(scan.counterpart_user_id));
  if (!requesterPassport || !counterpartPassport) throw new ScoringUnavailable('Both Compatibility Passports must be complete.');
  if (requesterPassport.assessment_version !== counterpartPassport.assessment_version) throw new ScoringUnavailable('Compatibility Passports use different assessment versions.');

  const rows = await sql`
    select q.question_key, q.scoring_metadata,
           a.answer_value->>'code' as requester_code,
           b.answer_value->>'code' as counterpart_code
    from mymatchiq.assessment_questions q
    join mymatchiq.assessment_answers a on a.question_id=q.id and a.passport_id=${requesterPassport.id}::uuid
    join mymatchiq.assessment_answers b on b.question_id=q.id and b.passport_id=${counterpartPassport.id}::uuid
    where q.assessment_version=${requesterPassport.assessment_version} and q.active=true
  `;
  if (!rows.length) throw new ScoringUnavailable('No approved scoring configuration is loaded.');

  let weighted = 0, totalWeight = 0;
  const dimensions: Record<string,{sum:number;weight:number}> = {};
  let algorithmVersion = '';

  for (const row of rows as any[]) {
    const meta = row.scoring_metadata || {};
    const pairScores = meta.pair_scores;
    const weight = Number(meta.weight);
    const a = String(row.requester_code || '');
    const b = String(row.counterpart_code || '');
    if (!pairScores || !Number.isFinite(weight) || weight <= 0 || !a || !b) throw new ScoringUnavailable(`Approved scoring metadata is incomplete for ${row.question_key}.`);
    const direct = `${a}|${b}`;
    const reverse = `${b}|${a}`;
    const raw = pairScores[direct] ?? pairScores[reverse];
    const pairScore = Number(raw);
    if (!Number.isFinite(pairScore) || pairScore < 0 || pairScore > 1) throw new ScoringUnavailable(`Approved pair scoring is missing for ${row.question_key}.`);
    const dimension = String(meta.dimension || 'overall');
    algorithmVersion = algorithmVersion || String(meta.algorithm_version || '');
    if (!algorithmVersion || !meta.algorithm_version || String(meta.algorithm_version) !== algorithmVersion) throw new ScoringUnavailable('Approved scoring algorithm version is missing or inconsistent.');
    weighted += pairScore * weight; totalWeight += weight;
    dimensions[dimension] ||= { sum: 0, weight: 0 };
    dimensions[dimension].sum += pairScore * weight; dimensions[dimension].weight += weight;
  }
  if (!totalWeight) throw new ScoringUnavailable('No approved scoring weights are available.');
  const score = Math.round((weighted / totalWeight) * 10000) / 100;
  const breakdown = Object.fromEntries(Object.entries(dimensions).map(([k,v]) => [k, Math.round((v.sum/v.weight)*10000)/100]));
  const saved = await sql`
    insert into mymatchiq.compatibility_results (scan_id, score, breakdown, algorithm_version)
    values (${scanId}::uuid, ${score}, ${JSON.stringify(breakdown)}::jsonb, ${algorithmVersion})
    on conflict (scan_id) do update set score=excluded.score, breakdown=excluded.breakdown, algorithm_version=excluded.algorithm_version, computed_at=now()
    returning score, breakdown, algorithm_version, computed_at
  `;
  await sql`update mymatchiq.scan_requests set status='computed' where id=${scanId}::uuid`;
  return saved[0];
}

async function optionalCompute(sql: Sql, scanId: string) {
  try { return { result: await computeCompatibility(sql, scanId), scoringPending: false }; }
  catch (e) { if (e instanceof ScoringUnavailable) return { result: null, scoringPending: true, scoringMessage: e.message }; throw e; }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const sql = neon(env.DATABASE_URL);
    try {
      if (url.pathname === '/api/health' && request.method === 'GET') {
        const db = await sql`select current_database() as database, now() as checked_at`;
        return json({ ok:true, service:'MyMatchIQ', database:db[0]?.database, checkedAt:db[0]?.checked_at });
      }

      const user = await requireUser(request, env);
      await ensureProfile(sql, user.id);

      if (url.pathname === '/api/profile/init' && request.method === 'POST') return json({ ok:true }, 201);

      if (url.pathname === '/api/me' && request.method === 'GET') {
        const rows = await sql`select u.id,u.name,u.email,p.tier,p.locale,p.verification_status,p.onboarding_complete,p.privacy_config from neon_auth."user" u join mymatchiq.profiles p on p.user_id=u.id where u.id=${user.id}::uuid`;
        return rows.length ? json(rows[0]) : json({error:'User not found'},404);
      }

      if (url.pathname === '/api/settings' && request.method === 'PATCH') {
        const body = await request.json() as any;
        if (body.locale && !['en','es','fr'].includes(body.locale)) return json({error:'Unsupported language'},400);
        if (body.locale) await sql`update mymatchiq.profiles set locale=${body.locale} where user_id=${user.id}::uuid`;
        if (body.privacyConfig && typeof body.privacyConfig === 'object') await sql`update mymatchiq.profiles set privacy_config=coalesce(privacy_config,'{}'::jsonb) || ${JSON.stringify(body.privacyConfig)}::jsonb where user_id=${user.id}::uuid`;
        if (body.notifications && typeof body.notifications === 'object') await sql`update mymatchiq.notification_preferences set preferences=${JSON.stringify(body.notifications)}::jsonb, updated_at=now() where user_id=${user.id}::uuid`;
        return json({ok:true});
      }

      if (url.pathname === '/api/legal/accept' && request.method === 'POST') {
        const body = await request.json() as any;
        if (!['terms','privacy','safety'].includes(body.documentType) || !body.documentVersion) return json({error:'Invalid legal acceptance'},400);
        await sql`insert into mymatchiq.legal_acceptances (user_id,document_type,document_version) values (${user.id}::uuid,${body.documentType},${body.documentVersion}) on conflict do nothing`;
        return json({ok:true},201);
      }

      if (url.pathname === '/api/assessment/questions' && request.method === 'GET') {
        const data = await tierQuestions(sql,user.id);
        return json(data);
      }

      if (url.pathname === '/api/passport' && request.method === 'GET') {
        const p = await sql`select id,assessment_version,status,completed_at,created_at,updated_at from mymatchiq.compatibility_passports where user_id=${user.id}::uuid order by created_at desc limit 1`;
        if (!p.length) return json({passport:null,answers:[]});
        const answers = await sql`select question_id,answer_value,answered_at from mymatchiq.assessment_answers where passport_id=${p[0].id}::uuid`;
        return json({passport:p[0],answers});
      }

      if (url.pathname === '/api/passport/answers' && request.method === 'POST') {
        const body = await request.json() as any;
        if (!body.questionId || typeof body.answerValue?.code !== 'string') return json({error:'Invalid answer'},400);
        const q = await sql`select id,assessment_version,answer_options from mymatchiq.assessment_questions where id=${body.questionId}::uuid and active=true`;
        if (!q.length) return json({error:'Question not found'},404);
        const options = Array.isArray(q[0].answer_options) ? q[0].answer_options as any[] : [];
        if (!options.some(o => String(o.code) === String(body.answerValue.code))) return json({error:'Answer option not allowed'},400);
        let p = await sql`select id,status from mymatchiq.compatibility_passports where user_id=${user.id}::uuid and assessment_version=${q[0].assessment_version} limit 1`;
        if (!p.length) p = await sql`insert into mymatchiq.compatibility_passports (user_id,assessment_version,status) values (${user.id}::uuid,${q[0].assessment_version},'draft') returning id,status`;
        if (p[0].status === 'archived') return json({error:'Passport is archived'},409);
        await sql`insert into mymatchiq.assessment_answers (passport_id,question_id,answer_value) values (${p[0].id}::uuid,${body.questionId}::uuid,${JSON.stringify(body.answerValue)}::jsonb) on conflict (passport_id,question_id) do update set answer_value=excluded.answer_value,answered_at=now(),updated_at=now()`;
        return json({ok:true,passportId:p[0].id},201);
      }

      if (url.pathname === '/api/passport/complete' && request.method === 'POST') {
        const data = await tierQuestions(sql,user.id);
        if (!data.version || !data.questions.length) return json({error:'No approved assessment question bank is loaded.'},409);
        const p = await sql`select id from mymatchiq.compatibility_passports where user_id=${user.id}::uuid and assessment_version=${data.version} limit 1`;
        if (!p.length) return json({error:'Start the Compatibility Passport first.'},409);
        const c = await sql`select count(*)::int as count from mymatchiq.assessment_answers where passport_id=${p[0].id}::uuid and question_id in (select id from mymatchiq.assessment_questions where assessment_version=${data.version} and active=true and (tier_scope='free' or (${data.tier} in ('premier','elite') and tier_scope='premier') or (${data.tier}='elite' and tier_scope='elite')))`;
        if (Number(c[0]?.count||0) !== data.questions.length) return json({error:`Complete all ${data.questions.length} required questions first.`},409);
        const done = await sql`update mymatchiq.compatibility_passports set status='complete',completed_at=now() where id=${p[0].id}::uuid returning id,assessment_version,status,completed_at`;
        await sql`update mymatchiq.profiles set onboarding_complete=true where user_id=${user.id}::uuid`;
        return json({passport:done[0]});
      }

      if (url.pathname === '/api/scans' && request.method === 'GET') {
        const rows = await sql`select s.id,s.scan_type,s.status,s.requester_user_id,s.counterpart_user_id,s.created_at,r.score,r.algorithm_version from mymatchiq.scan_requests s left join mymatchiq.compatibility_results r on r.scan_id=s.id where ${user.id}::uuid in (s.requester_user_id,s.counterpart_user_id) order by s.created_at desc limit 100`;
        return json({scans:rows});
      }

      if (url.pathname === '/api/scans/single' && request.method === 'POST') {
        const body = await request.json() as any;
        if (!body.counterpartUserId || body.counterpartUserId===user.id) return json({error:'Invalid member'},400);
        const complete = await sql`select mymatchiq.user_has_complete_passport(${user.id}::uuid) requester_complete,mymatchiq.user_has_complete_passport(${body.counterpartUserId}::uuid) counterpart_complete`;
        if (!complete[0]?.requester_complete || !complete[0]?.counterpart_complete) return json({error:'Both members need completed Compatibility Passports before a Single Scan can be calculated.'},409);
        const scan = await sql`insert into mymatchiq.scan_requests (scan_type,requester_user_id,counterpart_user_id,status) values ('single',${user.id}::uuid,${body.counterpartUserId}::uuid,'ready') returning id,status`;
        const computed = await optionalCompute(sql,String(scan[0].id));
        await sql`insert into mymatchiq.audit_events (user_id,event_type,entity_type,entity_id,metadata) values (${user.id}::uuid,'single_scan_created','scan',${scan[0].id}::uuid,'{"private":true,"counterpart_not_notified":true}'::jsonb)`;
        return json({scanId:scan[0].id,status:computed.result?'computed':'ready',...computed},201);
      }

      if (url.pathname === '/api/scans/dual' && request.method === 'POST') {
        const body = await request.json() as any;
        if (!body.inviteeUserId || body.inviteeUserId===user.id) return json({error:'Invalid invitee'},400);
        const tiers = await sql`select user_id,tier from mymatchiq.profiles where user_id in (${user.id}::uuid,${body.inviteeUserId}::uuid)`;
        const tierMap = Object.fromEntries((tiers as any[]).map(r=>[String(r.user_id),String(r.tier)]));
        if (!['premier','elite'].includes(tierMap[user.id]) || !['premier','elite'].includes(tierMap[body.inviteeUserId])) return json({error:'Dual Scan is available to Premier and Elite members.'},403);
        const complete = await sql`select mymatchiq.user_has_complete_passport(${user.id}::uuid) requester_complete,mymatchiq.user_has_complete_passport(${body.inviteeUserId}::uuid) invitee_complete`;
        if (!complete[0]?.requester_complete || !complete[0]?.invitee_complete) return json({error:'Both users must complete their Compatibility Passport before Dual Scan.'},409);
        const token = crypto.randomUUID()+crypto.randomUUID(); const tokenHash = await sha256(token);
        const scan = await sql`insert into mymatchiq.scan_requests (scan_type,requester_user_id,counterpart_user_id,status) values ('dual',${user.id}::uuid,${body.inviteeUserId}::uuid,'waiting_consent') returning id`;
        const invite = await sql`insert into mymatchiq.dual_scan_invitations (scan_id,inviter_user_id,invitee_user_id,token_hash,status,expires_at) values (${scan[0].id}::uuid,${user.id}::uuid,${body.inviteeUserId}::uuid,${tokenHash},'pending',now()+interval '72 hours') returning id,expires_at`;
        return json({scanId:scan[0].id,invitationId:invite[0].id,invitationToken:token,status:'waiting_consent',expiresAt:invite[0].expires_at},201);
      }

      if (url.pathname === '/api/invitations' && request.method === 'GET') {
        await sql`update mymatchiq.dual_scan_invitations set status='expired',responded_at=coalesce(responded_at,now()) where invitee_user_id=${user.id}::uuid and status='pending' and expires_at<=now()`;
        const rows = await sql`select i.id,i.scan_id,i.inviter_user_id,u.name inviter_name,i.status,i.expires_at,i.created_at from mymatchiq.dual_scan_invitations i join neon_auth."user" u on u.id=i.inviter_user_id where i.invitee_user_id=${user.id}::uuid and i.status='pending' order by i.created_at desc`;
        return json({invitations:rows});
      }

      const inviteRespond = url.pathname.match(/^\/api\/invitations\/([0-9a-f-]+)\/respond$/i);
      if (inviteRespond && request.method === 'POST') {
        const body = await request.json() as any; const action = body.action;
        if (!['accept','decline'].includes(action)) return json({error:'Invalid response'},400);
        const rows = await sql`select i.id,i.scan_id,i.status,i.expires_at,i.invitee_user_id from mymatchiq.dual_scan_invitations i where i.id=${inviteRespond[1]}::uuid and i.invitee_user_id=${user.id}::uuid`;
        const i:any=rows[0]; if(!i) return json({error:'Invitation not found'},404);
        if(i.status!=='pending') return json({error:'Invitation is no longer pending',status:i.status},409);
        if(new Date(i.expires_at).getTime()<=Date.now()){await sql`update mymatchiq.dual_scan_invitations set status='expired',responded_at=now() where id=${i.id}::uuid`;await sql`update mymatchiq.scan_requests set status='expired' where id=${i.scan_id}::uuid`;return json({error:'Invitation expired'},410);}
        const accepted=action==='accept';
        await sql`update mymatchiq.dual_scan_invitations set status=${accepted?'accepted':'declined'},responded_at=now() where id=${i.id}::uuid`;
        await sql`insert into mymatchiq.consent_events (scan_id,user_id,consent_scope,action) values (${i.scan_id}::uuid,${user.id}::uuid,'dual_scan',${accepted?'granted':'declined'})`;
        await sql`update mymatchiq.scan_requests set status=${accepted?'ready':'declined'} where id=${i.scan_id}::uuid`;
        if(!accepted) return json({scanId:i.scan_id,status:'declined'});
        const computed=await optionalCompute(sql,String(i.scan_id));
        return json({scanId:i.scan_id,status:computed.result?'computed':'ready',...computed});
      }

      const resultMatch=url.pathname.match(/^\/api\/scans\/([0-9a-f-]+)\/result$/i);
      if(resultMatch&&request.method==='GET'){
        const rows=await sql`select r.score,r.breakdown,r.algorithm_version,r.computed_at from mymatchiq.compatibility_results r join mymatchiq.scan_requests s on s.id=r.scan_id where r.scan_id=${resultMatch[1]}::uuid and ${user.id}::uuid in (s.requester_user_id,s.counterpart_user_id)`;
        return rows.length?json(rows[0]):json({error:'Result not available'},404);
      }

      if(url.pathname==='/api/verification'&&request.method==='GET'){
        const rows=await sql`select p.verification_status,v.status,v.verified_at,v.expires_at from mymatchiq.profiles p left join lateral (select status,verified_at,expires_at from mymatchiq.verification_records where user_id=p.user_id order by created_at desc limit 1) v on true where p.user_id=${user.id}::uuid`;
        return json({verification:rows[0]||{verification_status:'unverified'}});
      }

      if(url.pathname==='/api/connections'&&request.method==='GET'){
        const rows=await sql`select c.*,h.status handoff_status,h.handoff_reference,h.expires_at handoff_expires_at from mymatchiq.connection_requests c left join mymatchiq.o2ol_handoffs h on h.connection_request_id=c.id where ${user.id}::uuid in (c.user_a,c.user_b) order by c.created_at desc`;
        return json({connections:rows});
      }

      if(url.pathname==='/api/connections'&&request.method==='POST'){
        const body=await request.json() as any;
        if(!body.otherUserId||!body.scanId||body.otherUserId===user.id) return json({error:'Invalid connection request'},400);
        const scan=await sql`select s.id from mymatchiq.scan_requests s join mymatchiq.compatibility_results r on r.scan_id=s.id where s.id=${body.scanId}::uuid and ${user.id}::uuid in (s.requester_user_id,s.counterpart_user_id) and ${body.otherUserId}::uuid in (s.requester_user_id,s.counterpart_user_id)`;
        if(!scan.length) return json({error:'A completed compatibility result between these users is required.'},409);
        const c=await sql`insert into mymatchiq.connection_requests (initiated_by,user_a,user_b,scan_id,status) values (${user.id}::uuid,${user.id}::uuid,${body.otherUserId}::uuid,${body.scanId}::uuid,'pending') returning *`;
        return json({connection:c[0]},201);
      }

      const connectionRespond=url.pathname.match(/^\/api\/connections\/([0-9a-f-]+)\/respond$/i);
      if(connectionRespond&&request.method==='POST'){
        const body=await request.json() as any; if(!['accept','decline'].includes(body.action)) return json({error:'Invalid response'},400);
        const rows=await sql`select * from mymatchiq.connection_requests where id=${connectionRespond[1]}::uuid and status='pending' and ${user.id}::uuid in (user_a,user_b) and initiated_by<>${user.id}::uuid`;
        if(!rows.length) return json({error:'Connection request not found'},404);
        const accepted=body.action==='accept';
        await sql`update mymatchiq.connection_requests set status=${accepted?'accepted':'declined'},responded_at=now() where id=${connectionRespond[1]}::uuid`;
        await sql`insert into mymatchiq.consent_events (scan_id,user_id,consent_scope,action) values (${rows[0].scan_id}::uuid,${user.id}::uuid,'connection',${accepted?'granted':'declined'})`;
        if(accepted) await sql`insert into mymatchiq.o2ol_handoffs (connection_request_id,status) values (${connectionRespond[1]}::uuid,'ready') on conflict (connection_request_id) do nothing`;
        return json({connectionId:connectionRespond[1],status:accepted?'accepted':'declined',handoffStatus:accepted?'ready':null});
      }

      const handoff=url.pathname.match(/^\/api\/connections\/([0-9a-f-]+)\/handoff$/i);
      if(handoff&&request.method==='GET'){
        const rows=await sql`select h.status,h.handoff_reference,h.expires_at from mymatchiq.o2ol_handoffs h join mymatchiq.connection_requests c on c.id=h.connection_request_id where h.connection_request_id=${handoff[1]}::uuid and c.status='accepted' and ${user.id}::uuid in (c.user_a,c.user_b)`;
        return rows.length?json({handoff:rows[0]}):json({error:'One2OneLove handoff not ready'},404);
      }

      return json({error:'Not found'},404);
    } catch(error){
      if(error instanceof Response) return error;
      console.error(error);
      return json({error:'Internal server error'},500);
    }
  }
};
