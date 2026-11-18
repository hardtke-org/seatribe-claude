import { AGB, AGB_FASSUNG } from './agb';
import { LAENDER, datumLang, euro } from './data';
import type { Profile, Terms } from './types';

/** Bausteine eines Dokuments. Vorschau (HTML) und PDF werden aus derselben Liste erzeugt. */
export type Block =
  | { t: 'titel'; text: string }
  | { t: 'mitte'; text: string }
  | { t: 'h'; text: string }
  | { t: 'h2'; text: string }
  | { t: 'p'; text: string; neu?: boolean }
  | { t: 'nr'; nr: string; text: string }
  | { t: 'punkte'; liste: string[] }
  | { t: 'zeilen'; zeilen: [string, string][] }
  | { t: 'unterschrift'; links: { ort: string; name: string }; rechts: { ort: string; name: string }; bild?: string | null }
  | { t: 'seite'; fuss: string };

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
    t.bordkasse == null ? 'Bordkasse' : '',
  ].filter(Boolean);
}

/** Überführungsvertrag mit dem Eigner, Fassung „Tagessatz mit Logistikpauschale". */
export function eignerVertrag(i: ContractInput): Block[] {
  const p = i.profile, t = i.terms;
  const rule = ruleOf(p);
  const z = zahlung(t, rule, p);
  const firma = p.company || p.display_name || '';
  const sitz = [p.street, [p.postal_code, p.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  const leer = '____________________';

  const anteile = [
    rule.honorar > 0 ? `${rule.honorar} % des kalkulierten Skipperhonorars` : '',
    rule.admin > 0 ? `die Administrationspauschale ${prozent(rule.admin)}` : '',
    rule.logistik > 0 ? `die Logistikpauschale ${prozent(rule.logistik)}` : '',
  ].filter(Boolean);
  const liste = anteile.length > 1 ? anteile.slice(0, -1).join(', ') + ' sowie ' + anteile[anteile.length - 1] : anteile[0] ?? '';

  return [
    { t: 'titel', text: 'ÜBERFÜHRUNGSVERTRAG' },
    { t: 'mitte', text: 'zwischen' },
    { t: 'mitte', text: `${firma}${sitz ? ', ' + sitz : ''}\n(nachfolgend „Auftragnehmer“)` },
    { t: 'mitte', text: 'und' },
    { t: 'mitte', text: `${i.ownerName.trim() || leer}${i.ownerAddress.trim() ? ', ' + i.ownerAddress.trim().replace(/\s*\n\s*/g, ', ') : ''}\n(nachfolgend „Auftraggeber“)` },

    { t: 'h', text: '§ 1 Vertragsgegenstand' },
    { t: 'p', text: 'Gegenstand des Vertrages ist der Einsatz eines qualifizierten Schiffsführers und der erforderlichen Crew zur Planung und Durchführung der vorgesehenen Überführung folgender Yacht:' },
    { t: 'zeilen', zeilen: [
      ['Yachttyp', i.boatType.trim()], ['Yachtname', i.boatName.trim()], ['Starthafen', i.from], ['Zielhafen', i.to],
      ['Geplanter Starttermin', i.start ? datumLang(i.start) : ''],
    ] },
    { t: 'p', text: 'Der geplante Starttermin kann sich insbesondere aufgrund von Wetterbedingungen, technischen Erfordernissen oder behördlichen Vorgaben verschieben.' },

    { t: 'h', text: '§ 2 Vergütung & Auslagen' },
    { t: 'p', text: `Kalkulierte Gesamtkosten: ca. ${euro(t.angebot_netto) || leer} netto / ${euro(t.angebot_brutto) || leer} brutto.` },
    { t: 'p', text: 'Die Gesamtkosten errechnen sich wie folgt:' },
    { t: 'h2', text: 'Vergütung' },
    { t: 'zeilen', zeilen: [
      ['Tagessatz', t.tagessatz_kunde != null ? `${euro(t.tagessatz_kunde)} netto pro Kalendertag` : ''],
      ['Kalkulierte Abrechnungsdauer', tage(t.tage_gesamt)],
      ['Mindestabrechnungsdauer', tage(i.minTage)],
      ['Höchstabrechnungsdauer', tage(i.maxTage)],
      ['Logistikpauschale', t.logistikpauschale != null ? `${euro(t.logistikpauschale)} netto` : ''],
      ['Verpflegungskosten', 'in der Logistikpauschale inbegriffen'],
      ['Administrationspauschale', t.adminpauschale != null ? `${euro(t.adminpauschale)} netto` : ''],
    ] },
    { t: 'p', text: 'Die kalkulierte Abrechnungsdauer dient der voraussichtlichen Kostenberechnung. Die Schlussabrechnung erfolgt anhand der tatsächlichen Abrechnungsdauer, mindestens jedoch auf Grundlage der vereinbarten Mindestabrechnungsdauer. § 7 Absatz 3 der AGB bleibt unberührt.' },
    { t: 'p', neu: true, text: 'Berechnet werden höchstens die Kalendertage der vereinbarten Höchstabrechnungsdauer. Dies gilt nicht für Verzögerungen, die auf dem Zustand der Yacht, auf notwendigen Reparaturen, auf behördlichen Maßnahmen oder auf Umständen aus dem Bereich des Auftraggebers oder Dritter beruhen.' },
    { t: 'h2', text: 'Auslagen' },
    { t: 'zeilen', zeilen: [['Bordkassen-Vorschuss (Schätzwert)', euro(t.bordkasse)]] },
    { t: 'p', neu: true, text: 'Die Bordkasse deckt die Kosten des Yachtbetriebs nach § 2 Absatz 3 der AGB. Sie wird nach Abschluss der Überführung gegen Nachweis abgerechnet. Nicht verwendete Teile der Bordkasse werden erstattet.' },

    { t: 'h', text: '§ 3 Zahlungsbedingungen' },
    { t: 'p', neu: true, text: `Bei Vertragsabschluss werden ${liste} fällig. Das entspricht einer Anzahlung von ${euro(z.anzahlung)} brutto.` },
    { t: 'p', neu: true, text: `Der verbleibende Betrag von ${euro(z.rest)} brutto ist spätestens 14 Tage vor dem geplanten Starttermin fällig. Bei einem späteren Vertragsabschluss wird er sofort fällig.` },
    { t: 'p', neu: true, text: 'Der Bordkassen-Vorschuss ist vor Beginn der Überführung bereitzustellen.' },
    { t: 'p', text: 'Voraussetzung für den Beginn der Überführung ist der vollständige Zahlungseingang der fälligen Beträge.' },

    { t: 'h', text: '§ 4 Versicherung' },
    { t: 'p', text: 'Der Auftraggeber weist vor Beginn des Einsatzes eine gültige Haftpflicht- und Kaskoversicherung nach, die Überführungsfahrten durch einen fremden gewerblichen Schiffsführer einschließt.' },
    { t: 'p', text: 'Der Auftragnehmer setzt einen Schiffsführer ein, der über eine gewerbliche Skipperhaftpflichtversicherung verfügt.' },

    { t: 'h', text: '§ 5 Schlussbestimmungen' },
    { t: 'p', text: 'Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform.' },

    { t: 'unterschrift', links: { ort: 'Ort, Datum (Auftraggeber):', name: 'Unterschrift Auftraggeber' }, rechts: { ort: `Ort, Datum (Auftragnehmer):\n${[i.ort, datumLang(i.datum)].filter(Boolean).join(', ')}`, name: `Unterschrift ${firma}` }, bild: p.signature_data },

    { t: 'seite', fuss: `AGB Fassung vom ${AGB_FASSUNG}` },
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
