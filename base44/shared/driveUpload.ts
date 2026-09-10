const BOUNDARY = 'bf-drive-upload-8f3d2b';

// Finds a Drive folder by name (creating it if missing) and returns its id.
export async function findOrCreateDriveFolder(accessToken, name) {
  const safeName = String(name || 'BuildFlow Files')
    .replace(/[/\\?*<>:"|]/g, '-')
    .slice(0, 100);
  const query = encodeURIComponent(
    `name = '${safeName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );
  const listRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (listRes.ok) {
    const found = await listRes.json();
    if (found.files && found.files.length > 0) return found.files[0].id;
  }
  const createRes = await fetch(
    'https://www.googleapis.com/drive/v3/files?fields=id,name',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: safeName, mimeType: 'application/vnd.google-apps.folder' }),
    }
  );
  if (!createRes.ok) {
    throw new Error(`Drive folder create failed: ${(await createRes.text()).slice(0, 300)}`);
  }
  const created = await createRes.json();
  return created.id;
}

// Uploads bytes to the connected Google Drive account as a new file,
// optionally inside an existing folder (folderId from findOrCreateDriveFolder).
// Returns { id, name, mimeType, size, webViewLink } from the Drive API.
export async function uploadToDrive(accessToken, name, mimeType, bytes, folderId) {
  const metadata = JSON.stringify(folderId ? { name, parents: [folderId] } : { name });
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