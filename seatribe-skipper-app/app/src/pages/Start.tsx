import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listDeliveries } from '../deliveries';
import type { Delivery } from '../types';
import { Icon, Top } from '../ui';
import { DeliveryRow } from './Liste';

export default function Start() {
  const [items, setItems] = useState<Delivery[] | null>(null);
  useEffect(() => { listDeliveries().then(setItems).catch(() => setItems([])); }, []);

  return (
    <>
      <Top />
      <h1>Was möchtest du tun?</h1>
      <div className="tiles">
        <Link className="tile main" to="/ueberfuehrungen/neu">
          <Icon n="plus" />
          <span><span className="t">Überführung anlegen</span><br /><span className="s">Start, Ziel, Boot</span></span>
        </Link>
        <Link className="tile" to="/ueberfuehrungen">
          <Icon n="list" />
          <span><span className="t">Meine Überführungen</span><br /><span className="s">{items == null ? ' ' : items.length + ' angelegt'}</span></span>
        </Link>
        <Link className="tile" to="/konto">
          <Icon n="id" />
          <span><span className="t">Mein Konto</span><br /><span className="s">Kontoart, Steuer, Versand</span></span>
        </Link>
        <div className="tile soon">
          <Icon n="play" />
          <span><span className="t">Academy</span><br /><span className="s">kommt später</span></span>
        </div>
      </div>
      {items && items.length > 0 && (
        <div className="stack">
          <span className="label">Zuletzt angelegt</span>
          {items.slice(0, 2).map((d) => <DeliveryRow key={d.id} d={d} />)}
        </div>
      )}
    </>
  );
}
