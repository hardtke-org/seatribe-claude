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
  const crew = profile?.role === 'crew';
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
      {status === 'bestaetigt' && <p className="okmsg" role="status">{crew ? 'Du bist als Crew für Seatribe bestätigt.' : 'Du bist als Seatribe-Skipper bestätigt.'}</p>}
      <div className="tiles">
        {!crew && (
          <Link className="tile main" to="/auftraege">
            <Icon n="compass" />
            <span><span className="t">Meine Aufträge</span><br /><span className="s">Überführungen für Seatribe</span></span>
          </Link>
        )}
        <Link className={crew ? 'tile main' : 'tile'} to="/dokumente">
          <Icon n="doc" />
          <span><span className="t">Meine Dokumente</span><br /><span className="s">Nachweise und Verträge</span></span>
        </Link>
        <Link className="tile" to="/konto">
          <Icon n="id" />
          <span><span className="t">Mein Konto</span><br /><span className="s">Anschrift, Scheine, Steuer</span></span>
        </Link>
        {!crew && (
          <Link className="tile" to="/agentur">
            <Icon n="users" />
            <span><span className="t">Agentur</span><br /><span className="s">Skipper beauftragen</span></span>
          </Link>
        )}
      </div>
    </>
  );
}

function AgenturStart() {
  const [items, setItems] = useState<Delivery[] | null>(null);
  const [offen, setOffen] = useState<number | null>(null);
  const [crewOffen, setCrewOffen] = useState<number | null>(null);
  useEffect(() => {
    listDeliveries().then(setItems).catch(() => setItems([]));
    const zaehle = (rolle: string) => supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', rolle).eq('seatribe_status', 'neu');
    zaehle('skipper').then(({ count }) => setOffen(count ?? 0));
    zaehle('crew').then(({ count }) => setCrewOffen(count ?? 0));
  }, []);
  const wartet = (n: number | null) => n == null ? ' ' : n === 0 ? 'Profile und Nachweise' : n === 1 ? '1 wartet auf Bestätigung' : n + ' warten auf Bestätigung';

  return (
    <>
      <Top />
      <h1>Was möchtest du tun?</h1>
      <div className="tiles">
        <Link className="tile main" to="/agentur">
          <Icon n="users" />
          <span><span className="t">Skipper</span><br /><span className="s">{wartet(offen)}</span></span>
        </Link>
        <Link className="tile" to="/ueberfuehrungen">
          <Icon n="list" />
          <span><span className="t">Überführungen</span><br /><span className="s">{items == null ? ' ' : items.length + ' angelegt'}</span></span>
        </Link>
        <Link className="tile" to="/agentur/crew">
          <Icon n="anchor" />
          <span><span className="t">Crew</span><br /><span className="s">{wartet(crewOffen)}</span></span>
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
