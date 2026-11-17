import { useState } from 'react';
import { datum, docLabel, groesse } from './data';
import { deleteDocument, documentUrl } from './docs';
import type { SkipperDocument } from './types';
import { Icon } from './ui';

/** Liste hinterlegter Nachweise. Mit onChanged darf gelöscht werden (eigene Dokumente). */
export function DocList({ docs, onChanged }: { docs: SkipperDocument[]; onChanged?: () => void }) {
  const [error, setError] = useState('');
  const [ask, setAsk] = useState<string | null>(null);

  async function open(d: SkipperDocument) {
    setError('');
    // Das Fenster wird sofort geöffnet, sonst blockt der Browser es nach dem Warten.
    const w = window.open('', '_blank');
    try {
      const url = await documentUrl(d);
      if (w) w.location.href = url; else window.location.href = url;
    } catch (e) {
      w?.close();
      setError('Die Datei konnte nicht geöffnet werden: ' + String((e as Error).message ?? e));
    }
  }

  async function remove(d: SkipperDocument) {
    setError('');
    try { await deleteDocument(d); setAsk(null); onChanged?.(); }
    catch (e) { setError('Löschen hat nicht geklappt: ' + String((e as Error).message ?? e)); }
  }

  return (
    <div className="stack">
      {error && <p className="err" role="alert">{error}</p>}
      {docs.map((d) => (
        <div className="row doc" key={d.id}>
          <span className="ic"><Icon n="doc" /></span>
          <span className="tx">
            <span className="tt">{docLabel(d.kind)}</span><br />
            <span className="ss">{[d.file_name, groesse(d.size_bytes), d.valid_until ? 'gültig bis ' + datum(d.valid_until) : '', 'hochgeladen ' + datum(d.created_at.slice(0, 10))].filter(Boolean).join(' · ')}</span>
            <span className="acts">
              <button className="linkbtn" onClick={() => open(d)}>Ansehen</button>
              {onChanged && (ask === d.id
                ? <><button className="linkbtn del" onClick={() => remove(d)}>Wirklich löschen</button><button className="linkbtn" onClick={() => setAsk(null)}>Abbrechen</button></>
                : <button className="linkbtn" onClick={() => setAsk(d.id)}>Löschen</button>)}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
