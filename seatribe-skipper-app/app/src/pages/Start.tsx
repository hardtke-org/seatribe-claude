import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { listDeliveries } from '../deliveries';
import { supabase } from '../supabase';
import type { Delivery } from '../types';
import { Icon, Top } from '../ui';
import { DeliveryRow } from './Liste';

export default function Start() {
  const { profile } = useAuth();
  if (!profile) return (<><Top /><p className="lead">Lädt …</p></>);
  return profile.role === 'agentur' ? <AgenturStart /> : <SkipperStart />;
}

function SkipperStart() {
  const { profile } = useAuth();
  const status = profile?.seatribe_status;
  return (
    <>
      <Top />
      <h1>Was möchtest du tun?</h1>
      {status === 'neu' && (
        <p className="note" role="status">Dein Konto wartet auf die Bestätigung durch Seatribe. Trag in der Zwischenzeit deine Angaben ein und lade deine Nachweise hoch.</p>
      )}
      {status === 'abgelehnt' && (
        <p className="note" role="status">Dein Konto ist derzeit nicht für Seatribe-Aufträge freigegeben. Bei Fragen melde dich bitte bei Seatribe.</p>
      )}
      {status === 'bestaetigt' && <p className="okmsg" role="status">Du bist als Seatribe-Skipper bestätigt.</p>}
      <div className="tiles">
        <Link className="tile main" to="/auftraege">
          <Icon n="compass" />
          <span><span className="t">Meine Aufträge</span><br /><span className="s">Überführungen für Seatribe</span></span>
        </Link>
        <Link className="tile" to="/dokumente">
          <Icon n="doc" />
          <span><span className="t">Meine Dokumente</span><br /><span className="s">Nachweise und Verträge</span></span>
        </Link>
        <Link className="tile" to="/konto">
          <Icon n="id" />
          <span><span className="t">Mein Konto</span><br /><span className="s">Anschrift, Scheine, Steuer</span></span>
        </Link>
        <Link className="tile" to="/agentur">
          <Icon n="users" />
          <span><span className="t">Agentur</span><br /><span className="s">Skipper beauftragen</span></span>
        </Link>
      </div>
    </>
  );
}

function AgenturStart() {
  const [items, setItems] = useState<Delivery[] | null>(null);
  const [offen, setOffen] = useState<number | null>(null);
  useEffect(() => {
    listDeliveries().then(setItems).catch(() => setItems([]));
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'skipper').eq('seatribe_status', 'neu')
      .then(({ count }) => setOffen(count ?? 0));
  }, []);

  return (
    <>
      <Top />
      <h1>Was möchtest du tun?</h1>
      <div className="tiles">
        <Link className="tile main" to="/agentur">
          <Icon n="users" />
          <span><span className="t">Skipper</span><br /><span className="s">{offen == null ? ' ' : offen === 0 ? 'Profile und Nachweise' : offen === 1 ? '1 wartet auf Bestätigung' : offen + ' warten auf Bestätigung'}</span></span>
        </Link>
        <Link className="tile" to="/ueberfuehrungen">
          <Icon n="list" />
          <span><span className="t">Überführungen</span><br /><span className="s">{items == null ? ' ' : items.length + ' angelegt'}</span></span>
        </Link>
        <Link className="tile" to="/ueberfuehrungen/neu">
          <Icon n="plus" />
          <span><span className="t">Überführung anlegen</span><br /><span className="s">Start, Ziel, Boot</span></span>
        </Link>
        <Link className="tile" to="/konto">
          <Icon n="id" />
          <span><span className="t">Mein Konto</span><br /><span className="s">Firma, Anschrift, Steuer</span></span>
        </Link>
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
