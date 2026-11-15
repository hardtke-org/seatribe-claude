# Seatribe Skipper App – Projektgedächtnis

Diese Datei ist die eine gültige Fassung aller Entscheidungen zu diesem Projekt.
Sie wird in jeder Sitzung gelesen. Wenn sich etwas ändert oder neu entschieden wird: hier nachtragen.

Stand: 2026-11-15 – Konzeptphase. Es gibt einen klickbaren Prototyp (`prototyp/index.html`, Beispieldaten, ohne Login und Speicherung), noch keine echte App.

## Worum es geht

Seatribe (Academy + Deliveries) baut Nebenprodukte, die selbst genutzt und an andere Skipper verkauft werden.
Ziel ist **eine** einheitliche App für Überführungsskipper statt mehrerer Einzeltools.

Arbeitssprache mit dem Auftraggeber: Deutsch, per Du. Er ist kein Entwickler – Erklärungen ohne Fachjargon.

## Kernidee: alles hängt an einer Reise

Eine Reise (z. B. „Flensburg → Mallorca") trägt Boot, Unterlagen und alle Schritte:

**Angebot → Vertrag → Übernahme → Schäden unterwegs → Übergabe**

- Daten werden nur einmal eingegeben (Angebot → Vertrag, Bootsdaten → Protokolle).
- Übernahme, Schadensmeldung und Übergabe sind technisch dasselbe: Checkpunkte, Fotos, Notiz, PDF mit Zeitstempel. Einmal bauen, dreimal nutzen.
- Scheine/Lizenzen gehören zum Skipper-Profil, nicht zur Reise.
- Das **Boot ist ein eigener Datensatz** (Name, Typ, MMSI …), nicht Felder in der Reise – damit später ein Charterunternehmen (Boot im Vordergrund) ohne Großumbau möglich ist.

## Entscheidungen

| Thema | Entscheidung |
|---|---|
| Zielkunde | Zuerst einzelne Skipper (ein Konto = ein Skipper). Charterunternehmen später. |
| Eigner | Bekommt kein Konto. Die Ausrüstungs- & Zustandsliste füllt er heute über ein HubSpot-Formular aus; das bleibt vorerst so. Später: E-Mail mit Link, über den er sie ohne Login ausfüllt, die Angaben landen im Törn. Vollmacht, Versicherung, MwSt-Nachweis lädt zunächst der Skipper hoch; Eigner-Upload ist ein späterer Ausbau. |
| Branding | Standard: Seatribe Deliveries. Eigenes Branding gegen Aufpreis. |
| Bedienung | Große Buttons, Fotos, Spracheingabe statt Tippen. |
| Form | Web-App, die sich wie eine App installieren lässt (PWA), keine App-Stores. |
| Ablage der Ergebnisse | Start: App speichert selbst, Empfänger-E-Mail pro Konto einstellbar (PDF + Link). Eigenes Google Drive pro Kunde erst später als Extra. |
| Agentur-Ebene | Nur für Seatribe intern, nicht Teil des verkauften Produkts. Skippervertrag und Skipper-Rechnung werden vorerst nicht gebaut. |
| Baukasten | Pro Reise wird angehakt, welche Dokumente gebraucht werden; nur die entstehen als PDF. Geändert wird immer in der Bearbeitungsansicht, danach wird das PDF neu erzeugt (kein Bearbeiten im PDF). |
| AGB | Grundlage ist die Fassung mit dem neuesten Datum (15.09.2026). AGB sind vom Vertrag getrennt. Zuerst wird ohne AGB- und Haftungsteil gebaut; der kommt später und wird juristisch geprüft. |
| Begriffe | „Skipperhonorar" (nicht Heuer). Weitere Begriffe siehe Abschnitt Preisbaukasten. |
| Konto | Ein „Seatribe-Konto" für alles (Skipper App, später Academy). Technik dafür: Supabase (Login, Datenbank, Dateiablage, EU-Region) – bestätigt am 2026-11-15; Projekt angelegt: `https://kfyltkepnyrdqvhmjymg.supabase.co` (Region Europa; Projektkennung `kfyltkepnyrdqvhmjymg`). Geheime Schlüssel nie in den Chat oder ins Repository. |
| Academy | Später im selben Konto: Videos nur ansehen (kein Download), Handouts zum Download, Inhalte nur für Käufer. Videos brauchen einen eigenen Streaming-Dienst mit geschützter Wiedergabe; Supabase regelt nur, wer was sehen darf. |
| Startseite | Große Kacheln („Briefmarken"): Törn anlegen, Meine Törns usw. Ein Törn kann mit fast leeren Bootsdaten angelegt werden. Auf der Törn-Seite stehen die Aktionen: Angebot erstellen, Vertrag erstellen, Checkliste an Kunden schicken … |
| Wort in der Oberfläche | „Überführung" (nicht Törn oder Reise). |
| Vorgehen | Erst klickbarer Prototyp, am Handy durchgehen und zurechtrücken, dann richtig bauen. Prototyp: `prototyp/index.html`, veröffentlicht als privates Artifact https://claude.ai/artifact/HTgxCjottbvSUHuDH326Ta (aus anderer Sitzung mit dieser Adresse als `url` aktualisieren). Enthält Kachel-Startseite, Überführung anlegen, Überführungs-Seite mit Bausteinen, Angebots-Wizard mit Live-Summe, Ausrüstungsliste samt Eigner-Ansicht; übrige Bausteine nur als Beschreibung. |
| Reihenfolge | 1. Fundament (Login, Konto-Einstellungen, Reise) + Boat Check zieht um · 2. Schaden aufnehmen + Übergabe · 3. Angebots-Wizard · 4. Vertrag aus Angebot · 5. Unterlagen/Scheine, Branding, Bezahlung |

Vorschläge, noch nicht bestätigt:
- MVP-Umfang und Reihenfolge neu festlegen (Angebot/Vertrag evtl. vor dem Umzug des Boat Check).
- Offline-fähig (lokal speichern, später hochladen), weil das Netz im Hafen oft schlecht ist.
- Sprache: Aufnahme + serverseitige Transkription statt Browser-Diktat.
- Zeitstempel vom Server und PDF unveränderbar ablegen (Beweiswert).

## Dokumente, die die App erzeugen soll

Gesichtet am 2026-11-15 anhand der Vorlagen im Drive-Ordner „Vorlagen" (elf PDFs + ein Beispielangebot als Google Doc). Alle lassen sich aus denselben Stammdaten einer Reise füllen.

| Dokument | Zwischen wem | Wann |
|---|---|---|
| Angebot (E-Mail-Text) | Anbieter → Eigner | vor Auftrag |
| Überführungsvertrag + AGB | Anbieter ↔ Eigner | nach Zusage |
| Ausrüstungs- & Zustandsliste | Selbstauskunft des Eigners | vor der Reise |
| Vollmacht (englisch) | Eigner → Skipper | vor der Reise |
| Crewvereinbarung „Hand gegen Koje" mit Packliste | Anbieter ↔ Crewmitglied | vor der Reise |
| Crewliste (englisch) | für Behörden/Häfen | vor der Reise |
| Übernahme-, Schadens-, Übergabeprotokoll | Skipper | während der Reise |
| Meilenbestätigung (deutsch/englisch) | Anbieter → Crewmitglied | nach der Reise |
| Schlussabrechnung / Rechnung | Anbieter → Eigner | nach der Reise |
| Skippervertrag + AGB, Skipper-Rechnung | Agentur ↔ beauftragter Skipper | nur Agentur-Fall |

**Zwei Ebenen:** Seatribe arbeitet als Agentur (Vertrag mit dem Eigner *und* Vertrag mit einem beauftragten Skipper, inkl. Kundenschutz und Geheimhaltung). Ein einzelner Skipper als Käufer braucht nur die Ebene Skipper ↔ Eigner. Die Agentur-Ebene ist nur für Seatribe intern und wird vorerst nicht gebaut.

### Stammdaten (einmal erfassen, überall verwenden)

- **Boot:** Name, Typ/Modell, Baujahr, Flagge, Rufzeichen, MMSI, Registriernummer
- **Eigner:** Name, Anschrift, Nationalität, Passnummer
- **Skipper:** Name, Anschrift, Nationalität, Geburtsdatum, Passnummer, Scheinnummer, Telefon, Notfallkontakt, Haftpflichtversicherung
- **Crew:** je Person dieselben Felder wie Skipper (ohne Schein), Funktion an Bord
- **Reise:** Start- und Zielhafen (mit Marina), geplanter Start, kalkulierte Dauer, gesegelte Seemeilen, Gültigkeit der Vollmacht

### Preisbaukasten für Angebot und Vertrag

Entschieden am 2026-11-15. Es sind keine drei festen Modelle, sondern zwei Schalter plus Zusätze:

**1. Honorar** (eines von beiden)
- Festpreis
- Tagessatz × Abrechnungstage, mit Mindest- und Maximalabrechnungstagen. Beispiel: kalkuliert 13 Tage, mindestens werden 10 berechnet, höchstens 15. Dauert es 18 Tage, trägt der Anbieter die Differenz. Der Deckel gilt nicht bei Verzögerungen durch die Yacht oder Dritte (Defekt, Reparatur, Behörde).

**2. Reise und Verpflegung** (eines von beiden)
- Logistikpauschale: deckt Reisekosten und Verpflegung vollständig ab
- Einzeln: Reisekosten nach Aufwand gegen Beleg (im Angebot als Schätzung) und Verpflegung wahlweise gar nicht, als Betrag pro Tag oder als Betrag pro Tag und Person

**3. Abrechnungsbeginn** (nur bei Tagessatz)
- ab Abreisetag vom Heimatort bis Rückkehr
- ab Ankunft am Starthafen bis Übergabe
- ab Ankunft am Hafen, plus eine fest eingegebene Zahl bezahlter Tage für Anreise und Rückreise (z. B. je 1 Tag). Dauert die Reise tatsächlich länger, trägt das der Anbieter.

**4. Immer zusätzlich: Bordkasse**
Hafen- und Liegegebühren, Diesel, Schleusen, kleine Reparaturen und Ersatzteile. Abrechnung gegen Beleg. Bei Motorbooten später evtl. eigener Posten Diesel – vorerst nicht.

**Voreinstellungen:** Was ein Skipper einmal zusammengeklickt hat, merkt sich die App als seinen Standard für das nächste Angebot; pro Angebot bleibt alles änderbar. Später: mehrere benannte Vertragsarten je Skipper speichern.

**5. Optional:** Administrationspauschale, Mehrwertsteuer je Position (die Aufteilung der Tage innerhalb/außerhalb der EU entscheidet der Nutzer, die App rechnet nur), Zahlungsplan, Crew „Hand gegen Koje" oder bezahlt.

Begriffe (bestätigt am 2026-11-15; die AGB werden an diese Begriffe angepasst, nicht umgekehrt – Seatribe schreibt die eigenen Verträge künftig selbst über die App):
- Nur noch **ein** Topf namens „Bordkasse" = Betriebskosten der Yacht. „Sicherheitsrücklage" und „Nebenkosten" entfallen als eigene Begriffe; der vorab gezahlte Betrag heißt „Bordkassen-Vorschuss".
- Verpflegung gehört ausdrücklich **nicht** in die Bordkasse, sondern läuft über Schalter 2.
- „Kalendertage" statt „Einsatztage", „Administrationspauschale" statt „Bearbeitungs- & Koordinationspauschale" (so steht es in der neuesten AGB).

### Beobachtungen zu den Vorlagen

- Es gibt drei AGB-Fassungen (15.12.2025, 20.02.2026, 15.09.2026) mit unterschiedlicher Haftungs-, Storno- und Abrechnungsregelung. Die App braucht **eine** geprüfte Grundfassung mit Bausteinen je Preismodell.
- Begriffe schwanken: Heuer / Skipperhonorar, Bordkasse / Sicherheitsrücklage / Nebenkosten, Einsatztage / Kalendertage, Administrations- / Bearbeitungspauschale. Vor dem Bau festlegen.
- Die AGB vom 20.02.2026 verlangen eine Zustandsdokumentation vor Beginn und bei Übergabe; die Fassung vom 15.12.2025 verlangt dokumentierte Schadensmeldungen binnen 48 Stunden. Genau das liefern Übernahme-, Schadens- und Übergabeprotokoll.
- Die Ausrüstungsliste (Selbstauskunft des Eigners) und die Übernahme-Checkliste decken dieselben Themen ab. Idee: Die Angaben des Eigners erscheinen beim Check als Soll, der Skipper bestätigt oder widerspricht.
- Die Vorlagen im Drive sind ausgefüllte Echtfälle mit personenbezogenen Daten (Anschriften, Geburtsdaten, Passnummern). Nur dort belassen; für die App neutrale Fassungen ableiten.

## Rückmeldung zum Prototyp (Runde 1, 2026-11-15)

Eingebaut: Mehrwertsteuer in drei Varianten (alles / ein Teil der Tage ohne / keine), Angebotsvorschau mit Briefkopf und Logo, Knopf „Per E-Mail senden", „Mein Konto" oben rechts, Vollmacht ansehen → versenden → unterschrieben hochladen, ausführlichere Ausrüstungsliste mit Zurück-Knopf oben, klarere Trennung „Speichern" (dieses Angebot) und „Als Vorlage merken" (Startwerte für künftige Angebote).

Entschieden am 2026-11-15 (im Prototyp unter „Mein Konto" eingebaut):
- **Kontoart „Skipper" oder „Agentur"** ist eine Einstellung im Konto, nicht pro Angebot. Agentur: Administrationspauschale und Formulierungen wie „Koordination von Skipper und Crew" sind voreingestellt; Skipper: aus, pro Angebot zuschaltbar. Seatribe GmbH ist das erste Agentur-Konto. Skippervertrag und Skipper-Rechnung bleiben draußen.
- **E-Mail-Versand:** Jeder Nutzer hinterlegt in den Einstellungen sein eigenes Postfach, aus dem die App sendet. Alternative: nicht aus der App senden, Text kopieren bzw. PDF speichern und selbst verschicken.
- **Mehrwertsteuer bei gemischten Tagen:** Nur das Honorar ist anteilig steuerfrei. Administrations- und Logistikpauschale laufen immer voll mit 19 %.
- Die E-Mail des Eigners bleibt beim Anlegen freiwillig.
- **Sitz und Mehrwertsteuer im Konto:** Der Nutzer wählt das Land, in dem er oder seine Firma sitzt; daraus kommt der Mehrwertsteuersatz für seine Angebote (so wird die App international nutzbar). Skipper können zusätzlich „Ich weise keine Mehrwertsteuer aus" wählen (z. B. Kleinunternehmer); Agenturen weisen immer Mehrwertsteuer aus. Die Steuersätze im Prototyp stammen aus Claudes Wissen und müssen vor der echten Version geprüft werden. Der Satz des Sitzlandes ist nur die Voreinstellung – was im Einzelfall gilt (Leistungsort, Auslandskunden), entscheidet der Nutzer.
- **Veröffentlichung:** Der Prototyp bleibt vorerst nur als privates Artifact; auf Vercel kommt er erst später.

## Offene Punkte

- AGB vom 15.09.2026 an die App-Begriffe anpassen (u. a. Paragraf „Sicherheitsrücklage" in „Bordkasse" überführen), danach juristisch prüfen.
- Vertragsvorlagen vor dem Verkauf anwaltlich prüfen lassen; Haftung beim Nutzer.
- Datenschutz für fremde Skipper: AV-Vertrag, EU-Hosting, Löschkonzept.
- Preismodell und Bezahlung (Stripe) noch nicht besprochen.

## Bestehender Boat Check (`../boat-check`)

Läuft produktiv und wurde bereits von mehreren Skippern genutzt. Ablauf beim Absenden: PDF entsteht auf dem Handy → `/api/upload-pdf` legt es in Google Drive → `/api/send` schickt eine Mail mit Link.

Bekannte Schwächen, die beim Umzug zu beheben sind:

- Empfänger-Mail ist fest im Code (`api/send.ts`), Zielordner fest als Umgebungsvariable `GOOGLE_DRIVE_FOLDER_ID` in Vercel.
- Beide Schnittstellen sind ohne Anmeldung aufrufbar.
- Daten liegen bis zum Absenden nur im Browser des Handys (kein Konto, keine Historie).
- Fotos stecken nur im PDF, sie werden nicht einzeln abgelegt.
- Im PDF steht nur das Datum, keine Uhrzeit; die Zeit kommt vom Handy.
- Es gibt nur „Erledigt / Übersprungen". In echten Berichten steht deshalb „Erledigt" mit Notiz „Nicht vorhanden" – es fehlt ein Status wie „nicht vorhanden" bzw. „Mangel".
- Notizen überlagern im PDF teilweise den Text des Checkpunkts.
- Umlaute im Dateinamen gehen kaputt (z. B. „ü" im Skippernamen).
- Doppeltes Absenden erzeugt doppelte Dateien.
- `boat-check/README.md` und `boat-check/CLAUDE.md` beschreiben noch „kein Backend" – das stimmt nicht mehr.

## Google Drive

Ordner „Seatribe Skipper App" (liegt unter „Seatribe"), ID `10LVuMsjfCycQLUoOETv0XkM2u6FWGDxW`

- „Onboarding Berichte" – hier landen die PDFs des Boat Check, ID `1j31_cNPkmBix95aqRY0HkkOogUO3SwpC`
- „Vorlagen" – Angebots- und Vertragsvorlagen des Auftraggebers, ID `1GaT_JJybeAt0qTrNYyn-mEw1mU9Vu8rP`
- Google Doc „Seatribe Skipper App – Ideen-Eingang" – Notizzettel des Auftraggebers, ID `1903ZfzjSDkTix9RSFOwb4g4nWgD9--pLI8FiJ3CrjbA`

Drive-Ordner werden über ihre ID angesprochen, nicht über den Pfad. Verschieben oder Umbenennen ändert die ID nicht.

## Arbeitsweise

- **Ideen-Eingang:** Der Auftraggeber notiert Ideen im Google Doc. Auf „lies den Ideen-Eingang" die neuen Punkte lesen, hier einarbeiten und im Doc als übernommen markieren.
- **Echte Kundendaten** (Namen, Adressen, Preise aus Verträgen und Berichten) nicht ins Repository legen. Aus Originalen nur neutrale Vorlagen ableiten.
- Erst besprechen, dann bauen: größere Schritte vorher abstimmen.
