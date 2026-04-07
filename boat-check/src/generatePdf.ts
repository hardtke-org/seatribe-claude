import jsPDF from 'jspdf';
import type { AppData, SkipperInfo } from './types';
import { getImage } from './imageStore';

const MARGIN = 15;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;

function normalizeImage(dataUrl: string, maxMm: number): Promise<{ dataUrl: string; wMm: number; hMm: number }> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(1, maxMm / (img.width / 3.7795));
      const wPx = img.width * ratio;
      const hPx = img.height * ratio;
      const canvas = document.createElement('canvas');
      canvas.width = wPx;
      canvas.height = hPx;
      canvas.getContext('2d')!.drawImage(img, 0, 0, wPx, hPx);
      resolve({
        dataUrl: canvas.toDataURL('image/jpeg', 0.82),
        wMm: wPx / 3.7795,
        hMm: hPx / 3.7795,
      });
    };
    img.src = dataUrl;
  });
}

export async function generatePdf(appData: AppData, skipper: SkipperInfo): Promise<string> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const date = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  let y = MARGIN;

  function checkPage(needed: number) {
    if (y + needed > PAGE_H - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  }

  // --- Header ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, PAGE_W, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SEATRIBE DELIVERIES', MARGIN, 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Bootsübernahme-Check', MARGIN, 19);
  y = 36;

  // --- Skipper info box ---
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(MARGIN, y, CONTENT_W, 38, 3, 3, 'F');

  const col1 = MARGIN + 5;
  const col2 = MARGIN + CONTENT_W / 2 + 5;
  const lineH = 7;
  let iy = y + 8;

  function infoRow(label: string, value: string, x: number, yy: number) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(label.toUpperCase(), x, yy);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(value, x, yy + 4);
  }

  infoRow('Skipper', skipper.name, col1, iy);
  infoRow('Auftrags-ID', skipper.auftragId, col2, iy);
  iy += lineH + 4;
  infoRow('Bootstyp', skipper.bootstyp, col1, iy);
  infoRow('Datum', date, col2, iy);
  iy += lineH + 4;
  infoRow('Starthafen', skipper.starthafen, col1, iy);
  infoRow('Zielhafen', skipper.zielhafen, col2, iy);

  y += 44;

  // --- Tasks grouped by cluster ---
  const clusters = [...appData.clusters].sort((a, b) => a.order - b.order);

  for (const cluster of clusters) {
    const tasks = appData.tasks
      .filter(t => t.clusterId === cluster.id)
      .sort((a, b) => a.order - b.order);

    if (tasks.length === 0) continue;

    checkPage(12);

    // Cluster heading
    doc.setFillColor(226, 232, 240); // slate-200
    doc.rect(MARGIN, y, CONTENT_W, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85); // slate-700
    doc.text(cluster.title.toUpperCase(), MARGIN + 3, y + 5);
    y += 10;

    for (const task of tasks) {
      const isDone = task.status === 'done';
      const isSkip = task.status === 'skip';

      // Fetch images
      const imageIds = task.imageIds ?? [];
      const loadedImages: { dataUrl: string; wMm: number; hMm: number }[] = [];
      for (const id of imageIds) {
        const raw = await getImage(id);
        if (raw) {
          const normalized = await normalizeImage(raw, 55);
          loadedImages.push(normalized);
        }
      }

      const imagesRowH = loadedImages.length > 0 ? Math.max(...loadedImages.map(i => i.hMm)) + 4 : 0;
      const noteH = task.note ? 6 : 0;
      const rowH = 8 + noteH + imagesRowH;

      checkPage(rowH + 2);

      // Status badge
      if (isDone) {
        doc.setTextColor(5, 150, 105); // emerald-600
      } else {
        doc.setTextColor(161, 161, 170); // zinc-400
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(isDone ? '✓' : '→', MARGIN + 1, y + 5.5);

      // Task title
      doc.setFont('helvetica', isDone ? 'normal' : 'normal');
      doc.setFontSize(9);
      doc.setTextColor(isDone ? 100 : isSkip ? 148 : 30, isDone ? 116 : isSkip ? 163 : 41, isDone ? 139 : isSkip ? 173 : 59);
      doc.text(task.title, MARGIN + 7, y + 5.5);

      // Status label right-aligned
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      const statusLabel = isDone ? 'Erledigt' : 'Übersprungen';
      doc.setTextColor(isDone ? 5 : 161, isDone ? 150 : 161, isDone ? 105 : 170);
      doc.text(statusLabel, PAGE_W - MARGIN - doc.getTextWidth(statusLabel), y + 5.5);

      let subY = y + 8;

      // Note
      if (task.note) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Notiz: ${task.note}`, MARGIN + 7, subY);
        subY += 6;
      }

      // Images
      if (loadedImages.length > 0) {
        let imgX = MARGIN + 7;
        for (const img of loadedImages) {
          doc.addImage(img.dataUrl, 'JPEG', imgX, subY, img.wMm, img.hMm);
          imgX += img.wMm + 2;
        }
        subY += imagesRowH;
      }

      y = subY + 2;

      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.line(MARGIN, y, PAGE_W - MARGIN, y);
      y += 2;
    }

    y += 4;
  }

  // --- Footer on each page ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Seite ${i} von ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 8, { align: 'right' });
    doc.text('Seatribe Deliveries GmbH', MARGIN, PAGE_H - 8);
  }

  return doc.output('datauristring').split(',')[1]; // base64 only
}
