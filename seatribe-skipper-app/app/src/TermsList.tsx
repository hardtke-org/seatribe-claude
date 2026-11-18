import { TERMS, termText } from './data';
import type { Terms } from './types';

/**
 * Konditionen einer Überführung. Mit einer Logistikpauschale entfallen Reisekosten und Verpflegung
 * als eigene Posten; sie erscheinen dann ausgegraut. `luecken` markiert fehlende Pflichtangaben.
 */
export function TermsList({ terms, luecken = false }: { terms: Terms; luecken?: boolean }) {
  const pauschal = (terms.logistikpauschale ?? 0) > 0;
  return (
    <dl className="facts">
      {TERMS.map((x) => {
        if (pauschal && (x.k === 'reisekosten' || x.k === 'verpflegung')) {
          return (<div key={x.k} className="off"><dt>{x.t}</dt><dd>in der Logistikpauschale</dd></div>);
        }
        const v = termText(x.art, terms[x.k]);
        if (!v && !luecken) return null;
        const fehlt = !v && !!x.wichtig;
        return (<div key={x.k}><dt>{x.t}</dt><dd className={fehlt ? 'miss' : undefined}>{v || (fehlt ? 'fehlt' : '–')}</dd></div>);
      })}
    </dl>
  );
}
