import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { createMimeMessage } from 'npm:mimetext@2';

const RUN_KEY = 'bf-team-activity-alert-9d2e';
const SIGNIFICANT_ACTIONS = ['created', 'status_changed', 'deleted', 'commented', 'file_uploaded'];
const DAY_MS = 24 * 60 * 60 * 1000;

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
    const now = Date.now();

    // Determine the cutoff: everything since the last alert was sent
    const states = await base44.asServiceRole.entities.AlertState.list();
    const state = (states || [])[0];
    const cutoff = state && state.last_sent_at
      ? new Date(state.last_sent_at).getTime()
      : now - DAY_MS;

    const logs = await base44.asServiceRole.entities.ActivityLog.list('-created_date', 100);
    const significant = (logs || []).filter((l) =>
      SIGNIFICANT_ACTIONS.includes(l.action) && new Date(l.created_date).getTime() > cutoff
    );
    const comments = await base44.asServiceRole.entities.Comment.list('-created_date', 100);
    const newComments = (comments || []).filter((c) =>
      new Date(c.created_date).getTime() > cutoff
    );

    if (significant.length === 0 && newComments.length === 0) {
      return Response.json({ ok: true, skipped: true });
    }

    const users = await base44.asServiceRole.entities.User.list();
    const admin = (users || []).find((u) => u.role === 'admin') || (users || [])[0];
    const recipients = (users || []).filter((u) => u.email);
    if (!admin || !admin.email || recipients.length === 0) {
      return Response.json({ error: 'No team members found' }, { status: 400 });
    }

    const fmtTime = (dateStr) =>
      new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const updateLines = significant.map((l) =>
      `- ${l.actor_name || 'Someone'} ${l.action.replace('_', ' ')} "${l.project_name || 'a project'}"${l.details ? ` — ${l.details}` : ''} (${fmtTime(l.created_date)})`
    );
    const commentLines = newComments.map((c) =>
      `- ${c.author_name || 'Someone'} on "${c.project_name || 'a project'}": ${c.text} (${fmtTime(c.created_date)})`
    );

    const dateLabel = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const subject = `BuildFlow activity alert — ${dateLabel}`;
    const bodyText = [
      'Hi team,',
      '',
      'Here is a summary of significant project activity since the last alert.',
      '',
      'Updates',
      ...(updateLines.length ? updateLines : ['- No new updates']),
      '',
      'New comments',
      ...(commentLines.length ? commentLines : ['- No new comments']),
      '',
      'You are receiving this because you are a member of this BuildFlow workspace.',
      '— Se Fire Tech',
    ].join('\n');

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const sendResults = [];
    for (const recipient of recipients) {
      const msg = createMimeMessage();
      msg.setSender(admin.email);
      msg.setRecipient(recipient.email);
      msg.setSubject(subject);
      msg.setMessage('text/plain', bodyText);
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: msg.asEncoded() }),
      });
      if (!res.ok) {
        console.log(`Alert email failed for ${recipient.email}:`, await res.text());
      }
      sendResults.push({ to: recipient.email, ok: res.ok });
    }

    const sentCount = sendResults.filter((r) => r.ok).length;
    if (sentCount > 0) {
      const nowIso = new Date(now).toISOString();
      if (state && state.id) {
        await base44.asServiceRole.entities.AlertState.update(state.id, { last_sent_at: nowIso });
      } else {
        await base44.asServiceRole.entities.AlertState.create({ last_sent_at: nowIso });
      }
    }

    return Response.json({
      ok: true,
      sentTo: sentCount,
      updates: significant.length,
      comments: newComments.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}