import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { createMimeMessage } from 'npm:mimetext@2';

const RUN_KEY = 'bf-deadline-alert-4c8a';
const DAY_MS = 24 * 60 * 60 * 1000;
const ALERT_WINDOW_DAYS = 3;

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
    const projects = await base44.asServiceRole.entities.Project.list('-updated_date', 200);
    const users = await base44.asServiceRole.entities.User.list();
    const admin = (users || []).find((u) => u.role === 'admin') || (users || [])[0];
    const recipients = (users || []).filter((u) => u.email);
    if (!admin || !admin.email || recipients.length === 0) {
      return Response.json({ error: 'No team members found' }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Active, un-alerted projects whose deadline is within the window (or overdue)
    const due = [];
    for (const p of projects || []) {
      if (!p.deadline || p.status === 'published') continue;
      if (p.deadline_alert_sent === p.deadline) continue; // already alerted for this deadline
      const deadlineDay = new Date(`${p.deadline}T00:00:00`);
      if (Number.isNaN(deadlineDay.getTime())) continue;
      const daysLeft = Math.round((deadlineDay.getTime() - today.getTime()) / DAY_MS);
      if (daysLeft <= ALERT_WINDOW_DAYS) due.push({ project: p, daysLeft });
    }

    if (due.length === 0) {
      return Response.json({ ok: true, skipped: true });
    }

    due.sort((a, b) => a.daysLeft - b.daysLeft);
    const fmtDate = (d) =>
      new Date(`${d}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const lines = due.map(({ project: p, daysLeft }) =>
      daysLeft < 0
        ? `- ${p.name} — OVERDUE, was due ${fmtDate(p.deadline)} (${Math.abs(daysLeft)} day${daysLeft === -1 ? '' : 's'} ago), status: ${p.status}, ${p.progress || 0}% built`
        : `- ${p.name} — due ${fmtDate(p.deadline)}${daysLeft === 0 ? ' (today)' : ` (in ${daysLeft} day${daysLeft === 1 ? '' : 's'})`}, status: ${p.status}, ${p.progress || 0}% built`
    );

    const dateLabel = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const subject = `BuildFlow deadline alert — ${dateLabel}`;
    const bodyText = [
      'Hi team,',
      '',
      'The following project deadlines are approaching or overdue.',
      '',
      ...lines,
      '',
      'You are receiving this because you are a member of this BuildFlow workspace.',
      '— Se Fire Tech',
    ].join('\n');

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    let sentCount = 0;
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
        console.log(`Deadline alert failed for ${recipient.email}:`, await res.text());
      } else {
        sentCount += 1;
      }
    }

    // Mark each project as alerted for this deadline so it is not re-sent daily
    if (sentCount > 0) {
      for (const { project: p } of due) {
        try {
          await base44.asServiceRole.entities.Project.update(p.id, { deadline_alert_sent: p.deadline });
        } catch (e) {
          console.log(`Could not mark deadline alert for ${p.name}:`, e.message);
        }
      }
    }

    return Response.json({
      ok: true,
      sentTo: sentCount,
      alerted: due.map(({ project: p, daysLeft }) => ({ name: p.name, daysLeft })),
    });
  } catch (error) {
    console.log('sendDeadlineAlerts error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}