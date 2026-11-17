import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useAuth } from '../auth';
import { DOC_KINDS } from '../data';
import { ACCEPT, listDocuments, uploadDocument } from '../docs';
import { DocList } from '../DocList';
import type { DocKind, SkipperDocument } from '../types';
import { Field, Nav, Top } from '../ui';

export default function Dokumente() {
  const { session } = useAuth();
  const uid = session?.user.id;
  const [docs, setDocs] = useState<SkipperDocument[] | null>(null);
  const [kind, setKind] = useState<DocKind>('segelschein');
  const [until, setUntil] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    if (!uid) return;
    listDocuments(uid).then(setDocs).catch((e) => { setDocs([]); setMsg({ ok: false, text: 'Die Liste konnte nicht geladen werden: ' + String(e.message ?? e) }); });
  }, [uid]);
  useEffect(load, [load]);

  async function upload(e: FormEvent) {
    e.preventDefault();
    if (!uid) return;
    if (!file) { setMsg({ ok: false, text: 'Bitte zuerst eine Datei auswählen.' }); return; }
    setBusy(true); setMsg(null);
    try {
      await uploadDocument(uid, kind, file, until || null);
      setFile(null); setUntil('');
      if (fileRef.current) fileRef.current.value = '';
      setMsg({ ok: true, text: 'Hochgeladen.' });
      load();
    } catch (err) {
      const m = String((err as Error).message ?? err);
      setMsg({ ok: false, text: /^(Bitte|Die Datei)/.test(m) ? m : 'Hochladen hat nicht geklappt: ' + m });
    }
    setBusy(false);
  }

  const fehlt = docs ? DOC_KINDS.filter((k) => k.k !== 'sonstiges' && !docs.some((d) => d.kind === k.k)) : [];

  return (
    <>
      <Top />
      <Nav to="/" label="Start" />
      <div className="stack">
        <h1>Meine Dokumente</h1>
        <p className="lead">Einmal hinterlegt, bei jedem Auftrag zur Hand.</p>
      </div>

      <span className="label">Nachweise</span>
      <p className="hint">Deine Nachweise liegen geschützt. Sehen können sie nur du und Seatribe als Agentur. An einen Eigner gehen sie nur, wenn du sie für einen Auftrag freigibst.</p>
      {docs == null && <p className="lead">Lädt …</p>}
      {docs && docs.length > 0 && <DocList docs={docs} onChanged={load} />}
      {docs && fehlt.length > 0 && <p className="lead">Fehlt noch: {fehlt.map((k) => k.t).join(', ')}.</p>}

      <form className="stack card" onSubmit={upload} noValidate>
        <h2>Nachweis hochladen</h2>
        <label className="field" htmlFor="d-art">
          <span>Was ist es?</span>
          <select className="inp" id="d-art" value={kind} onChange={(e) => setKind(e.target.value as DocKind)}>
            {DOC_KINDS.map((k) => <option key={k.k} value={k.k}>{k.t}</option>)}
          </select>
          <small>{DOC_KINDS.find((k) => k.k === kind)?.hint}</small>
        </label>
        <label className="field" htmlFor="d-datei">
          <span>Datei</span>
          <input className="inp" id="d-datei" type="file" ref={fileRef} accept={ACCEPT} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <small>Foto oder PDF, höchstens 10 MB.</small>
        </label>
        <Field id="d-bis" label="Gültig bis (falls befristet)" type="date" value={until} onChange={setUntil} />
        {msg && <p className={msg.ok ? 'okmsg' : 'err'} role="status">{msg.text}</p>}
        <button className="btn wide" type="submit" disabled={busy}>{busy ? 'Lädt hoch …' : 'Hochladen'}</button>
      </form>

      <span className="label">Verträge</span>
      <p className="hint">Noch keine Verträge. Dein Vertrag mit Seatribe liegt hier, sobald du einen Auftrag übernimmst.</p>
    </>
  );
}
