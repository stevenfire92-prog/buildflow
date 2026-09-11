import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { uploadToDrive, findOrCreateDriveFolder, getDriveAccessToken } from '../../shared/driveUpload.ts';

const RUN_KEY = 'bf-project-autosave-9d1f';
const SNAPSHOT_NAME = 'Project Snapshot.json';

export default async function(req) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }
    if (!body || body.run_key !== RUN_KEY) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const projectId = body.project_id;
    if (!projectId || typeof projectId !== 'string') {
      return Response.json({ error: 'project_id is required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    let project;
    try {
      project = await base44.asServiceRole.entities.Project.get(projectId);
    } catch (e) {
      // Deleted projects keep their last snapshot; nothing to save
      return Response.json({ ok: true, skipped: true, reason: 'project not found' });
    }

    const accessToken = await getDriveAccessToken(base44);
    const folderId = await findOrCreateDriveFolder(accessToken, project.name);

    // Replace the previous snapshot so each project keeps exactly one current file
    const query = encodeURIComponent(
      `name = '${SNAPSHOT_NAME}' and '${folderId}' in parents and trashed = false`
    );
    const listRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (listRes.ok) {
      const found = await listRes.json();
      for (const file of found.files || []) {
        await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }
    }

    const payload = {
      saved_at: new Date().toISOString(),
      project: project,
    };
    const bytes = new TextEncoder().encode(JSON.stringify(payload, null, 2));
    const saved = await uploadToDrive(accessToken, SNAPSHOT_NAME, 'application/json', bytes, folderId);

    return Response.json({
      ok: true,
      project: project.name,
      drive_file_id: saved.id,
      drive_link: saved.webViewLink || '',
    });
  } catch (error) {
    console.log('backupProjectToDrive error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}