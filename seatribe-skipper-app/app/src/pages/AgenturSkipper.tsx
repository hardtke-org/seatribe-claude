import { useCallback, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth';
import { DOC_KINDS, datum } from '../data';
import { listDocuments } from '../docs';
import { DocList } from '../DocList';
import { supabase } from '../supabase';
import type { Profile, SkipperDocument } from '../types';
import { Nav, Top } from '../ui';
import { STATUS } from './Agentur';

export default function AgenturSkipper() {
  const { id } = useParams();
  const { profile: me } = useAuth();
  const [p, setP] = useState<Profile | null | undefined>(undefined);
  const [docs, setDocs] = useState<SkipperDocument[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).eq('role', 'skipper').maybeSingle();
    if (error) { setError(error.message); setP(null); return; }
    setP((data as Profile | null) ?? null);
    if (data) listDocuments(id).then(setDocs).catch((e) => setError(String(e.message ?? e)));
  }, [id]);
  useEffect(() => { void load(); }, [load]);

  async function setStatus(s: Profile['seatribe_status']) {
    if (!id) return;
    setBusy(true); setError('');
    const { error } = await supabase.rpc('set_skipper_status', { skipper_id: id, new_status: s });
    setBusy(false);
    if (error) { setError('Das hat nicht geklappt: ' + error.message); return; }
    await load();
  }

  if (me && me.role !== 'agentur') return <Navigate to="/agentur" replace />;
  if (p === undefined) return (<><Top /><Nav to="/agentur" label="Skipper" /><p className="lead">Lädt …</p></>);
  if (p === null) return (<><Top /><Nav to="/agentur" label="Skipper" /><p className="hint">Diesen Skipper gibt es nicht.</p>{error && <p className="err">{error}</p>}</>);

  const adresse = [p.street, [p.postal_code, p.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  const rows: [string, string][] = [
    ['E-Mail', p.email || '–'], ['Telefon', p.phone || '–'], ['Firma', p.company || '–'], ['Anschrift', adresse || '–'],
    ['Geburtsdatum', datum(p.birth_date) || '–'], ['Nationalität', p.nationality || '–'],
    ['Höchster Schein', p.highest_licence || '–'], ['Scheinnummer', p.licence_number || '–'], ['Notfallkontakt', p.emergency_contact || '–'],
    ['Mehrwertsteuer', p.charges_vat ? 'weist sie aus' : 'weist keine aus'],
    ...(p.charges_vat ? [['Umsatzsteuer-ID oder Steuernummer', p.tax_number || '–'] as [string, string]] : []),
    ['Angemeldet seit', datum(p.created_at.slice(0, 10))],
  ];
  const fehlt = DOC_KINDS.filter((k) => k.k !== 'sonstiges' && !docs.some((d) => d.kind === k.k));

  return (
    <>
      <Top />
      <Nav to="/agentur" label="Skipper" />
      <div className="stack">
        <h1>{p.display_name || p.email || 'Ohne Namen'}</h1>
        <p><span className={'state ' + STATUS[p.seatribe_status].c}>{STATUS[p.seatribe_status].t}</span></p>
      </div>
      {error && <p className="err" role="alert">{error}</p>}

      {p.seatribe_status !== 'bestaetigt' && (
        <button className="btn wide" disabled={busy} onClick={() => setStatus('bestaetigt')}>Als Seatribe-Skipper bestätigen</button>
      )}
      {p.seatribe_status === 'neu' && (
        <button className="btn ghost wide" disabled={busy} onClick={() => setStatus('abgelehnt')}>Nicht freigeben</button>
      )}
      {p.seatribe_status === 'bestaetigt' && (
        <button className="btn ghost wide" disabled={busy} onClick={() => setStatus('abgelehnt')}>Bestätigung zurücknehmen</button>
      )}

      <span className="label">Angaben</span>
      <dl className="facts">
        {rows.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
      </dl>

      <span className="label">Nachweise</span>
      {docs.length === 0 ? <p className="hint">Noch keine Nachweise hochgeladen.</p> : <DocList docs={docs} />}
      {docs.length > 0 && fehlt.length > 0 && <p className="lead">Fehlt noch: {fehlt.map((k) => k.t).join(', ')}.</p>}
    </>
  );
}
