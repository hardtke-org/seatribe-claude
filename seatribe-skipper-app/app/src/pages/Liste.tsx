import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listDeliveries } from '../deliveries';
import { datum } from '../data';
import type { Delivery } from '../types';
import { Icon, Nav, Top } from '../ui';

export function DeliveryRow({ d }: { d: Delivery }) {
  const sub = [d.boat?.type, d.boat?.name ? `„${d.boat.name}"` : '', d.planned_start ? 'ab ' + datum(d.planned_start) : ''].filter(Boolean).join(' · ');
  return (
    <Link className="row" to={`/ueberfuehrungen/${d.id}`}>
      <span className="ic"><Icon n="compass" /></span>
      <span className="tx">
        <span className="tt">{d.from_port} → {d.to_port}</span>
        {sub && <><br /><span className="ss">{sub}</span></>}
      </span>
      <Icon n="chev" className="chev" />
    </Link>
  );
}

export default function Liste() {
  const [items, setItems] = useState<Delivery[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { listDeliveries().then(setItems).catch((e) => setError(String(e.message ?? e))); }, []);

  return (
    <>
      <Top />
      <Nav to="/" label="Start" />
      <h1>Meine Überführungen</h1>
      {error && <p className="err" role="alert">Die Liste konnte nicht geladen werden: {error}</p>}
      {items == null && !error && <p className="lead">Lädt …</p>}
      {items && items.length === 0 && <p className="hint">Noch keine Überführung angelegt. Leg die erste an, Start- und Zielhafen reichen.</p>}
      {items && items.length > 0 && <div className="stack">{items.map((d) => <DeliveryRow key={d.id} d={d} />)}</div>}
      <Link className="btn wide" to="/ueberfuehrungen/neu">Überführung anlegen</Link>
    </>
  );
}
