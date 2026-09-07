import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { getSession, signIn, signOut, signUp } from './auth';

type Tab = 'home' | 'passport' | 'scans' | 'settings';
type Language = 'en' | 'es' | 'fr';

type Question = {
  id: string;
  question_key: string;
  position: number;
  prompt_i18n: Record<string, string>;
  answer_options: Array<{ code: string; label?: string; label_i18n?: Record<string, string> }>;
};

const copy = {
  en: {
    dashboard: 'Compatibility Dashboard', passport: 'Compatibility Passport', scans: 'Scans', settings: 'Privacy & Settings',
    clarity: 'Clarity Before Connection.', private: 'Your Compatibility Passport is private by default.',
    complete: 'Complete Passport', single: 'Single Scan', dual: 'Dual Scan', signOut: 'Sign Out',
  },
  es: {
    dashboard: 'Panel de Compatibilidad', passport: 'Pasaporte de Compatibilidad', scans: 'Escaneos', settings: 'Privacidad y Configuración',
    clarity: 'Claridad Antes de la Conexión.', private: 'Tu Pasaporte de Compatibilidad es privado por defecto.',
    complete: 'Completar Pasaporte', single: 'Escaneo Individual', dual: 'Escaneo Dual', signOut: 'Cerrar Sesión',
  },
  fr: {
    dashboard: 'Tableau de Compatibilité', passport: 'Passeport de Compatibilité', scans: 'Analyses', settings: 'Confidentialité et Paramètres',
    clarity: 'La Clarté Avant la Connexion.', private: 'Votre Passeport de Compatibilité est privé par défaut.',
    complete: 'Compléter le Passeport', single: 'Analyse Individuelle', dual: 'Analyse Double', signOut: 'Se Déconnecter',
  },
} as const;

function normalizedSession(result: any) {
  return result?.session ? result : result?.data ?? result ?? null;
}

function AuthScreen({ onReady }: { onReady: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const result = mode === 'signup' ? await signUp(name.trim(), email.trim(), password) : await signIn(email.trim(), password);
      if (result?.error) throw new Error(result.error.message || 'Authentication failed');
      await onReady();
    } catch (e: any) {
      setError(e?.message || 'Unable to sign in.');
    } finally { setBusy(false); }
  }

  return <div className="miq-auth-wrap">
    <form className="miq-auth-card" onSubmit={submit}>
      <img src="/assets/mymatchiq-logo.png" className="miq-logo" alt="MyMatchIQ" />
      <h1>Clarity Before Connection.</h1>
      <p className="miq-muted">MyMatchIQ is a compatibility intelligence platform. No chat. No DMs. Consent at every step.</p>
      {error && <div className="miq-error">{error}</div>}
      {mode === 'signup' && <div className="miq-field"><label>Name</label><input value={name} onChange={e => setName(e.target.value)} required autoComplete="name" /></div>}
      <div className="miq-field"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" /></div>
      <div className="miq-field"><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} /></div>
      <button className="miq-button" style={{width:'100%',marginTop:10}} disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create My Account' : 'Sign In'}</button>
      <div className="miq-auth-switch"><button type="button" className="miq-link" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>{mode === 'signup' ? 'Already have an account? Sign in' : 'New to MyMatchIQ? Create an account'}</button></div>
      <p className="miq-muted" style={{marginTop:16}}>By using MyMatchIQ you confirm you are at least 18 and agree to the applicable Terms, Privacy Policy, and safety rules.</p>
    </form>
  </div>;
}

export function ProductApp() {
  const [session, setSession] = useState<any>(undefined);
  const [me, setMe] = useState<any>(null);
  const [tab, setTab] = useState<Tab>('home');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [passport, setPassport] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const [scans, setScans] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [singleTarget, setSingleTarget] = useState('');
  const [dualTarget, setDualTarget] = useState('');
  const [shareTarget, setShareTarget] = useState('');
  const [shares, setShares] = useState<any[]>([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const language: Language = (me?.locale || 'en') as Language;
  const t = copy[language] || copy.en;

  async function bootstrap() {
    setError('');
    try {
      const s = normalizedSession(await getSession());
      setSession(s);
      if (!s?.user && !s?.session?.user) return;
      await api.initProfile();
      const [profile, p] = await Promise.all([api.me(), api.passport()]);
      setMe(profile); setPassport(p.passport);
    } catch (e: any) {
      setError(e?.message || 'Unable to load your account.');
    }
  }

  useEffect(() => { bootstrap(); }, []);

  async function loadPassport() {
    setBusy(true); setError(''); setNotice('');
    try {
      const [q, p] = await Promise.all([api.questions(), api.passport()]);
      setQuestions(q.questions || []); setPassport(p.passport);
      const existing: Record<string,string> = {};
      for (const a of p.answers || []) if (a?.question_id && a?.answer_value?.code) existing[a.question_id] = a.answer_value.code;
      setAnswers(existing);
    } catch (e:any) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function loadScans() {
    setBusy(true); setError('');
    try {
      const [s, i, c] = await Promise.all([api.scans(), api.invitations(), api.connections()]);
      setScans(s.scans || []); setInvitations(i.invitations || []); setConnections(c.connections || []);
    } catch(e:any){ setError(e.message); }
    finally{ setBusy(false); }
  }

  useEffect(() => { if (tab === 'passport') loadPassport(); if (tab === 'scans') loadScans(); if (tab === 'settings') loadShares(); }, [tab]);

  async function saveAnswer(questionId:string, code:string) {
    setAnswers(v => ({...v,[questionId]:code}));
    try { await api.saveAnswer(questionId, code); } catch(e:any){ setError(e.message); }
  }

  async function finishPassport() {
    setBusy(true); setError('');
    try { const r = await api.completePassport(); setPassport(r.passport); setNotice('Compatibility Passport completed.'); await bootstrap(); }
    catch(e:any){ setError(e.message); }
    finally{ setBusy(false); }
  }

  async function createSingle() {
    if (!singleTarget.trim()) return;
    setBusy(true); setError(''); setNotice('');
    try { const r = await api.singleScan(singleTarget.trim()); setNotice(r.result ? `Single Scan complete: ${r.result.score}% compatibility.` : 'Single Scan created.'); setSingleTarget(''); await loadScans(); }
    catch(e:any){ setError(e.message); }
    finally{ setBusy(false); }
  }

  async function createDual() {
    if (!dualTarget.trim()) return;
    setBusy(true); setError(''); setNotice('');
    try { await api.dualScan(dualTarget.trim()); setNotice('Dual Scan invitation created. It will not proceed without the other user’s consent.'); setDualTarget(''); await loadScans(); }
    catch(e:any){ setError(e.message); }
    finally{ setBusy(false); }
  }

  async function respondInvite(id:string, action:'accept'|'decline') {
    setBusy(true); setError('');
    try { const r = await api.respondInvitation(id, action); setNotice(action === 'accept' ? (r.result ? `Dual Scan complete: ${r.result.score}% compatibility.` : 'Invitation accepted.') : 'Invitation declined.'); await loadScans(); }
    catch(e:any){ setError(e.message); }
    finally{ setBusy(false); }
  }

  async function loadShares() {
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

  async function updateLanguage(locale:Language) {
    setBusy(true); setError('');
    try { await api.settings({locale}); setMe((v:any)=>({...v,locale})); setNotice('Language preference saved.'); }
    catch(e:any){ setError(e.message); }
    finally{setBusy(false);}
  }

  async function logout() { await signOut(); setSession(null); setMe(null); }

  if (session === undefined) return <div className="miq-auth-wrap"><div className="miq-auth-card"><p className="miq-muted">Loading MyMatchIQ…</p></div></div>;
  if (!session?.user && !session?.session?.user) return <AuthScreen onReady={bootstrap} />;

  const progress = questions.length ? Math.round((Object.keys(answers).length/questions.length)*100) : passport?.status === 'complete' ? 100 : 0;
  const tier = me?.tier || 'free';

  return <div className="miq-product">
    <div className="miq-shell">
      <header className="miq-top">
        <img src="/assets/mymatchiq-logo.png" className="miq-logo" alt="MyMatchIQ" />
        <div className="miq-top-actions">
          <span className="miq-badge">{String(tier).toUpperCase()}</span>
          {me?.verification_status === 'verified' && <span className="miq-badge verified">✓ Verified</span>}
          <button className="miq-pill" onClick={logout}>{t.signOut}</button>
        </div>
      </header>

      <section className="miq-hero"><h1>{t.clarity}</h1><p>{t.private} No chat. No DMs.</p></section>
      <nav className="miq-nav">
        {([['home',t.dashboard],['passport',t.passport],['scans',t.scans],['settings',t.settings]] as [Tab,string][]).map(([key,label]) => <button key={key} className={tab===key?'active':''} onClick={()=>{setTab(key);setError('');setNotice('')}}>{label}</button>)}
      </nav>

      {error && <div className="miq-error">{error}</div>}{notice && <div className="miq-notice">{notice}</div>}

      {tab === 'home' && <main className="miq-grid">
        <section className="miq-card half"><h2>{t.passport}</h2><div className="miq-stat">{passport?.status === 'complete' ? 'Complete' : `${progress}%`}</div><div className="miq-progress"><span style={{width:`${progress}%`}} /></div><p className="miq-muted">Your private foundation for compatibility analysis.</p><div className="miq-actions"><button className="miq-button" onClick={()=>setTab('passport')}>{passport?.status==='complete'?'Review Passport':'Continue Passport'}</button></div></section>
        <section className="miq-card half"><h2>Verification</h2><div className="miq-stat" style={{fontSize:24}}>{me?.verification_status || 'unverified'}</div><p className="miq-muted">Verification status is stored separately from your assessment responses. MyMatchIQ does not expose identification documents through compatibility scans.</p></section>
        <section className="miq-card third"><h2>{t.single}</h2><p className="miq-muted">Private evaluation. The other member is not notified by the Single Scan workflow.</p></section>
        <section className="miq-card third"><h2>{t.dual}</h2><p className="miq-muted">Mutual, invitation-based compatibility insight. Available to Premier and Elite.</p></section>
        <section className="miq-card third"><h2>Consent First</h2><p className="miq-muted">No compatibility sharing or connection moves forward without the applicable user consent.</p></section>
      </main>}

      {tab === 'passport' && <main className="miq-grid"><section className="miq-card"><h2>{t.passport}</h2><p className="miq-muted">Structured compatibility assessment • {String(tier).toUpperCase()} tier</p><div className="miq-progress"><span style={{width:`${progress}%`}} /></div>
        {busy && !questions.length && <p className="miq-muted">Loading assessment…</p>}
        {!busy && !questions.length && passport?.status !== 'complete' && <div className="miq-notice">The assessment engine is connected, but no approved production question bank is loaded on this environment yet. MyMatchIQ will not invent compatibility questions or scoring rules.</div>}
        {questions.map((q,index)=>{const prompt=q.prompt_i18n?.[language]||q.prompt_i18n?.en||q.question_key; const opts=Array.isArray(q.answer_options)?q.answer_options:[];return <div className="miq-question" key={q.id}><h3>{index+1}. {prompt}</h3><div className="miq-options">{opts.map((o:any)=>{const label=o.label_i18n?.[language]||o.label_i18n?.en||o.label||o.code;return <button type="button" className={`miq-option ${answers[q.id]===o.code?'selected':''}`} key={o.code} onClick={()=>saveAnswer(q.id,o.code)}><span>{answers[q.id]===o.code?'●':'○'}</span><span>{label}</span></button>})}</div></div>})}
        {!!questions.length && <div className="miq-actions"><button className="miq-button" disabled={busy || Object.keys(answers).length < questions.length} onClick={finishPassport}>{t.complete}</button></div>}
      </section></main>}

      {tab === 'scans' && <main className="miq-grid">
        <section className="miq-card half"><h2>{t.single}</h2><p className="miq-muted">Enter the MyMatchIQ user ID of another member with a completed Compatibility Passport. No invitation or notification is created.</p><div className="miq-field"><label>Member ID</label><input value={singleTarget} onChange={e=>setSingleTarget(e.target.value)} placeholder="User ID" /></div><button className="miq-button" onClick={createSingle} disabled={busy || passport?.status!=='complete'}>Run Private Single Scan</button></section>
        <section className="miq-card half"><h2>{t.dual}</h2><p className="miq-muted">Dual Scan requires mutual consent and Premier or Elite access.</p><div className="miq-field"><label>Member ID</label><input value={dualTarget} onChange={e=>setDualTarget(e.target.value)} placeholder="User ID" /></div><button className="miq-button" onClick={createDual} disabled={busy || !['premier','elite'].includes(tier) || passport?.status!=='complete'}>Send Dual Scan Invitation</button>{!['premier','elite'].includes(tier)&&<p className="miq-muted" style={{marginTop:8}}>Dual Scan is available on Premier and Elite.</p>}</section>
        <section className="miq-card"><h2>Incoming Dual Scan Invitations</h2><div className="miq-list">{!invitations.length&&<p className="miq-muted">No pending invitations.</p>}{invitations.map(i=><div className="miq-row" key={i.id}><div className="miq-row-main"><strong>Invitation from {i.inviter_name || i.inviter_user_id}</strong><span className="miq-muted">Expires {new Date(i.expires_at).toLocaleString()}</span></div><div className="miq-actions"><button className="miq-button" onClick={()=>respondInvite(i.id,'accept')}>Accept</button><button className="miq-button secondary" onClick={()=>respondInvite(i.id,'decline')}>Decline</button></div></div>)}</div></section>
        <section className="miq-card"><h2>Scan History</h2><div className="miq-list">{!scans.length&&<p className="miq-muted">No scans yet.</p>}{scans.map(s=><div className="miq-row" key={s.id}><div className="miq-row-main"><strong>{s.scan_type === 'dual' ? 'Dual Scan' : 'Single Scan'} • {s.status}</strong><span className="miq-muted">{new Date(s.created_at).toLocaleString()}</span></div>{s.score!=null&&<span className="miq-score">{Number(s.score).toFixed(1)}%</span>}</div>)}</div></section>
        <section className="miq-card"><h2>Connections & One2OneLove</h2><p className="miq-muted">MyMatchIQ does not provide chat or DMs. When a connection is mutually accepted, the handoff state can direct the users toward One2OneLove where applicable.</p><div className="miq-list">{!connections.length&&<p className="miq-muted">No connection requests.</p>}{connections.map(c=><div className="miq-row" key={c.id}><div><strong>{c.status}</strong><span className="miq-muted">Connection {c.id}</span></div>{c.handoff_status&&<span className="miq-badge">O2OL: {c.handoff_status}</span>}</div>)}</div></section>
      </main>}

      {tab === 'settings' && <main className="miq-grid"><section className="miq-card half"><h2>Language</h2><div className="miq-field"><label>Language</label><select value={language} onChange={e=>updateLanguage(e.target.value as Language)}><option value="en">English</option><option value="es">Español</option><option value="fr">Français</option></select></div></section>
        <section className="miq-card half"><h2>Privacy Controls</h2><p className="miq-muted">Compatibility Passport data remains private by default. Single Scans do not expose your raw answers. Dual Scans require consent.</p><div className="miq-actions"><button className="miq-button secondary" onClick={async()=>{try{await api.settings({privacyConfig:{passportPrivate:true,shareResultsOnlyWithConsent:true}});setNotice('Privacy preferences saved.')}catch(e:any){setError(e.message)}}}>Save Privacy Defaults</button></div></section>
        <section className="miq-card"><h2>Compatibility Sharing</h2><p className="miq-muted">Your Passport stays private. Grant a specific MyMatchIQ member permission to receive compatibility-sharing access, then revoke that permission whenever you choose.</p><div className="miq-field"><label>Member ID</label><input value={shareTarget} onChange={e=>setShareTarget(e.target.value)} placeholder="User ID" /></div><div className="miq-actions"><button className="miq-button" disabled={busy || passport?.status!=='complete'} onClick={createShare}>Grant Access</button></div><div className="miq-list">{!shares.length&&<p className="miq-muted">You have not granted compatibility-sharing access to anyone.</p>}{shares.map(s=><div className="miq-row" key={s.id}><div><strong>{s.viewer_name || s.viewer_user_id}</strong><span className="miq-muted">Active compatibility access{s.expires_at ? ` • expires ${new Date(s.expires_at).toLocaleString()}` : ''}</span></div><button className="miq-button danger" onClick={()=>revokeShare(s.viewer_user_id)}>Revoke</button></div>)}</div></section>
        <section className="miq-card half"><h2>Your Data</h2><p className="miq-muted">Download a portable JSON copy of the MyMatchIQ information associated with your account, including Passport answers, scan records, sharing permissions, legal acceptance and connection state.</p><div className="miq-actions"><button className="miq-button secondary" disabled={busy} onClick={downloadPrivacyExport}>Download My Data</button></div></section>
        <section className="miq-card"><h2>Legal & Safety</h2><p className="miq-muted">The recovered MyMatchIQ Terms and Privacy Policy remain part of the approved product. Acceptance is versioned in your account record.</p><div className="miq-actions"><button className="miq-button secondary" onClick={()=>api.acceptLegal('terms','2025-12-13').then(()=>setNotice('Terms acceptance recorded.')).catch((e:any)=>setError(e.message))}>Accept Current Terms</button><button className="miq-button secondary" onClick={()=>api.acceptLegal('privacy','2025-12-13').then(()=>setNotice('Privacy acceptance recorded.')).catch((e:any)=>setError(e.message))}>Accept Current Privacy Policy</button></div></section>
      </main>}
      <footer className="miq-footer-note">MyMatchIQ • Compatibility intelligence, not a traditional dating app • No Chat • No DMs</footer>
    </div>
  </div>;
}
