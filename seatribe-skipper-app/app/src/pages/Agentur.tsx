import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { supabase } from '../supabase';
import { datum } from '../data';
import type { Invitation, Profile } from '../types';
import { Field, Icon, Nav, Top } from '../ui';

export const STATUS: Record<Profile['seatribe_status'], { t: string; c: string }> = {
  neu: { t: 'wartet', c: 'wait' },
  bestaetigt: { t: 'bestätigt', c: 'ok' },
  abgelehnt: { t: 'nicht freigegeben', c: '' },
};

type Rolle = 'skipper' | 'crew';
const W: Record<Rolle, { titel: string; einladen: string; feld: string; lead: string; leer: string; als: string; zweck: string }> = {
  skipper: {
    titel: 'Skipper', einladen: 'Skipper einladen', feld: 'E-Mail des Skippers',
    lead: 'Alle, die sich als Skipper in der App angemeldet haben – von dir eingeladen oder von sich aus. Nur bestätigte Skipper kannst du einem Auftrag zuweisen.',
    leer: 'Noch hat kein Skipper ein Konto. Lade deine Skipper oben ein; sie legen dann selbst ihr Konto an.',
    als: 'als Skipper', zweck: 'Dort hinterlegst du einmal deine Angaben und Nachweise und siehst die Überführungen, die ich dir zuweise.',
  },
  crew: {
    titel: 'Crew', einladen: 'Crew einladen', feld: 'E-Mail des Crewmitglieds',
    lead: 'Alle, die du als Crew eingeladen hast und die ein Konto angelegt haben.',
    leer: 'Noch hat kein Crewmitglied ein Konto. Lade deine Crew oben ein; jeder legt dann selbst sein Konto an.',
    als: 'als Crew', zweck: 'Dort hinterlegst du einmal deine Angaben und Nachweise, damit sie für jede Überführung bereitliegen.',
  },
};

export default function Agentur({ rolle = 'skipper' }: { rolle?: Rolle }) {
  const { profile } = useAuth();
  if (!profile) return (<><Top /><p className="lead">Lädt …</p></>);
  if (profile.role !== 'agentur') {
    return (
      <>
        <Top />
        <Nav to="/" label="Start" />
        <h1>Agentur</h1>
        <p className="hint">Dieser Bereich ist für Agenturen, die Überführungen an Skipper vergeben. Wenn du eine Agentur bist, melde dich bitte bei Seatribe.</p>
      </>
    );
  }
  return <SkipperListe key={rolle} rolle={rolle} />;
}

function SkipperListe({ rolle }: { rolle: Rolle }) {
  const w = W[rolle];
  const { profile } = useAuth();
  const [items, setItems] = useState<Profile[] | null>(null);
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [mailErr, setMailErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState('');
  const [ask, setAsk] = useState<string | null>(null);

  async function load() {
    const [p, i] = await Promise.all([
      supabase.from('profiles').select('*').neq('role', 'agentur').order('created_at', { ascending: false }),
      supabase.from('invitations').select('*').eq('role', rolle).order('created_at', { ascending: false }),
    ]);
    if (p.error) setError(p.error.message); else setItems((p.data ?? []) as Profile[]);
    if (!i.error) setInvites((i.data ?? []) as Invitation[]);
  }
  useEffect(() => { void load(); }, []);

  const rang = { neu: 0, bestaetigt: 1, abgelehnt: 2 };
  const sorted = items ? items.filter((p) => p.role === rolle).sort((a, b) => rang[a.seatribe_status] - rang[b.seatribe_status]) : null;
  const eingeladen = new Set(invites.filter((i) => i.accepted_by).map((i) => i.accepted_by));
  const offen = invites.filter((i) => !i.accepted_at);

  const link = (adr: string) => `${window.location.origin}/?einladung=${encodeURIComponent(adr)}`;
  function mailto(adr: string) {
    const firma = profile?.company || 'Seatribe Deliveries';
    const text = [
      'Hallo,', '',
      `ich möchte dich ${w.als} für ${firma} in die Seatribe Skipper App einladen. ${w.zweck}`, '',
      'Leg dir über diesen Link ein Konto an, bitte mit dieser E-Mail-Adresse:', link(adr), '',
      'Viele Grüße', profile?.display_name || firma,
    ].join('\n');
    return `mailto:${adr}?subject=${encodeURIComponent('Einladung zur Seatribe Skipper App')}&body=${encodeURIComponent(text)}`;
  }

  async function einladen(e: FormEvent) {
    e.preventDefault();
    const adr = email.trim().toLowerCase();
    setMailErr(''); setNote('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adr)) { setMailErr('Bitte prüfe die E-Mail-Adresse.'); return; }
    if (items == null) return; // Liste lädt noch: erst danach lässt sich prüfen, ob es das Konto schon gibt
    const konto = items.find((p) => (p.email ?? '').toLowerCase() === adr);
    if (konto) { setMailErr(`${konto.display_name || 'Diese Person'} hat schon ein Konto${konto.role === rolle ? ' und steht unten in der Liste' : konto.role === 'crew' ? ' als Crew' : ' als Skipper'}.`); return; }
    if (offen.some((i) => i.email === adr)) { setMailErr('Diese Adresse ist schon eingeladen. Du findest sie unter „Eingeladen".'); return; }
    setBusy(true);
    const { error } = await supabase.from('invitations').insert({ email: adr, role: rolle });
    setBusy(false);
    if (error) { setMailErr(/duplicate|unique/i.test(error.message) ? 'Diese Adresse ist schon eingeladen.' : 'Das hat nicht geklappt: ' + error.message); return; }
    setEmail(''); setOpen(false);
    setNote(`Einladung für ${adr} angelegt. Schick sie jetzt über „E-Mail öffnen" aus deinem Postfach ab.`);
    await load();
  }

  async function kopieren(i: Invitation) {
    try { await navigator.clipboard.writeText(link(i.email)); setCopied(i.id); setTimeout(() => setCopied(''), 2500); }
    catch { setNote('Kopieren hat nicht geklappt. Der Link lautet: ' + link(i.email)); }
  }

  async function zurueckziehen(i: Invitation) {
    const { error } = await supabase.from('invitations').delete().eq('id', i.id);
    setAsk(null);
    if (error) { setNote('Zurückziehen hat nicht geklappt: ' + error.message); return; }
    setNote(`Einladung für ${i.email} zurückgezogen.`);
    await load();
  }

  return (
    <>
      <Top />
      <Nav to="/" label="Start" />
      <div className="stack">
        <h1>{w.titel}</h1>
        <p className="lead">{w.lead}</p>
      </div>

      {!open && <button className="btn wide" onClick={() => { setOpen(true); setNote(''); }}>{w.einladen}</button>}
      {open && (
        <form className="stack" onSubmit={einladen} noValidate>
          <Field id="e-mail" label={w.feld} type="email" inputMode="email" autoComplete="off" value={email}
            onChange={(v) => { setEmail(v); setMailErr(''); }} error={mailErr}
            hint="Die App bereitet die Einladung vor. Abgeschickt wird sie aus deinem eigenen Postfach." />
          <button className="btn wide" type="submit" disabled={busy || items == null || !email.trim()}>{busy ? 'Einen Moment …' : 'Einladung vorbereiten'}</button>
          <button className="btn ghost wide" type="button" onClick={() => { setOpen(false); setEmail(''); setMailErr(''); }}>Abbrechen</button>
        </form>
      )}
      {note && <p className="okmsg" role="status">{note}</p>}

      {offen.length > 0 && (
        <div className="stack">
          <span className="label">Eingeladen, noch kein Konto</span>
          {offen.map((i) => (
            <div className="row doc" key={i.id}>
              <span className="tx">
                <span className="tt">{i.email}</span><br />
                <span className="ss">eingeladen am {datum(i.created_at.slice(0, 10))}</span>
                <span className="acts">
                  <a className="linkbtn" href={mailto(i.email)}>E-Mail öffnen</a>
                  <button className="linkbtn" onClick={() => kopieren(i)}>{copied === i.id ? 'Link kopiert' : 'Link kopieren'}</button>
                  {ask === i.id
                    ? <><button className="linkbtn del" onClick={() => zurueckziehen(i)}>Wirklich zurückziehen</button><button className="linkbtn" onClick={() => setAsk(null)}>Abbrechen</button></>
                    : <button className="linkbtn" onClick={() => setAsk(i.id)}>Zurückziehen</button>}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}

      {error && <p className="err" role="alert">Die Liste konnte nicht geladen werden: {error}</p>}
      {sorted == null && !error && <p className="lead">Lädt …</p>}
      {sorted && sorted.length === 0 && <p className="hint">{w.leer}</p>}
      {sorted && sorted.length > 0 && (
        <div className="stack">
          {offen.length > 0 && <span className="label">Mit Konto</span>}
          {sorted.map((p) => (
            <Link className="row" key={p.id} to={`/agentur/${rolle}/${p.id}`}>
              <span className="ic"><Icon n="id" /></span>
              <span className="tx">
                <span className="tt">{p.display_name || p.email || 'Ohne Namen'}</span><br />
                <span className="ss">{[p.display_name ? p.email : '', p.highest_licence, p.city, eingeladen.has(p.id) ? 'von dir eingeladen' : ''].filter(Boolean).join(' · ') || 'Profil noch leer'}</span>
              </span>
              <span className={'state ' + STATUS[p.seatribe_status].c}>{STATUS[p.seatribe_status].t}</span>
              <Icon n="chev" className="chev" />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
