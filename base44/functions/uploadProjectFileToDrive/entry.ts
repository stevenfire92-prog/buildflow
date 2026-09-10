import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { uploadToDrive, getDriveAccessToken, findOrCreateDriveFolder } from '../../shared/driveUpload.ts';

const MAX_BYTES = 100 * 1024 * 1024;

export default async function(req) {
  try {
    const body = await req.json();
    const { file_url, file_name, mime_type, project_id, project_name } = body || {};

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!file_url || !file_name || !project_id) {
      return Response.json({ error: 'file_url, file_name and project_id are required' }, { status: 400 });
    }

    const fileRes = await fetch(file_url);
    if (!fileRes.ok) {
      return Response.json({ error: 'Could not read the uploaded file' }, { status: 400 });
    }
    const bytes = new Uint8Array(await fileRes.arrayBuffer());
    if (bytes.length > MAX_BYTES) {
      return Response.json({ error: 'File is too large (max 100 MB)' }, { status: 400 });
    }

    const accessToken = await getDriveAccessToken(base44);
    const safeName = String(file_name).slice(0, 200);
    const folderId = await findOrCreateDriveFolder(accessToken, project_name || project_id);
    const saved = await uploadToDrive(
      accessToken,
      safeName,
      mime_type || 'application/octet-stream',
      bytes,
      folderId
    );

    const record = await base44.entities.ProjectFile.create({
      project_id: String(project_id),
      project_name: project_name || '',
      file_name: safeName,
      mime_type: saved.mimeType || mime_type || 'application/octet-stream',
      size: saved.size ? Number(saved.size) : bytes.length,
      drive_file_id: saved.id,
      drive_link: saved.webViewLink || '',
      uploaded_by: user.email || '',
    });

    return Response.json({ file: record });
  } catch (error) {
    console.log('uploadProjectFileToDrive error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}