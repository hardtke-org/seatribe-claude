import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { filename } = req.body as { filename: string };

    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    const accessToken = await auth.getAccessToken();

    // Create a resumable upload session – returns a Location URL the client uploads to directly
    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': 'application/pdf',
        },
        body: JSON.stringify({
          name: filename,
          parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
        }),
      }
    );

    const uploadUrl = response.headers.get('location');
    if (!uploadUrl) throw new Error('No upload URL returned');

    return res.status(200).json({ uploadUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Fehler beim Erstellen der Upload-URL' });
  }
}
