import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, SkipForward, Headphones, X, Radio, Mic } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const NARRATOR_CHAPTERS = [
  {
    id: "welcome",
    title: "1. Welcome & Platform Tour",
    subtitle: "By Steven Thomas Turcott",
    script:
      "Hello and welcome! I'm Steven Thomas Turcott, founder of Se Fire Tech. You're exploring Builder Flow, our intelligent platform designed to build, deploy, and scale custom applications with natural language. From full-stack web and mobile apps to Stripe monetization and automated workflows, everything here is built to give you total creative and engineering control.",
  },
  {
    id: "dashboard",
    title: "2. Project Dashboard & Kanban",
    subtitle: "Managing your builds",
    script:
      "Our project management dashboard gives you deep visibility into every build. You can track progress from draft to published, organize tasks with our interactive Kanban board, and perform bulk status updates across all your active applications in just one click.",
  },
  {
    id: "kindle",
    title: "3. Shadow Path & Kindle Books",
    subtitle: "Dark fantasy publication suite",
    script:
      "Here you'll find my complete nine-book dark fantasy series, Shadow Path. We've integrated direct Stripe purchase and thirty-day rental checkout right into the app, alongside direct links to the official Amazon Kindle store.",
  },
  {
    id: "growth",
    title: "4. Google Sheets & Automation",
    subtitle: "Metrics and automated reporting",
    script:
      "Builder Flow automatically syncs all project activities and Stripe sales data straight into your Google Sheets spreadsheet. Every Monday at 9:00 AM, our automated workflow compiles an executive recap and emails it directly to your inbox via Gmail.",
  },
  {
    id: "languages",
    title: "5. 190+ Languages & Accents",
    subtitle: "Global localization engine",
    script:
      "Our platform now supports over 190 global languages and dozens of regional accents, from American, British, Canadian, and Australian English to Mexican Spanish, Québécois French, and Brazilian Portuguese. The narrator and voice guides dynamically adapt to your selected regional accent.",
  },
  {
    id: "setup",
    title: "6. Quick Setup & Deployment",
    subtitle: "Live app launch guide",
    script:
      "Ready to launch? Our AI Setup Assistant is here to guide you step-by-step through connecting Stripe live payments, syncing your Google Calendar deadlines, attaching custom domains, and publishing your applications worldwide.",
  },
];

export default function NarratorGuide() {
  const { lang, activeAccent, regionalAccents, setAccent } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [rate, setRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");
  const [highlightWordIndex, setHighlightWordIndex] = useState(-1);
  const [minimized, setMinimized] = useState(true);

  const utteranceRef = useRef(null);
  const activeChapter = NARRATOR_CHAPTERS[currentChapterIndex];

  // Load browser speech synthesis voices
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      if (voices.length > 0 && !selectedVoiceURI) {
        // Look for male/founder-like or matched language voice
        const match =
          voices.find((v) => v.lang.startsWith(lang) && (v.name.includes("Male") || v.name.includes("David") || v.name.includes("Alex") || v.name.includes("George"))) ||
          voices.find((v) => v.lang.startsWith(lang)) ||
          voices[0];
        if (match) setSelectedVoiceURI(match.voiceURI);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, [lang]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setHighlightWordIndex(-1);
  };

  const speakChapter = (index = currentChapterIndex) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const chapter = NARRATOR_CHAPTERS[index];
    if (!chapter) return;

    setCurrentChapterIndex(index);

    const utterance = new SpeechSynthesisUtterance(chapter.script);
    utteranceRef.current = utterance;

    // Apply voice settings calibrated for Steven's Founder persona
    utterance.rate = rate * (activeAccent?.rate || 1.0);
    utterance.pitch = 0.95 * (activeAccent?.pitch || 1.0);
    utterance.volume = volume;
    utterance.lang = activeAccent?.speechLang || "en-US";

    if (selectedVoiceURI && availableVoices.length > 0) {
      const v = availableVoices.find((voice) => voice.voiceURI === selectedVoiceURI);
      if (v) utterance.voice = v;
    }

    // Word boundary tracking for live teleprompter highlighting
    utterance.onboundary = (event) => {
      if (event.name === "word") {
        setHighlightWordIndex(event.charIndex);
      }
    };

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setHighlightWordIndex(-1);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setHighlightWordIndex(-1);
    };

    window.speechSynthesis.speak(utterance);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      stopSpeaking();
    } else {
      speakChapter(currentChapterIndex);
    }
  };

  const nextChapter = () => {
    const nextIdx = (currentChapterIndex + 1) % NARRATOR_CHAPTERS.length;
    speakChapter(nextIdx);
  };

  const restartChapter = () => {
    speakChapter(currentChapterIndex);
  };

  return (
    <>
      {/* Floating Pill Launcher / Soundwave Trigger */}
      <div className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-40">
        <button
          onClick={() => {
            setIsOpen(true);
            setMinimized(false);
          }}
          className={`group flex items-center gap-3 px-4 py-2.5 rounded-full shadow-xl backdrop-blur-xl border transition-all duration-300 ${
            isPlaying
              ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/30"
              : "bg-black/90 hover:bg-black border-white/15 text-white/90 hover:text-white"
          }`}
          title="Steven Turcott — Narrator Voice Guide"
        >
          <div className="relative flex items-center justify-center">
            <Headphones className="w-4 h-4 text-amber-400" />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[11px] font-semibold tracking-wide flex items-center gap-1.5">
              <span>Steven's Voice Guide</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono">
                {activeAccent.id}
              </span>
            </span>
            <span className="text-[10px] text-white/50 truncate max-w-[120px]">
              {isPlaying ? "Narrating now..." : activeChapter.title}
            </span>
          </div>

          {/* Soundwave animation bars */}
          {isPlaying ? (
            <div className="flex items-center gap-0.5 h-4 ml-1">
              <span className="w-0.5 h-3 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-0.5 h-4 bg-amber-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-0.5 h-2.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.4s]" />
              <span className="w-0.5 h-3.5 bg-amber-300 rounded-full animate-bounce" />
            </div>
          ) : (
            <Play className="w-3.5 h-3.5 text-white/60 group-hover:text-amber-400 transition-colors ml-1" />
          )}
        </button>
      </div>

      {/* Expanded Narrator Modal / Control Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-start p-4 sm:p-8 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-neutral-950 border border-amber-500/20 shadow-2xl overflow-hidden flex flex-col text-white">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-transparent border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">
                      Steven Thomas Turcott
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-black">
                      Founder Voice
                    </span>
                  </div>
                  <p className="text-xs text-white/50">
                    Se Fire Tech · Audio Walkthrough & Interactive Guide
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Active Script & Teleprompter */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs text-white/50 border-b border-white/5 pb-2">
                <span className="font-semibold text-amber-300">
                  {activeChapter.title}
                </span>
                <span>{activeChapter.subtitle}</span>
              </div>

              <div className="min-h-[110px] p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-sm sm:text-base leading-relaxed text-white/80">
                {activeChapter.script}
              </div>

              {/* Chapter Jump Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
                  Tour Chapters
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {NARRATOR_CHAPTERS.map((ch, idx) => (
                    <button
                      key={ch.id}
                      onClick={() => speakChapter(idx)}
                      className={`px-3 py-2 text-left rounded-xl text-xs font-medium border transition-colors flex items-center justify-between ${
                        currentChapterIndex === idx
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className="truncate">{ch.title}</span>
                      {currentChapterIndex === idx && isPlaying && (
                        <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Playback Controls Bar */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-white/10 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={restartChapter}
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                    title="Restart Current Chapter"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={togglePlayPause}
                    className="px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 fill-black" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-black" />
                        <span>Play Chapter</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={nextChapter}
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                    title="Next Chapter"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Speed & Accent Quick Config */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 text-xs">
                    {[1.0, 1.25, 1.5].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setRate(s);
                          if (isPlaying) speakChapter(currentChapterIndex);
                        }}
                        className={`px-2 py-0.5 rounded-full transition-colors ${
                          rate === s
                            ? "bg-white text-black font-bold"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  <span className="text-xs text-amber-300/80 font-mono px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
                    {activeAccent.flag} {activeAccent.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}