import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { getDriveAccessToken } from '../../shared/driveUpload.ts';

export default async function(req) {
  try {
    const body = await req.json();
    const { file_id } = body || {};

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!file_id) return Response.json({ error: 'file_id is required' }, { status: 400 });

    const record = await base44.entities.ProjectFile.get(file_id);
    if (!record) return Response.json({ error: 'File not found' }, { status: 404 });

    const accessToken = await getDriveAccessToken(base44);
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(record.drive_file_id)}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } }
    );
    // 404 means the Drive file is already gone — still clean up the record.
    if (!res.ok && res.status !== 404) {
      console.log('Drive delete failed:', (await res.text()).slice(0, 300));
      return Response.json({ error: 'Could not delete the file from Drive' }, { status: 500 });
    }

    await base44.entities.ProjectFile.delete(file_id);
    return Response.json({ ok: true });
  } catch (error) {
    console.log('deleteProjectFileFromDrive error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}