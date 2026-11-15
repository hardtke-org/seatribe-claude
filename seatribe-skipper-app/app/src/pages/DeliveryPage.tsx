import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { getDelivery } from '../deliveries';
import { BAUSTEINE, datum, komma } from '../data';
import type { Delivery } from '../types';
import { Icon, Nav, Top } from '../ui';

export default function DeliveryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [d, setD] = useState<Delivery | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'missing' | 'error'>('loading');
  const [choosing, setChoosing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getDelivery(id).then((x) => { setD(x); setState(x ? 'ok' : 'missing'); }).catch((e) => { setError(String(e.message ?? e)); setState('error'); });
  }, [id]);

  async function toggle(k: string) {
    if (!d) return;
    const modules = { ...d.modules, [k]: !d.modules[k] };
    const before = d;
    setD({ ...d, modules });
    const { error } = await supabase.from('deliveries').update({ modules }).eq('id', d.id);
    if (error) { setD(before); setError('Die Auswahl konnte nicht gespeichert werden: ' + error.message); }
  }

  async function remove() {
    if (!d) return;
    const { error } = await supabase.from('deliveries').delete().eq('id', d.id);
    if (error) { setError('Löschen hat nicht geklappt: ' + error.message); return; }
    navigate('/ueberfuehrungen', { replace: true });
  }

  if (state !== 'ok' || !d) {
    return (
      <>
        <Top />
        <Nav to="/ueberfuehrungen" label="Meine Überführungen" />
        {state === 'loading' && <p className="lead">Lädt …</p>}
        {state === 'missing' && <p className="hint">Diese Überführung gibt es nicht (mehr).</p>}
        {state === 'error' && <p className="err" role="alert">Die Überführung konnte nicht geladen werden: {error}</p>}
      </>
    );
  }

  const b = d.boat;
  const missing = [d.planned_start, b?.type, b?.name, b?.length_m, b?.mmsi, d.owner?.name, d.owner?.email].filter((x) => x == null || x === '').length;
  const meta = [
    d.planned_start ? 'Start ' + datum(d.planned_start) : 'Starttermin offen',
    b?.type || 'Bootstyp offen',
    b?.name ? `„${b.name}"` : '',
    b?.length_m ? `${komma(b.length_m)} m${b.beam_m ? ' × ' + komma(b.beam_m) + ' m' : ''}` : '',
    b?.draft_m ? `Tiefgang ${komma(b.draft_m)} m` : '',
    b?.year_built ? `Baujahr ${b.year_built}` : '',
    d.owner?.name ? `Eigner: ${d.owner.name}` : 'Eigner offen',
  ].filter(Boolean);

  let phase = '';
  return (
    <>
      <Top />
      <Nav to="/ueberfuehrungen" label="Meine Überführungen" />
      <section className="route">
        <div className="ports">{d.from_port}<span>→</span>{d.to_port}</div>
        <div className="meta">{meta.map((m) => <span key={m}>{m}</span>)}</div>
        <Link className="btn" style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.28)', color: '#fff', minHeight: 0, padding: '8px 12px', fontSize: '.88rem' }}
          to={`/ueberfuehrungen/${d.id}/bearbeiten`}>{missing ? `Daten ergänzen (${missing} offen)` : 'Daten bearbeiten'}</Link>
      </section>

      {error && <p className="err" role="alert">{error}</p>}

      {BAUSTEINE.filter((x) => d.modules[x.k]).map((x) => {
        const head = x.phase !== phase ? <span className="label" key={'p-' + x.phase}>{x.phase}</span> : null;
        phase = x.phase;
        return (
          <div key={x.k} style={{ display: 'contents' }}>
            {head}
            <div className="row soon">
              <span className="ic"><Icon n={x.ic} /></span>
              <span className="tx"><span className="tt">{x.t}</span><br /><span className="ss">{x.sub}</span></span>
              <span className="state">kommt bald</span>
            </div>
          </div>
        );
      })}

      <div className="stack">
        <button className="btn ghost" aria-expanded={choosing} onClick={() => setChoosing(!choosing)}>{choosing ? 'Auswahl schließen' : 'Bausteine auswählen'}</button>
        {choosing && (
          <>
            <p className="lead">Nur was angehakt ist, erscheint oben und wird später zum PDF.</p>
            <div className="chips">
              {BAUSTEINE.map((x) => (
                <button key={x.k} className="chip" aria-pressed={!!d.modules[x.k]} onClick={() => toggle(x.k)}>
                  {d.modules[x.k] && <Icon n="check" />}{x.t}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="stack">
        {!confirmDelete && <button className="btn ghost danger" onClick={() => setConfirmDelete(true)}>Überführung löschen</button>}
        {confirmDelete && (
          <>
            <p className="note">Die Überführung {d.from_port} → {d.to_port} wird endgültig gelöscht. Boot und Eigner bleiben gespeichert.</p>
            <div className="two">
              <button className="btn ghost" onClick={() => setConfirmDelete(false)}>Abbrechen</button>
              <button className="btn ghost danger" onClick={remove}>Endgültig löschen</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
