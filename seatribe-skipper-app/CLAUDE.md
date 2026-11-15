# Seatribe Skipper App – Projektgedächtnis

Diese Datei ist die eine gültige Fassung aller Entscheidungen zu diesem Projekt.
Sie wird in jeder Sitzung gelesen. Wenn sich etwas ändert oder neu entschieden wird: hier nachtragen.

Stand: 2026-11-15 – Konzeptphase, es ist noch kein Code für die neue App geschrieben.

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
| Eigner | Tut zunächst nichts in der App. Der Skipper lädt Vollmacht, Versicherung, MwSt-Nachweis selbst zur Reise hoch. Eigner-Upload ist ein späterer Ausbau. |
| Branding | Standard: Seatribe Deliveries. Eigenes Branding gegen Aufpreis. |
| Bedienung | Große Buttons, Fotos, Spracheingabe statt Tippen. |
| Form | Web-App, die sich wie eine App installieren lässt (PWA), keine App-Stores. |
| Ablage der Ergebnisse | Start: App speichert selbst, Empfänger-E-Mail pro Konto einstellbar (PDF + Link). Eigenes Google Drive pro Kunde erst später als Extra. |
| Reihenfolge | 1. Fundament (Login, Konto-Einstellungen, Reise) + Boat Check zieht um · 2. Schaden aufnehmen + Übergabe · 3. Angebots-Wizard · 4. Vertrag aus Angebot · 5. Unterlagen/Scheine, Branding, Bezahlung |

Vorschläge, noch nicht bestätigt:
- Technik: bestehender Stack (Vite, React, TypeScript, Tailwind, Vercel) + Supabase (Login, Datenbank, Dateiablage, EU-Region).
- Offline-fähig (lokal speichern, später hochladen), weil das Netz im Hafen oft schlecht ist.
- Sprache: Aufnahme + serverseitige Transkription statt Browser-Diktat.
- Zeitstempel vom Server und PDF unveränderbar ablegen (Beweiswert).

## Angebots-Wizard – gewünschte Eingaben

- Tagespauschale
- Abrechnungsbeginn: ab Abfahrt zu Hause oder ab Ankunft am Hafen
- Sonderpreise für Hafentage, Sondertermine
- Mindest- und Maximalabrechnungstage
- Reisekosten: Pauschale oder nach Aufwand
- Bordkasse

Aus den Angebotsdaten entsteht später der Vertrag. Grundlage sind die Vorlagen des Auftraggebers (siehe Google Drive unten).

## Offene Punkte

- Angebots- und Vertragsvorlagen sichten, sobald sie im Drive-Ordner „Vorlagen" liegen (am 2026-11-15 noch leer).
- Vertragsvorlagen vor dem Verkauf anwaltlich prüfen lassen; Haftung beim Nutzer.
- Datenschutz für fremde Skipper: AV-Vertrag, EU-Hosting, Löschkonzept.
- Preismodell und Bezahlung (Stripe) noch nicht besprochen.
- Technikvorschlag (Supabase) bestätigen.

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
