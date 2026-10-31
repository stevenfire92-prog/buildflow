import React, { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { client } from "@/api/localClient";
import { logActivity } from "@/lib/activityLog";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const timeAgo = (dateStr, t) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return t("act.justNow");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("act.minutesAgo").replace("{n}", minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("act.hoursAgo").replace("{n}", hours);
  const days = Math.floor(hours / 24);
  return days === 1 ? t("act.yesterday") : t("act.daysAgo").replace("{n}", days);
};

export default function ProjectComments({ projectId, projectName }) {
  const { t } = useLanguage();
  const [comments, setComments] = useState(null);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [me, setMe] = useState(null);

  useEffect(() => {
    client.entities.Comment
      .filter({ project_id: projectId }, "created_date", 100)
      .then(setComments)
      .catch(() => setComments([]));
    client.auth.me().then(setMe).catch(() => setMe(null));
  }, [projectId]);

  const handlePost = async () => {
    const value = text.trim();
    if (!value || posting) return;
    setPosting(true);
    try {
      const created = await client.entities.Comment.create({
        project_id: projectId,
        project_name: projectName || "",
        author_name: me?.full_name || me?.email || "Someone",
        author_email: me?.email || "",
        text: value,
      });
      setComments((prev) => [...(prev || []), created]);
      setText("");
      logActivity({
        action: "commented",
        projectName,
        projectId,
        details: value.length > 80 ? `${value.slice(0, 77)}…` : value,
      });
    } catch {
      // failed post — keep the text so nothing is lost
    }
    setPosting(false);
  };

  return (
    <div className="mt-3">
      {comments === null ? (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-4 border-white/10 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {comments.length > 0 && (
            <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
              {comments.map((c) => (
                <div key={c.id} className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                  <p className="text-xs text-white/45">
                    <span className="font-medium text-white/70">{c.author_name}</span> · {timeAgo(c.created_date, t)}
                  </p>
                  <p className="mt-0.5 text-sm text-white/80 whitespace-pre-wrap">{c.text}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePost()}
              placeholder={t("cmt.placeholder")}
              className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
            />
            <button
              onClick={handlePost}
              disabled={posting || !text.trim()}
              className="px-3 rounded-xl text-black bg-white hover:bg-white/90 transition-colors disabled:opacity-40 flex items-center justify-center"
              aria-label="Post comment"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}