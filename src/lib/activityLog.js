import { base44 } from "@/api/base44Client";

let userPromise = null;
const getCurrentUser = () => {
  if (!userPromise) userPromise = base44.auth.me().catch(() => null);
  return userPromise;
};

// Fire-and-forget: activity logging must never break the action it records.
export async function logActivity({ action, projectName, projectId, details }) {
  try {
    const user = await getCurrentUser();
    await base44.entities.ActivityLog.create({
      action,
      project_name: projectName || "",
      project_id: projectId || "",
      details: details || "",
      actor_name: user?.full_name || user?.email || "Someone",
      actor_email: user?.email || "",
    });
  } catch (e) {
    console.log("Activity log failed:", e);
  }
}