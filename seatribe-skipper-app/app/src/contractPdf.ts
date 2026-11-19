import type { Block } from './contract';

async function dataUrl(url: string): Promise<string> {
  const blob = await (await fetch(url)).blob();
  return new Promise((ok, fail) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = fail; r.readAsDataURL(blob); });
}

type Schrift = 'kopf' | 'text' | 'stark';   // Manrope Bold · Open Sans · Open Sans SemiBold

/**
 * Setzt die Bausteine als A4-PDF in der Designsprache der Seatribe-Dokumente:
 * Manrope für Überschriften und Beträge, Open Sans für Text. Die Schriften werden eingebettet.
 */
export async function renderPdf(blocks: Block[], opt: { fuss: string; firma: string; kopf: string; entwurf: boolean }): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const dateien: [string, Schrift][] = [['Manrope-Bold.ttf', 'kopf'], ['OpenSans-Regular.ttf', 'text'], ['OpenSans-SemiBold.ttf', 'stark']];
  for (const [datei, name] of dateien) {
    doc.addFileToVFS(datei, (await dataUrl('/fonts/' + datei)).split(',')[1]);
    doc.addFont(datei, name, 'normal');
  }
  const logo = await dataUrl('/logo-192.png');

  const L = 17, R = 193, X = 29, W = R - X, BOTTOM = 275.5;
  const INK = '#0f2534', BLAU = '#005b84', HELL = '#009fe0', FLAECHE = '#eef5fa', LINIE = '#d7e0e6', GRAU = '#5b6b77', ROT = '#c0392b';
  const mm = (pt: number) => pt * 0.3528;

  let y = 0;
  let teil = { fuss: opt.fuss, kopf: opt.kopf, vertrag: true };
  const seiten: { seite: number; fuss: string; nr: number; teil: number }[] = [];
  let teilNr = 0, nrImTeil = 0;

  const font = (f: Schrift, size: number, farbe = INK, sperr = 0) => { doc.setFont(f, 'normal'); doc.setFontSize(size); doc.setTextColor(farbe); doc.setCharSpace(sperr); };
  const breite = (s: string) => doc.getTextWidth(s);
  const linie = (x1: number, yy: number, x2: number, farbe = LINIE, dick = 0.2) => { doc.setDrawColor(farbe); doc.setLineWidth(dick); doc.line(x1, yy, x2, yy); };

  const laufkopf = () => {
    const a = teil.vertrag ? opt.fuss : teil.kopf;
    font('stark', 8); doc.text(a, L, 17);
    const wa = breite(a);
    if (teil.vertrag && opt.kopf) { font('text', 8); doc.text(' · ' + opt.kopf, L + wa, 17); }
    doc.addImage(logo, 'PNG', R - 9, 11, 9, 9);
    linie(L, 24, R);
    y = 32;
  };
  const merke = () => { nrImTeil++; seiten.push({ seite: doc.getNumberOfPages(), fuss: teil.fuss, nr: nrImTeil, teil: teilNr }); };
  const neueSeite = () => { doc.addPage(); merke(); laufkopf(); };
  const platz = (h: number) => { if (y + h > BOTTOM) neueSeite(); };

  /** Fließtext mit gemischten Schriften, Wort für Wort umbrochen. */
  const fliess = (teile: { text: string; f: Schrift }[], x: number, w: number, size: number, farbe = INK, zeile = 1.5) => {
    const lh = mm(size) * zeile;
    platz(lh);
    let cx = x;
    for (const t of teile) {
      font(t.f, size, farbe);
      const leer = breite(' ');
      for (const wort of t.text.split(/\s+/).filter(Boolean)) {
        const ww = breite(wort);
        if (cx > x && cx + ww > x + w) { y += lh; platz(lh); cx = x; font(t.f, size, farbe); }
        doc.text(wort, cx, y);
        cx += ww + leer;
      }
    }
    y += lh;
  };
  const label = (s: string, x: number, yy: number, size = 6.5, farbe = BLAU) => { font('stark', size, farbe, 0.32); doc.text(s, x, yy); doc.setCharSpace(0); };

  merke();

  for (let n = 0; n < blocks.length; n++) {
    const b = blocks[n];

    if (b.t === 'kopf') {
      label(b.marke, L, 14.6, 7);
      font('kopf', 23); doc.text(b.titel, L, 26);
      font('text', 8.5, GRAU); doc.text(b.ort, L, 32.6);
      doc.addImage(logo, 'PNG', R - 17.5, 13.5, 17.5, 17.5);
      linie(L, 38.4, R, HELL, 0.55);
      y = 44;
    }

    else if (b.t === 'parteien') {
      const bw = 81, h = Math.max(26.5, 15 + Math.max(b.a.zeilen.length, b.b.zeilen.length) * 4.6);
      [[L, b.a] as const, [R - bw, b.b] as const].forEach(([x, p]) => {
        doc.setFillColor(FLAECHE); doc.rect(x, y, bw, h, 'F');
        label(p.label, x + 4, y + 6.2);
        font('kopf', 10.5); doc.text(p.name || ' ', x + 4, y + 11.4);
        font('text', 9.5); p.zeilen.forEach((z, k) => doc.text(z, x + 4, y + 16.6 + k * 4.6));
      });
      font('text', 8.5, GRAU); doc.text('und', 105, y + h / 2 + 1, { align: 'center' });
      y += h + 4.4;
      font('text', 7.6, GRAU); doc.text(b.nach, L, y);
      y += 8;
    }

    else if (b.t === 'h') {
      platz(22);
      if (b.nr) { y += 2.5; font('kopf', 11.5); doc.text(b.nr, L, y); doc.text(b.text, X, y); y += 6.4; }
      else { y += 3.5; font('kopf', 10.5); doc.text(b.text, L, y); y += 5.6; }
    }

    else if (b.t === 'p') { const x = teil.vertrag ? X : L; fliess([{ text: b.text, f: 'text' }], x, R - x - 2, teil.vertrag ? 9.5 : 9); y += 1.6; }

    else if (b.t === 'yacht') {
      const h = 26.4, mx = 111; platz(h + 4); y += 0.3;
      doc.setDrawColor(LINIE); doc.setLineWidth(0.25); doc.roundedRect(X, y, W, h, 0.8, 0.8, 'S');
      linie(X, y + h / 2, R); doc.line(mx, y, mx, y + h);
      const zelle = (lab: string, wert: string, x: number, yy: number, rechts = false) => {
        font('stark', 6.5);
        const wl = breite(lab) + 0.32 * (lab.length - 1);   // Breite mit Sperrung, damit das Etikett rechts bündig sitzt
        label(lab, rechts ? x - wl : x, yy + 5.4);
        font('kopf', 10.5); if (wert) doc.text(wert, x, yy + 10.2, { align: rechts ? 'right' : 'left' });
      };
      zelle('YACHTTYP', b.typ, X + 4, y); zelle('YACHTNAME', b.name, mx + 4, y);
      zelle('STARTHAFEN', b.von, X + 4, y + h / 2); zelle('ZIELHAFEN', b.nach, mx - 4, y + h / 2, true);
      zelle('GEPLANTER STARTTERMIN', b.start, mx + 4, y + h / 2);
      font('kopf', 10.5);
      const x1 = X + 4 + breite(b.von) + 4, x2 = mx - 4 - breite(b.nach) - 4, py = y + h / 2 + 8.9;
      if (x2 - x1 > 6) { linie(x1, py, x2 - 1.2, HELL, 0.35); doc.setFillColor(HELL); doc.triangle(x2, py, x2 - 2, py - 0.9, x2 - 2, py + 0.9, 'F'); }
      y += h + 5;
    }

    else if (b.t === 'summe') {
      const h = 18.4; platz(h + 6);
      doc.setFillColor(FLAECHE); doc.rect(X, y, W, h, 'F'); doc.setFillColor(HELL); doc.rect(X, y, 0.9, h, 'F');
      label(b.titel, X + 5.6, y + 7.6); font('text', 8.5); doc.text(b.sub, X + 5.6, y + 12);
      font('kopf', 15.5);
      const wb = breite(b.brutto || ' '), xb = R - 5, xn = xb - wb - 6;
      if (b.brutto) doc.text(b.brutto, xb, y + 9.2, { align: 'right' });
      if (b.netto) doc.text(b.netto, xn, y + 9.2, { align: 'right' });
      font('text', 7.6); doc.text('brutto', xb, y + 14, { align: 'right' }); doc.text('netto', xn, y + 14, { align: 'right' });
      y += h + 6;
    }

    else if (b.t === 'label') {
      // Eine Zwischenüberschrift steht nie allein am Seitenende: Platz für die folgende Tabelle mit prüfen.
      const folgt = blocks[n + 1];
      platz(10 + (folgt?.t === 'tabelle' ? folgt.zeilen.reduce((s, z) => s + (z.sub ? 5.6 : 7.2), 4) : 10));
      // Zwischenüberschrift: fett in Manrope, mit kräftiger Linie darunter, die die Tabelle oben abschließt
      y += 1.2; font('kopf', 10.5); doc.text(b.text, X, y); y += 2.4;
      linie(X, y, R, INK, 0.35);
    }

    else if (b.t === 'tabelle') {
      b.zeilen.forEach((z, k) => {
        const h = z.sub ? 5.6 : 7.2, gr = z.sub ? 7.6 : 9.5, by = y + h - (z.sub ? 1.9 : 2.3);
        font('text', gr); const xk = X + (z.sub ? 5 : 0); doc.text(z.k, xk, by);
        if (z.zusatz) { const w1 = breite(z.k); font('text', gr - 1); doc.text(z.zusatz, xk + w1, by); }
        font('text', gr); const wz = z.vz ? breite(z.vz) : 0;
        if (z.vz) doc.text(z.vz, R, by, { align: 'right' });
        font(z.sub ? 'text' : 'stark', gr); if (z.v) doc.text(z.v, R - wz, by, { align: 'right' });
        y += h;
        if (k === b.zeilen.length - 1) linie(X, y, R, INK, 0.35); else linie(X, y, R);
      });
      y += 5;
    }

    else if (b.t === 'klein') {
      for (const p of b.punkte) { fliess([{ text: p.s, f: 'stark' }, { text: p.text, f: 'text' }], X, W, 7.8, INK, 1.48); y += 0.9; }
      y += 3.6;
    }

    else if (b.t === 'karten') {
      const kw = (W - 3) / 2, innen = kw - 8.4;
      font('text', 8.5);
      const texte = b.karten.map((k) => doc.splitTextToSize(k.text, innen) as string[]);
      const h = 21.5 + Math.max(...texte.map((t) => t.length)) * 4.3;
      platz(h + 4);
      b.karten.forEach((k, i) => {
        const x = X + i * (kw + 3);
        doc.setDrawColor(LINIE); doc.setLineWidth(0.25); doc.roundedRect(x, y, kw, h, 0.8, 0.8, 'S');
        doc.setFillColor(i === 0 ? HELL : BLAU); doc.rect(x, y, kw, 0.9, 'F');
        label(k.kopf, x + 4.2, y + 6.4);
        font('text', 8); doc.text(k.sub, x + 4.2, y + 10.2);
        font('kopf', 14); doc.text(k.betrag, x + 4.2, y + 17.6);
        const wb = breite(k.betrag); font('text', 8, GRAU); doc.text('brutto', x + 4.2 + wb + 1.6, y + 17.6);
        font('text', 8.5); doc.text(texte[i], x + 4.2, y + 23.4, { lineHeightFactor: 1.42 });
      });
      y += h + 5;
    }

    else if (b.t === 'unterschrift') {
      const h = 42; platz(h + 6);
      y = Math.max(y + 8, BOTTOM - h - 2);   // die Unterschriften stehen unten auf der Seite
      const halb = (R - L) / 2 - 6, x2 = L + (R - L) / 2 + 6;
      ([[L, b.links], [x2, b.rechts]] as const).forEach(([x, s]) => {
        label(s.label, x, y);
        font('text', 10); if (s.ort) doc.text(s.ort, x, y + 9.4);
        linie(x, y + 12.4, x + halb, INK, 0.25); font('text', 7.6, GRAU); doc.text('Ort, Datum', x, y + 16.2);
        linie(x, y + 34, x + halb, INK, 0.25); font('text', 7.6, GRAU); doc.text(s.name, x, y + 37.8);
      });
      if (b.bild) {
        try {
          const pr = doc.getImageProperties(b.bild);
          const bw = Math.min(50, (15 * pr.width) / pr.height), bh = (bw * pr.height) / pr.width;
          doc.addImage(b.bild, x2, y + 33.4 - bh, bw, bh);
        } catch { /* Bild nicht lesbar: Feld bleibt zum Unterschreiben frei */ }
      }
      y += h;
    }

    else if (b.t === 'seite') {
      teil = { fuss: b.fuss, kopf: b.kopf, vertrag: false }; teilNr++; nrImTeil = 0;
      doc.addPage(); merke(); laufkopf();
    }

    else if (b.t === 'titel') { font('kopf', 16); doc.text(b.text, L, y + 3); y += 9; }

    else if (b.t === 'nr') {
      platz(5); font('text', 9); doc.text(b.nr, L, y);
      fliess([{ text: b.text, f: 'text' }], L + 7, R - L - 9, 9); y += 1.2;
    }

    else if (b.t === 'punkte') {
      for (const p of b.liste) { platz(5); font('text', 9); doc.text('•', L + 8, y); fliess([{ text: p, f: 'text' }], L + 13, R - L - 15, 9); }
      y += 1.2;
    }
  }

  for (const s of seiten) {
    doc.setPage(s.seite);
    const von = seiten.filter((x) => x.teil === s.teil).length;
    linie(L, 280.6, R);
    font('text', 7.6);
    const links = `${s.fuss} · ${opt.firma}`;
    doc.text(opt.entwurf && breite(links) > 62 ? s.fuss : links, L, 286.4);   // sonst läuft der Text in den Entwurfsvermerk
    doc.text(`Seite ${s.nr} von ${von}`, R, 286.4, { align: 'right' });
    if (opt.entwurf) { font('stark', 7.6, ROT, 0.25); doc.text('ENTWURF – noch nicht juristisch geprüft', 105, 286.4, { align: 'center' }); doc.setCharSpace(0); }
  }
  return doc.output('blob');
}
