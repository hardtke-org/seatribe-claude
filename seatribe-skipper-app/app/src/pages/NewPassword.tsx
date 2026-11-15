import { useState, type FormEvent } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../auth';
import { Field, Top } from '../ui';

export default function NewPassword() {
  const { endRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError('Nimm bitte mindestens 8 Zeichen.'); return; }
    setBusy(true); setError('');
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setError('Das hat nicht geklappt: ' + error.message);
    else endRecovery();
  }

  return (
    <>
      <Top />
      <h1>Neues Passwort setzen</h1>
      <form className="stack" onSubmit={submit} noValidate>
        <Field id="np-pass" label="Neues Passwort" type="password" autoComplete="new-password" value={password} onChange={setPassword} hint="Mindestens 8 Zeichen." />
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn wide" type="submit" disabled={busy || !password}>{busy ? 'Einen Moment …' : 'Passwort speichern'}</button>
      </form>
    </>
  );
}
