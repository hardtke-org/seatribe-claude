import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { skipper, clusters, tasks } = req.body as {
      skipper: { name: string; auftragId: string; bootstyp: string; starthafen: string; zielhafen: string };
      clusters: { id: string; title: string; order: number }[];
      tasks: { id: string; clusterId: string; title: string; note?: string; status: string; order: number }[];
    };

    const date = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const statusLabel = (s: string) => s === 'done' ? '✓ Erledigt' : s === 'skip' ? '→ Übersprungen' : '○ Offen';
    const statusColor = (s: string) => s === 'done' ? '#059669' : s === 'skip' ? '#92400e' : '#64748b';

    const sortedClusters = [...clusters].sort((a, b) => a.order - b.order);

    const clustersHtml = sortedClusters.map(cluster => {
      const clusterTasks = tasks
        .filter(t => t.clusterId === cluster.id)
        .sort((a, b) => a.order - b.order);

      const tasksHtml = clusterTasks.map(t => `
        <tr>
          <td style="padding:6px 8px;font-size:13px;color:${statusColor(t.status)};white-space:nowrap;font-weight:bold">${statusLabel(t.status)}</td>
          <td style="padding:6px 8px;font-size:13px;color:#1e293b">${t.title}${t.note ? `<br><span style="color:#64748b;font-style:italic;font-size:12px">Notiz: ${t.note}</span>` : ''}</td>
        </tr>
      `).join('');

      return `
        <tr><td colspan="2" style="padding:12px 8px 4px;font-size:11px;font-weight:bold;color:#475569;text-transform:uppercase;letter-spacing:0.05em;background:#f1f5f9">${cluster.title}</td></tr>
        ${tasksHtml}
      `;
    }).join('');

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#009FE0;padding:16px 24px;border-radius:8px 8px 0 0">
          <p style="color:#fff;margin:0;font-size:18px;font-weight:bold;line-height:1.2">Bootsübernahme-Check</p>
          <p style="color:#fff;margin:4px 0 0;font-size:13px;opacity:0.85">Seatribe Deliveries</p>
        </div>
        <div style="background:#f8fafc;padding:20px 24px;border:1px solid #e2e8f0">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:4px 0;font-size:13px;color:#64748b;font-weight:bold;width:120px">Skipper</td><td style="padding:4px 0;font-size:13px">${skipper.name}</td></tr>
            <tr><td style="padding:4px 0;font-size:13px;color:#64748b;font-weight:bold">Auftrags-ID</td><td style="padding:4px 0;font-size:13px">${skipper.auftragId}</td></tr>
            <tr><td style="padding:4px 0;font-size:13px;color:#64748b;font-weight:bold">Bootstyp</td><td style="padding:4px 0;font-size:13px">${skipper.bootstyp}</td></tr>
            <tr><td style="padding:4px 0;font-size:13px;color:#64748b;font-weight:bold">Starthafen</td><td style="padding:4px 0;font-size:13px">${skipper.starthafen}</td></tr>
            <tr><td style="padding:4px 0;font-size:13px;color:#64748b;font-weight:bold">Zielhafen</td><td style="padding:4px 0;font-size:13px">${skipper.zielhafen}</td></tr>
            <tr><td style="padding:4px 0;font-size:13px;color:#64748b;font-weight:bold">Datum</td><td style="padding:4px 0;font-size:13px">${date}</td></tr>
          </table>
        </div>
        <div style="border:1px solid #e2e8f0;border-top:none">
          <table style="width:100%;border-collapse:collapse">
            ${clustersHtml}
          </table>
        </div>
        <div style="padding:12px 24px;background:#f1f5f9;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
          <p style="margin:0;font-size:11px;color:#94a3b8">Eingereicht am ${date} · Seatribe Deliveries</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'Bootsübernahme-Check <checklist@seatribe-deliveries.com>',
      to: 'delivery@seatribe-deliveries.com',
      subject: `Übergabe-Check: ${skipper.name} | ${skipper.auftragId} | ${date}`,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Fehler beim Senden' });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } },
};
