import React, { useState, useRef, useEffect } from "react";
import { Bot, Sparkles, Send, X, RefreshCw, Volume2, CheckCircle2, ChevronRight, Copy, Check, ShieldCheck, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import ReactMarkdown from "react-markdown";

const QUICK_ACTIONS = [
  {
    label: "App Setup Checklist",
    prompt: "Guide me through the complete step-by-step setup checklist for my Builder Flow applications and production deployment.",
    icon: CheckCircle2,
  },
  {
    label: "Stripe Monetization",
    prompt: "How do I configure my Stripe live keys, products ($16/mo and $28 one-time), and digital checkouts?",
    icon: Zap,
  },
  {
    label: "Google Sheets & Gmail Reports",
    prompt: "Explain how my Google Sheets sync and automated Monday 9:00 AM Gmail reports work and how to test them.",
    icon: ShieldCheck,
  },
  {
    label: "190+ Languages & Accents",
    prompt: "How does the 190+ languages and regional accents engine work with Steven's narrator voice?",
    icon: Sparkles,
  },
];

export default function BuilderAiAssistant() {
  const { lang, activeAccent } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I am your **Builder Flow AI Setup Assistant**, created by Steven Thomas Turcott (Se Fire Tech). I am here to help you configure, launch, and monetize your apps. What would you like to set up today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [narratingIndex, setNarratingIndex] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const text = typeof textToSend === "string" ? textToSend.trim() : input.trim();
    if (!text || loading) return;

    const userMessage = { role: "user", content: text };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await base44.functions.invoke("aiAssistantChat", {
        message: text,
        history: messages.slice(-5),
      });

      const reply = res.data?.reply || "I'm ready to help with your setup. What would you like to configure next?";
      setMessages([...newHistory, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages([
        ...newHistory,
        {
          role: "assistant",
          content:
            "I encountered a temporary connection issue. Please make sure your project functions are deployed and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const narrateMessage = (text, index) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    if (narratingIndex === index) {
      setNarratingIndex(null);
      return;
    }

    setNarratingIndex(index);
    const cleanText = text.replace(/[*#_`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05 * (activeAccent?.rate || 1.0);
    utterance.pitch = 0.95 * (activeAccent?.pitch || 1.0);
    utterance.lang = activeAccent?.speechLang || "en-US";

    utterance.onend = () => setNarratingIndex(null);
    utterance.onerror = () => setNarratingIndex(null);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      {/* Floating Assistant Trigger in bottom-right corner */}
      <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-semibold text-xs shadow-2xl hover:shadow-amber-500/30 hover:scale-105 transition-all duration-300"
          title="Open AI Setup Assistant"
        >
          <span className="relative flex items-center justify-center">
            <Bot className="w-4 h-4 fill-black" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-ping" />
          </span>
          <span className="tracking-wide">AI Setup Assistant</span>
          <span className="px-1.5 py-0.5 rounded-full bg-black/15 text-[10px] font-bold">
            PRO
          </span>
        </button>
      </div>

      {/* AI Assistant Chat Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full sm:w-[460px] h-[90vh] sm:h-[680px] rounded-3xl bg-neutral-950 border border-amber-500/30 shadow-2xl flex flex-col overflow-hidden text-white animate-in slide-in-from-bottom-5 sm:slide-in-from-right-5 duration-300">
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-amber-500/20 via-neutral-900 to-transparent border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-black flex items-center justify-center shadow-md shadow-amber-400/20 font-bold shrink-0">
                  <Bot className="w-5 h-5 fill-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">
                      Builder Flow AI Assistant
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Best-in-Class
                    </span>
                  </div>
                  <p className="text-xs text-white/50">
                    Se Fire Tech · Intelligent Architecture & Setup Guide
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setMessages([
                      {
                        role: "assistant",
                        content:
                          "Chat reset. How can I help you set up or optimize your Builder Flow applications?",
                      },
                    ]);
                  }}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                  title="Clear conversation"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
                    setIsOpen(false);
                  }}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Action Chips */}
            <div className="px-4 py-2.5 bg-black/40 border-b border-white/5 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(action.prompt)}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/30 text-white/70 hover:text-white whitespace-nowrap transition-colors"
                >
                  <action.icon className="w-3 h-3 text-amber-400" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {messages.map((m, idx) => {
                const isAssistant = m.role === "assistant";
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      isAssistant ? "items-start" : "items-end"
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isAssistant
                          ? "bg-white/[0.04] border border-white/10 text-white/90"
                          : "bg-amber-400 text-black font-medium"
                      }`}
                    >
                      {isAssistant ? (
                        <div className="prose prose-invert prose-xs max-w-none space-y-2">
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <div>{m.content}</div>
                      )}
                    </div>

                    {/* Assistant Action Bar: Copy & Narrate with Steven's Voice */}
                    {isAssistant && (
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-white/40">
                        <button
                          onClick={() => copyToClipboard(m.content, idx)}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                          title="Copy response"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <span>·</span>

                        <button
                          onClick={() => narrateMessage(m.content, idx)}
                          className={`flex items-center gap-1 transition-colors ${
                            narratingIndex === idx
                              ? "text-amber-400 font-semibold"
                              : "hover:text-amber-400"
                          }`}
                          title="Listen with Steven's voice narrator"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>
                            {narratingIndex === idx
                              ? "Speaking..."
                              : "Listen with Steven's Voice"}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-white/60 w-fit">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>AI Assistant is compiling recommendations...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-4 bg-neutral-900/80 border-t border-white/10 flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask setup, Stripe, Google Sheets, or deployment questions..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-black flex items-center justify-center font-bold transition-all shrink-0"
              >
                <Send className="w-4 h-4 fill-black" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}