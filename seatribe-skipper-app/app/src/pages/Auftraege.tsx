import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { listAssignments } from '../deliveries';
import { datum, komma } from '../data';
import type { Assignment } from '../types';
import { Icon, Nav, Top } from '../ui';

function useAssignments() {
  const [items, setItems] = useState<Assignment[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { listAssignments().then(setItems).catch((e) => setError(String(e.message ?? e))); }, []);
  return { items, error };
}

function Von({ a }: { a: Assignment }) {
  return <span className="from"><img src="/logo-192.png" alt="" />Auftrag von {a.agency_name || 'Seatribe Deliveries'}</span>;
}

export default function Auftraege() {
  const { items, error } = useAssignments();
  return (
    <>
      <Top />
      <Nav to="/" label="Start" />
      <h1>Meine Aufträge</h1>
      {error && <p className="err" role="alert">Die Aufträge konnten nicht geladen werden: {error}</p>}
      {items == null && !error && <p className="lead">Lädt …</p>}
      {items && items.length === 0 && <p className="hint">Noch kein Auftrag. Sobald Seatribe dir eine Überführung zuweist, erscheint sie hier mit allen Angaben zu Boot, Route und Terminen.</p>}
      {items && items.length > 0 && (
        <div className="stack">
          {items.map((a) => (
            <Link className="row" key={a.id} to={`/auftraege/${a.id}`}>
              <span className="ic"><Icon n="compass" /></span>
              <span className="tx">
                <span className="tt">{a.from_port} → {a.to_port}</span><br />
                <span className="ss">{[a.boat_type, a.boat_name ? `„${a.boat_name}"` : '', a.planned_start ? 'ab ' + datum(a.planned_start) : 'Termin offen'].filter(Boolean).join(' · ')}</span>
              </span>
              <Icon n="chev" className="chev" />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export function Auftrag() {
  const { id } = useParams();
  const { items, error } = useAssignments();
  const a = items?.find((x) => x.id === id);
  if (!a) {
    return (
      <>
        <Top />
        <Nav to="/auftraege" label="Meine Aufträge" />
        {error && <p className="err" role="alert">Der Auftrag konnte nicht geladen werden: {error}</p>}
        {items == null && !error && <p className="lead">Lädt …</p>}
        {items && <p className="hint">Diesen Auftrag gibt es nicht (mehr), oder er ist dir nicht mehr zugewiesen.</p>}
      </>
    );
  }
  const boot: [string, string][] = ([
    ['Typ', a.boat_type], ['Name', a.boat_name], ['Baujahr', a.year_built ? String(a.year_built) : null],
    ['Länge', a.length_m ? komma(a.length_m) + ' m' : null], ['Breite', a.beam_m ? komma(a.beam_m) + ' m' : null], ['Tiefgang', a.draft_m ? komma(a.draft_m) + ' m' : null],
    ['Flagge', a.flag], ['Rufzeichen', a.callsign], ['MMSI', a.mmsi], ['Registriernummer', a.registration_no],
  ] as [string, string | null][]).filter((r): r is [string, string] => !!r[1]);

  return (
    <>
      <Top />
      <Nav to="/auftraege" label="Meine Aufträge" />
      <Von a={a} />
      <section className="route">
        <div className="ports">{a.from_port}<span>→</span>{a.to_port}</div>
        <div className="meta">
          <span>{a.planned_start ? 'Start ' + datum(a.planned_start) : 'Starttermin offen'}</span>
          {a.boat_type && <span>{a.boat_type}</span>}
          {a.boat_name && <span>„{a.boat_name}"</span>}
        </div>
      </section>

      <span className="label">Boot</span>
      {boot.length === 0 ? <p className="hint">Zum Boot ist noch nichts eingetragen.</p> : (
        <dl className="facts">{boot.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}</dl>
      )}

      <span className="label">Eigner</span>
      {!a.owner_name && !a.owner_phone && !a.owner_email ? <p className="hint">Der Kontakt zum Eigner ist noch nicht eingetragen.</p> : (
        <dl className="facts">
          {a.owner_name && <div><dt>Name</dt><dd>{a.owner_name}</dd></div>}
          {a.owner_phone && <div><dt>Telefon</dt><dd><a href={'tel:' + a.owner_phone.replace(/[^+\d]/g, '')}>{a.owner_phone}</a></dd></div>}
          {a.owner_email && <div><dt>E-Mail</dt><dd><a href={'mailto:' + a.owner_email}>{a.owner_email}</a></dd></div>}
        </dl>
      )}

      <p className="hint">Vertrag, Vollmacht und Checklisten zu diesem Auftrag erscheinen hier, sobald sie fertig sind.</p>
    </>
  );
}
