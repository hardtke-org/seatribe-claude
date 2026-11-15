// Steuersätze nach Sitzland. Stand der Werte vor dem Verkauf prüfen.
export const LAENDER: [code: string, name: string, vat: number][] = [
  ['DE', 'Deutschland', 19], ['AT', 'Österreich', 20], ['CH', 'Schweiz', 8.1], ['NL', 'Niederlande', 21],
  ['DK', 'Dänemark', 25], ['SE', 'Schweden', 25], ['FR', 'Frankreich', 20], ['ES', 'Spanien', 21],
  ['IT', 'Italien', 22], ['HR', 'Kroatien', 25], ['GR', 'Griechenland', 24], ['PL', 'Polen', 23],
];

export function vatLabel(country: string): string {
  const l = LAENDER.find((x) => x[0] === country) ?? LAENDER[0];
  return String(l[2]).replace('.', ',') + ' %';
}

export interface Baustein { k: string; phase: string; t: string; ic: string; sub: string }

export const BAUSTEINE: Baustein[] = [
  { k: 'angebot', phase: 'Vor dem Auftrag', t: 'Angebot erstellen', ic: 'euro', sub: 'Preisbaukasten, rechnet live mit' },
  { k: 'vertrag', phase: 'Vor dem Auftrag', t: 'Vertrag erstellen', ic: 'pen', sub: 'Übernimmt die Angaben aus dem Angebot' },
  { k: 'ausruestung', phase: 'Vor der Abfahrt', t: 'Ausrüstungsliste an Eigner schicken', ic: 'clip', sub: 'Der Eigner füllt sie selbst aus' },
  { k: 'vollmacht', phase: 'Vor der Abfahrt', t: 'Vollmacht', ic: 'key', sub: 'Ansehen, versenden, unterschrieben hochladen' },
  { k: 'crew', phase: 'Vor der Abfahrt', t: 'Crewliste und Crewvereinbarung', ic: 'users', sub: 'Crew einmal eintragen' },
  { k: 'uebernahme', phase: 'Unterwegs', t: 'Boot übernehmen', ic: 'anchor', sub: 'Checkliste mit Fotos' },
  { k: 'schaden', phase: 'Unterwegs', t: 'Schaden aufnehmen', ic: 'alert', sub: 'Foto und Sprachnotiz' },
  { k: 'uebergabe', phase: 'Unterwegs', t: 'Boot übergeben', ic: 'flag', sub: 'Protokoll am Zielhafen' },
  { k: 'meilen', phase: 'Nach der Ankunft', t: 'Meilenbestätigung', ic: 'compass', sub: 'Für jedes Crewmitglied' },
  { k: 'abrechnung', phase: 'Nach der Ankunft', t: 'Schlussabrechnung', ic: 'doc', sub: 'Nach tatsächlichen Kalendertagen' },
];

export function defaultModules(): Record<string, boolean> {
  return Object.fromEntries(BAUSTEINE.map((b) => [b.k, b.k !== 'meilen']));
}

export function datum(s: string | null): string {
  if (!s) return '';
  const [y, m, d] = s.split('-');
  return `${d}.${m}.${y}`;
}

/** "12,5" oder "12.5" → 12.5; leer oder ungültig → null */
export function zahl(s: string): number | null {
  const t = s.trim().replace(',', '.');
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function komma(n: number | null): string {
  return n == null ? '' : String(n).replace('.', ',');
}
