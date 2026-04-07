import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pdf, skipper } = req.body as {
      pdf: string;
      skipper: { name: string; auftragId: string; bootstyp: string; starthafen: string; zielhafen: string };
    };

    const date = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    await resend.emails.send({
      from: 'Bootsübernahme-Check <checklist@seatribe-deliveries.com>',
      to: 'delivery@seatribe-deliveries.com',
      subject: `Übergabe-Check: ${skipper.name} | ${skipper.auftragId} | ${date}`,
      html: `
        <h2>Neue Übergabe-Checkliste eingereicht</h2>
        <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
          <tr><td style="color:#64748b;font-weight:bold">Skipper</td><td>${skipper.name}</td></tr>
          <tr><td style="color:#64748b;font-weight:bold">Auftrags-ID</td><td>${skipper.auftragId}</td></tr>
          <tr><td style="color:#64748b;font-weight:bold">Bootstyp</td><td>${skipper.bootstyp}</td></tr>
          <tr><td style="color:#64748b;font-weight:bold">Starthafen</td><td>${skipper.starthafen}</td></tr>
          <tr><td style="color:#64748b;font-weight:bold">Zielhafen</td><td>${skipper.zielhafen}</td></tr>
          <tr><td style="color:#64748b;font-weight:bold">Datum</td><td>${date}</td></tr>
        </table>
        <p style="margin-top:16px;color:#64748b;font-size:12px">Das vollständige PDF ist als Anhang beigefügt.</p>
      `,
      attachments: [
        {
          filename: `check-${skipper.auftragId}-${skipper.name.replace(/\s+/g, '-')}.pdf`,
          content: pdf,
        },
      ],
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Fehler beim Senden' });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};
