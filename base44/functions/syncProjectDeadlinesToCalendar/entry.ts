import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

function getNextDay(dateStr: string): string {
  try {
    const parts = dateStr.split("-").map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const next = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + 1));
      return next.toISOString().slice(0, 10);
    }
  } catch (_) {}
  return dateStr;
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { event_type, project_id, project, old_project } = body;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlecalendar");
    if (!accessToken) {
      return Response.json(
        { error: "Google Calendar connection unavailable. Please ensure Google Calendar is authorized." },
        { status: 400 }
      );
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // Helper to delete an event by ID
    async function deleteCalendarEvent(eventId: string) {
      if (!eventId) return;
      try {
        await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
          { method: "DELETE", headers }
        );
      } catch (_) {}
    }

    // Helper to create or update an event in primary calendar
    async function upsertCalendarEvent(proj: any) {
      if (!proj || !proj.name) return null;

      // If project has no deadline, remove event if one was previously created
      if (!proj.deadline) {
        if (proj.google_calendar_event_id) {
          await deleteCalendarEvent(proj.google_calendar_event_id);
          if (proj.id) {
            await base44.asServiceRole.entities.Project.update(proj.id, {
              google_calendar_event_id: null,
            });
          }
        }
        return { action: "cleared" };
      }

      const cleanDeadline = String(proj.deadline).slice(0, 10);
      const nextDay = getNextDay(cleanDeadline);

      const eventPayload = {
        summary: `🚀 Launch: ${proj.name}`,
        description: [
          `Builder Flow Project Launch Deadline`,
          `Project: ${proj.name}`,
          `Status: ${proj.status || "draft"}`,
          `Progress: ${proj.progress || 0}%`,
          proj.description ? `Description: ${proj.description}` : null,
          proj.goals ? `Goals: ${proj.goals}` : null,
          `Direct Link: https://defiant-build-flow-labs.base44.app/project-details?id=${proj.id}`,
        ]
          .filter(Boolean)
          .join("\n\n"),
        start: { date: cleanDeadline },
        end: { date: nextDay },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 1440 }, // 24h before
            { method: "popup", minutes: 540 },  // Morning of launch
          ],
        },
      };

      let eventId = proj.google_calendar_event_id;
      let res: Response | null = null;

      if (eventId) {
        // Attempt update
        try {
          res = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
            {
              method: "PUT",
              headers,
              body: JSON.stringify(eventPayload),
            }
          );
          if (res.status === 404) {
            // Event was deleted in Google Calendar, re-create below
            res = null;
            eventId = null;
          }
        } catch (_) {
          res = null;
        }
      }

      if (!eventId || !res) {
        res = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
          {
            method: "POST",
            headers,
            body: JSON.stringify(eventPayload),
          }
        );
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Google Calendar API error (${res.status}): ${errText}`);
      }

      const eventData = await res.json();
      const savedEventId = eventData.id;

      if (proj.id && (proj.google_calendar_event_id !== savedEventId || !proj.google_calendar_synced_at)) {
        await base44.asServiceRole.entities.Project.update(proj.id, {
          google_calendar_event_id: savedEventId,
          google_calendar_synced_at: new Date().toISOString(),
        });
      }

      return {
        action: "synced",
        event_id: savedEventId,
        htmlLink: eventData.htmlLink,
        summary: eventPayload.summary,
        deadline: cleanDeadline,
      };
    }

    // Handle delete event from workflow entity trigger
    if (event_type === "delete" || body.action === "delete") {
      const eventId = project?.google_calendar_event_id || old_project?.google_calendar_event_id;
      if (eventId) {
        await deleteCalendarEvent(eventId);
      }
      return Response.json({ success: true, action: "deleted" });
    }

    // Handle single project sync by ID
    const targetId = project_id || project?.id;
    if (targetId && !body.syncAll) {
      const current = await base44.asServiceRole.entities.Project.get(targetId).catch(() => project);
      if (current) {
        const result = await upsertCalendarEvent(current);
        return Response.json({ success: true, result });
      }
    }

    // Default or syncAll: scan all projects with deadlines
    const allProjects = await base44.asServiceRole.entities.Project.list("-updated_date", 100);
    const withDeadlines = allProjects.filter((p: any) => p.deadline);
    const results = [];

    for (const p of withDeadlines) {
      try {
        const r = await upsertCalendarEvent(p);
        results.push({ id: p.id, name: p.name, ...r });
      } catch (err: any) {
        results.push({ id: p.id, name: p.name, error: err.message });
      }
    }

    return Response.json({
      success: true,
      syncedCount: results.filter((r) => r.action === "synced").length,
      totalDeadlines: withDeadlines.length,
      results,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}