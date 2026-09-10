import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { getDriveAccessToken } from '../../shared/driveUpload.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }
    const fileId = String(body.file_id || '');
    if (!fileId) return Response.json({ error: 'file_id is required' }, { status: 400 });

    const record = await base44.entities.ProjectFile.get(fileId);
    if (!record || !record.drive_file_id) {
      return Response.json({ error: 'File not found' }, { status: 404 });
    }

    const accessToken = await getDriveAccessToken(base44);

    // Make the file viewable by anyone with the link so the whole team
    // can preview it inside the dashboard. Idempotent: a second call for an
    // already-shared file returns an "already exists" style error, which we ignore.
    const permRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${record.drive_file_id}/permissions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'reader', type: 'anyone' }),
      }
    );
    if (!permRes.ok) {
      const detail = await permRes.text();
      if (!/already|existing/i.test(detail)) {
        console.log('getDriveFilePreviewUrl permission error:', detail.slice(0, 300));
        return Response.json({ error: 'Could not enable preview for this file' }, { status: 502 });
      }
    }

    return Response.json({
      preview_url: `https://drive.google.com/file/d/${record.drive_file_id}/preview`,
    });
  } catch (error) {
    console.log('getDriveFilePreviewUrl error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}