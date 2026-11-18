import type { Block } from './contract';

async function dataUrl(url: string): Promise<string> {
  const blob = await (await fetch(url)).blob();
  return new Promise((ok, fail) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = fail; r.readAsDataURL(blob); });
}

/** Setzt die Bausteine als A4-PDF. Die Schrift wird eingebettet, damit Umlaute und das Euro-Zeichen überall gleich aussehen. */
export async function renderPdf(blocks: Block[], opt: { fuss: string; entwurf: boolean }): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  for (const [datei, stil] of [['Manrope-Regular.ttf', 'normal'], ['Manrope-Bold.ttf', 'bold']] as const) {
    const b64 = (await dataUrl('/fonts/' + datei)).split(',')[1];
    doc.addFileToVFS(datei, b64);
    doc.addFont(datei, 'Manrope', stil);
  }
  const logo = await dataUrl('/logo-192.png');

  const L = 22, R = 188, W = R - L, TOP = 24, BOTTOM = 272;
  const INK = '#0f2534', MUTED = '#6b7a85', LINE = '#c9d2d9';
  let y = TOP, fuss = opt.fuss, seiteImTeil = 1;
  const marken: { seite: number; fuss: string; nr: number }[] = [];
  const merke = () => marken.push({ seite: doc.getNumberOfPages(), fuss, nr: seiteImTeil });
  const neueSeite = () => { merke(); doc.addPage(); y = TOP; seiteImTeil++; };
  const platz = (h: number) => { if (y + h > BOTTOM) neueSeite(); };
  const font = (stil: 'normal' | 'bold', size: number, farbe = INK) => { doc.setFont('Manrope', stil); doc.setFontSize(size); doc.setTextColor(farbe); };
  const absatz = (text: string, x: number, breite: number, size = 10, stil: 'normal' | 'bold' = 'normal', align: 'left' | 'center' = 'left') => {
    font(stil, size);
    const lh = size * 0.5;
    for (const zeile of doc.splitTextToSize(text, breite) as string[]) {
      platz(lh);
      doc.text(zeile, align === 'center' ? x + breite / 2 : x, y, { align });
      y += lh;
    }
  };

  doc.addImage(logo, 'PNG', L, 12, 16, 16);
  y = 36;

  for (const b of blocks) {
    if (b.t === 'titel') { y += 2; absatz(b.text, L, W, 16, 'bold', 'center'); y += 4; }
    else if (b.t === 'mitte') { absatz(b.text, L, W, 10, 'normal', 'center'); y += 3; }
    else if (b.t === 'h') { platz(16); y += 5; absatz(b.text, L, W, 11.5, 'bold'); y += 1.5; }
    else if (b.t === 'h2') { platz(12); y += 2; absatz(b.text, L, W, 10, 'bold'); y += 1; }
    else if (b.t === 'p') { absatz(b.text, L, W); y += 2.5; }
    else if (b.t === 'nr') {
      platz(5); font('normal', 10); doc.text(b.nr, L, y);
      absatz(b.text, L + 7, W - 7); y += 2;
    }
    else if (b.t === 'punkte') { for (const p of b.liste) { platz(5); font('normal', 10); doc.text('•', L + 8, y); absatz(p, L + 13, W - 13); } y += 2; }
    else if (b.t === 'zeilen') {
      for (const [k, v] of b.zeilen) {
        font('normal', 10);
        const links = doc.splitTextToSize(k, 62) as string[], rechts = doc.splitTextToSize(v || ' ', W - 68) as string[];
        const h = Math.max(links.length, rechts.length) * 5 + 2.5;
        platz(h);
        font('normal', 10, MUTED); doc.text(links, L + 2, y);
        font('bold', 10); doc.text(rechts, L + 68, y);
        y += h - 2.5;
        doc.setDrawColor(LINE); doc.setLineWidth(0.2); doc.line(L, y - 2.2, R, y - 2.2);
        y += 1.5;
      }
      y += 2;
    }
    else if (b.t === 'unterschrift') {
      platz(48); y += 8;
      const y0 = y, halb = W / 2 - 6, x2 = L + W / 2 + 6, linie = y0 + 30;
      font('normal', 10);
      doc.text(doc.splitTextToSize(b.links.ort, halb) as string[], L, y0);
      doc.text(doc.splitTextToSize(b.rechts.ort, halb) as string[], x2, y0);
      if (b.bild) {
        try {
          const pr = doc.getImageProperties(b.bild);
          const bw = Math.min(50, (16 * pr.width) / pr.height), bh = (bw * pr.height) / pr.width;
          doc.addImage(b.bild, x2, linie - 0.5 - bh, bw, bh);
        } catch { /* Bild nicht lesbar: Feld bleibt zum Unterschreiben frei */ }
      }
      doc.setDrawColor(INK); doc.setLineWidth(0.2);
      doc.line(L, linie, L + halb, linie); doc.line(x2, linie, R, linie);
      font('normal', 8.5, MUTED);
      doc.text(b.links.name, L, linie + 4.5); doc.text(b.rechts.name, x2, linie + 4.5);
      y = linie + 10;
    }
    else if (b.t === 'seite') { merke(); doc.addPage(); y = TOP; fuss = b.fuss; seiteImTeil = 1; }
  }
  merke();

  for (const m of marken) {
    doc.setPage(m.seite);
    font('normal', 8, MUTED);
    doc.text(m.fuss, L, 286);
    doc.text('Seite ' + m.nr, R, 286, { align: 'right' });
    if (opt.entwurf) { font('bold', 8, '#96600B'); doc.text('ENTWURF – noch nicht juristisch geprüft', R, 14, { align: 'right' }); }
  }
  return doc.output('blob');
}
