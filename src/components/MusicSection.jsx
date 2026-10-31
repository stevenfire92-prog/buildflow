// Se Fire — music promo section. Spotify embed works out of the box.
// Pass soundcloud/apple/amazon URLs as props when known.
import { Music2, ExternalLink } from 'lucide-react';

export const SE_FIRE_SPOTIFY = 'https://open.spotify.com/artist/0pvxsVN3Cj3MochJhfROvm';
export const SE_FIRE_SPOTIFY_EMBED = 'https://open.spotify.com/embed/artist/0pvxsVN3Cj3MochJhfROvm?utm_source=generator&theme=0';
export const STEVEN_APPLE_MUSIC = [
  { name: 'Apple Music', url: 'https://music.apple.com/ca/artist/steven-thomas-turcott/1729066564' },
  { name: 'Apple Music 2', url: 'https://music.apple.com/ca/artist/steven-turcott/1727817453' },
];

export const STEVEN_SOUNDCLOUD = 'https://on.soundcloud.com/nvLoq8RUuO1CK8OpJA';
export const STEVEN_AMAZON_MUSIC = 'https://music.amazon.ca/artists/B0CTF8K3GL';

export default function MusicSection({ soundcloud = STEVEN_SOUNDCLOUD, appleMusic = STEVEN_APPLE_MUSIC, amazonMusic = STEVEN_AMAZON_MUSIC, accent = 'emerald' }) {
  const appleLinks = Array.isArray(appleMusic) ? appleMusic : (appleMusic ? [{ name: 'Apple Music', url: appleMusic }] : []);
  const platforms = [
    { name: 'Spotify', url: SE_FIRE_SPOTIFY, color: 'bg-[#1DB954]/15 border-[#1DB954]/40 text-[#1DB954]' },
    ...appleLinks.map((a) => ({ name: a.name, url: a.url, color: 'bg-rose-500/15 border-rose-500/40 text-rose-400' })),
    soundcloud && { name: 'SoundCloud', url: soundcloud, color: 'bg-orange-500/15 border-orange-500/40 text-orange-400' },
    amazonMusic && { name: 'Amazon Music', url: amazonMusic, color: 'bg-sky-500/15 border-sky-500/40 text-sky-400' },
  ].filter(Boolean);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center gap-2.5 mb-1">
        <Music2 className="w-5 h-5 text-slate-300" />
        <h3 className="font-bold text-lg">Se Fire — official music</h3>
      </div>
      <p className="text-sm text-slate-500 mb-4">Stream the tracks behind the brand.</p>
      <iframe
        src={SE_FIRE_SPOTIFY_EMBED}
        width="100%"
        height="352"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Se Fire on Spotify"
        className="rounded-xl"
      />
      <div className="flex flex-wrap gap-2 mt-4">
        {platforms.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold ${p.color}`}
          >
            {p.name} <ExternalLink className="w-3 h-3" />
          </a>
        ))}
      </div>
    </div>
  );
}
