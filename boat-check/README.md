# Bootsübernahme-Check

Kachelboard-App für die systematische Bootsübernahme. 80 Checkpunkte in 4 Clustern.

## Setup & Start

```bash
npm install
npm run dev
```

Öffnet `http://localhost:5173` im Browser.

## Features

- **Kachel-Board**: Tasks als swipbare Cards, gruppiert nach Cluster
- **3 Status**: Offen, Erledigt, Übersprungen
- **Swipe-Gesten**: Links = Erledigt, Rechts = Übersprungen (Mobile & Desktop)
- **Buttons**: Fallback-Buttons auf jeder Kachel (✓ ⦸ ↩)
- **Fortschritt**: Prozentanzeige (übersprungene Tasks zählen nicht mit)
- **Suche**: Volltextsuche über Task-Titel
- **Notizen**: Notiz pro Task hinzufügen (Stift-Icon)
- **Cluster-Aktionen**: "Alle ✓" Button pro Cluster
- **Import/Export**: JSON-Datei exportieren/importieren
- **Reset**: Auf Seed-Daten zurücksetzen
- **Persistenz**: localStorage, kein Backend nötig
- **Mobile-first**: Responsive, touch-optimiert

## Steuerung

| Aktion | Mobile | Desktop |
|--------|--------|---------|
| Erledigt | Swipe links | Swipe links oder ✓-Button |
| Überspringen | Swipe rechts | Swipe rechts oder ⦸-Button |
| Zurück auf Offen | ↩-Button | ↩-Button |
| Notiz | ✎-Button | ✎-Button |

## Tech-Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- localStorage (kein Backend)
- Pointer Events für Swipe-Gesten
