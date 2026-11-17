import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { supabase } from '../supabase';
import type { Profile } from '../types';
import { Icon, Nav, Top } from '../ui';

export const STATUS: Record<Profile['seatribe_status'], { t: string; c: string }> = {
  neu: { t: 'wartet', c: 'wait' },
  bestaetigt: { t: 'bestätigt', c: 'ok' },
  abgelehnt: { t: 'nicht freigegeben', c: '' },
};

export default function Agentur() {
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
  return <SkipperListe />;
}

function SkipperListe() {
  const [items, setItems] = useState<Profile[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    supabase.from('profiles').select('*').eq('role', 'skipper').order('created_at', { ascending: false })
      .then(({ data, error }) => { if (error) setError(error.message); else setItems((data ?? []) as Profile[]); });
  }, []);
  const rang = { neu: 0, bestaetigt: 1, abgelehnt: 2 };
  const sorted = items ? [...items].sort((a, b) => rang[a.seatribe_status] - rang[b.seatribe_status]) : null;

  return (
    <>
      <Top />
      <Nav to="/" label="Start" />
      <div className="stack">
        <h1>Skipper</h1>
        <p className="lead">Alle, die sich in der App angemeldet haben. Nur bestätigte Skipper kannst du später einem Auftrag zuweisen.</p>
      </div>
      {error && <p className="err" role="alert">Die Liste konnte nicht geladen werden: {error}</p>}
      {sorted == null && !error && <p className="lead">Lädt …</p>}
      {sorted && sorted.length === 0 && <p className="hint">Noch hat sich kein Skipper angemeldet. Schick deinen Skippern die Adresse der App; sie legen dort selbst ein Konto an.</p>}
      {sorted && sorted.length > 0 && (
        <div className="stack">
          {sorted.map((p) => (
            <Link className="row" key={p.id} to={`/agentur/skipper/${p.id}`}>
              <span className="ic"><Icon n="id" /></span>
              <span className="tx">
                <span className="tt">{p.display_name || p.email || 'Ohne Namen'}</span><br />
                <span className="ss">{[p.display_name ? p.email : '', p.highest_licence, p.city].filter(Boolean).join(' · ') || 'Profil noch leer'}</span>
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
