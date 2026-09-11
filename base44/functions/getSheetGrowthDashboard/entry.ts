import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

const readSheet = async (accessToken, spreadsheetId, range) => {
  const url = `${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) return null; // tab missing or unreadable
  const data = await res.json();
  return data.values || [];
};

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets');
    const spreadsheetId = secrets.get('GOOGLE_SHEETS_SPREADSHEET_ID');

    const [summaryRows, snapshotRows] = await Promise.all([
      readSheet(accessToken, spreadsheetId, 'Weekly Metrics!A1:I1000'),
      readSheet(accessToken, spreadsheetId, 'Project Snapshots!A1:F5000'),
    ]);

    // Weekly metrics — one row per week, later duplicates (re-runs) win
    const weeklyMap = new Map();
    (summaryRows || []).forEach((r) => {
      if (!r[0] || !/^\d{4}-\d{2}-\d{2}$/.test(r[0])) return;
      weeklyMap.set(r[0], {
        week: r[0],
        total: toNum(r[1]),
        newProjects: toNum(r[2]),
        building: toNum(r[3]),
        ready: toNum(r[4]),
        published: toNum(r[5]),
        avgProgress: toNum(r[6]),
        activities: toNum(r[7]),
      });
    });
    const weekly = Array.from(weeklyMap.values()).sort((a, b) =>
      a.week.localeCompare(b.week)
    );

    // Per-project progress history across weekly snapshots
    const byProject = new Map();
    (snapshotRows || []).forEach((r) => {
      const week = r[0];
      const name = (r[1] || '').trim();
      if (!week || !/^\d{4}-\d{2}-\d{2}$/.test(week) || !name) return;
      if (!byProject.has(name)) byProject.set(name, new Map());
      byProject.get(name).set(week, { week, progress: toNum(r[4]), status: r[3] || '' });
    });
    const projectTrends = Array.from(byProject.entries())
      .map(([name, weekMap]) => {
        const points = Array.from(weekMap.values()).sort((a, b) =>
          a.week.localeCompare(b.week)
        );
        return { name, points, latestWeek: points[points.length - 1].week };
      })
      .sort((a, b) => b.latestWeek.localeCompare(a.latestWeek))
      .slice(0, 15);

    return Response.json({ ok: true, weekly, projectTrends });
  } catch (error) {
    console.error('getSheetGrowthDashboard failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}