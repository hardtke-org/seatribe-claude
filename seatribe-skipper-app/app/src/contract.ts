import { AGB, AGB_FASSUNG } from './agb';
import { LAENDER, datumLang, euro } from './data';
import type { Profile, Terms } from './types';

/**
 * Bausteine eines Dokuments. Vorschau (HTML) und PDF werden aus derselben Liste erzeugt.
 * Die Designsprache (Kopf, Parteien-Kästen, Paragraf am Rand, Datenkasten, Summenblock, Tabelle,
 * kleine Erläuterungen, Zahlungskarten, Unterschriften) gilt für alle Dokumente der App.
 */
export type Block =
  | { t: 'kopf'; marke: string; titel: string; ort: string }
  | { t: 'parteien'; a: Partei; b: Partei; nach: string }
  | { t: 'h'; nr?: string; text: string }
  | { t: 'p'; text: string; neu?: boolean }
  | { t: 'yacht'; typ: string; name: string; von: string; nach: string; start: string }
  | { t: 'summe'; titel: string; sub: string; netto: string; brutto: string }
  | { t: 'label'; text: string }
  | { t: 'tabelle'; zeilen: Zeile[] }
  | { t: 'klein'; punkte: { s: string; text: string; neu?: boolean }[] }
  | { t: 'karten'; karten: { kopf: string; sub: string; betrag: string; text: string }[] }
  | { t: 'unterschrift'; links: { label: string; ort: string; name: string }; rechts: { label: string; ort: string; name: string }; bild?: string | null }
  | { t: 'seite'; fuss: string; kopf: string }
  | { t: 'titel'; text: string }
  | { t: 'nr'; nr: string; text: string }
  | { t: 'punkte'; liste: string[] };

export interface Partei { label: string; name: string; zeilen: string[] }
/** k = Bezeichnung, zusatz = kleiner Nachsatz, v = Wert (hervorgehoben), vz = Nachsatz zum Wert, sub = eingerückte Unterzeile */
export interface Zeile { k: string; zusatz?: string; v: string; vz?: string; sub?: boolean }

export interface DepositRule { admin: number; honorar: number; logistik: number }
export const DEFAULT_RULE: DepositRule = { admin: 100, honorar: 50, logistik: 50 };
export function ruleOf(p: Profile | null): DepositRule {
  const r = (p?.deposit_rule ?? {}) as Partial<DepositRule>;
  const ok = (v: unknown, d: number) => (typeof v === 'number' && v >= 0 && v <= 100 ? v : d);
  return { admin: ok(r.admin, DEFAULT_RULE.admin), honorar: ok(r.honorar, DEFAULT_RULE.honorar), logistik: ok(r.logistik, DEFAULT_RULE.logistik) };
}

export interface Zahlung { honorar: number; logistik: number; admin: number; gesamt: number; anzahlung: number; rest: number; mwst: number; abweichung: number | null }

/** Teilt die Bruttobeträge nach der Regel aus dem Konto in Anzahlung und Restzahlung. Die Beträge selbst kommen aus HubSpot. */
export function zahlung(terms: Terms, rule: DepositRule, profile: Profile | null): Zahlung {
  const satz = profile?.charges_vat === false ? 0 : (LAENDER.find((l) => l[0] === (profile?.country ?? 'DE'))?.[2] ?? 19);
  const f = 1 + satz / 100;
  const rund = (n: number) => Math.round(n * 100) / 100;
  const honorar = rund(terms.honorar_brutto ?? (terms.honorar_netto ?? 0) * f);
  const logistik = rund((terms.logistikpauschale ?? 0) * f);
  const admin = rund((terms.adminpauschale ?? 0) * f);
  const gesamt = rund(honorar + logistik + admin);
  const anzahlung = rund((honorar * rule.honorar + logistik * rule.logistik + admin * rule.admin) / 100);
  const abweichung = terms.angebot_brutto != null && Math.abs(terms.angebot_brutto - gesamt) > 1 ? rund(terms.angebot_brutto - gesamt) : null;
  return { honorar, logistik, admin, gesamt, anzahlung, rest: rund(gesamt - anzahlung), mwst: satz, abweichung };
}

export interface ContractInput {
  profile: Profile;
  ownerName: string;
  ownerAddress: string;
  boatType: string;
  boatName: string;
  from: string;
  to: string;
  start: string;       // ISO-Datum oder leer
  terms: Terms;
  minTage: number | null;
  maxTage: number | null;
  ort: string;
  datum: string;       // ISO
}

const tage = (n: number | null | undefined) => (n == null ? '' : `${n.toLocaleString('de-DE')} ${n === 1 ? 'Kalendertag' : 'Kalendertage'}`);
const prozent = (n: number) => (n === 100 ? 'in voller Höhe' : `zu ${n} %`);

/** Was für einen vollständigen Vertrag noch fehlt. */
export function luecken(i: ContractInput): string[] {
  const t = i.terms;
  return [
    !i.profile.company && !i.profile.display_name ? 'dein Firmenname (Mein Konto)' : '',
    !i.profile.street || !i.profile.city ? 'deine Anschrift (Mein Konto)' : '',
    !i.ownerName.trim() ? 'Name des Eigners' : '',
    !i.ownerAddress.trim() ? 'Anschrift des Eigners' : '',
    !i.boatType.trim() ? 'Yachttyp' : '',
    t.tagessatz_kunde == null ? 'Tagessatz' : '',
    t.tage_gesamt == null ? 'kalkulierte Kalendertage' : '',
    i.minTage == null ? 'Mindestabrechnungsdauer' : '',
    i.maxTage == null ? 'Höchstabrechnungsdauer' : '',
    t.adminpauschale == null ? 'Administrationspauschale' : '',
    t.bordkasse == null ? 'Bordkassen-Vorschuss' : '',
  ].filter(Boolean);
}

/** Tage, die nicht zusammenpassen: Mindestdauer ≤ kalkulierte Dauer ≤ Höchstdauer. */
export function tageHinweis(i: ContractInput): string | null {
  const k = i.terms.tage_gesamt, min = i.minTage, max = i.maxTage;
  if (min != null && max != null && min > max) return `Die Mindestdauer (${min}) liegt über der Höchstdauer (${max}).`;
  if (k != null && min != null && min > k) return `Die Mindestdauer (${min}) liegt über der kalkulierten Dauer (${k}). Bitte prüfen, ob das so gewollt ist.`;
  if (k != null && max != null && max < k) return `Die Höchstdauer (${max}) liegt unter der kalkulierten Dauer (${k}).`;
  return null;
}

/** Überführungsvertrag mit dem Eigner, Fassung „Tagessatz mit Logistikpauschale". */
export function eignerVertrag(i: ContractInput): Block[] {
  const p = i.profile, t = i.terms;
  const rule = ruleOf(p);
  const z = zahlung(t, rule, p);
  const firma = p.company || p.display_name || '';
  const ortDatum = [i.ort, datumLang(i.datum)].filter(Boolean).join(', ');
  const zeilen = (s: string) => s.split(/\n/).map((x) => x.trim()).filter(Boolean);

  const anteile = [
    rule.honorar > 0 ? `${rule.honorar} % des kalkulierten Skipperhonorars` : '',
    rule.admin > 0 ? `Administrationspauschale ${prozent(rule.admin)}` : '',
    rule.logistik > 0 ? `Logistikpauschale ${prozent(rule.logistik)}` : '',
  ].filter(Boolean).join(', ');

  return [
    { t: 'kopf', marke: 'SEATRIBE DELIVERIES', titel: 'Überführungsvertrag', ort: ortDatum },
    { t: 'parteien',
      a: { label: 'AUFTRAGNEHMER', name: firma, zeilen: [p.street ?? '', [p.postal_code, p.city].filter(Boolean).join(' ')].filter(Boolean) },
      b: { label: 'AUFTRAGGEBER', name: i.ownerName.trim(), zeilen: zeilen(i.ownerAddress) },
      nach: 'nachfolgend „Auftragnehmer“ und „Auftraggeber“ – schließen folgenden Vertrag:' },

    { t: 'h', nr: '§ 1', text: 'Vertragsgegenstand' },
    { t: 'p', text: 'Gegenstand des Vertrages ist der Einsatz eines qualifizierten Schiffsführers und der erforderlichen Crew zur Planung und Durchführung der vorgesehenen Überführung folgender Yacht:' },
    { t: 'yacht', typ: i.boatType.trim(), name: i.boatName.trim(), von: i.from, nach: i.to, start: i.start ? datumLang(i.start) : '' },
    { t: 'p', text: 'Der geplante Starttermin kann sich insbesondere aufgrund von Wetterbedingungen, technischen Erfordernissen oder behördlichen Vorgaben verschieben.' },

    { t: 'h', nr: '§ 2', text: 'Vergütung & Auslagen' },
    { t: 'summe', titel: 'KALKULIERTE GESAMTKOSTEN', sub: 'ca., zzgl. Auslagen', netto: euro(t.angebot_netto), brutto: euro(t.angebot_brutto) },
    { t: 'label', text: 'Vergütung' },
    { t: 'tabelle', zeilen: [
      { k: 'Tagessatz', v: t.tagessatz_kunde != null ? `${euro(t.tagessatz_kunde)} netto` : '', vz: t.tagessatz_kunde != null ? ' / Kalendertag' : '' },
      { k: 'Kalkulierte Abrechnungsdauer', v: tage(t.tage_gesamt) },
      { k: 'Mindestabrechnungsdauer', v: tage(i.minTage), sub: true },
      { k: 'Höchstabrechnungsdauer', v: tage(i.maxTage), sub: true },
      { k: 'Logistikpauschale', zusatz: ' – inkl. Reisekosten und Verpflegung', v: t.logistikpauschale != null ? `${euro(t.logistikpauschale)} netto` : '' },
      { k: 'Administrationspauschale', v: t.adminpauschale != null ? `${euro(t.adminpauschale)} netto` : '' },
    ] },
    { t: 'klein', punkte: [
      { s: 'Abrechnungsdauer:', text: 'Die kalkulierte Abrechnungsdauer dient der voraussichtlichen Kostenberechnung. Die Schlussabrechnung erfolgt anhand der tatsächlichen Abrechnungsdauer. § 7 Absatz 3 der AGB bleibt unberührt.' },
      { s: 'Mindest- und Höchstdauer:', neu: true, text: 'Berechnet werden mindestens die Kalendertage der vereinbarten Mindestabrechnungsdauer und höchstens die der vereinbarten Höchstabrechnungsdauer. Die Höchstdauer gilt nicht für Verzögerungen, die auf dem Zustand der Yacht, auf notwendigen Reparaturen, auf behördlichen Maßnahmen oder auf Umständen aus dem Bereich des Auftraggebers oder Dritter beruhen.' },
      { s: 'Logistikpauschale:', neu: true, text: 'Sie umfasst die planmäßigen Reise- und Verpflegungskosten des Schiffsführers und der Crew. Zusätzliche Reise- und Verpflegungskosten aufgrund yachtbedingter Verzögerungen trägt der Auftraggeber gegen Nachweis.' },
      { s: 'Administrationspauschale:', neu: true, text: 'Sie ist mit Beginn der Vorbereitung verdient und wird danach nicht erstattet.' },
    ] },
    { t: 'label', text: 'Auslagen' },
    { t: 'tabelle', zeilen: [{ k: 'Bordkassen-Vorschuss', zusatz: ' (Schätzwert)', v: euro(t.bordkasse) }] },
    { t: 'klein', punkte: [
      { s: 'Bordkasse:', neu: true, text: 'Sie deckt die Kosten des Yachtbetriebs nach § 2 Absatz 3 der AGB, insbesondere Treibstoffe, Hafengebühren, Ersatzteile und Reparaturen. Sie wird nach Abschluss der Überführung gegen Nachweis abgerechnet. Nicht verwendete Teile werden erstattet.' },
    ] },

    { t: 'h', nr: '§ 3', text: 'Zahlungsbedingungen' },
    { t: 'karten', karten: [
      { kopf: '1 · ANZAHLUNG', sub: 'bei Vertragsabschluss', betrag: euro(z.anzahlung), text: anteile ? anteile + '.' : '' },
      { kopf: '2 · RESTBETRAG', sub: '14 Tage vor Start', betrag: euro(z.rest), text: 'Spätestens 14 Tage vor dem geplanten Starttermin fällig. Bei einem späteren Vertragsabschluss wird er sofort fällig.' },
    ] },
    { t: 'p', neu: true, text: 'Der Bordkassen-Vorschuss ist vor Beginn der Überführung bereitzustellen. Voraussetzung für den Beginn der Überführung ist der vollständige Zahlungseingang der fälligen Beträge.' },

    { t: 'h', nr: '§ 4', text: 'Versicherung' },
    { t: 'p', text: 'Der Auftraggeber weist vor Beginn des Einsatzes eine gültige Haftpflicht- und Kaskoversicherung nach, die Überführungsfahrten durch einen fremden gewerblichen Schiffsführer einschließt.' },
    { t: 'p', text: 'Der Auftragnehmer setzt einen Schiffsführer ein, der über eine gewerbliche Skipperhaftpflichtversicherung verfügt.' },

    { t: 'h', nr: '§ 5', text: 'Schlussbestimmungen' },
    { t: 'p', text: 'Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform.' },

    { t: 'unterschrift',
      links: { label: 'AUFTRAGGEBER', ort: '', name: `Unterschrift Auftraggeber${i.ownerName.trim() ? ' · ' + i.ownerName.trim() : ''}` },
      rechts: { label: 'AUFTRAGNEHMER', ort: ortDatum, name: `Unterschrift ${firma}` }, bild: p.signature_data },

    { t: 'seite', fuss: `AGB · Fassung vom ${AGB_FASSUNG}`, kopf: `Allgemeine Geschäftsbedingungen · Fassung vom ${AGB_FASSUNG}` },
    { t: 'titel', text: 'AGB' },
    ...AGB.flatMap((a): Block[] => [
      { t: 'h', text: a.titel },
      ...a.absaetze.flatMap((text, n): Block[] => [
        a.absaetze.length > 1 ? { t: 'nr', nr: `${n + 1}.`, text } : { t: 'p', text },
        ...(a.punkte && a.punkte.nach === n ? [{ t: 'punkte', liste: a.punkte.liste } as Block] : []),
      ]),
    ]),
  ];
}
