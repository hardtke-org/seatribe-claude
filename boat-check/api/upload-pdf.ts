import { google } from 'googleapis';
import { Readable } from 'stream';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const filename = (req.headers['x-filename'] as string) || 'report.pdf';

    // Read raw binary body (no base64 overhead)
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
    }
    const pdfBuffer = Buffer.concat(chunks);

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    );
    auth.setCredentials({ refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN });
    const drive = google.drive({ version: 'v3', auth });

    const file = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
      },
      media: {
        mimeType: 'application/pdf',
        body: Readable.from(pdfBuffer),
      },
      fields: 'id,webViewLink',
    });

    return res.status(200).json({
      driveLink: file.data.webViewLink,
      fileId: file.data.id,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Upload error:', msg);
    return res.status(500).json({ error: msg });
  }
}

export const config = {
  api: {
    bodyParser: false, // receive raw binary
    sizeLimit: '10mb',
  },
};
