import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../auth';
import { LAENDER, datum, vatLabel } from '../data';
import { Field, Nav, Opt, Top } from '../ui';

const EMPTY = {
  name: '', company: '', street: '', postal: '', city: '', phone: '', nationality: '', birth: '',
  licence: '', licenceNo: '', emergency: '', country: 'DE', noVat: false, tax: '',
};
type Form = typeof EMPTY;

export default function Konto() {
  const { session, profile, reloadProfile } = useAuth();
  const [f, setF] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  // Solange das Konto noch nie gespeichert wurde, öffnet es direkt zum Ausfüllen.
  const [editing, setEditing] = useState<boolean | null>(null);

  function fill() {
    if (!profile) return;
    setF({
      name: profile.display_name ?? '', company: profile.company ?? '', street: profile.street ?? '', postal: profile.postal_code ?? '',
      city: profile.city ?? '', phone: profile.phone ?? '', nationality: profile.nationality ?? '', birth: profile.birth_date ?? '',
      licence: profile.highest_licence ?? '', licenceNo: profile.licence_number ?? '', emergency: profile.emergency_contact ?? '',
      country: profile.country, noVat: !profile.charges_vat, tax: profile.tax_number ?? '',
    });
  }

  useEffect(() => {
    if (!profile) return;
    fill();
    setEditing((e) => e ?? profile.created_at === profile.updated_at);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const set = <K extends keyof Form>(k: K) => (v: Form[K]) => setF((p) => ({ ...p, [k]: v }));
  const t = (s: string) => s.trim() || null;

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!session) return;
    setBusy(true); setMsg(null);
    const { error } = await supabase.from('profiles').update({
      display_name: t(f.name), company: t(f.company), street: t(f.street), postal_code: t(f.postal), city: t(f.city),
      phone: t(f.phone), nationality: t(f.nationality), birth_date: f.birth || null,
      highest_licence: t(f.licence), licence_number: t(f.licenceNo), emergency_contact: t(f.emergency),
      country: f.country, charges_vat: !f.noVat, tax_number: t(f.tax),
    }).eq('id', session.user.id);
    setBusy(false);
    if (error) { setMsg({ ok: false, text: 'Speichern hat nicht geklappt: ' + error.message }); return; }
    await reloadProfile();
    setMsg({ ok: true, text: 'Gespeichert.' });
    setEditing(false);
    window.scrollTo(0, 0);
  }

  function cancel() { fill(); setMsg(null); setEditing(false); window.scrollTo(0, 0); }

  if (!profile || editing == null) return (<><Top /><Nav to="/" label="Start" konto={false} /><p className="lead">Lädt …</p></>);
  const agency = profile.role === 'agentur';

  if (!editing) {
    const land = LAENDER.find((l) => l[0] === profile.country)?.[1] ?? profile.country;
    const adresse = [profile.street, [profile.postal_code, profile.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
    const rows: [string, string][] = [
      ['Rolle', agency ? 'Agentur' : 'Skipper'],
      ['Name', profile.display_name || '–'],
      ['Firma', profile.company || '–'],
      ['Anschrift', adresse || '–'],
      ['Telefon', profile.phone || '–'],
      ...(agency ? [] : [
        ['Geburtsdatum', datum(profile.birth_date) || '–'],
        ['Nationalität', profile.nationality || '–'],
        ['Höchster Schein', profile.highest_licence || '–'],
        ['Scheinnummer', profile.licence_number || '–'],
        ['Notfallkontakt', profile.emergency_contact || '–'],
      ] as [string, string][]),
      ['Sitz', land],
      ['Mehrwertsteuer', profile.charges_vat ? vatLabel(profile.country) : 'wird nicht ausgewiesen'],
      ...(profile.charges_vat ? [['Umsatzsteuer-ID oder Steuernummer', profile.tax_number || '–'] as [string, string]] : []),
    ];
    return (
      <>
        <Top />
        <Nav to="/" label="Start" right={<button className="back" onClick={() => { setMsg(null); setEditing(true); }}>Bearbeiten</button>} />
        <div className="stack">
          <h1>Mein Konto</h1>
          <p className="lead">Angemeldet als {session?.user.email}</p>
        </div>
        {msg && <p className={msg.ok ? 'okmsg' : 'err'} role="status">{msg.text}</p>}
        <dl className="facts">
          {rows.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
        </dl>
        <button className="btn ghost wide" onClick={() => supabase.auth.signOut()}>Abmelden</button>
      </>
    );
  }

  return (
    <>
      <Top />
      <Nav to="/" label="Start" konto={false} />
      <div className="stack">
        <h1>Mein Konto bearbeiten</h1>
        <p className="lead">Diese Angaben stehen später in Verträgen, Vollmacht und Crewliste. Du trägst sie nur einmal ein.</p>
      </div>
      <form className="stack" onSubmit={save} noValidate>
        <span className="label">Person</span>
        <Field id="k-name" label="Vor- und Nachname" value={f.name} onChange={set('name')} autoComplete="name" />
        <Field id="k-firma" label={agency ? 'Firma' : 'Firma (falls vorhanden)'} value={f.company} onChange={set('company')} autoComplete="organization" />
        <Field id="k-strasse" label="Straße und Hausnummer" value={f.street} onChange={set('street')} autoComplete="street-address" />
        <div className="two">
          <Field id="k-plz" label="PLZ" value={f.postal} onChange={set('postal')} autoComplete="postal-code" />
          <Field id="k-ort" label="Ort" value={f.city} onChange={set('city')} autoComplete="address-level2" />
        </div>
        <Field id="k-telefon" label="Telefon" type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" />

        {!agency && (
          <>
            <div className="two">
              <Field id="k-geburt" label="Geburtsdatum" type="date" value={f.birth} onChange={set('birth')} />
              <Field id="k-nation" label="Nationalität" value={f.nationality} onChange={set('nationality')} />
            </div>
            <span className="label">Befähigung</span>
            <Field id="k-schein" label="Höchster Segelschein" value={f.licence} onChange={set('licence')} placeholder="z. B. SSS, Yachtmaster Offshore" />
            <Field id="k-scheinnr" label="Scheinnummer" value={f.licenceNo} onChange={set('licenceNo')} autoComplete="off" />
            <span className="label">Notfall</span>
            <Field id="k-notfall" label="Notfallkontakt" value={f.emergency} onChange={set('emergency')} placeholder="Name und Telefon" />
          </>
        )}

        <span className="label">Sitz und Mehrwertsteuer</span>
        <label className="field" htmlFor="k-land">
          <span>Land, in dem du oder deine Firma sitzt</span>
          <select className="inp" id="k-land" value={f.country} onChange={(e) => set('country')(e.target.value)}>
            {LAENDER.map((l) => <option key={l[0]} value={l[0]}>{l[1]}</option>)}
          </select>
          <small>Mehrwertsteuersatz für deine Rechnungen: {vatLabel(f.country)}.</small>
        </label>
        <Opt type="checkbox" name="k-keine" value="mwst" checked={f.noVat} onChange={() => set('noVat')(!f.noVat)} title="Ich weise keine Mehrwertsteuer aus"
          sub="Rechnungen nennen dann nur Nettobeträge." />
        {!f.noVat && (
          <Field id="k-steuer" label="Umsatzsteuer-ID oder Steuernummer" value={f.tax} onChange={set('tax')} placeholder="z. B. DE123456789 oder 22/123/45678" autoComplete="off" />
        )}

        {msg && <p className={msg.ok ? 'okmsg' : 'err'} role="status">{msg.text}</p>}
        <button className="btn wide" type="submit" disabled={busy}>{busy ? 'Speichert …' : 'Speichern'}</button>
        {profile.created_at !== profile.updated_at && <button className="btn ghost wide" type="button" onClick={cancel}>Abbrechen</button>}
      </form>
    </>
  );
}
