import { createServer } from 'http';
import { exec } from 'child_process';
import { URL } from 'url';

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:8080';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

const authUrl =
  `https://accounts.google.com/o/oauth2/v2/auth` +
  `?client_id=${CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&access_type=offline` +
  `&prompt=consent`;

console.log('\nÖffne Browser für Google-Login...\n');
exec(`open "${authUrl}"`);

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:8080');
  const code = url.searchParams.get('code');
  if (!code) { res.end('Kein Code gefunden.'); return; }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  const data = await tokenRes.json();

  if (data.refresh_token) {
    console.log('\n✓ Refresh Token erhalten!\n');
    console.log('GOOGLE_OAUTH_CLIENT_ID=' + CLIENT_ID);
    console.log('GOOGLE_OAUTH_CLIENT_SECRET=' + CLIENT_SECRET);
    console.log('GOOGLE_OAUTH_REFRESH_TOKEN=' + data.refresh_token);
    console.log('\nDiese drei Werte in Vercel als Environment Variables eintragen.\n');
    res.end('<h2>Fertig! Du kannst dieses Fenster schließen.</h2>');
  } else {
    console.error('Fehler:', data);
    res.end('<h2>Fehler beim Abrufen des Tokens. Siehe Terminal.</h2>');
  }

  server.close();
});

server.listen(8080, () => {
  console.log('Warte auf Google-Callback auf Port 8080...');
});
