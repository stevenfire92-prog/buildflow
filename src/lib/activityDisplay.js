import { Plus, Pencil, ArrowRightLeft, Trash2, MessageSquare, Upload } from "lucide-react";

export const csvEscape = (value) => {
  const str = value == null ? "" : String(value);
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

export const actionConfig = {
  created: { icon: Plus, cls: "text-emerald-400 bg-emerald-500/15", labelKey: "act.created" },
  updated: { icon: Pencil, cls: "text-sky-400 bg-sky-500/15", labelKey: "act.updatedSettings" },
  status_changed: { icon: ArrowRightLeft, cls: "text-amber-400 bg-amber-500/15", labelKey: "act.statusChanged" },
  deleted: { icon: Trash2, cls: "text-red-400 bg-red-500/15", labelKey: "act.deleted" },
  commented: { icon: MessageSquare, cls: "text-violet-400 bg-violet-500/15", labelKey: "act.commented" },
  file_uploaded: { icon: Upload, cls: "text-cyan-400 bg-cyan-500/15", labelKey: "act.fileUploaded" },
};

export const timeAgo = (dateStr, t) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return t("act.justNow");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("act.minutesAgo").replace("{n}", minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("act.hoursAgo").replace("{n}", hours);
  const days = Math.floor(hours / 24);
  return days === 1 ? t("act.yesterday") : t("act.daysAgo").replace("{n}", days);
};