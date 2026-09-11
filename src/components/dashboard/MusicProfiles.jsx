import React, { useState, useEffect, useCallback } from "react";
import { Music, Plus, X, BadgeCheck, Disc3, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { Image } from "@/components/ui/image";

const PLATFORMS = [
  { id: "spotify", label: "Spotify" },
  { id: "apple_music", label: "Apple Music" },
  { id: "deezer", label: "Deezer" },
  { id: "soundcloud", label: "SoundCloud" },
  { id: "amazon_music", label: "Amazon Music" },
];
const platformLabel = (id) =>
  (PLATFORMS.find((p) => p.id === id) || {}).label || id;

function parseProfile(platform, input) {
  const s = (input || "").trim();
  if (!s) return null;

  if (platform === "spotify") {
    const m = s.match(/artist\/([A-Za-z0-9]+)/);
    const id = m ? m[1] : /^[A-Za-z0-9]{22}$/.test(s) ? s : null;
    if (!id) return null;
    return { artist_id: id, profile_url: `https://open.spotify.com/artist/${id}` };
  }
  if (platform === "deezer") {
    const m = s.match(/artist\/(\d+)/);
    const id = m ? m[1] : /^\d+$/.test(s) ? s : null;
    if (!id) return null;
    return { artist_id: id, profile_url: `https://www.deezer.com/artist/${id}` };
  }
  if (platform === "apple_music") {
    const m = s.match(/artist\/[^/]+\/(\d+)/);
    if (!/music\.apple\.com/i.test(s) || !m) return null;
    return { artist_id: m[1], profile_url: s };
  }
  if (platform === "soundcloud") {
    const m = s.match(/^https?:\/\/soundcloud\.com\/([A-Za-z0-9_-]+)/i);
    const handle = m ? m[1] : /^[A-Za-z0-9_-]+$/.test(s) ? s : null;
    if (!handle) return null;
    return { artist_id: handle, profile_url: `https://soundcloud.com/${handle}` };
  }
  if (platform === "amazon_music") {
    if (!/^https?:\/\/music\.amazon\.com\//i.test(s)) return null;
    return { artist_id: null, profile_url: s };
  }
  return null;
}

const fmtCount = (n) =>
  typeof n === "number" ? new Intl.NumberFormat().format(n) : null;

export default function MusicProfiles() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState("spotify");
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    base44.functions
      .invoke("getMusicProfileStats", {})
      .then((res) => setData(res.data))
      .catch(() => setData({ profiles: [] }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    const parsed = parseProfile(platform, input);
    if (!parsed) {
      toast({ title: t("mp.invalid") });
      return;
    }
    setAdding(true);
    try {
      await base44.entities.MusicProfile.create({
        platform,
        artist_id: parsed.artist_id || "",
        profile_url: parsed.profile_url,
      });
      setInput("");
      load();
    } catch {
      toast({ title: t("mp.addFailTitle"), description: t("mp.addFailDesc") });
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (recordId) => {
    try {
      await base44.entities.MusicProfile.delete(recordId);
    } catch {}
    load();
  };

  const profiles = (data && data.profiles) || [];

  return (
    <section className="rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="flex items-center gap-2 text-base font-medium text-white">
            <Music className="w-4 h-4" /> {t("mp.title")}
          </h2>
          <p className="mt-1 text-xs text-white/45">{t("mp.subtitle")}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-white/[0.03] border border-white/10 p-4">
        <h3 className="flex items-center gap-2 text-sm font-medium text-white">
          <BadgeCheck className="w-4 h-4 text-sky-400" /> {t("mp.bioTitle")}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          {t("mp.bio")}
        </p>
      </div>

      <div className="mt-4 flex gap-1.5 flex-wrap">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPlatform(p.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              platform === p.id
                ? "bg-white text-black"
                : "bg-white/5 text-white/60 hover:text-white border border-white/10"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={t("mp.addPlaceholder")}
          className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25"
        />
        <button
          onClick={handleAdd}
          disabled={adding}
          className="flex items-center gap-1.5 whitespace-nowrap bg-white text-black rounded-full px-4 py-2 text-sm font-medium hover:bg-white/90 disabled:opacity-50 transition-colors"
        >
          <Plus className="w-4 h-4" /> {t("mp.add")}
        </button>
      </div>

      {loading ? (
        <div className="mt-6 flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-white/15 border-t-white rounded-full animate-spin" />
        </div>
      ) : profiles.length === 0 ? (
        <p className="mt-6 text-sm text-white/40">{t("mp.empty")}</p>
      ) : (
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {profiles.map((p) => (
            <div
              key={p.record_id}
              className="relative rounded-xl bg-white/[0.03] border border-white/10 p-4"
            >
              <button
                onClick={() => handleRemove(p.record_id)}
                title="Remove"
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-4 pr-8">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 shrink-0">
                  {p.image ? (
                    <Image src={p.image} alt={p.name || platformLabel(p.platform)} className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                      <Disc3 className="w-6 h-6 text-white/40" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  {p.url ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 font-medium text-white hover:underline truncate"
                    >
                      <span className="truncate">{p.name || platformLabel(p.platform)}</span>
                      <BadgeCheck className="w-4 h-4 text-sky-400 shrink-0" />
                    </a>
                  ) : (
                    <span className="font-medium text-white truncate">
                      {p.name || platformLabel(p.platform)}
                    </span>
                  )}
                  <p className="text-xs text-white/45 mt-0.5">
                    {platformLabel(p.platform)}
                    {p.followers !== null && (
                      <>
                        {" · "}
                        {t("mp.followers")}:{" "}
                        <span className="text-white/70">{fmtCount(p.followers)}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {p.latest_release && (
                <p className="mt-3 text-xs text-white/50 truncate">
                  {t("mp.latestRelease")}:{" "}
                  <a
                    href={p.latest_release.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white/80 hover:underline"
                  >
                    {p.latest_release.name}
                  </a>
                  <span className="text-white/30"> · {p.latest_release.release_date}</span>
                </p>
              )}

              {p.url && (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/70 bg-white/5 border border-white/10 rounded-full hover:text-white hover:border-white/25 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> {t("mp.openProfile")}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}