from pathlib import Path

worker = Path('worker/index.ts')
text = worker.read_text()
anchor = "      if(url.pathname==='/api/verification'&&request.method==='GET'){"
insert = '''      if(url.pathname==='/api/shares'&&request.method==='GET'){
        await sql`update mymatchiq.compatibility_shares set status='expired',updated_at=now() where owner_user_id=${user.id}::uuid and status='active' and expires_at is not null and expires_at<=now()`;
        const rows=await sql`select s.id,s.viewer_user_id,u.name viewer_name,s.status,s.expires_at,s.created_at from mymatchiq.compatibility_shares s join neon_auth."user" u on u.id=s.viewer_user_id where s.owner_user_id=${user.id}::uuid and s.status='active' order by s.created_at desc`;
        return json({shares:rows});
      }

      if(url.pathname==='/api/shares'&&request.method==='POST'){
        const body=await request.json() as any;
        if(!body.viewerUserId||body.viewerUserId===user.id) return json({error:'Invalid viewer'},400);
        const viewer=await sql`select id from neon_auth."user" where id=${body.viewerUserId}::uuid`;
        if(!viewer.length) return json({error:'Member not found'},404);
        const complete=await sql`select mymatchiq.user_has_complete_passport(${user.id}::uuid) as complete`;
        if(!complete[0]?.complete) return json({error:'Complete your Compatibility Passport before sharing compatibility access.'},409);
        let expiresAt:string|null=null;
        if(body.expiresAt){ const d=new Date(body.expiresAt); if(Number.isNaN(d.getTime())||d.getTime()<=Date.now()) return json({error:'Invalid expiration'},400); expiresAt=d.toISOString(); }
        const rows=await sql`insert into mymatchiq.compatibility_shares (owner_user_id,viewer_user_id,status,expires_at) values (${user.id}::uuid,${body.viewerUserId}::uuid,'active',${expiresAt}::timestamptz) on conflict (owner_user_id,viewer_user_id) do update set status='active',expires_at=excluded.expires_at,updated_at=now() returning id,viewer_user_id,status,expires_at,created_at`;
        await sql`insert into mymatchiq.consent_events (user_id,consent_scope,action,metadata) values (${user.id}::uuid,'compatibility_share','granted',${JSON.stringify({viewerUserId:body.viewerUserId})}::jsonb)`;
        return json({share:rows[0]},201);
      }

      const shareRevoke=url.pathname.match(/^\\/api\\/shares\\/([0-9a-f-]+)$/i);
      if(shareRevoke&&request.method==='DELETE'){
        const rows=await sql`update mymatchiq.compatibility_shares set status='revoked',updated_at=now() where owner_user_id=${user.id}::uuid and viewer_user_id=${shareRevoke[1]}::uuid and status='active' returning id`;
        if(!rows.length) return json({error:'Active share not found'},404);
        await sql`insert into mymatchiq.consent_events (user_id,consent_scope,action,metadata) values (${user.id}::uuid,'compatibility_share','revoked',${JSON.stringify({viewerUserId:shareRevoke[1]})}::jsonb)`;
        return json({ok:true});
      }

      if(url.pathname==='/api/privacy/export'&&request.method==='GET'){
        const [profile,passports,answers,scans,shares,connections,legal,notifications]=await Promise.all([
          sql`select u.id,u.name,u.email,p.tier,p.locale,p.verification_status,p.onboarding_complete,p.privacy_config,p.created_at from neon_auth."user" u join mymatchiq.profiles p on p.user_id=u.id where u.id=${user.id}::uuid`,
          sql`select * from mymatchiq.compatibility_passports where user_id=${user.id}::uuid order by created_at`,
          sql`select a.* from mymatchiq.assessment_answers a join mymatchiq.compatibility_passports p on p.id=a.passport_id where p.user_id=${user.id}::uuid order by a.answered_at`,
          sql`select s.id,s.scan_type,s.status,s.requester_user_id,s.counterpart_user_id,s.created_at,r.score,r.breakdown,r.algorithm_version,r.computed_at from mymatchiq.scan_requests s left join mymatchiq.compatibility_results r on r.scan_id=s.id where ${user.id}::uuid in (s.requester_user_id,s.counterpart_user_id) order by s.created_at`,
          sql`select owner_user_id,viewer_user_id,status,expires_at,created_at,updated_at from mymatchiq.compatibility_shares where ${user.id}::uuid in (owner_user_id,viewer_user_id) order by created_at`,
          sql`select c.*,h.status handoff_status,h.handoff_reference from mymatchiq.connection_requests c left join mymatchiq.o2ol_handoffs h on h.connection_request_id=c.id where ${user.id}::uuid in (c.user_a,c.user_b) order by c.created_at`,
          sql`select document_type,document_version,accepted_at from mymatchiq.legal_acceptances where user_id=${user.id}::uuid order by accepted_at`,
          sql`select preferences,updated_at from mymatchiq.notification_preferences where user_id=${user.id}::uuid`
        ]);
        return json({exportedAt:new Date().toISOString(),profile:profile[0]||null,passports,answers,scans,shares,connections,legalAcceptances:legal,notificationPreferences:notifications[0]||null});
      }

'''
if anchor not in text:
    raise SystemExit('worker anchor not found')
if "url.pathname==='/api/shares'" not in text:
    worker.write_text(text.replace(anchor, insert + anchor))

api = Path('frontend/src/api.ts')
text = api.read_text()
anchor = "  verification: () => request<any>('/api/verification'),"
insert = "  shares: () => request<any>('/api/shares'),\n  createShare: (viewerUserId: string, expiresAt?: string) => request<any>('/api/shares', { method: 'POST', body: JSON.stringify({ viewerUserId, expiresAt }) }),\n  revokeShare: (viewerUserId: string) => request<any>(`/api/shares/${viewerUserId}`, { method: 'DELETE' }),\n  privacyExport: () => request<any>('/api/privacy/export'),\n"
if anchor not in text:
    raise SystemExit('api anchor not found')
if 'privacyExport:' not in text:
    api.write_text(text.replace(anchor, insert + anchor))

app = Path('frontend/src/ProductApp.tsx')
text = app.read_text()
state_anchor = "  const [dualTarget, setDualTarget] = useState('');"
if state_anchor not in text:
    raise SystemExit('state anchor not found')
if 'setShareTarget' not in text:
    text = text.replace(state_anchor, state_anchor + "\n  const [shareTarget, setShareTarget] = useState('');\n  const [shares, setShares] = useState<any[]>([]);")

fn_anchor = "  async function updateLanguage(locale:Language) {"
fn_insert = '''  async function loadShares() {
    try { const r = await api.shares(); setShares(r.shares || []); } catch(e:any) { setError(e.message); }
  }

  async function createShare() {
    if(!shareTarget.trim()) return;
    setBusy(true); setError(''); setNotice('');
    try { await api.createShare(shareTarget.trim()); setShareTarget(''); setNotice('Compatibility sharing access granted. You can revoke it at any time.'); await loadShares(); }
    catch(e:any){ setError(e.message); }
    finally{ setBusy(false); }
  }

  async function revokeShare(viewerUserId:string) {
    setBusy(true); setError('');
    try { await api.revokeShare(viewerUserId); setNotice('Compatibility sharing access revoked.'); await loadShares(); }
    catch(e:any){ setError(e.message); }
    finally{ setBusy(false); }
  }

  async function downloadPrivacyExport() {
    setBusy(true); setError('');
    try {
      const data=await api.privacyExport();
      const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
      const link=document.createElement('a'); link.href=URL.createObjectURL(blob); link.download=`mymatchiq-data-${new Date().toISOString().slice(0,10)}.json`; link.click(); URL.revokeObjectURL(link.href);
      setNotice('Your MyMatchIQ data export was prepared.');
    } catch(e:any){ setError(e.message); }
    finally{ setBusy(false); }
  }

'''
if fn_anchor not in text:
    raise SystemExit('function anchor not found')
if 'async function loadShares' not in text:
    text = text.replace(fn_anchor, fn_insert + fn_anchor)

effect_old = "  useEffect(() => { if (tab === 'passport') loadPassport(); if (tab === 'scans') loadScans(); }, [tab]);"
effect_new = "  useEffect(() => { if (tab === 'passport') loadPassport(); if (tab === 'scans') loadScans(); if (tab === 'settings') loadShares(); }, [tab]);"
text = text.replace(effect_old, effect_new)

settings_anchor = '        <section className="miq-card"><h2>Legal & Safety</h2>'
settings_insert = '''        <section className="miq-card"><h2>Compatibility Sharing</h2><p className="miq-muted">Your Passport stays private. Grant a specific MyMatchIQ member permission to receive compatibility-sharing access, then revoke that permission whenever you choose.</p><div className="miq-field"><label>Member ID</label><input value={shareTarget} onChange={e=>setShareTarget(e.target.value)} placeholder="User ID" /></div><div className="miq-actions"><button className="miq-button" disabled={busy || passport?.status!=='complete'} onClick={createShare}>Grant Access</button></div><div className="miq-list">{!shares.length&&<p className="miq-muted">You have not granted compatibility-sharing access to anyone.</p>}{shares.map(s=><div className="miq-row" key={s.id}><div><strong>{s.viewer_name || s.viewer_user_id}</strong><span className="miq-muted">Active compatibility access{s.expires_at ? ` • expires ${new Date(s.expires_at).toLocaleString()}` : ''}</span></div><button className="miq-button danger" onClick={()=>revokeShare(s.viewer_user_id)}>Revoke</button></div>)}</div></section>
        <section className="miq-card half"><h2>Your Data</h2><p className="miq-muted">Download a portable JSON copy of the MyMatchIQ information associated with your account, including Passport answers, scan records, sharing permissions, legal acceptance and connection state.</p><div className="miq-actions"><button className="miq-button secondary" disabled={busy} onClick={downloadPrivacyExport}>Download My Data</button></div></section>
'''
if settings_anchor not in text:
    raise SystemExit('settings anchor not found')
if 'Compatibility Sharing</h2>' not in text:
    text = text.replace(settings_anchor, settings_insert + settings_anchor)
app.write_text(text)
