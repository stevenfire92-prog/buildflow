const BOUNDARY = 'bf-drive-upload-8f3d2b';

// Uploads bytes to the connected Google Drive account as a new file.
// Returns { id, name, mimeType, size, webViewLink } from the Drive API.
export async function uploadToDrive(accessToken, name, mimeType, bytes) {
  const metadata = JSON.stringify({ name });
  const pre =
    `--${BOUNDARY}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    `${metadata}\r\n` +
    `--${BOUNDARY}\r\n` +
    `Content-Type: ${mimeType}\r\n\r\n`;
  const post = `\r\n--${BOUNDARY}--`;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${BOUNDARY}`,
      },
      body: new Blob([pre, bytes, post]),
    }
  );
  if (!res.ok) {
    throw new Error(`Drive upload failed: ${(await res.text()).slice(0, 300)}`);
  }
  return await res.json();
}

// Returns the OAuth access token of the app's shared Google Drive connection.
export async function getDriveAccessToken(base44) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
  return accessToken;
}