import type { DocKind } from './types';

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


/** Nachweise, die ein Skipper hinterlegt. Reihenfolge = Anzeige. */
export const DOC_KINDS: { k: DocKind; t: string; hint: string }[] = [
  { k: 'segelschein', t: 'Höchster Segelschein', hint: 'z. B. SSS, SHS, Yachtmaster' },
  { k: 'funkschein', t: 'Funkschein', hint: 'SRC oder LRC' },
  { k: 'pyroschein', t: 'Pyro-Schein', hint: 'Fachkundenachweis für Seenotsignalmittel' },
  { k: 'haftpflicht', t: 'Skipper-Haftpflicht', hint: 'Nachweis der gewerblichen Versicherung' },
  { k: 'reisepass', t: 'Reisepass', hint: 'Datenseite' },
  { k: 'personalausweis', t: 'Personalausweis', hint: 'Vorder- und Rückseite' },
  { k: 'sonstiges', t: 'Sonstiges', hint: 'Weitere Nachweise' },
];

export function docLabel(k: string): string {
  return DOC_KINDS.find((d) => d.k === k)?.t ?? k;
}

export function groesse(bytes: number | null): string {
  if (!bytes) return '';
  return bytes < 1024 * 1024 ? Math.max(1, Math.round(bytes / 1024)) + ' KB' : (bytes / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
}

/** Stufen der HubSpot-Pipeline „Yachtüberführung" ab Auftrag. Andere Stufen zeigt die App als „in Vorbereitung". */
export const STUFEN: Record<string, string> = {
  decisionmakerboughtin: 'Angebot an den Kunden',
  closedwon: 'Auftrag erhalten',
  '565421285': 'Vertrag an Kunden',
  '567560922': 'Rechnung Anzahlung an Kunden',
  '853885681': 'Zustand der Yacht an Kunden',
  '198215396': 'Anzahlung eingegangen',
  '5215845589': 'Finale Rechnung an Kunden',
  '232135899': 'Zweite Zahlung eingegangen',
  '262137847': 'Ist unterwegs',
  '415367903': 'Endabrechnung',
  '222653147': 'Überführung abgeschlossen',
  closedlost: 'Auftrag nicht erhalten',
  '198267875': 'Seatribe hat abgesagt',
  '1744769252': 'Absage nach Zusage',
};
export function stufe(stage: string | null): string {
  return stage ? STUFEN[stage] ?? 'in Vorbereitung' : '';
}

export function euro(n: number | null | undefined): string {
  if (n == null) return '';
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

/** Konditionen in der Reihenfolge der Anzeige, mit den Begriffen der App (HubSpot sagt Heuer, Einsatztage, Bearbeitungspauschale). */
export const TERMS: { k: string; t: string; art: 'tage' | 'euro' | 'sm'; wichtig?: boolean }[] = [
  { k: 'entfernung_sm', t: 'Entfernung', art: 'sm' },
  { k: 'tage_gesamt', t: 'Kalendertage gesamt', art: 'tage', wichtig: true },
  { k: 'segeltage', t: 'davon Segeltage', art: 'tage' },
  { k: 'hafentage', t: 'davon Hafentage', art: 'tage' },
  { k: 'klarieren', t: 'davon Ein- und Ausklarieren', art: 'tage' },
  { k: 'min_tage', t: 'Mindestens abgerechnete Tage', art: 'tage', wichtig: true },
  { k: 'max_tage', t: 'Höchstens abgerechnete Tage', art: 'tage', wichtig: true },
  { k: 'tage_ohne_mwst', t: 'Tage ohne Mehrwertsteuer', art: 'tage' },
  { k: 'tagessatz_kunde', t: 'Tagessatz Skipperhonorar', art: 'euro', wichtig: true },
  { k: 'honorar_netto', t: 'Skipperhonorar netto', art: 'euro', wichtig: true },
  { k: 'honorar_brutto', t: 'Skipperhonorar brutto', art: 'euro' },
  { k: 'logistikpauschale', t: 'Logistikpauschale netto', art: 'euro' },
  { k: 'adminpauschale', t: 'Administrationspauschale netto', art: 'euro' },
  { k: 'reisekosten', t: 'Reisekosten (Schätzung, nach Aufwand)', art: 'euro' },
  { k: 'verpflegung', t: 'Verpflegung', art: 'euro' },
  { k: 'bordkasse', t: 'Bordkassen-Vorschuss (Abrechnung nach Aufwand)', art: 'euro' },
  { k: 'angebot_netto', t: 'Angebot netto (zzgl. Bordkasse)', art: 'euro', wichtig: true },
  { k: 'angebot_brutto', t: 'Angebot brutto (zzgl. Bordkasse)', art: 'euro', wichtig: true },
];
export function termText(art: 'tage' | 'euro' | 'sm', n: number | null | undefined): string {
  if (n == null) return '';
  return art === 'euro' ? euro(n) : art === 'sm' ? n.toLocaleString('de-DE') + ' sm' : n.toLocaleString('de-DE');
}

/** „12.4.2027" → „2027-04-12"; alles andere (z. B. „Mitte Mai") bleibt Freitext. */
export function isoDatum(s: string | null): string | null {
  const m = s?.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return null;
  const [d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
/** „2026-09-21" → „21. September 2026", so wie es im Vertrag steht. */
export function datumLang(iso: string | null): string {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${Number(m[3])}. ${MONATE[Number(m[2]) - 1]} ${m[1]}` : '';
}
