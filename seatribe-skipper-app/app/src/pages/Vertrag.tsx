import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth';
import { eignerVertrag, luecken, ruleOf, tageHinweis, zahlung, type Block, type ContractInput } from '../contract';
import { datum, euro, isoDatum } from '../data';
import { getDelivery } from '../deliveries';
import { supabase } from '../supabase';
import type { Contract, Delivery, Terms } from '../types';
import { Field, Nav, Opt, Top } from '../ui';

const BUCKET = 'contracts';
const heute = () => new Date().toISOString().slice(0, 10);
const zahlOderNull = (s: string) => (s.trim() === '' ? null : Number.isFinite(Number(s.replace(',', '.'))) ? Number(s.replace(',', '.')) : null);

function Vorschau({ blocks }: { blocks: Block[] }) {
  const bisAgb = blocks.findIndex((b) => b.t === 'seite');
  return (
    <div className="paper vertrag">
      {blocks.slice(0, bisAgb < 0 ? undefined : bisAgb).map((b, n) => {
        if (b.t === 'kopf') return (
          <div key={n} className="v-kopf">
            <div><span className="v-label">{b.marke}</span><div className="title">{b.titel}</div><div className="when">{b.ort}</div></div>
            <img src="/logo-192.png" alt="" />
          </div>
        );
        if (b.t === 'parteien') return (
          <div key={n} className="stack" style={{ gap: 6 }}>
            <div className="two">
              {[b.a, b.b].map((p) => (
                <div key={p.label} className="v-box"><span className="v-label">{p.label}</span><strong className={p.name ? undefined : 'miss'}>{p.name || 'fehlt'}</strong>{p.zeilen.map((z) => <div key={z}>{z}</div>)}</div>
              ))}
            </div>
            <small className="when">{b.nach}</small>
          </div>
        );
        if (b.t === 'h') return <h3 key={n}>{b.nr ? b.nr + '  ' : ''}{b.text}</h3>;
        if (b.t === 'p') return <p key={n} className={b.neu ? 'neu' : undefined}>{b.text}</p>;
        if (b.t === 'yacht') return (
          <dl key={n}>
            {([['Yachttyp', b.typ], ['Yachtname', b.name], ['Starthafen', b.von], ['Zielhafen', b.nach], ['Geplanter Starttermin', b.start]] as const).map(([k, v]) => (
              <div key={k} style={{ display: 'contents' }}><dt>{k}</dt><dd>{v || '–'}</dd></div>
            ))}
          </dl>
        );
        if (b.t === 'summe') return (
          <div key={n} className="v-summe"><span className="v-label">{b.titel}</span><div>{b.sub}</div><div className="total">{b.netto || '–'} <small>netto</small> · {b.brutto || '–'} <small>brutto</small></div></div>
        );
        if (b.t === 'label') return <strong key={n} className="v-zwischen">{b.text}</strong>;
        if (b.t === 'tabelle') return (
          <table key={n}><tbody>
            {b.zeilen.map((z) => (<tr key={z.k} className={z.sub ? 'v-sub' : undefined}><td>{z.k}{z.zusatz}</td><td className={z.v ? undefined : 'miss'}>{z.v ? <><strong>{z.v}</strong>{z.vz}</> : 'fehlt'}</td></tr>))}
          </tbody></table>
        );
        if (b.t === 'klein') return (<div key={n} className="v-klein">{b.punkte.map((p) => <p key={p.s} className={p.neu ? 'neu' : undefined}><strong>{p.s}</strong> {p.text}</p>)}</div>);
        if (b.t === 'karten') return (
          <div key={n} className="two">
            {b.karten.map((k) => (<div key={k.kopf} className="v-karte neu"><span className="v-label">{k.kopf}</span><div className="when">{k.sub}</div><strong>{k.betrag} <small>brutto</small></strong><div>{k.text}</div></div>))}
          </div>
        );
        if (b.t === 'unterschrift') return (
          <div key={n} className="two" style={{ fontSize: '.8rem' }}>
            <div><span className="v-label">{b.links.label}</span><div className="signline" />{b.links.name}</div>
            <div><span className="v-label">{b.rechts.label}</span><div>{b.rechts.ort}</div><div className="signline">{b.bild && <img src={b.bild} alt="Deine Unterschrift" />}</div>{b.rechts.name}</div>
          </div>
        );
        return null;
      })}
    </div>
  );
}

export default function Vertrag() {
  const { id } = useParams();
  const { session, profile } = useAuth();
  const uid = session?.user.id;
  const [d, setD] = useState<Delivery | null | undefined>(undefined);
  const [terms, setTerms] = useState<Terms | null>(null);
  const [list, setList] = useState<Contract[]>([]);
  const [f, setF] = useState({ ownerName: '', ownerAddress: '', boatType: '', boatName: '', start: '', min: '', max: '' });
  const [entwurf, setEntwurf] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [ask, setAsk] = useState<string | null>(null);
  const datei = useRef<HTMLInputElement>(null);
  const ziel = useRef<Contract | null>(null);

  const loadList = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase.from('contracts').select('*').eq('delivery_id', id).eq('kind', 'eigner').order('created_at', { ascending: false });
    setList((data ?? []) as Contract[]);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const del = await getDelivery(id).catch(() => null);
      setD(del);
      if (!del) return;
      const t = await supabase.from('delivery_terms').select('data').eq('delivery_id', id).maybeSingle();
      const data = (t.data?.data as Terms | undefined) ?? null;
      setTerms(data);
      setF({
        ownerName: del.owner?.name ?? '', ownerAddress: del.owner?.address ?? '', boatType: del.boat?.type ?? '', boatName: del.boat?.name ?? '',
        start: del.planned_start ?? isoDatum(del.when_text) ?? '',
        min: data?.min_tage != null ? String(data.min_tage) : '', max: data?.max_tage != null ? String(data.max_tage) : '',
      });
      await loadList();
    })();
  }, [id, loadList]);

  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const input: ContractInput | null = useMemo(() => (d && profile && terms ? {
    profile, ownerName: f.ownerName, ownerAddress: f.ownerAddress, boatType: f.boatType, boatName: f.boatName,
    from: d.from_port, to: d.to_port, start: f.start, terms, minTage: zahlOderNull(f.min), maxTage: zahlOderNull(f.max),
    ort: profile.city ?? '', datum: heute(),
  } : null), [d, profile, terms, f]);
  const blocks = useMemo(() => (input ? eignerVertrag(input) : []), [input]);
  const fehlt = input ? luecken(input) : [];
  const z = terms && profile ? zahlung(terms, ruleOf(profile), profile) : null;

  async function open(path: string) {
    const w = window.open('', '_blank');
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 120);
    if (error || !data) { w?.close(); setMsg({ ok: false, text: 'Die Datei konnte nicht geöffnet werden.' }); return; }
    if (w) w.location.href = data.signedUrl; else window.location.href = data.signedUrl;
  }

  async function erzeugen() {
    if (!d || !input || !uid || !terms) return;
    setBusy(true); setMsg(null);
    try {
      // Was hier ergänzt wurde, wird bei der Überführung gespeichert, damit es nur einmal eingegeben wird.
      const owner = { name: f.ownerName.trim() || null, address: f.ownerAddress.trim() || null };
      let ownerId = d.owner?.id ?? null;
      if (ownerId) { const r = await supabase.from('owners').update(owner).eq('id', ownerId); if (r.error) throw r.error; }
      else if (owner.name || owner.address) { const r = await supabase.from('owners').insert(owner).select('id').single(); if (r.error) throw r.error; ownerId = r.data.id; }
      const boat = { type: f.boatType.trim() || null, name: f.boatName.trim() || null };
      let boatId = d.boat?.id ?? null;
      if (boatId) { const r = await supabase.from('boats').update(boat).eq('id', boatId); if (r.error) throw r.error; }
      else if (boat.type || boat.name) { const r = await supabase.from('boats').insert(boat).select('id').single(); if (r.error) throw r.error; boatId = r.data.id; }
      const upd = await supabase.from('deliveries').update({ planned_start: f.start || null, owner_id: ownerId, boat_id: boatId }).eq('id', d.id);
      if (upd.error) throw upd.error;
      const neu = { ...terms, min_tage: input.minTage, max_tage: input.maxTage };
      const tu = await supabase.from('delivery_terms').update({ data: neu }).eq('delivery_id', d.id);
      if (tu.error) throw tu.error;
      setTerms(neu);

      const { renderPdf } = await import('../contractPdf');
      const firma = profile?.company || profile?.display_name || '';
      const pdf = await renderPdf(blocks, { fuss: 'Überführungsvertrag', firma, kopf: [firma, f.ownerName.trim()].filter(Boolean).join(' / '), entwurf });
      const kurz = (d.order_no ? 'Auftrag-' + d.order_no : `${d.from_port}-${d.to_port}`).normalize('NFKD').replace(/[^\w-]+/g, '-').replace(/-+/g, '-').slice(0, 60);
      const name = `Ueberfuehrungsvertrag-${kurz}${entwurf ? '-Entwurf' : ''}.pdf`;
      const path = `${uid}/${d.id}/${crypto.randomUUID()}.pdf`;
      const up = await supabase.storage.from(BUCKET).upload(path, pdf, { contentType: 'application/pdf' });
      if (up.error) throw up.error;
      const ins = await supabase.from('contracts').insert({ delivery_id: d.id, kind: 'eigner', file_path: path, file_name: name, data: { entwurf, anzahlung: z?.anzahlung, rest: z?.rest } });
      if (ins.error) { await supabase.storage.from(BUCKET).remove([path]); throw ins.error; }
      await loadList();
      setMsg({ ok: true, text: 'Der Vertrag ist erzeugt und liegt unten bei den Fassungen.' });
    } catch (e) {
      setMsg({ ok: false, text: 'Das hat nicht geklappt: ' + String((e as Error).message ?? e) });
    }
    setBusy(false);
  }

  async function signiert(c: Contract, file: File | undefined) {
    if (!file || !uid) return;
    setMsg(null);
    const ext = (file.name.split('.').pop() || 'pdf').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'pdf';
    const path = `${uid}/${c.delivery_id}/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined });
    if (up.error) { setMsg({ ok: false, text: 'Hochladen hat nicht geklappt: ' + up.error.message }); return; }
    const r = await supabase.from('contracts').update({ signed_path: path, signed_name: file.name, signed_at: new Date().toISOString() }).eq('id', c.id);
    if (r.error) { await supabase.storage.from(BUCKET).remove([path]); setMsg({ ok: false, text: 'Speichern hat nicht geklappt: ' + r.error.message }); return; }
    if (c.signed_path) await supabase.storage.from(BUCKET).remove([c.signed_path]);
    await loadList();
    setMsg({ ok: true, text: 'Die unterschriebene Fassung ist abgelegt.' });
  }

  async function loeschen(c: Contract) {
    const rm = await supabase.storage.from(BUCKET).remove([c.file_path, ...(c.signed_path ? [c.signed_path] : [])]);
    if (rm.error) { setMsg({ ok: false, text: 'Löschen hat nicht geklappt: ' + rm.error.message }); return; }
    await supabase.from('contracts').delete().eq('id', c.id);
    setAsk(null); await loadList();
  }

  const zurueck = <Nav to={`/ueberfuehrungen/${id}`} label="Überführung" />;
  if (d === undefined || !profile) return (<><Top />{zurueck}<p className="lead">Lädt …</p></>);
  if (d === null) return (<><Top />{zurueck}<p className="hint">Diese Überführung gibt es nicht (mehr).</p></>);
  if (!terms) return (<><Top />{zurueck}<h1>Vertrag mit dem Eigner</h1><p className="hint">Für den Vertrag braucht die App die Konditionen. Hol den Auftrag zuerst aus HubSpot.</p></>);

  return (
    <>
      <Top />
      {zurueck}
      <div className="stack">
        <h1>Vertrag mit dem Eigner</h1>
        <p className="lead">{d.from_port} → {d.to_port}{d.order_no ? ` · Auftrag ${d.order_no}` : ''} · Fassung „Tagessatz mit Logistikpauschale“</p>
      </div>
      {(terms.logistikpauschale ?? 0) <= 0 && <p className="note">In diesem Auftrag ist keine Logistikpauschale eingetragen. Die Fassungen „Reisekosten einzeln“ und „Festpreis“ gibt es in der App noch nicht.</p>}

      <span className="label">Angaben für den Vertrag</span>
      <Field id="v-name" label="Name des Eigners" value={f.ownerName} onChange={set('ownerName')} />
      <label className="field" htmlFor="v-adr">
        <span>Anschrift des Eigners</span>
        <textarea className="inp" id="v-adr" value={f.ownerAddress} onChange={(e) => set('ownerAddress')(e.target.value)} placeholder={'Straße und Hausnummer\nPLZ Ort\nLand'} />
      </label>
      <div className="two">
        <Field id="v-typ" label="Yachttyp" value={f.boatType} onChange={set('boatType')} />
        <Field id="v-boot" label="Yachtname" value={f.boatName} onChange={set('boatName')} />
      </div>
      <Field id="v-start" label="Geplanter Starttermin" type="date" value={f.start} onChange={set('start')} hint={d.when_text && !f.start ? `In HubSpot steht: „${d.when_text}“. Ohne festes Datum bleibt die Zeile im Vertrag leer.` : undefined} />
      <div className="two">
        <Field id="v-min" label="Mindesttage" inputMode="numeric" value={f.min} onChange={set('min')} />
        <Field id="v-max" label="Höchsttage" inputMode="numeric" value={f.max} onChange={set('max')} />
      </div>

      {z && (
        <dl className="facts">
          <div><dt>Anzahlung bei Vertragsabschluss</dt><dd>{euro(z.anzahlung)} brutto</dd></div>
          <div><dt>Restzahlung</dt><dd>{euro(z.rest)} brutto</dd></div>
          <div><dt>Bordkassen-Vorschuss, vor der Abfahrt</dt><dd>{euro(terms.bordkasse) || '–'}</dd></div>
        </dl>
      )}
      {z?.abweichung != null && <p className="note">Skipperhonorar, Logistik- und Administrationspauschale ergeben zusammen {euro(z.gesamt)} brutto. In HubSpot steht als Angebot brutto {euro(terms.angebot_brutto)}. Bitte in HubSpot prüfen, welche Zahl stimmt.</p>}
      {!profile.signature_data && <p className="hint">Du hast noch keine Unterschrift hinterlegt. Das geht unter „Mein Konto“; bis dahin bleibt das Feld im Vertrag frei.</p>}
      {fehlt.length > 0 && <p className="note">Für einen vollständigen Vertrag fehlt noch: {fehlt.join(', ')}.</p>}
      {input && tageHinweis(input) && <p className="note">{tageHinweis(input)}</p>}

      <span className="label">Vorschau (ohne AGB)</span>
      <Vorschau blocks={blocks} />
      <p className="lead">Gelb markiert sind die Stellen, die von deiner bisherigen Vorlage abweichen. Im PDF folgen die AGB in der Fassung vom 15.09.2026.</p>

      <Opt type="checkbox" name="v-entwurf" value="ja" checked={entwurf} onChange={() => setEntwurf(!entwurf)} title="Als Entwurf kennzeichnen"
        sub="Oben auf jeder Seite steht „ENTWURF – noch nicht juristisch geprüft“. Nimm den Haken erst heraus, wenn dein Jurist die Texte freigegeben hat." />
      {msg && <p className={msg.ok ? 'okmsg' : 'err'} role="status">{msg.text}</p>}
      <button className="btn wide" onClick={erzeugen} disabled={busy}>{busy ? 'Erzeugt das PDF …' : 'PDF erzeugen und ablegen'}</button>

      <span className="label">Fassungen</span>
      {/* Ein einziges, wirklich verstecktes Dateifeld für alle Fassungen: Es öffnet sich nur über den Knopf „hochladen". */}
      <input ref={datei} type="file" hidden accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif"
        onChange={(e) => { const c = ziel.current; const f = e.target.files?.[0]; e.target.value = ''; if (c) void signiert(c, f); }} />
      {list.length === 0 && <p className="hint">Noch kein Vertrag erzeugt.</p>}
      {list.map((c) => (
        <div className="row doc" key={c.id}>
          <span className="tx">
            <span className="tt">{c.file_name}</span><br />
            <span className="ss">erzeugt {datum(c.created_at.slice(0, 10))}{c.data.entwurf ? ' · Entwurf' : ''}{c.signed_at ? ` · unterschrieben abgelegt ${datum(c.signed_at.slice(0, 10))}` : ''}</span>
            <span className="acts">
              <button className="linkbtn" onClick={() => open(c.file_path)}>Ansehen</button>
              {c.signed_path && <button className="linkbtn" onClick={() => open(c.signed_path!)}>Unterschriebene Fassung</button>}
              <button className="linkbtn" onClick={() => { ziel.current = c; datei.current?.click(); }}>
                {c.signed_path ? 'Unterschriebene ersetzen' : 'Unterschriebene Fassung hochladen'}
              </button>
              {ask === c.id
                ? <><button className="linkbtn del" onClick={() => loeschen(c)}>Wirklich löschen</button><button className="linkbtn" onClick={() => setAsk(null)}>Abbrechen</button></>
                : <button className="linkbtn" onClick={() => setAsk(c.id)}>Löschen</button>}
            </span>
          </span>
        </div>
      ))}
    </>
  );
}
