import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { TERMS, defaultModules, isoDatum, komma, stufe } from '../data';
import { TermsList } from '../TermsList';
import type { HubspotOrder } from '../types';
import { Field, Nav, Opt, Top } from '../ui';

interface Existing { id: string; boat_id: string | null; owner_id: string | null }

async function fehlertext(error: unknown): Promise<string> {
  // Die Funktion antwortet bei Fehlern mit einem verständlichen Satz im Feld „error".
  const ctx = (error as { context?: Response }).context;
  if (ctx && typeof ctx.json === 'function') {
    try { const j = await ctx.json(); if (j?.error) return j.error; } catch { /* keine lesbare Antwort */ }
  }
  return String((error as Error).message ?? error);
}

export default function HubspotImport() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [no, setNo] = useState(params.get('id') ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<HubspotOrder | null>(null);
  const [existing, setExisting] = useState<Existing | null>(null);
  const [contactId, setContactId] = useState('');

  async function fetchOrder(orderNo: string) {
    setBusy(true); setError(''); setOrder(null); setExisting(null);
    const { data, error } = await supabase.functions.invoke('hubspot-order', { body: { auftrags_id: orderNo.trim() } });
    if (error) { setError(await fehlertext(error)); setBusy(false); return; }
    const o = data as HubspotOrder;
    const ex = await supabase.from('deliveries').select('id, boat_id, owner_id').eq('hubspot_deal_id', o.deal_id).maybeSingle();
    setExisting((ex.data as Existing | null) ?? null);
    setOrder(o);
    // Vorauswahl: ein Kontakt, der in HubSpot als Eigner oder Kunde gekennzeichnet ist, sonst der erste.
    const eigner = o.contacts.find((c) => /eigner|kunde|owner/i.test(c.label ?? '')) ?? o.contacts[0];
    setContactId(eigner?.id ?? '');
    setBusy(false);
  }

  useEffect(() => { const id = params.get('id'); if (id) void fetchOrder(id); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  function submit(e: FormEvent) { e.preventDefault(); if (no.trim()) void fetchOrder(no); }

  async function save() {
    if (!order) return;
    if (!order.route.from || !order.route.to) { setError('In HubSpot fehlen Start- oder Zielhafen. Bitte dort eintragen und noch einmal abrufen.'); return; }
    setBusy(true); setError('');
    try {
      // HubSpot führt: Was dort steht, überschreibt. Was dort leer ist, bleibt in der App stehen (z. B. MMSI).
      const filled = <T extends Record<string, unknown>>(o: T) => Object.fromEntries(Object.entries(o).filter(([, v]) => v != null)) as Partial<T>;
      const boat = filled(order.boat);
      const c = order.contacts.find((x) => x.id === contactId);
      const owner = c ? filled({ name: c.name, email: c.email, phone: c.phone, address: c.address }) : {};

      let boatId = existing?.boat_id ?? null;
      if (boatId) { if (Object.keys(boat).length) { const r = await supabase.from('boats').update(boat).eq('id', boatId); if (r.error) throw r.error; } }
      else if (Object.keys(boat).length) { const r = await supabase.from('boats').insert(boat).select('id').single(); if (r.error) throw r.error; boatId = r.data.id; }

      let ownerId = existing?.owner_id ?? null;
      if (ownerId) { if (Object.keys(owner).length) { const r = await supabase.from('owners').update(owner).eq('id', ownerId); if (r.error) throw r.error; } }
      else if (Object.keys(owner).length) { const r = await supabase.from('owners').insert(owner).select('id').single(); if (r.error) throw r.error; ownerId = r.data.id; }

      const start = isoDatum(order.route.when);
      const delivery = {
        from_port: order.route.from, to_port: order.route.to, when_text: order.route.when, ...(start ? { planned_start: start } : {}),
        boat_id: boatId, owner_id: ownerId, hubspot_deal_id: order.deal_id, order_no: order.order_no, hubspot_stage: order.stage,
        hubspot_synced_at: new Date().toISOString(),
      };
      let id = existing?.id ?? null;
      if (id) { const r = await supabase.from('deliveries').update(delivery).eq('id', id); if (r.error) throw r.error; }
      else { const r = await supabase.from('deliveries').insert({ ...delivery, modules: defaultModules() }).select('id').single(); if (r.error) throw r.error; id = r.data.id; }

      // Was Seatribe dem Skipper zahlt, wird in der App nicht gespeichert (Entscheidung vom 2026-11-18).
      const { tagessatz_skipper: _weg, ...terms } = order.terms;
      void _weg;
      const t = await supabase.from('delivery_terms').upsert({ delivery_id: id, data: terms });
      if (t.error) throw t.error;
      navigate(`/ueberfuehrungen/${id}`, { replace: true });
    } catch (err) {
      setError('Speichern hat nicht geklappt: ' + String((err as Error).message ?? err));
      setBusy(false);
    }
  }

  const b = order?.boat;
  const kopf: [string, string | null][] = order ? [
    ['Auftrags-ID', order.order_no],
    ['Stand in HubSpot', stufe(order.stage) || null],
    ['Starthafen', order.route.from], ['Zielhafen', order.route.to], ['Wann', order.route.when],
    ['Bootstyp', b!.type], ['Bootsname', b!.name], ['Baujahr', b!.year_built ? String(b!.year_built) : null],
    ['Länge', b!.length_m ? komma(b!.length_m) + ' m' : null], ['Breite', b!.beam_m ? komma(b!.beam_m) + ' m' : null], ['Tiefgang', b!.draft_m ? komma(b!.draft_m) + ' m' : null],
    ['Registrierungsnummer', b!.registration_no],
  ] : [];
  const pflicht = new Set(['Starthafen', 'Zielhafen', 'Wann', 'Bootstyp', 'Bootsname', 'Länge']);
  const fehlt = order ? [
    ...kopf.filter(([k, v]) => pflicht.has(k) && !v).map(([k]) => k),
    ...TERMS.filter((x) => x.wichtig && order.terms[x.k] == null).map((x) => x.t),
    ...(order.contacts.length === 0 ? ['Kontakt des Eigners'] : []),
  ] : [];

  return (
    <>
      <Top />
      <Nav to="/ueberfuehrungen" label="Überführungen" />
      <div className="stack">
        <h1>Auftrag aus HubSpot holen</h1>
        <p className="lead">Die App liest den Deal nur. In HubSpot wird nichts verändert.</p>
      </div>

      <form className="stack" onSubmit={submit} noValidate>
        <Field id="h-nr" label="Auftrags-ID" inputMode="numeric" value={no} onChange={setNo} hint="Die Nummer aus dem Feld „Auftrags-ID“ am Deal." autoComplete="off" />
        <button className={order ? 'btn ghost wide' : 'btn wide'} type="submit" disabled={busy || !no.trim()}>{busy && !order ? 'Sucht …' : order ? 'Erneut abrufen' : 'Abrufen'}</button>
      </form>
      {error && <p className="err" role="alert">{error}</p>}

      {order && (
        <>
          {existing && <p className="note">Diesen Auftrag gibt es in der App schon. Beim Speichern werden seine Angaben mit dem Stand aus HubSpot aktualisiert; der zugewiesene Skipper bleibt.</p>}
          {fehlt.length > 0 && <p className="note">In HubSpot fehlt noch: {fehlt.join(', ')}. Du kannst trotzdem übernehmen und später erneut abrufen.</p>}

          <span className="label">Überführung und Boot</span>
          <dl className="facts">
            {kopf.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd className={v || !pflicht.has(k) ? undefined : 'miss'}>{v || (pflicht.has(k) ? 'fehlt' : '–')}</dd></div>))}
          </dl>

          <span className="label">Eigner</span>
          {order.contacts_note && <p className="note">{order.contacts_note}</p>}
          {order.contacts.length > 1 && <p className="lead">Am Deal hängen {order.contacts.length} Kontakte. Wer ist der Eigner?</p>}
          {order.contacts.map((c) => (
            <Opt key={c.id} name="h-eigner" value={c.id} checked={contactId === c.id} onChange={() => setContactId(c.id)}
              title={(c.name || c.email || 'Ohne Namen') + (c.label ? ` (${c.label})` : '')}
              sub={[c.email, c.phone, c.address].filter(Boolean).join(' · ') || 'keine weiteren Angaben'} />
          ))}

          <span className="label">Konditionen (sieht nur die Agentur)</span>
          <TermsList terms={order.terms} luecken />

          <button className="btn wide" onClick={save} disabled={busy}>{busy ? 'Speichert …' : existing ? 'Überführung aktualisieren' : 'Überführung anlegen'}</button>
        </>
      )}
    </>
  );
}
