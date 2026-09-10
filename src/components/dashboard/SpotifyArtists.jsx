import React, { useState, useEffect, useCallback } from "react";
import { Music, Plus, X, BadgeCheck, Disc3 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { Image } from "@/components/ui/image";

const LINK_ID_RE = /artist\/([A-Za-z0-9]+)/;
const RAW_ID_RE = /^[A-Za-z0-9]{22}$/;

function parseArtistId(input) {
  const trimmed = (input || "").trim();
  const match = trimmed.match(LINK_ID_RE);
  if (match) return match[1];
  if (RAW_ID_RE.test(trimmed)) return trimmed;
  return null;
}

const fmtCount = (n) =>
  typeof n === "number" ? new Intl.NumberFormat().format(n) : "—";

export default function SpotifyArtists() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    base44.functions
      .invoke("getSpotifyArtistStats", {})
      .then((res) => setStats(res.data))
      .catch(() => setStats({ artists: [] }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    const artistId = parseArtistId(input);
    if (!artistId) {
      toast({ title: t("spot.invalid") });
      return;
    }
    setAdding(true);
    try {
      await base44.entities.SpotifyArtist.create({ artist_id: artistId });
      setInput("");
      load();
    } catch {
      toast({ title: t("spot.addFailTitle"), description: t("spot.addFailDesc") });
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (recordId) => {
    try {
      await base44.entities.SpotifyArtist.delete(recordId);
    } catch {}
    load();
  };

  const artists = (stats && stats.artists) || [];

  return (
    <section className="rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="flex items-center gap-2 text-base font-medium text-white">
            <Music className="w-4 h-4" /> {t("spot.title")}
          </h2>
          <p className="mt-1 text-xs text-white/45">{t("spot.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={t("spot.addPlaceholder")}
            className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25"
          />
          <button
            onClick={handleAdd}
            disabled={adding}
            className="flex items-center gap-1.5 whitespace-nowrap bg-white text-black rounded-full px-4 py-2 text-sm font-medium hover:bg-white/90 disabled:opacity-50 transition-colors"
          >
            <Plus className="w-4 h-4" /> {t("spot.add")}
          </button>
        </div>
      </div>

      {stats && stats.not_configured && (
        <p className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-xs text-amber-300">
          {t("spot.notConfigured")}
        </p>
      )}

      {loading ? (
        <div className="mt-6 flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-white/15 border-t-white rounded-full animate-spin" />
        </div>
      ) : artists.length === 0 ? (
        <p className="mt-6 text-sm text-white/40">{t("spot.empty")}</p>
      ) : (
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {artists.map((a) => (
            <div
              key={a.record_id}
              className="relative rounded-xl bg-white/[0.03] border border-white/10 p-4"
            >
              <button
                onClick={() => handleRemove(a.record_id)}
                title="Remove"
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-4 pr-8">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 shrink-0">
                  {a.image ? (
                    <Image src={a.image} alt={a.name} className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                      <Disc3 className="w-6 h-6 text-white/40" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  {a.url ? (
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 font-medium text-white hover:underline truncate"
                    >
                      <span className="truncate">{a.name}</span>
                      <BadgeCheck className="w-4 h-4 text-sky-400 shrink-0" />
                    </a>
                  ) : (
                    <span className="font-medium text-white truncate">{a.name}</span>
                  )}
                  <p className="text-xs text-white/45 mt-0.5">
                    {t("spot.followers")}:{" "}
                    <span className="text-white/70">{fmtCount(a.followers)}</span>
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] text-white/40 mb-1">
                  <span>{t("spot.popularity")}</span>
                  <span>{a.popularity ?? "—"}/100</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${a.popularity || 0}%` }}
                  />
                </div>
              </div>

              {a.genres && a.genres.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {a.genres.map((g) => (
                    <span
                      key={g}
                      className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/60"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {a.latest_release && (
                <p className="mt-3 text-xs text-white/50 truncate">
                  {t("spot.latestRelease")}:{" "}
                  <a
                    href={a.latest_release.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white/80 hover:underline"
                  >
                    {a.latest_release.name}
                  </a>
                  <span className="text-white/30">
                    {" "}
                    · {a.latest_release.release_date}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}