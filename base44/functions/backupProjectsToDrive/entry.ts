import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { uploadToDrive, getDriveAccessToken } from '../../shared/driveUpload.ts';

const RUN_KEY = 'bf-drive-backup-5e2a';

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

    const base44 = createClientFromRequest(req);
    const projects = await base44.asServiceRole.entities.Project.list('-updated_date', 500);
    const projectFiles = await base44.asServiceRole.entities.ProjectFile.list('-updated_date', 500);
    const activityLogs = await base44.asServiceRole.entities.ActivityLog.list('-created_date', 500);

    const payload = {
      generated_at: new Date().toISOString(),
      projects: projects || [],
      project_files: projectFiles || [],
      activity_logs: activityLogs || [],
    };
    const bytes = new TextEncoder().encode(JSON.stringify(payload, null, 2));

    const dateLabel = new Date().toISOString().slice(0, 10);
    const accessToken = await getDriveAccessToken(base44);
    const saved = await uploadToDrive(
      accessToken,
      `BuildFlow Backup ${dateLabel}.json`,
      'application/json',
      bytes
    );

    return Response.json({
      ok: true,
      drive_file_id: saved.id,
      drive_link: saved.webViewLink || '',
      projects: (projects || []).length,
      project_files: (projectFiles || []).length,
      activity_logs: (activityLogs || []).length,
    });
  } catch (error) {
    console.log('backupProjectsToDrive error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}