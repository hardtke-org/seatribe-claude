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

  useEffect(() => {
    if (!profile) return;
    setName(profile.display_name ?? '');
    setCompany(profile.company ?? '');
    setType(profile.account_type);
    setCountry(profile.country);
    setNoVat(!profile.charges_vat);
    setTaxNumber(profile.tax_number ?? '');
    setMailMode(profile.mail_mode);
    setSender(profile.sender_email ?? '');
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
  }

  if (!profile) return (<><Top /><Nav to="/" label="Start" konto={false} /><p className="lead">Lädt …</p></>);

  return (
    <>
      <Top />
      <Nav to="/" label="Start" konto={false} />
      <div className="stack">
        <h1>Mein Konto</h1>
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
          sub="Zum Beispiel als Kleinunternehmer. Angebote und Rechnungen nennen dann nur Nettobeträge." />
        <Field id="k-steuer" label="Umsatzsteuer-ID oder Steuernummer" value={taxNumber} onChange={setTaxNumber} placeholder="z. B. DE123456789 oder 22/123/45678" autoComplete="off"
          hint={noVat ? 'Erscheint auf der Rechnung, zusammen mit dem Hinweis auf die Kleinunternehmerregelung.' : 'Erscheint auf Angebot und Rechnung.'} />

        <span className="label">E-Mail-Versand</span>
        <Opt name="k-mail" value="kopieren" checked={mailMode === 'kopieren'} onChange={() => setMailMode('kopieren')} title="Nicht aus der App senden"
          sub="Du kopierst den Text oder speicherst das PDF und verschickst es selbst." />
        <Opt name="k-mail" value="postfach" checked={mailMode === 'postfach'} onChange={() => setMailMode('postfach')} title="Aus meinem Postfach senden"
          sub="Kommt in einem späteren Schritt. Du kannst die Absenderadresse schon hinterlegen." />
        {mailMode === 'postfach' && <Field id="k-absender" label="Absenderadresse" type="email" inputMode="email" value={sender} onChange={setSender} placeholder="name@beispiel.de" />}

        {msg && <p className={msg.ok ? 'okmsg' : 'err'} role="status">{msg.text}</p>}
        <button className="btn wide" type="submit" disabled={busy}>{busy ? 'Speichert …' : 'Speichern'}</button>
      </form>
      <button className="btn ghost wide" onClick={() => supabase.auth.signOut()}>Abmelden</button>
    </>
  );
}
