/**
 * AGB der Seatribe GmbH, Fassung vom 15.09.2026, unverändert aus der Vorlage übernommen.
 * Änderungen nur nach juristischer Prüfung. Offene Stellen stehen im Projektgedächtnis.
 */
export const AGB_FASSUNG = '15.09.2026';

export interface AgbAbschnitt { titel: string; absaetze: string[]; punkte?: { nach: number; liste: string[] } }

export const AGB: AgbAbschnitt[] = [
  { titel: '§ 1 Allgemeines', absaetze: [
    'Der Auftragnehmer erbringt sämtliche Leistungen ausschließlich auf Grundlage dieser Allgemeinen Geschäftsbedingungen.',
    'Der Auftragnehmer erbringt die vereinbarten Leistungen nach den Grundsätzen ordnungsgemäßer Berufsausübung durch entsprechend qualifiziertes Personal.',
  ] },
  { titel: '§ 2 Hauptpflichten der Parteien', absaetze: [
    'Der Auftragnehmer stellt für die Überführung der im Vertrag bezeichneten Yacht einen qualifizierten Schiffsführer sowie die vereinbarte Crew bereit. Er stellt sicher, dass der eingesetzte Schiffsführer über die erforderlichen Befähigungsnachweise und die für die Überführung erforderliche Erfahrung verfügt.',
    'Der Auftraggeber stellt die Yacht zum vereinbarten Zeitpunkt seetüchtig, einsatzbereit und für die vorgesehene Route geeignet zur Verfügung. Er zahlt die vereinbarte Vergütung.',
    'Die Kosten des Yachtbetriebs trägt der Auftraggeber. Dazu gehören insbesondere Treibstoffe, Schmierstoffe, Ersatzteile, Reparaturen, Hafengebühren, Ein- und Ausklarierungsgebühren sowie sicherheitsbedingte Maßnahmen.',
    'Ist eine Übernachtung an Bord aus Gründen, die mit der Yacht zusammenhängen, nicht möglich, trägt der Auftraggeber die notwendigen Unterbringungskosten gegen Nachweis.',
    'Die Logistikpauschale umfasst die planmäßigen Reise- und Verpflegungskosten des Schiffsführers und der Crew. Zusätzliche Reise- und Verpflegungskosten aufgrund yachtbedingter Verzögerungen trägt der Auftraggeber gegen Nachweis.',
  ] },
  { titel: '§ 3 Zeitrahmen des Einsatzes', absaetze: [
    'Die Dauer des Einsatzes hängt insbesondere von Wetter, Seegang, Zustand und Geschwindigkeit der Yacht, Reparaturbedarf, Hafenverfügbarkeit und behördlichen Maßnahmen ab und kann nicht verbindlich vorhergesagt werden.',
    'Der im Einzelvertrag genannte Grundzeitraum dient der Einsatzplanung und der Kalkulation des voraussichtlichen Skipperhonorars.',
  ] },
  { titel: '§ 4 Die Crew', absaetze: [
    'Soweit nichts anderes vereinbart ist, bestimmt der Auftragnehmer in Abstimmung mit dem Schiffsführer die Anzahl und Zusammensetzung der Crew.',
    'Der vorgesehene Schiffsführer kann bei Krankheit, Unfall oder Verhinderung durch einen entsprechend qualifizierten Schiffsführer ersetzt werden. Dem Auftraggeber entstehen hierdurch keine zusätzlichen Kosten.',
  ] },
  { titel: '§ 5 Sicherheit der Yacht', absaetze: [
    'Der Auftraggeber gewährleistet, dass die Yacht bei Übergabe seetüchtig, betriebssicher, vollständig ausgerüstet und für die vorgesehene Überführung geeignet ist.',
    'Der Auftraggeber muss bekannte oder vermutete Mängel, Vorschäden, Reparaturen und Funktionsstörungen vor Einsatzbeginn vollständig mitteilen.',
    'Treten Zweifel an der Seetüchtigkeit oder Betriebssicherheit auf, darf der Schiffsführer die Abreise verschieben, einen sicheren Hafen anlaufen, Untersuchungen oder Reparaturen verlangen, die Fahrt unterbrechen oder den Einsatz abbrechen.',
    'Der Auftraggeber ist verpflichtet, für die Dauer des Einsatzes eine gültige Haftpflicht- und Kaskoversicherung vorzuhalten, die Überführungsfahrten durch fremde gewerbliche Schiffsführer einschließt.',
  ] },
  { titel: '§ 6 Routenplanung und Sicherheit', absaetze: [
    'Die konkrete Routen- und Zeitplanung erfolgt durch den Schiffsführer unter Berücksichtigung des vorgesehenen Zielhafens, der Wetterbedingungen, des Zustands der Yacht und der Sicherheit der Crew.',
    'Notwendige Änderungen erfolgen unter Berücksichtigung der Sicherheit von Crew und Yacht. Der Auftraggeber wird über wesentliche Änderungen informiert.',
  ] },
  { titel: '§ 7 Unterbrechung oder Abbruch der Überführung', absaetze: [
    'Bei einer notwendigen Unterbrechung der Überführung aus wichtigem Grund wird der Auftraggeber schnellstmöglich informiert.',
    'Zusätzliche Kosten aufgrund technischer Mängel, notwendiger Reparaturen, fehlender Seetüchtigkeit oder Zahlungsverzugs trägt der Auftraggeber gegen Nachweis.',
    'Bei einem Abbruch wegen technischer Mängel oder fehlender Seetüchtigkeit bleibt das für den Grundzeitraum kalkulierte Skipperhonorar geschuldet. Ersparte Aufwendungen sowie anderweitig erzielte oder zumutbar erzielbare Einnahmen werden angerechnet.',
  ] },
  { titel: '§ 8 Haftung', absaetze: [
    'Der Auftragnehmer haftet bei Vorsatz, grober Fahrlässigkeit sowie bei Schäden aus der Verletzung von Leben, Körper oder Gesundheit.',
    'Bei leichter Fahrlässigkeit haftet der Auftragnehmer nur bei Verletzung wesentlicher Vertragspflichten und begrenzt auf den vorhersehbaren vertragstypischen Schaden.',
    'Für Schäden aufgrund technischer Mängel, Verschleiß oder fehlender Seetüchtigkeit der Yacht haftet der Auftragnehmer nur, soweit diese durch ihn oder eine von ihm eingesetzte Person verursacht oder mitverursacht wurden.',
  ] },
  { titel: '§ 9 Entgelt des Auftragnehmers', absaetze: [
    'Das Skipperhonorar wird nach dem tatsächlichen Zeitaufwand in Kalendertagen bemessen. Die voraussichtliche Höhe ergibt sich aus dem Einzelvertrag. Die Regelung in § 7 Absatz 3 bleibt unberührt.',
    'Der abrechnungsrelevante Zeitraum beginnt mit der Abreise des Schiffsführers von seinem Heimatort und endet mit dessen Rückkehr. Jeder angefangene Kalendertag innerhalb dieses Zeitraums gilt als abrechnungsfähig.',
  ] },
  { titel: '§ 10 Sicherheitsrücklage', absaetze: [
    'Zusätzlich zum Skipperhonorar kann der Auftragnehmer eine Sicherheitsrücklage in angemessener Höhe erheben. Diese wird separat ausgewiesen und dient ausschließlich der Deckung unvorhergesehener technischer Ausgaben (z. B. Ersatzteile, Notreparaturen), die im Rahmen der Überführung erforderlich werden.',
    'Die Sicherheitsrücklage wird nach Beendigung des Einsatzes abgerechnet. Nicht verwendete Beträge werden erstattet.',
    'Über die Verwendung entscheidet der Schiffsführer. Soweit möglich, wird der Auftraggeber vorab informiert.',
  ] },
  { titel: '§ 11 Rechnungslegung und Fälligkeit', absaetze: [
    'Bei Vertragsabschluss werden 50 % des kalkulierten Skipperhonorars sowie die Administrations- und Logistikpauschale fällig. Die Administrationspauschale ist mit Beginn der Vorbereitung verdient.',
    'Das verbleibende Skipperhonorar ist spätestens 14 Tage vor dem geplanten Starttermin zu zahlen. Voraussetzung für den Beginn der Überführung ist der vollständige Zahlungseingang.',
    'Nach Beendigung des Einsatzes erfolgt die Schlussabrechnung auf Grundlage der tatsächlich angefallenen Kalendertage. § 7 Absatz 3 bleibt unberührt.',
    'Nachforderungen sind innerhalb von sieben Tagen zu zahlen. Erstattungen erfolgen innerhalb von sieben Tagen nach der Schlussabrechnung.',
    'Bei einer Stornierung werden geleistete Zahlungen auf die gemäß § 14 geschuldete Stornoentschädigung angerechnet.',
  ] },
  { titel: '§ 12 Höhere Gewalt', absaetze: [
    'Ereignisse außerhalb des Einflussbereichs der Parteien können eine Änderung, Unterbrechung oder Beendigung der Überführung erforderlich machen. Die Yacht wird in diesem Fall nach Möglichkeit in einem sicheren Hafen übergeben.',
    'Das Skipperhonorar wird bis zur Beendigung des Einsatzes gemäß § 9 abgerechnet. Notwendige zusätzliche Aufwendungen trägt der Auftraggeber gegen Nachweis.',
  ] },
  { titel: '§ 13 Abrechnung der Bordkosten', absaetze: [
    'Die vom Auftraggeber gemäß § 2 Absatz 3 zu tragenden Kosten werden nach Beendigung des Einsatzes gegen Nachweis abgerechnet.',
    'Nicht verwendete Vorschüsse werden erstattet. Ein verbleibender Differenzbetrag ist innerhalb von sieben Tagen auszugleichen.',
  ] },
  { titel: '§ 14 Stornierung durch den Auftraggeber', absaetze: [
    'Bei einer Stornierung werden folgende Anteile des kalkulierten Skipperhonorars fällig:',
    'Der Auftraggeber kann nachweisen, dass durch die Stornierung kein oder ein wesentlich geringerer Schaden entstanden ist.',
    'Die Administrationspauschale wird nach Beginn der Vorbereitung nicht erstattet.',
    'Bereits angefallene oder verbindlich gebuchte Reise- und Logistikkosten des Schiffsführers und der Crew trägt der Auftraggeber gegen Nachweis. Die Logistikpauschale wird darauf angerechnet. Ein nicht verwendeter Restbetrag wird erstattet.',
    'Nicht verwendete Vorschüsse für Bordkosten und Sicherheitsrücklagen werden erstattet.',
  ], punkte: { nach: 0, liste: ['28 Tage oder mehr vor Beginn: 30 %', '14–27 Tage vor Beginn: 50 %', 'weniger als 14 Tage vor Beginn: 80 %', 'bei Abreise oder Antritt: 100 %'] } },
  { titel: '§ 15 Vertragspartner, Rechtswahl und Gerichtsstand', absaetze: [
    'Vertragspartner ist die Seatribe GmbH.',
    'Es gilt das Recht der Bundesrepublik Deutschland.',
    'Ist der Auftraggeber Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist Hamburg Gerichtsstand.',
  ] },
  { titel: '§ 16 Salvatorische Klausel', absaetze: [
    'Die Unwirksamkeit einzelner Bestimmungen berührt die Wirksamkeit der übrigen Regelungen nicht. An die Stelle unwirksamer Bestimmungen treten die gesetzlichen Vorschriften.',
  ] },
];
