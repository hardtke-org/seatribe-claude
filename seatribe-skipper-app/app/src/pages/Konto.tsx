import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../auth';
import { LAENDER, vatLabel } from '../data';
import type { AccountType, MailMode } from '../types';
import { Field, Nav, Opt, Top } from '../ui';

export default function Konto() {
  const { session, profile, reloadProfile } = useAuth();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [type, setType] = useState<AccountType>('skipper');
  const [country, setCountry] = useState('DE');
  const [noVat, setNoVat] = useState(false);
  const [taxNumber, setTaxNumber] = useState('');
  const [mailMode, setMailMode] = useState<MailMode>('kopieren');
  const [sender, setSender] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  // Solange das Konto noch nie gespeichert wurde, öffnet es direkt zum Ausfüllen.
  const [editing, setEditing] = useState<boolean | null>(null);

  function fill() {
    if (!profile) return;
    setName(profile.display_name ?? '');
    setCompany(profile.company ?? '');
    setType(profile.account_type);
    setCountry(profile.country);
    setNoVat(!profile.charges_vat);
    setTaxNumber(profile.tax_number ?? '');
    setMailMode(profile.mail_mode);
    setSender(profile.sender_email ?? '');
  }

  useEffect(() => {
    if (!profile) return;
    fill();
    setEditing((e) => e ?? profile.created_at === profile.updated_at);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!session) return;
    setBusy(true); setMsg(null);
    const { error } = await supabase.from('profiles').update({
      display_name: name.trim() || null,
      company: company.trim() || null,
      account_type: type,
      country,
      charges_vat: !noVat,
      tax_number: taxNumber.trim() || null,
      mail_mode: mailMode,
      sender_email: sender.trim() || null,
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

  if (!editing) {
    const land = LAENDER.find((l) => l[0] === profile.country)?.[1] ?? profile.country;
    const rows: [string, string][] = [
      ['Kontoart', profile.account_type === 'agentur' ? 'Agentur' : 'Skipper'],
      ['Name', profile.display_name || '–'],
      ['Firma', profile.company || '–'],
      ['Sitz', land],
      ['Mehrwertsteuer', profile.charges_vat ? vatLabel(profile.country) : 'wird nicht ausgewiesen'],
      ...(profile.charges_vat ? [['Umsatzsteuer-ID oder Steuernummer', profile.tax_number || '–'] as [string, string]] : []),
      ['E-Mail-Versand', profile.mail_mode === 'postfach' ? `Aus meinem Postfach${profile.sender_email ? ' (' + profile.sender_email + ')' : ''}` : 'Nicht aus der App senden'],
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
        <p className="lead">Angemeldet als {session?.user.email}</p>
      </div>
      <form className="stack" onSubmit={save} noValidate>
        <span className="label">Kontoart</span>
        <Opt name="k-art" value="skipper" checked={type === 'skipper'} onChange={() => setType('skipper')} title="Skipper"
          sub="Du fährst selbst. Angebote ohne Administrationspauschale, sie lässt sich pro Angebot zuschalten." />
        <Opt name="k-art" value="agentur" checked={type === 'agentur'} onChange={() => setType('agentur')} title="Agentur"
          sub="Du vermittelst und koordinierst Skipper und Crew. Die Administrationspauschale ist voreingestellt." />

        <span className="label">Name</span>
        <Field id="k-name" label="Dein Name" value={name} onChange={setName} autoComplete="name" />
        <Field id="k-firma" label={type === 'agentur' ? 'Firma' : 'Firma (falls vorhanden)'} value={company} onChange={setCompany} autoComplete="organization" />

        <span className="label">Sitz und Mehrwertsteuer</span>
        <label className="field" htmlFor="k-land">
          <span>Land, in dem du oder deine Firma sitzt</span>
          <select className="inp" id="k-land" value={country} onChange={(e) => setCountry(e.target.value)}>
            {LAENDER.map((l) => <option key={l[0]} value={l[0]}>{l[1]}</option>)}
          </select>
          <small>Daraus ergibt sich der Mehrwertsteuersatz für deine Angebote: {vatLabel(country)}.</small>
        </label>
        <Opt type="checkbox" name="k-keine" value="mwst" checked={noVat} onChange={() => setNoVat(!noVat)} title="Ich weise keine Mehrwertsteuer aus"
          sub="Angebote und Rechnungen nennen dann nur Nettobeträge." />
        {!noVat && (
          <Field id="k-steuer" label="Umsatzsteuer-ID oder Steuernummer" value={taxNumber} onChange={setTaxNumber} placeholder="z. B. DE123456789 oder 22/123/45678" autoComplete="off"
            hint="Erscheint auf Angebot und Rechnung." />
        )}

        <span className="label">E-Mail-Versand</span>
        <Opt name="k-mail" value="kopieren" checked={mailMode === 'kopieren'} onChange={() => setMailMode('kopieren')} title="Nicht aus der App senden"
          sub="Du kopierst den Text oder speicherst das PDF und verschickst es selbst." />
        <Opt name="k-mail" value="postfach" checked={mailMode === 'postfach'} onChange={() => setMailMode('postfach')} title="Aus meinem Postfach senden"
          sub="Kommt in einem späteren Schritt. Du kannst die Absenderadresse schon hinterlegen." />
        {mailMode === 'postfach' && <Field id="k-absender" label="Absenderadresse" type="email" inputMode="email" value={sender} onChange={setSender} placeholder="name@beispiel.de" />}

        {msg && <p className={msg.ok ? 'okmsg' : 'err'} role="status">{msg.text}</p>}
        <button className="btn wide" type="submit" disabled={busy}>{busy ? 'Speichert …' : 'Speichern'}</button>
        {profile.created_at !== profile.updated_at && <button className="btn ghost wide" type="button" onClick={cancel}>Abbrechen</button>}
      </form>
    </>
  );
}
