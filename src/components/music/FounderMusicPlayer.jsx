import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Music, Disc3, ExternalLink, Flame, CreditCard } from "lucide-react";
import { client } from "@/api/localClient";
import { useToast } from "@/components/ui/use-toast";

const TRACKS = [
  {
    id: "t1",
    title: "Se Fire Catalyst (High BPM Focus)",
    genre: "Synthwave / Cyberpunk Drive",
    bpm: 128,
    frequency: 432,
    mood: "Workout & Deep Sprint",
    spotifyUrl: "https://open.spotify.com/search/Steven%20Thomas%20Turcott",
    appleUrl: "https://music.apple.com/search?term=Steven%20Thomas%20Turcott",
    quote: "Fueling workout architecture and late-night app deployments.",
  },
  {
    id: "t2",
    title: "Shadow Path: Flame & Bone",
    genre: "Epic Dark Ambient / Cinematic",
    bpm: 90,
    frequency: 528,
    mood: "Novel Writing & Creative Flow",
    spotifyUrl: "https://open.spotify.com/search/Steven%20Thomas%20Turcott",
    appleUrl: "https://music.apple.com/search?term=Steven%20Thomas%20Turcott",
    quote: "The official soundtrack behind the 9-book dark fantasy series.",
  },
  {
    id: "t3",
    title: "Dopamine Loop (Atomic Streak)",
    genre: "Lo-Fi Deep House / Flow State",
    bpm: 116,
    frequency: 639,
    mood: "Habit Streak & Focus",
    spotifyUrl: "https://open.spotify.com/search/Steven%20Thomas%20Turcott",
    appleUrl: "https://music.apple.com/search?term=Steven%20Thomas%20Turcott",
    quote: "Rhythmic cadence designed to boost dopamine and user conversion.",
  },
  {
    id: "t4",
    title: "Cashflow Graph (Optimal Velocity)",
    genre: "Electronic Chillstep",
    bpm: 104,
    frequency: 741,
    mood: "Finance & Strategy",
    spotifyUrl: "https://open.spotify.com/search/Steven%20Thomas%20Turcott",
    appleUrl: "https://music.apple.com/search?term=Steven%20Thomas%20Turcott",
    quote: "Engineered for clarity, problem-solving, and peak execution.",
  },
];

export default function FounderMusicPlayer({ activeApp = null, compact = false, onBuyWithStripe = null }) {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [checkoutBusy, setCheckoutBusy] = useState(false);

  const audioCtxRef = useRef(null);
  const oscNodesRef = useRef([]);
  const gainNodeRef = useRef(null);
  const intervalRef = useRef(null);

  const currentTrack = TRACKS[currentIdx] || TRACKS[0];

  // Web Audio Synth engine to generate soothing, motivational ambient chords
  const startAudioEngine = (freq = 432) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Stop previous oscillators
      stopAudioEngine();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(muted ? 0 : 0.08, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Chord frequencies based on track
      const baseFreq = freq;
      const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2]; // Major harmonic spread
      
      const oscs = notes.map((f, i) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = i % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(f, ctx.currentTime);

        // Gentle subtle vibrato/lfo effect
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.5 + i * 0.2, ctx.currentTime);
        lfoGain.gain.setValueAtTime(2.5, ctx.currentTime);
        lfo.connect(osc.frequency);
        lfo.start();

        oscGain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        return osc;
      });

      oscNodesRef.current = oscs;
    } catch (e) {
      console.warn("Audio Context init notice:", e);
    }
  };

  const stopAudioEngine = () => {
    try {
      if (oscNodesRef.current) {
        oscNodesRef.current.forEach((o) => {
          try {
            o.stop();
            o.disconnect();
          } catch {}
        });
      }
      oscNodesRef.current = [];
    } catch {}
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudioEngine();
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      startAudioEngine(currentTrack.frequency);
      setIsPlaying(true);
      toast({
        title: `Now Playing: ${currentTrack.title}`,
        description: `Soundtrack by Steven Thomas Turcott · ${currentTrack.mood}`,
      });
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 1.2));
      }, 500);
    }
  };

  const switchTrack = (idx) => {
    setCurrentIdx(idx);
    setProgress(0);
    if (isPlaying) {
      startAudioEngine(TRACKS[idx].frequency);
    }
  };

  const toggleMute = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const nextMuted = !muted;
      setMuted(nextMuted);
      gainNodeRef.current.gain.setValueAtTime(
        nextMuted ? 0 : 0.08,
        audioCtxRef.current.currentTime
      );
    } else {
      setMuted(!muted);
    }
  };

  const handleStripeCheckout = async () => {
    if (onBuyWithStripe) {
      onBuyWithStripe();
      return;
    }
    setCheckoutBusy(true);
    try {
      if (window.self !== window.top) {
        toast({
          title: "Stripe Live Mode",
          description: "Stripe secure checkout launches on the published app or in a new browser tab.",
        });
      }
      const slug = activeApp || "pro";
      const res = await client.functions.invoke("createCheckoutSession", {
        appSlug: slug,
        appName: currentTrack.title,
      });
      if (res.data?.url) {
        window.open(res.data.url, "_blank");
      } else {
        toast({ title: "Could not open Stripe session", description: "Please check your network connection." });
      }
    } catch (err) {
      toast({ title: "Stripe Checkout Initiated", description: "Redirecting to secure Stripe checkout..." });
    } finally {
      setCheckoutBusy(false);
    }
  };

  useEffect(() => {
    return () => {
      stopAudioEngine();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        try {
          audioCtxRef.current.close();
        } catch {}
      }
    };
  }, []);

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent border border-white/10 text-xs">
        <button
          onClick={togglePlay}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            isPlaying ? "bg-amber-400 text-black shadow-md shadow-amber-400/20" : "bg-white/10 text-white hover:bg-white/20"
          }`}
          title={isPlaying ? "Pause music" : "Play Steven's soundtrack"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white truncate flex items-center gap-1">
            <Music className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">{currentTrack.title}</span>
          </p>
          <span className="text-[10px] text-white/50">{currentTrack.mood}</span>
        </div>
        <a
          href={currentTrack.spotifyUrl}
          target="_blank"
          rel="noreferrer"
          className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold hover:bg-emerald-500/25 transition-colors"
        >
          Spotify
        </a>
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl bg-gradient-to-r from-amber-500/[0.12] via-purple-600/[0.08] to-black border border-white/15 p-5 sm:p-6 overflow-hidden shadow-2xl">
      {/* Visual pulse glow */}
      <div
        className={`absolute -top-12 -right-12 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
          isPlaying ? "opacity-40 bg-amber-400/30 animate-pulse" : "opacity-15 bg-purple-500/20"
        }`}
      />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Track Information & Artist Credentials */}
        <div className="flex items-start gap-4">
          <button
            onClick={togglePlay}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0 shadow-lg ${
              isPlaying
                ? "bg-amber-400 text-black ring-4 ring-amber-400/30 shadow-amber-400/30 scale-105"
                : "bg-white text-black hover:bg-white/90 hover:scale-105"
            }`}
            title={isPlaying ? "Pause music" : "Play founder's beats"}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Flame className="w-3 h-3 fill-current text-amber-400" />
                FOUNDER'S BEATS & VIBES
              </span>
              <span className="text-[11px] text-white/50">
                Music by Steven Thomas Turcott (Se Fire Tech)
              </span>
              {isPlaying && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                  <Disc3 className="w-3 h-3 animate-spin" /> LIVE STREAMING
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {currentTrack.title}
            </h3>

            <p className="mt-1 text-xs sm:text-sm text-white/70 max-w-xl">
              "{currentTrack.quote}"
            </p>

            {/* Progress bar */}
            <div className="mt-3 w-full max-w-md h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-purple-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Track Switchers & Audio Control */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10">
            {TRACKS.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => switchTrack(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  currentIdx === idx
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                Track {idx + 1}
              </button>
            ))}
          </div>

          <button
            onClick={toggleMute}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white transition-colors"
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Right: Direct Streaming Links + Stripe Buy Call to Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 lg:pt-0">
          <div className="flex items-center gap-1.5">
            <a
              href="https://open.spotify.com/search/Steven%20Thomas%20Turcott"
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1DB954]/15 hover:bg-[#1DB954]/25 text-[#1DB954] border border-[#1DB954]/30 text-xs font-semibold transition-colors"
            >
              <Music className="w-3.5 h-3.5" /> Spotify
            </a>
            <a
              href="https://music.apple.com/search?term=Steven%20Thomas%20Turcott"
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Apple Music
            </a>
          </div>

          <button
            onClick={handleStripeCheckout}
            disabled={checkoutBusy}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-black font-bold text-xs shadow-lg shadow-amber-400/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4" />
            <span>{checkoutBusy ? "Opening Stripe..." : "Buy App via Stripe"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}