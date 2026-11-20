// ============================================================================
// music.jsx — Sapphire Spins background music: Steve's own tracks (Se Fire),
// played through a single HTML5 Audio element owned by the app shell, so the
// music keeps playing across lobby and game views.
//
// Autoplay policy: browsers block sound before a user gesture, and we never
// try to autoplay on load. If music is enabled (the default), playback starts
// on the FIRST tap/click/keypress anywhere in the app. The header toggle can
// mute/unmute at any time; the preference persists in localStorage.
// ============================================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export const TRACKS = [
  { title: 'On Tha Grind', src: 'https://drive.google.com/uc?export=download&id=1NEl1oEPIFWNOvcm3IQibnZZb3uv7G4N9' },
  { title: 'West Coast Cruzin', src: 'https://drive.google.com/uc?export=download&id=1gtOCtlap8kEyiAp1tIzTcKdl7OgaZftS' },
  { title: 'Chillin In Tha Studio', src: 'https://drive.google.com/uc?export=download&id=1Iqs8tPnTrL5wklG4-qGIpVLMqPDBuOzF' },
  { title: 'Goin Hard', src: 'https://drive.google.com/uc?export=download&id=1I4fQicycVLg4iR2OquvuOccVtOn0iXeg' },
];

const PREF_KEY = 'sapphire-spins-music-v1';
const VOLUME = 0.35;

const MusicContext = createContext(null);

function readEnabled() {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (raw) return JSON.parse(raw).enabled !== false;
  } catch {
    // storage unavailable — fall through to the default
  }
  return true; // default: enabled (starts on first interaction)
}

export function MusicProvider({ children }) {
  const audioRef = useRef(null);
  const [enabled, setEnabled] = useState(readEnabled);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const startedRef = useRef(false);

  // Create the single Audio element once.
  useEffect(() => {
    const audio = new Audio();
    audio.volume = VOLUME;
    audio.preload = 'auto';
    audio.src = TRACKS[0].src;
    audioRef.current = audio;
    const onEnded = () =>
      setTrackIndex((i) => (i + 1) % TRACKS.length);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.pause();
    };
  }, []);

  // Advance the playlist when the track index changes (after `ended`, or a
  // manual skip). Only auto-plays if playback had already started.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = TRACKS[trackIndex].src;
    if (startedRef.current && enabled) {
      audio.play().catch(() => {});
    }
  }, [trackIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || startedRef.current) return;
    startedRef.current = true;
    if (enabled) audio.play().catch(() => {});
  }, [enabled]);

  // First user interaction anywhere starts the music (once), if enabled.
  useEffect(() => {
    const kick = () => start();
    window.addEventListener('pointerdown', kick, { once: true });
    window.addEventListener('keydown', kick, { once: true });
    return () => {
      window.removeEventListener('pointerdown', kick);
      window.removeEventListener('keydown', kick);
    };
  }, [start]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    setEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(PREF_KEY, JSON.stringify({ enabled: next }));
      } catch {
        // storage unavailable
      }
      if (audio) {
        if (next) {
          startedRef.current = true;
          audio.play().catch(() => {});
        } else {
          audio.pause();
        }
      }
      return next;
    });
  }, []);

  const value = {
    enabled,
    playing,
    toggle,
    track: TRACKS[trackIndex],
  };

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used inside MusicProvider');
  return ctx;
}

// Header toggle: speaker icon + current track name. Lives in the app header,
// visible in the lobby and every game view.
export function MusicToggle() {
  const { enabled, playing, toggle, track } = useMusic();
  return (
    <button
      onClick={toggle}
      aria-pressed={String(enabled)}
      title={enabled ? 'Mute the music' : 'Turn the music on'}
      className="inline-flex items-center gap-2 border border-[var(--edge)] rounded-full bg-[var(--panel)] pl-3 pr-4 py-2 min-h-[44px] cursor-pointer transition hover:border-[var(--gold)] text-[var(--text)]"
    >
      {enabled ? (
        <Volume2 className="w-5 h-5 text-[var(--gold)]" />
      ) : (
        <VolumeX className="w-5 h-5 text-[var(--muted)]" />
      )}
      <span className="text-left leading-tight">
        <span className="block text-[0.65rem] uppercase tracking-wider text-[var(--muted)]">
          {enabled ? (playing ? 'Now playing' : 'Music on') : 'Music off'} · Se Fire
        </span>
        <span className="block text-sm font-semibold max-w-[10rem] truncate">
          {track.title}
        </span>
      </span>
    </button>
  );
}
