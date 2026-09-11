import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { createMimeMessage } from 'npm:mimetext@2';

const RUN_KEY = 'bf-weekly-gmail-report-7f3c';
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

    const projects = await base44.asServiceRole.entities.Project.list('-updated_date', 100);
    const users = await base44.asServiceRole.entities.User.list();
    const admin = (users || []).find((u) => u.role === 'admin') || (users || [])[0];
    if (!admin || !admin.email) {
      return Response.json({ error: 'No admin user email found' }, { status: 400 });
    }
    const recipients = (users || [])
      .filter((u, idx, arr) => u.email && arr.findIndex((x) => x.email === u.email) === idx)
      .map((u) => ({ email: u.email, name: u.full_name || 'there' }));

    const weekAgo = Date.now() - 7 * DAY_MS;
    const twoWeeksAgo = Date.now() - 14 * DAY_MS;
    const list = projects || [];
    const byStatus = { draft: 0, building: 0, ready: 0, published: 0 };
    let progressSum = 0;
    let newThisWeek = 0;
    let newLastWeek = 0;
    let activeThisWeek = 0;
    for (const p of list) {
      if (byStatus[p.status] !== undefined) byStatus[p.status] += 1;
      progressSum += p.progress || 0;
      const created = new Date(p.created_date).getTime();
      if (created > weekAgo) newThisWeek += 1;
      else if (created > twoWeeksAgo) newLastWeek += 1;
      if (new Date(p.updated_date).getTime() > weekAgo) activeThisWeek += 1;
    }
    const total = list.length;
    const avgProgress = total ? Math.round(progressSum / total) : 0;

    const recentLines = list
      .slice(0, 3)
      .map((p) => {
        const progress = Math.min(100, Math.max(0, p.progress || 0));
        return `- ${p.name} — ${p.status || 'draft'}, ${progress}% built`;
      })
      .join('\n') || '- No projects yet';

    const weekLabel = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const subject = `BuildFlow weekly report — ${weekLabel}`;
    const buildBody = (name) => [
      `Hi ${name},`,
      '',
      `Here is your BuildFlow weekly recap for the week of ${weekLabel}.`,
      '',
      'Activity (last 7 days)',
      `- New projects started: ${newThisWeek} (previous week: ${newLastWeek})`,
      `- Projects updated: ${activeThisWeek}`,
      '',
      'Portfolio',
      `- Total projects: ${total}`,
      `- Draft: ${byStatus.draft} | Building: ${byStatus.building} | Ready: ${byStatus.ready} | Published: ${byStatus.published}`,
      `- Average build progress: ${avgProgress}%`,
      '',
      'Recently active projects',
      recentLines,
      '',
      'You are receiving this because weekly Gmail reports are enabled for your account.',
      '— Se Fire Tech',
    ].join('\n');

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const sent = [];
    const failed = [];
    for (const r of recipients) {
      const msg = createMimeMessage();
      msg.setSender(admin.email);
      msg.setRecipient(r.email);
      msg.setSubject(subject);
      msg.setMessage('text/plain', buildBody(r.name));
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: msg.asEncoded() }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.log(`Gmail send failed for ${r.email}:`, errText);
        failed.push({ to: r.email });
        continue;
      }
      const data = await res.json();
      sent.push({ to: r.email, messageId: data.id });
    }

    return Response.json({
      ok: failed.length === 0,
      sentCount: sent.length,
      failedCount: failed.length,
      sent,
      failed,
      stats: { total, newThisWeek, newLastWeek, activeThisWeek, avgProgress, byStatus },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}