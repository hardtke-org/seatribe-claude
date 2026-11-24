import { useState, type FormEvent } from 'react';
import { supabase } from '../supabase';
import { Field, Top } from '../ui';

type Mode = 'login' | 'signup' | 'reset';

function deutsch(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return 'E-Mail oder Passwort stimmt nicht.';
  if (/email not confirmed/i.test(msg)) return 'Bitte bestätige zuerst deine E-Mail-Adresse über den Link, den wir dir geschickt haben.';
  if (/already registered/i.test(msg)) return 'Zu dieser E-Mail-Adresse gibt es schon ein Konto. Melde dich an oder setze das Passwort zurück.';
  if (/at least|password should/i.test(msg)) return 'Das Passwort ist zu kurz oder zu einfach. Nimm mindestens 8 Zeichen.';
  if (/rate limit|too many/i.test(msg)) return 'Zu viele Versuche. Bitte warte ein paar Minuten.';
  if (/valid email|invalid format/i.test(msg)) return 'Bitte prüfe die E-Mail-Adresse.';
  return 'Das hat nicht geklappt: ' + msg;
}

export default function Login() {
  // Einladungslink: /?einladung=adresse öffnet „Konto anlegen" mit der eingeladenen Adresse.
  const eingeladen = new URLSearchParams(window.location.search).get('einladung')?.trim() ?? '';
  const [mode, setMode] = useState<Mode>(eingeladen ? 'signup' : 'login');
  const [email, setEmail] = useState(eingeladen);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  function switchTo(m: Mode) { setMode(m); setError(''); setInfo(''); }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(''); setInfo(''); setBusy(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      } else if (mode === 'signup') {
        if (password.length < 8) throw new Error('password should be at least 8 characters');
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        if (data.user && data.user.identities && data.user.identities.length === 0) throw new Error('already registered');
        if (!data.session) setInfo('Fast geschafft: Wir haben dir eine E-Mail geschickt. Öffne den Link darin, um dein Konto zu bestätigen. Danach kannst du dich hier anmelden.');
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
        if (error) throw error;
        setInfo('Wenn es zu dieser Adresse ein Konto gibt, ist jetzt eine E-Mail mit einem Link zum Zurücksetzen unterwegs.');
      }
    } catch (err) {
      setError(deutsch(err instanceof Error ? err.message : String(err)));
    } finally {
      setBusy(false);
    }
  }

  const title = mode === 'login' ? 'Anmelden' : mode === 'signup' ? 'Seatribe-Konto anlegen' : 'Passwort zurücksetzen';

  return (
    <>
      <Top />
      <div className="stack">
        <h1>{title}</h1>
        <p className="lead">
          {mode === 'login' && 'Mit deinem Seatribe-Konto.'}
          {mode === 'signup' && (eingeladen ? 'Du wurdest eingeladen. Leg dein Konto bitte mit dieser E-Mail-Adresse an, dann wirst du gleich zugeordnet.' : 'Ein Konto für die Skipper App und später auch für die Academy.')}
          {mode === 'reset' && 'Wir schicken dir einen Link, über den du ein neues Passwort setzt.'}
        </p>
      </div>
      <form className="stack" onSubmit={submit} noValidate>
        <Field id="l-email" label="E-Mail" type="email" inputMode="email" autoComplete="email" value={email} onChange={setEmail} required />
        {mode !== 'reset' && (
          <Field id="l-pass" label="Passwort" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={setPassword}
            hint={mode === 'signup' ? 'Mindestens 8 Zeichen.' : undefined} required />
        )}
        {error && <p className="err" role="alert">{error}</p>}
        {info && <p className="okmsg" role="status">{info}</p>}
        <button className="btn wide" type="submit" disabled={busy || !email || (mode !== 'reset' && !password)}>
          {busy ? 'Einen Moment …' : mode === 'login' ? 'Anmelden' : mode === 'signup' ? 'Konto anlegen' : 'Link schicken'}
        </button>
      </form>
      <div className="stack">
        {mode !== 'login' && <button className="btn ghost wide" onClick={() => switchTo('login')}>Ich habe schon ein Konto</button>}
        {mode !== 'signup' && <button className="btn ghost wide" onClick={() => switchTo('signup')}>Neues Konto anlegen</button>}
        {mode === 'login' && <button className="linkbtn" style={{ alignSelf: 'center' }} onClick={() => switchTo('reset')}>Passwort vergessen?</button>}
      </div>
    </>
  );
}
