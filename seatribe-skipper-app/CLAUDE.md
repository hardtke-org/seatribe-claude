# Seatribe Skipper App – Projektgedächtnis

Diese Datei ist die eine gültige Fassung aller Entscheidungen zu diesem Projekt.
Sie wird in jeder Sitzung gelesen. Wenn sich etwas ändert oder neu entschieden wird: hier nachtragen.

Stand: 2026-11-17 – Rollen (Agentur/Skipper), Skipper-Profil und Nachweise sind gebaut, siehe „Erste Version für Seatribe und seine Skipper". Zuvor, 2026-11-15: Die echte App ist begonnen (`app/`): Login, Mein Konto, Überführungen anlegen/bearbeiten/löschen laufen gegen Supabase. Veröffentlicht unter https://seatribe-skipper-app.vercel.app. Der klickbare Prototyp (`prototyp/index.html`) bleibt die Vorlage für alles, was noch fehlt.

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
| Branding | Zwei Ebenen (entschieden am 2026-11-16). **Die App selbst** (Knöpfe, Kacheln, Kopfzeile) erscheint immer in den Farben von Seatribe Deliveries, auch bei fremden Skippern; das Dunkelblau soll stärker eingesetzt werden als bisher. **Dokumente** (Angebot, Vertrag, PDFs) tragen standardmäßig die Marke Seatribe Deliveries; gegen Bezahlung kann ein Nutzer sie durch seine eigene ersetzen. Dann darf das Dokument nicht aussehen, als käme es von Seatribe Deliveries, trägt aber unten den Hinweis „Erstellt mit der Seatribe Skipper App" (genauer Wortlaut offen). Quelle der Marke: Canva-Kit „Markenkit Seatribe Deliveries"; für die Academy gibt es ein eigenes Kit („Seatribe Academy"), das erst später dran ist. Der Canva-Connector zeigt nur Namen und Vorschaubild der Kits, nicht Farben und Schriften – die genauen Werte muss der Auftraggeber liefern. Geliefert am 2026-11-16 per Screenshot: Marke `#009fe0` (Hellblau), „Dunkel" `#0f2534`, „Akzent" `#ff914d` (Orange), `#ffffff`; Text & Flächen `#6b7a85`, `#8a97a1`, `#e4e9ed`, `#f7f9fa`. Nachgeliefert: Schrift **Manrope**; das eigentliche **Dunkelblau der Marke ist `#005b84`** – das nutzt der Auftraggeber zunehmend als Hauptfarbe neben dem Hellblau. Das sehr dunkle `#0f2534` soll fast gar nicht vorkommen, nur wo etwas ganz Dunkles nötig ist. Orange ist reine Akzentfarbe. **Farbverteilung, bestätigt am 2026-11-16 und in App und Prototyp umgesetzt:** Dunkelblau `#005b84` für Kopfzeile, Hauptkachel, Routen-Karte, große Seitenüberschriften, Links und den Rand der Nebenknöpfe. Orange `#ff914d` für den **einen** Hauptknopf pro Bildschirm (mit Schrift in `#0f2534`) und kleine Hervorhebungen. Ganz dunkel `#0f2534` für Titel, Beschriftungen, Fließtext. Hellblau `#009fe0` nur für Logo, Symbole, Fortschrittsbalken, Rahmen ausgewählter Felder – nie als Schrift oder Knopffläche. Grautöne des Kits für Hintergrund, Linien, Nebentexte. Löschen bleibt rot. Weiß nie auf Orange. Für den Dunkelmodus gibt es abgeleitete Töne, die nicht im Kit stehen (dunkle Flächen, helleres Blau für Links). Die Farben stehen als Variablen oben in `app/src/index.css`. **Nachtrag vom 2026-11-16, noch nicht umgesetzt (kommt mit dem nächsten Durchlauf):** Hellblau und Dunkelblau sind nur noch Flächen und Logo, keine Schriftfarben. Alle Schrift läuft in `#0f2534`, auch die großen Seitenüberschriften, die bisher dunkelblau sind. Offen ist dabei, wie Links („Zurück", „Mein Konto", „Bearbeiten") dann erkennbar bleiben, z. B. durch Unterstreichung. |
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
- **Sitz und Mehrwertsteuer im Konto:** Der Nutzer wählt das Land, in dem er oder seine Firma sitzt; daraus kommt der Mehrwertsteuersatz für seine Angebote (so wird die App international nutzbar). „Ich weise keine Mehrwertsteuer aus" (z. B. Kleinunternehmer) ist für beide Kontoarten wählbar, auch für Agenturen. Wer Mehrwertsteuer ausweist, hinterlegt im Konto seine Umsatzsteuer-ID oder Steuernummer; sie erscheint auf Angebot und Rechnung. Die Steuersätze im Prototyp stammen aus Claudes Wissen und müssen vor der echten Version geprüft werden. Der Satz des Sitzlandes ist nur die Voreinstellung – was im Einzelfall gilt (Leistungsort, Auslandskunden), entscheidet der Nutzer.
- **Veröffentlichung:** Der Prototyp bleibt vorerst nur als privates Artifact; auf Vercel kommt er erst später.

## Die echte App (`app/`)

Vite + React + TypeScript + react-router, eigenes CSS aus dem Prototyp übernommen (kein Tailwind). Befehle im Ordner `app/`: `npm install`, `npm run dev`, `npm run build`.

- **Veröffentlichung:** Vercel-Projekt `seatribe-skipper-app` (Team „hardtke-org's projects", Root Directory `seatribe-skipper-app/app`), Adresse https://seatribe-skipper-app.vercel.app. Vercel baut bei jeder Änderung der Hauptversion (`main`) automatisch neu; Änderungen kommen also erst nach dem Mergen eines Pull Requests live. Neue Vercel-Projekte kann Claude über den Connector nicht anlegen (keine Berechtigung), nur lesen.
- **Supabase:** Adresse und Publishable Key stehen in `app/.env` (öffentlich, kein Geheimnis). Schema in `supabase/migrations/`; Änderungen immer als neue Migration anwenden und dort ablegen.
- **Tabellen:** `profiles` (Kontoart, Sitzland, Mehrwertsteuer, Steuernummer, Versand), `boats`, `owners`, `deliveries` (mit `modules` = angehakte Bausteine). Überall gilt: Jeder sieht und ändert nur eigene Zeilen (RLS). Das Profil entsteht automatisch bei der Registrierung.
- **Anmeldung:** E-Mail + Passwort, Konto anlegen, Passwort zurücksetzen. Bestätigungs- und Reset-Links führen auf die Adresse der App; diese muss in Supabase unter Authentication → URL Configuration als Site URL eingetragen sein, sobald die App veröffentlicht ist.
- **Fertig (Schritt 1 und 2):** Start mit Kacheln, Mein Konto, Liste, Überführung anlegen/bearbeiten (Route, Boot mit Baujahr, Flagge, Länge, Breite, Tiefgang, MMSI, Rufzeichen; Eigner), Überführungs-Seite mit Baustein-Auswahl, Löschen mit Rückfrage.
- **Als Nächstes (Schritt 3):** Angebots-Wizard aus dem Prototyp in die App übernehmen, Angebot speichern, PDF mit Briefkopf. Danach Vertrag ohne AGB.
- **Getestet am 2026-11-15** mit zwei Testkonten im Browser gegen die echte Datenbank: Anmeldung, falsches Passwort, Konto speichern, Überführung anlegen/ändern/löschen, Bausteine, und dass Konto B die Daten von Konto A weder in der Liste noch über die direkte Adresse sieht. Testkonten danach gelöscht. Nicht getestet: Registrierung und Passwort-Reset per E-Mail (brauchen die veröffentlichte Adresse).
- Der Sicherheitshinweis von Supabase zu `public.rls_auto_enable()` betrifft eine von Supabase selbst angelegte Funktion, nicht unseren Code.
- **Mein Konto (entschieden am 2026-11-16):** Nach dem ersten Speichern zeigt die Seite nur die gespeicherten Angaben; oben rechts „Bearbeiten" öffnet die Auswahlfelder. Bei „Ich weise keine Mehrwertsteuer aus" ist das Feld für Umsatzsteuer-ID/Steuernummer ausgeblendet, bei beiden Kontoarten; der Hinweis auf die Kleinunternehmerregelung entfällt. Vom Auftraggeber nach Hinweis ausdrücklich so bestätigt. (Das ersetzt die Abrede vom Vortag, die Nummer immer abzufragen. Für den Rechnungsbaustein neu klären: Auch Kleinunternehmer müssen in Deutschland eine Steuernummer auf der Rechnung nennen.)
- **Ablauf für Änderungen:** auf dem Arbeitszweig bauen → Vercel erzeugt automatisch eine Vorschau-Adresse (nur mit Vercel-Anmeldung sichtbar, nutzt dieselbe Datenbank wie live) → Pull Request → der Auftraggeber bestätigt → live. Feinschliff direkt in der echten App; der Prototyp nur noch für ganz neue, unklare Bausteine. Vor jeder Aussage „liegt im Pull Request X" dessen Stand in GitHub prüfen: Der Auftraggeber bestätigt Pull Requests oft sofort, und alles, was danach auf den Arbeitszweig kommt, braucht einen neuen Pull Request (am 2026-11-16 wurden die Farben irrtümlich dem bereits bestätigten PR 4 zugeschrieben).
- **Erstes Werkzeug zum Launchen:** das Angebot. Übrige Bausteine für den Start ausblenden statt „kommt bald" zu zeigen (Vorschlag, noch nicht bestätigt). Vor dem Launch an Fremde: Impressum/Datenschutz, eigener Mail-Absender für Bestätigungs-Mails, eigenes Logo und Firmenname im Angebot, Steuersätze prüfen, Preis und Bezahlung, Besucherstatistik: Der Auftraggeber will sie, am liebsten über Google Analytics (wegen Google Ads, keine doppelte Messung) statt über Vercel. Wo und wie ist noch nicht entschieden; zu klären sind Einwilligungs-Banner, Mess-ID und ob im Boat Check, in der Skipper App oder nur auf der Website gemessen wird. Der alte Vercel-Vorschlag (PR 2) bleibt geschlossen.

## Geschäftliche Einschätzung (Claude, 2026-11-16, auf Wunsch des Auftraggebers)

**Wichtig:** Der Engpass von Seatribe Deliveries sind **Aufträge, nicht Skipper** (Klarstellung des Auftraggebers; Claude hatte zuerst das Gegenteil angenommen).

Ergebnis einer kurzen Webrecherche am 2026-11-16:
- Es gibt keine veröffentlichte Zahl der Überführungsskipper. Anhaltspunkt: Der große britische Anbieter PYD arbeitet laut Fachpresse mit rund 30 Skippern und über 500 Crewmitgliedern und überführt etwa 180–200 Yachten im Jahr; Halcyon nannte 2017 über 150 im Jahr. Der Beruf ist also klein; „einige Hundert bis wenige Tausend in Europa" bleibt Claudes Schätzung.
- Ein Werkzeug speziell für selbstständige Überführungsskipper (Angebot, Vertrag, Protokolle) wurde nicht gefunden. Das ist eine Lücke, aber auch ein Zeichen für einen kleinen Markt.
- Für Charter-Check-in/-out gibt es bereits Apps, teils kostenlos für Charterfirmen. Dieser Nachbarmarkt ist besetzt und preislich schwierig.
- Vercel: Der kostenlose Tarif ist laut Vercel nur für nicht-kommerzielle Nutzung; kommerziell braucht es den Pro-Tarif (laut Drittquellen ca. 20 USD pro Nutzer und Monat, vor dem Wechsel auf der Vercel-Seite prüfen).

Folgerung: Verkauf an Skipper ist ein Nebenverdienst. Der Hauptnutzen muss sein, **mehr Aufträge zu gewinnen**: (1) schnelle, professionelle Angebote erhöhen die Abschlussquote bei bestehenden Anfragen; (2) der Preisbaukasten als öffentlicher Preisrechner „Was kostet meine Überführung?" auf der Website, der Anfragen ins CRM bringt – passt zu Google Ads; (3) Skipper in der App können Anfragen, die sie nicht selbst fahren, an Seatribe weitergeben. Idee (2) und (3) sind Vorschläge, noch nicht besprochen.

## HubSpot als Quelle für die eigene Nutzung (gesichtet am 2026-11-16, noch nichts gebaut)

Seatribe Deliveries führt Anfragen, Angebote und Aufträge bereits vollständig in HubSpot (Portal 27171859). Für die eigene Nutzung ist HubSpot die führende Quelle; die App soll Angebote **nicht** noch einmal rechnen.

- **Pipelines der Deals:** Yachtüberführung (`default`), Portal LKW Transport (`255783906`), Transport per Frachtschiff (`563897532`), Bootskauf/-Verkauf, Triage. Insgesamt rund 3.750 Deals, davon rund 710 in „Yachtüberführung".
- **Stufen in „Yachtüberführung"** decken den ganzen Ablauf ab: Anfrage → Preisindikation (teils automatisch) → Angebot an den Kunden → Auftrag erhalten → Vertrag an Kunden → Rechnung Anzahlung → Zustand der Yacht an Kunden → Anzahlung eingegangen → Finale Rechnung → Ist unterwegs → Endabrechnung → Überführung abgeschlossen.
- **Angebotsdaten liegen als Deal-Felder vor**, u. a. `starthafen`, `zielhafen`, `wann`, `bootstyp`, `bootsname`, `bootskennzeichen`, `baujahr`, `lange`, `breite`, `tiefgang`, `maschinentyp`, `motorstunden`, `entfernung`, `etmal`, `segeltage`, `tage_hafentage`, `ein__ausklarieren`, `tage_gesamt`, `min_einsatztage`, `max_einsatztage`, `keine_mwst` (Tage ohne MwSt), `tagessatz_skipper` (Kunde → Seatribe), `skipper_bekommt__netto__pro_tag` (Seatribe → Skipper), `heuer_netto`, `heuer_brutto`, `logistikpauschale_netto`, `bearbeitungspauschale`, `bordkasse`, `reisekosten`, `verpflegungskosten`, `angebot_netto`, `angebot_uberfuhrung_brutto`, `anzahlung`, `restzahlung`, `auftrags_id`. Eigner-Daten hängen am verknüpften Kontakt.
- **Schon vorhanden:** das Feld `dokumente__uberfurhung` als Abhakliste (Vertrag Eigner, Vertrag Skipper, Verträge Crew, Ausrüstungs-/Zustandsliste, Rechnung Anzahlung, Rechnung Final, Vollmacht) und `skipper_gestrafft`.
- **Größenordnung:** In „Yachtüberführung" stehen rund 40 Deals in Stufen ab „Auftrag erhalten" (seit Mitte 2023), also grob 10–15 eigene Überführungen im Jahr. Zahl hängt davon ab, wie sauber die Stufen gepflegt sind.
- **Abweichungen zu den App-Begriffen:** HubSpot sagt „Heuer", „Bearbeitungspauschale", „Einsatztage"; die App sagt „Skipperhonorar", „Administrationspauschale", „Kalendertage". Beim Verknüpfen übersetzen oder angleichen.

**Idee des Auftraggebers (zu besprechen):** In HubSpot „Auftrag anlegen" auslösen → die App legt die Überführung mit allen Daten an → daraus entstehen Vertrag, Vollmacht, Checklisten → der Auftrag wird mit dem beauftragten Skipper geteilt, der die App ebenfalls nutzt; dazu gehören dann auch die Skipperverträge. Das würde die Entscheidung „Agentur-Ebene vorerst nicht bauen" aufheben. Zu beachten: Der Skipper darf die Konditionen zwischen Seatribe und Eigner nicht sehen (so steht es im Skippervertrag).

### Richtung für die eigene Nutzung (vom Auftraggeber am 2026-11-16 so beschrieben, Umsetzung noch nicht abgestimmt)

- Es sind tatsächlich rund 10 eigene Überführungen im Jahr; Ziel des Auftraggebers sind 50. Die meiste Zeit pro Auftrag kosten die **Verträge**.
- **Agentur-Seite:** nur für Seatribe. Sie holt Aufträge aus HubSpot, sieht Preise, erzeugt die Verträge mit Eigner und Skipper und legt sie ab. Das ersetzt die frühere Entscheidung „Agentur-Ebene vorerst nicht bauen".
- **Skipper** loggen sich mit eigenem Konto ein und haben zwei Wege: einen **Seatribe-Auftrag übernehmen** oder eine **eigene Überführung eingeben** (wie bisher). Die App bleibt damit allgemein nutzbar.
- Bei einem Seatribe-Auftrag sieht der Skipper **keine Preise und keine Verträge zwischen Seatribe und Eigner**, nur seine eigenen Verträge und Vereinbarungen sowie die Daten für die Fahrt.
- Technisch soll das klein bleiben.
- Vorschlag von Claude, noch nicht bestätigt: Der Skipper importiert nicht selbst aus HubSpot, sondern die Agentur gibt den Auftrag per Code oder Link frei; Preise und Eigner-Vertrag liegen in einer eigenen, nur für die Agentur lesbaren Tabelle. Für eigene Verträge zunächst den bestehenden AGB-Text vom 15.09.2026 unverändert verwenden.

### Neuer Zuschnitt (vom Auftraggeber am 2026-11-17 beschrieben; Umfang der ersten Version noch abzustimmen)

Die App wird zuerst für **Seatribe und die Skipper, die für Seatribe fahren,** gebaut. Der Verkauf an freie Skipper wird zurückgestellt.

- **Rollen:** Wer ein Konto anlegt, ist Skipper. Die Agentur-Seite gibt es nur für Seatribe und wird von Hand freigeschaltet. Klickt ein Skipper auf „Agentur", steht dort sinngemäß: „Wenn du eine Agentur bist, melde dich bei Seatribe."
- **Agentur:** spricht als einziges Konto mit HubSpot. Angebote, Tage und Preise werden weiter dort gepflegt. In der App: Auftrag aus HubSpot holen, Skipper zuweisen, Verträge erzeugen. Die AGB sind im Agentur-Konto hinterlegt und hängen am Vertrag.
- **Skipper zuweisen:** Jeder Skipper hat ein Profil und setzt einen Haken, dass er für Seatribe fährt. Die Agentur wählt in ihrer Ansicht aus diesen Skippern aus. Das ersetzt den Vorschlag „Teilen per Code".
- **Skipper-Profil mit Dokumenten:** Personalausweis, Reisepass, Funkschein, höchster Segelschein, Pyro-Schein – einmal hinterlegt, bei jedem Auftrag verfügbar. Die Agentur soll darauf zugreifen können, weil der Eigner die Nachweise oft sehen will.
- **Seatribe-Skipper** schreiben keine Angebote und keine Verträge mit Eignern; Seatribe schließt den Vertrag mit ihnen. Rechnungen des Skippers an Seatribe könnten später über die App laufen.
- **Versand:** nicht aus der App, sondern weiter über das eigene Postfach (IONOS). Die App erzeugt das PDF; unterschriebene Fassungen werden wieder hochgeladen.
- **Später:** freie Skipper mit eigenen Angeboten als bezahlte Variante; ein Link für den Eigner, über den er Unterlagen hochlädt (Mehrwertsteuernachweis, Flaggenzertifikat, Bootsschein) – „Königsklasse", könnte Folgeaufträge fördern.
- **Damit zurückgestellt:** Angebots-Wizard in der echten App, Kontoart-Wahl im Konto, Zielkunde „einzelne Skipper zuerst".
- **Hinweis von Claude, zu klären:** Ausweis- und Passkopien sind besonders heikle Daten. Nach deutschem Recht darf eine Ausweiskopie nach Claudes Kenntnis nur der Inhaber selbst an Dritte weitergeben. Vorschlag: Der Skipper gibt seine Nachweise pro Auftrag selbst für den Eigner frei; Ablage in geschütztem Speicher, Zugriff nur für ihn und die Agentur. Vor dem Bau rechtlich bestätigen lassen.
- Ergänzt am 2026-11-17: Erstnutzer sind die Seatribe-Skipper, aber die App wird so angelegt, dass ein Skipper sie später auch **ohne Seatribe für eigene Aufträge** nutzen kann (eigene Überführungen, Angebote). Diese Funktionen bleiben für Skipper zunächst unsichtbar bzw. hinter einer Bezahlschranke. Den Haken „Ich fahre für Seatribe" braucht es nicht bzw. er ist vorausgewählt, weil zunächst alle Nutzer Seatribe-Skipper sind.
- **Dokumentenordner:** Der Vertrag zwischen Seatribe und Skipper liegt bei beiden im Dokumentenordner. Verträge mit dem Eigner liegen nur bei der Agentur. Verträge entstehen immer aus den PDF-Vorlagen von Seatribe.
- Vorschläge von Claude dazu, noch nicht bestätigt: (a) den Angebots-Wizard jetzt **nicht** bauen, nur den Platz dafür vorsehen; eigene Überführungen (schon vorhanden) für Skipper vorerst ausblenden; (b) statt Haken eine Bestätigung durch die Agentur („als Seatribe-Skipper bestätigen"), damit nicht jeder, der sich registriert, automatisch zur Auswahl steht.
- Die Frage, warum aus Anfragen keine Aufträge werden, gehörte nicht in diesen Chat (Klarstellung des Auftraggebers); hier nicht weiterverfolgen, außer er bittet darum.

### Erste Version für Seatribe und seine Skipper (abgestimmt am 2026-11-17)

Entschieden vom Auftraggeber: Angebots-Wizard jetzt nicht bauen; Skipper werden von der Agentur bestätigt (kein Haken); die bezahlte Variante für freie Skipper kann bald danach kommen. Nachweise (Reisepass, Personalausweis, Scheine, Skipper-Haftpflicht) sollen Skipper, Agentur und Eigner sehen können – an den Eigner gehen sie nur über eine Freigabe des Skippers pro Auftrag (noch nicht gebaut, rechtliche Prüfung offen). Verträge mit dem Eigner sollen später auch beim Eigner liegen. Idee: Kopplung an ein „Skipper-Portal" – dafür bräuchte es eine ausdrückliche Zustimmung des Skippers; nur notiert.

Fünf Schritte: (1) Agentur-Rolle, Bestätigung der Skipper, Seite „Agentur" mit Hinweistext · (2) Skipper-Profil mit Stammdaten, Nachweisen und Dokumentenordner · (3) Auftrag aus HubSpot über die Auftrags-ID holen und Skipper zuweisen · (4) Vertrag mit Eigner samt AGB und Skippervertrag als PDF, unterschriebene Fassung hochladen · (5) Ansicht des Skippers auf seinen Auftrag ohne Preise. Danach Übernahme/Schaden/Übergabe, Eigner-Link, Rechnungen, freie Skipper.

**Schritt 1 und 2 sind gebaut (2026-11-17):**
- Datenbank (Migration `20261117_roles_skipper_profile_documents.sql`, angewendet): `profiles.role` (`skipper`/`agentur`) und `profiles.seatribe_status` (`neu`/`bestaetigt`/`abgelehnt`) kann niemand an sich selbst ändern; die Agentur setzt den Status über die Funktion `set_skipper_status`. Neue Profilfelder: Anschrift, Telefon, Geburtsdatum, Nationalität, höchster Schein, Scheinnummer, Notfallkontakt, E-Mail. Tabelle `skipper_documents` und privater Speicher `skipper-docs` (10 MB, PDF und Fotos): Jeder Skipper sieht nur den eigenen Ordner, die Agentur darf alles lesen, aber nichts ändern oder löschen.
- Die Agentur-Rolle wird von Hand in der Datenbank gesetzt; das Konto des Auftraggebers ist als Agentur freigeschaltet.
- Seiten: Start je Rolle (Skipper: Meine Aufträge, Meine Dokumente, Mein Konto, Agentur; Agentur: Skipper, Überführungen, Überführung anlegen, Mein Konto), `/dokumente` (Nachweise hochladen, ansehen, löschen; Platz für Verträge), `/auftraege` (noch leer), `/agentur` (Skipper: Hinweistext; Agentur: Skipper-Liste), `/agentur/skipper/:id` (Angaben, Nachweise, bestätigen / nicht freigeben / zurücknehmen). Eigene Überführungen sind für Skipper ausgeblendet. „Mein Konto" fragt keine Kontoart und keinen E-Mail-Versand mehr ab (Spalten bleiben in der Datenbank).
- Schrift überall `#0f2534`; Links sind unterstrichen; Nebenknöpfe haben einen dunkelblauen Rand. Damit ist der Nachtrag zur Farbverteilung umgesetzt.
- Getestet im Browser gegen die echte Datenbank mit zwei Skipper- und einem Agentur-Testkonto: Skipper kann Rolle und Status nicht ändern und die Bestätigungs-Funktion nicht aufrufen, sieht nur das eigene Profil; ein zweiter Skipper kommt weder an Einträge noch an Dateien des ersten; Agentur sieht Liste, Angaben und Dateien, kann bestätigen und zurücknehmen, aber nichts löschen oder ändern.
- Für Schritt 3 nötig: ein HubSpot-Zugang (privater App-Schlüssel, nur Lesen von Deals und Kontakten), der als Geheimnis in Supabase liegt – nie im Chat oder Repository.

**Schritt 3a ist gebaut (2026-11-17): Skipper zuweisen, noch ohne HubSpot.**
- Migration `20261118_assign_skipper.sql` (angewendet): `deliveries.assigned_skipper_id` und `assigned_at`. Ein Trigger lässt die Zuweisung nur zu, wenn die Überführung einer Agentur gehört und der Skipper bestätigt ist.
- Der Skipper liest seine Aufträge nur über die Funktion `my_assignments()`. Sie gibt Route, Termin, Bootsdaten, Name der Agentur und vom Eigner **Name, Telefon, E-Mail** heraus (so entschieden am 2026-11-17: Der Skipper braucht den Kontakt; die Anschrift bekommt er nicht). Auf die Tabellen selbst hat er keinen Zugriff. Verliert er die Bestätigung, sieht er die Aufträge nicht mehr. Preise müssen später in einer eigenen Tabelle liegen und dürfen nie in diese Funktion.
- Seiten: Auswahlfeld „Skipper" auf der Überführungs-Seite der Agentur; `/auftraege` und `/auftraege/:id` für den Skipper mit dem Kennzeichen „Auftrag von Seatribe Deliveries"; Telefonfeld für den Eigner im Formular.
- Getestet mit Agentur- und zwei Skipper-Testkonten: zuweisen, aufheben, Ansicht des Skippers; ein anderer Skipper sieht nichts; ein Skipper kann sich nicht selbst zuweisen; ein unbestätigter Skipper lässt sich nicht zuweisen.
- Der Auftraggeber erwähnte am 2026-11-17, Skipper könnten auch eigene Aufträge anlegen. Das bleibt wie abgestimmt vorerst ausgeblendet (später bezahlte Variante); das Kennzeichen „Auftrag von …" unterscheidet dann Seatribe-Aufträge von eigenen.
- HubSpot-Schlüssel: Es gibt in HubSpot bereits eine private App (dort jetzt „Veraltete Apps"). Claudes Connector kann deren Schlüssel nicht auslesen; der Auftraggeber muss ihn am Rechner kopieren und in Supabase als Secret `HUBSPOT_TOKEN` ablegen. Empfehlung: eigene App nur mit Leserechten für Deals und Kontakte.
- Drei Testkonten (`testlauf-a/b/c@example.com`, alle Rolle Skipper) liegen noch in der Datenbank; löschen, sobald der Auftraggeber die Rückfrage von Supabase am Rechner bestätigen kann.

**Nachtrag 2026-11-17 (Rückmeldung des Auftraggebers nach dem ersten Ausprobieren):**
- Die Skipper-Auswahl steht jetzt im Bearbeiten-Formular ganz unten (nach dem Eigner), damit sie nicht versehentlich verstellt wird; die Überführungs-Seite zeigt den Skipper nur noch an.
- HubSpot führt Vor- und Nachname getrennt; beim Abruf zu einem Namen zusammenführen.
- Ideen, noch nichts bauen: (a) beim Skipper in der Agentur-Ansicht seine Überführungen zeigen, mit „aktiv" und „abgeschlossen"; (b) **Login für Crew** mit eigener Ansicht: Crewvereinbarung, eigene Nachweise (Scheine, Ausweis, Haftpflicht), Meilenbestätigung, evtl. Meilenbuch – als Hebel für Verbreitung, Preisidee 4,99 pro Nutzer; beim Konto-Anlegen Wahl Skipper oder Crew (Agentur bleibt von Hand freigeschaltet – Hinweis von Claude); (c) **Unterschrift in der App**. Einschätzung von Claude dazu, keine Rechtsberatung: Diese Verträge brauchen keine besondere Form, eine einfache elektronische Unterschrift ist wirksam, aber im Streit schwächer zu beweisen. Vorschlag: für Skipper und Crew (haben ein Konto) Unterschrift in der App mit Protokoll (wer, wann, unveränderte Fassung des PDFs); für den Eigner später ein Signaturdienst oder der Eigner-Link. Vor dem Bau mit dem Anwalt klären, zusammen mit den AGB.

**Crew und Rollen – Richtung des Auftraggebers vom 2026-11-17 (Idee, noch nichts bauen):**
- Der Status einer Überführung (aktiv, abgeschlossen) kommt aus der HubSpot-Stufe.
- Beim Konto-Anlegen nur Skipper oder Crew; man kann auch beides sein. Die Agentur wird nicht gewählt, sondern bekommt einen besonderen Einladungslink.
- Der Skipper hat eine eigene Crew-Liste („aktive Crew") und fügt daraus Leute einer Überführung hinzu. Deren Daten und Nachweise (Ausweis usw.) sind einmal hinterlegt und müssen nicht neu hochgeladen werden.
- Könnte später auch für Charter interessant sein (Crewlisten), als lohnenderes Geschäft.
- Vorschläge von Claude dazu, noch nicht bestätigt: (a) kein fester Entweder-oder-Typ, sondern ein Personen-Konto; ob jemand Skipper oder Crew ist, ergibt sich je Überführung aus der Zuweisung; (b) Crew wird per E-Mail eingeladen und muss die Verbindung zum Skipper annehmen; ihre Nachweise sieht ein Skipper oder die Agentur nur für die Überführung, für die die Crew sie freigibt (heikle Daten, gleiche Regel wie bei den Skipper-Nachweisen gegenüber dem Eigner); (c) bei Seatribe-Aufträgen schlägt der Skipper die Crew vor, die Agentur sieht sie, weil die Crewvereinbarung zwischen Seatribe und dem Crewmitglied geschlossen wird; (d) Crew kostenlos, Skipper zahlen; (e) Reihenfolge: nach den Verträgen (Schritt 4), zusammen mit Crewvereinbarung, Crewliste und Meilenbestätigung.

**Nachtrag Crew und Rollen (2026-11-17, weiter nur Idee):**
- Der Auftraggeber will „Skipper" und „Crew" als sichtbar verschiedene Rollen behalten (Crew freut sich, später Skipper zu werden; Funktionen wie „Crew zuordnen" hängen an der Rolle). Claudes Vorschlag (a) „kein Unterschied" ist damit nicht bestätigt. Kompromiss, noch zu besprechen: ein Konto mit sichtbarer Rolle; beim Wechsel von Crew zu Skipper bleiben Konto und Nachweise erhalten.
- Crew legt ein eigenes Konto an, wird vom Skipper eingeladen oder fragt an; der Skipper nimmt an und kann jederzeit wieder ausschließen.
- Die Crewvereinbarung schließt je nach Fall die Agentur oder der Skipper (Skipper mit eigener Crew). Die Funktion haben also beide Rollen; pro Überführung wird festgelegt, wer sie schließt.
- Die Agentur-Ansicht bleibt vorerst nur beim Auftraggeber. Er muss die Ansichten Skipper und Crew selbst testen können (einfachster Weg: zweites Konto mit anderer E-Mail-Adresse).
- Charter-Idee: Ausweis fotografieren oder hochladen, die App liest die Daten aus und trägt sie ein. Einschätzung von Claude: Bei Pass und Personalausweis zuverlässig machbar über die maschinenlesbaren Zeilen; möglichst direkt auf dem Handy auslesen statt über einen fremden Dienst, und der Nutzer bestätigt die Werte. Scheine haben keine solche Zeile. Jedes Charterunternehmen hat ein eigenes Formular; zunächst eine Crewliste als PDF/Tabelle ausgeben.

**Weitere Ideen des Auftraggebers (2026-11-17, nur notiert):** Bei Crew ist der Knopf „Skipper" ausgegraut; ein Klick führt zum Abo (Preisidee 4,99 € im Jahr). Der Skipper lädt Crew per E-Mail-Link ein; wer schon ein Konto hat, wird verbunden, sonst legt er eines an. Jedes Crewmitglied lädt seine Ausweisdaten selbst hoch, statt Fotos an den Skipper zu schicken. Für Charterfirmen mit eigener App oder eigenem Upload später evtl. eine Schnittstelle. **Bestätigt vom Auftraggeber am 2026-11-17: Skipper, die Seatribe einlädt bzw. bestätigt, zahlen nicht.** Hinweise von Claude: 4,99 € im Jahr bringen selbst bei 1.000 zahlenden Skippern nur rund 5.000 € – der Preis gehört zur offenen Frage Preismodell; der Geburtsort steht nicht in den maschinenlesbaren Zeilen des Ausweises und muss getippt werden.

**Schritt 3b ist gebaut (2026-11-18): Auftrag aus HubSpot holen.**
- HubSpot: Service-Schlüssel „Seatribe Skipper App" (unter Entwicklung → Service-Schlüssel, nicht „Alte Apps"), nur Lesen von Deals und Kontakten. Er liegt in Supabase als Secret `HUBSPOT_TOKEN`. Die vorhandene App „n8n Integration" bleibt unberührt.
- Supabase-Funktion `hubspot-order` (Quelltext in `supabase/functions/hubspot-order/index.ts`; nach Änderungen neu einspielen): prüft, dass ein Agentur-Konto fragt, sucht den Deal über `auftrags_id` (Zahl) und liefert Route, Boot, Konditionen und **alle** verknüpften Kontakte. An den Deals hängen mehrere Kontakte, in HubSpot gekennzeichnet z. B. als „Eigner" und „Skipper"; die App wählt den mit „Eigner" vor, die Agentur kann umstellen.
- Migration `20261118_hubspot_orders.sql` (angewendet): `deliveries` merkt sich Deal, Auftrags-ID, Stufe, Freitext-Termin (`wann` ist in HubSpot Freitext; nur „12.4.2027" wird zum Datum) und Abrufzeit. Preise und Tage liegen in `delivery_terms`, lesbar nur für den Besitzer der Überführung. `my_assignments()` gibt dem Skipper zusätzlich Auftrags-ID, Terminangabe und einen groben Status (geplant / unterwegs / abgeschlossen), nicht die Stufe selbst.
- Seiten: `/ueberfuehrungen/hubspot` (Auftrags-ID eingeben → Vorschau mit markierten Lücken → anlegen oder vorhandene aktualisieren; HubSpot überschreibt, leere HubSpot-Felder lassen App-Werte stehen, der zugewiesene Skipper bleibt), Kachel „Auftrag holen", auf der Überführungs-Seite Auftrags-ID, Stand, „Aus HubSpot aktualisieren" und aufklappbare Konditionen mit den Begriffen der App.
- Getestet gegen echte Deals mit Testkonten: ohne Anmeldung und als Skipper abgelehnt; unbekannte ID; anlegen, aktualisieren ohne Doppel; Skipper sieht Auftrag ohne Preise und kann `delivery_terms` weder lesen noch schreiben. Testdaten danach entfernt.
- Beobachtung: `min_einsatztage`/`max_einsatztage` und der Tagessatz an den Skipper sind in den geprüften Deals oft leer; Bootsmaße fehlen teils. Für die Verträge (Schritt 4) müssen sie in HubSpot gepflegt sein.
- Nächster Schritt: Schritt 4, Verträge als PDF. Davor klären: welche Vorlage zuerst, und welche Angaben des Eigners (Anschrift) und des Skippers in den Vertrag gehören.

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
- **Einwände vor dem Bauen nennen** (Wunsch des Auftraggebers vom 2026-11-16): Jede Anweisung zuerst prüfen, ob sie sinnvoll ist. Wenn etwas dagegen spricht – etwa ein Widerspruch zu einer früheren Entscheidung oder ein rechtlicher bzw. fachlicher Haken –, das zuerst sagen und kurz besprechen. Gebaut wird erst die abgestimmte Fassung. Anlass: Die Steuernummer wurde auf Anweisung ausgeblendet, der Einwand dazu kam erst nach dem Bau.
