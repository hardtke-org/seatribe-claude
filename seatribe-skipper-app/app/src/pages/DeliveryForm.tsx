import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { getDelivery } from '../deliveries';
import { defaultModules, komma, zahl } from '../data';
import type { Delivery, Profile } from '../types';
import { Field, Nav, Top } from '../ui';

const EMPTY = {
  from: '', to: '', start: '',
  type: '', name: '', year: '', flag: '', length: '', beam: '', draft: '', mmsi: '', callsign: '',
  owner: '', email: '', phone: '', skipper: '',
};
type Form = typeof EMPTY;

function fromDelivery(d: Delivery): Form {
  return {
    from: d.from_port, to: d.to_port, start: d.planned_start ?? '',
    type: d.boat?.type ?? '', name: d.boat?.name ?? '', year: d.boat?.year_built ? String(d.boat.year_built) : '', flag: d.boat?.flag ?? '',
    length: komma(d.boat?.length_m ?? null), beam: komma(d.boat?.beam_m ?? null), draft: komma(d.boat?.draft_m ?? null),
    mmsi: d.boat?.mmsi ?? '', callsign: d.boat?.callsign ?? '',
    owner: d.owner?.name ?? '', email: d.owner?.email ?? '', phone: d.owner?.phone ?? '', skipper: d.assigned_skipper_id ?? '',
  };
}

const t = (s: string) => s.trim() || null;

export default function DeliveryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skippers, setSkippers] = useState<Pick<Profile, 'id' | 'display_name' | 'email'>[]>([]);
  useEffect(() => {
    supabase.from('profiles').select('id, display_name, email').eq('role', 'skipper').eq('seatribe_status', 'bestaetigt').order('display_name')
      .then(({ data }) => setSkippers(data ?? []));
  }, []);
  const [f, setF] = useState<Form>(EMPTY);
  const [existing, setExisting] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getDelivery(id).then((d) => {
      if (d) { setExisting(d); setF(fromDelivery(d)); } else setError('Diese Überführung gibt es nicht mehr.');
      setLoading(false);
    }).catch((e) => { setError(String(e.message ?? e)); setLoading(false); });
  }, [id]);

  const set = (k: keyof Form) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!f.from.trim() || !f.to.trim()) { setError('Bitte Start- und Zielhafen eintragen.'); return; }
    const year = f.year.trim() ? Number(f.year) : null;
    if (year != null && !(Number.isInteger(year) && year >= 1800 && year <= 2200)) { setError('Bitte das Baujahr als vierstellige Jahreszahl eintragen.'); return; }
    if (f.mmsi.trim() && !/^\d{9}$/.test(f.mmsi.trim())) { setError('Die MMSI hat genau neun Ziffern.'); return; }

    const boat = { type: t(f.type), name: t(f.name), year_built: year, flag: t(f.flag), length_m: zahl(f.length), beam_m: zahl(f.beam), draft_m: zahl(f.draft), mmsi: t(f.mmsi), callsign: t(f.callsign) };
    const owner = { name: t(f.owner), email: t(f.email), phone: t(f.phone) };
    const hasBoat = Object.values(boat).some((v) => v != null);
    const hasOwner = Object.values(owner).some((v) => v != null);

    setBusy(true);
    try {
      let boatId = existing?.boat?.id ?? null;
      if (boatId) { const r = await supabase.from('boats').update(boat).eq('id', boatId); if (r.error) throw r.error; }
      else if (hasBoat) { const r = await supabase.from('boats').insert(boat).select('id').single(); if (r.error) throw r.error; boatId = r.data.id; }

      let ownerId = existing?.owner?.id ?? null;
      if (ownerId) { const r = await supabase.from('owners').update(owner).eq('id', ownerId); if (r.error) throw r.error; }
      else if (hasOwner) { const r = await supabase.from('owners').insert(owner).select('id').single(); if (r.error) throw r.error; ownerId = r.data.id; }

      const delivery = { from_port: f.from.trim(), to_port: f.to.trim(), planned_start: f.start || null, boat_id: boatId, owner_id: ownerId, assigned_skipper_id: f.skipper || null };
      if (existing) {
        const r = await supabase.from('deliveries').update(delivery).eq('id', existing.id);
        if (r.error) throw r.error;
        navigate(`/ueberfuehrungen/${existing.id}`, { replace: true });
      } else {
        const r = await supabase.from('deliveries').insert({ ...delivery, modules: defaultModules() }).select('id').single();
        if (r.error) throw r.error;
        navigate(`/ueberfuehrungen/${r.data.id}`, { replace: true });
      }
    } catch (err) {
      setError('Speichern hat nicht geklappt: ' + (err instanceof Error ? err.message : (err as { message?: string }).message ?? String(err)));
      setBusy(false);
    }
  }

  const backTo = id ? `/ueberfuehrungen/${id}` : '/';
  if (loading) return (<><Top /><Nav to={backTo} label="Zurück" /><p className="lead">Lädt …</p></>);

  return (
    <>
      <Top />
      <Nav to={backTo} label={id ? 'Überführung' : 'Start'} />
      <div className="stack">
        <h1>{id ? 'Daten bearbeiten' : 'Überführung anlegen'}</h1>
        <p className="lead">Nur Start und Ziel sind nötig. Alles andere kannst du später ergänzen.</p>
      </div>
      <form className="stack" onSubmit={submit} noValidate>
        <span className="label">Route</span>
        <div className="two">
          <Field id="d-von" label="Starthafen" value={f.from} onChange={set('from')} required autoComplete="off" />
          <Field id="d-nach" label="Zielhafen" value={f.to} onChange={set('to')} required autoComplete="off" />
        </div>
        <Field id="d-start" label="Geplanter Start" type="date" value={f.start} onChange={set('start')} />

        <span className="label">Boot</span>
        <div className="two">
          <Field id="d-typ" label="Typ" value={f.type} onChange={set('type')} placeholder="z. B. Bavaria 46" />
          <Field id="d-name" label="Name" value={f.name} onChange={set('name')} />
        </div>
        <div className="two">
          <Field id="d-baujahr" label="Baujahr" value={f.year} onChange={set('year')} inputMode="numeric" maxLength={4} />
          <Field id="d-flagge" label="Flagge" value={f.flag} onChange={set('flag')} />
        </div>
        <div className="two">
          <Field id="d-laenge" label="Länge" value={f.length} onChange={set('length')} inputMode="decimal" unit="m" />
          <Field id="d-breite" label="Breite" value={f.beam} onChange={set('beam')} inputMode="decimal" unit="m" />
        </div>
        <div className="two">
          <Field id="d-tiefgang" label="Tiefgang" value={f.draft} onChange={set('draft')} inputMode="decimal" unit="m" />
          <Field id="d-mmsi" label="MMSI" value={f.mmsi} onChange={set('mmsi')} inputMode="numeric" maxLength={9} />
        </div>
        <Field id="d-rufzeichen" label="Rufzeichen" value={f.callsign} onChange={set('callsign')} />
        <p className="hint">Länge, Breite und Tiefgang brauchst du für Liegeplätze und Schleusen. MMSI, Rufzeichen und Flagge stehen in Crewliste und Vollmacht.</p>

        <span className="label">Eigner</span>
        <Field id="d-eigner" label="Name" value={f.owner} onChange={set('owner')} />
        <Field id="d-eigner-tel" label="Telefon" type="tel" value={f.phone} onChange={set('phone')} hint="Sieht auch der Skipper, dem du die Überführung zuweist." />
        <Field id="d-mail" label="E-Mail" type="email" inputMode="email" value={f.email} onChange={set('email')} />

        <span className="label">Skipper</span>
        <label className="field" htmlFor="d-skipper">
          <span>Wer fährt die Überführung?</span>
          <select className="inp" id="d-skipper" value={f.skipper} onChange={(e) => set('skipper')(e.target.value)}>
            <option value="">Noch niemand zugewiesen</option>
            {f.skipper && !skippers.some((s) => s.id === f.skipper) && <option value={f.skipper}>Zugewiesener Skipper (nicht mehr bestätigt)</option>}
            {skippers.map((s) => <option key={s.id} value={s.id}>{s.display_name || s.email}</option>)}
          </select>
          <small>{skippers.length === 0 ? 'Noch kein Skipper bestätigt. Bestätigen kannst du unter „Skipper".' : 'Zur Auswahl stehen alle bestätigten Skipper. Er sieht Route, Termin, Boot und den Kontakt zum Eigner – keine Preise.'}</small>
        </label>

        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn wide" type="submit" disabled={busy}>{busy ? 'Speichert …' : id ? 'Speichern' : 'Überführung anlegen'}</button>
      </form>
    </>
  );
}
