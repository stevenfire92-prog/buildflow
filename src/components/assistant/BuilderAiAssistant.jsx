import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const STORAGE_KEY = "bf:assistant:history";

const GREETING = {
  role: "assistant",
  content:
    "Hey, I'm **Spark** — the AI assistant for BuildFlow by Se Fire Tech. I can help you explore Steve's 87 live apps and games, price out a website, app, or game build, draft copy, or spec out a project idea. What are we working on?",
};

const SUGGESTIONS = [
  "What can you build for my business?",
  "How much is a custom app?",
  "Show me the games",
  "Write copy for my homepage",
];

const NOT_CONFIGURED_MESSAGE =
  "I'm still being switched on — check back soon, or reach Steve directly at stevenfire92@yahoo.com and he'll take care of you.";

const RATE_LIMITED_MESSAGE =
  "Whoa, I'm getting a lot of questions at once — give me a few minutes to catch up, then ask me again.";

const GENERIC_ERROR_MESSAGE =
  "Something glitched on my end — sorry about that. Give it another try, and if it keeps happening, reach Steve at stevenfire92@yahoo.com.";

function loadHistory() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [GREETING];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [GREETING];
    const clean = parsed.filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    );
    return clean.length > 0 ? clean : [GREETING];
  } catch {
    return [GREETING];
  }
}

export default function BuilderAiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(loadHistory);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Storage full or unavailable — chat still works for this session.
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  const clearChat = () => {
    setMessages([GREETING]);
  };

  const handleSend = async (textToSend) => {
    const text = typeof textToSend === "string" ? textToSend.trim() : input.trim();
    if (!text || loading) return;

    const userMessage = { role: "user", content: text };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    // Send the full conversation (minus local-only notices like error lines).
    const payload = newHistory
      .filter((m) => !m.transient)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });
      const data = await response.json().catch(() => null);

      if (response.ok && typeof data?.reply === "string") {
        setMessages([...newHistory, { role: "assistant", content: data.reply }]);
      } else if (data?.error === "ai_not_configured") {
        setMessages([
          ...newHistory,
          { role: "assistant", content: NOT_CONFIGURED_MESSAGE, transient: true },
        ]);
      } else if (response.status === 429 || data?.error === "rate_limited") {
        setMessages([
          ...newHistory,
          { role: "assistant", content: RATE_LIMITED_MESSAGE, transient: true },
        ]);
      } else {
        setMessages([
          ...newHistory,
          { role: "assistant", content: GENERIC_ERROR_MESSAGE, transient: true },
        ]);
      }
    } catch {
      setMessages([
        ...newHistory,
        { role: "assistant", content: GENERIC_ERROR_MESSAGE, transient: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const showSuggestions = messages.length <= 1 && !loading;

  return (
    <>
      {/* Floating Assistant Trigger in bottom-right corner */}
      <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-semibold text-xs shadow-2xl hover:shadow-amber-500/30 hover:scale-105 transition-all duration-300"
          title="Chat with Spark"
        >
          <span className="relative flex items-center justify-center">
            <Sparkles className="w-4 h-4 fill-black" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-ping" />
          </span>
          <span className="tracking-wide">Ask Spark</span>
          <span className="px-1.5 py-0.5 rounded-full bg-black/15 text-[10px] font-bold">
            AI
          </span>
        </button>
      </div>

      {/* Spark Chat Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full sm:w-[460px] h-[90vh] sm:h-[680px] rounded-3xl bg-neutral-950 border border-amber-500/30 shadow-2xl flex flex-col overflow-hidden text-white animate-in slide-in-from-bottom-5 sm:slide-in-from-right-5 duration-300">
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-amber-500/20 via-neutral-900 to-transparent border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-black flex items-center justify-center shadow-md shadow-amber-400/20 font-bold shrink-0">
                  <Sparkles className="w-5 h-5 fill-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">Spark</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      AI Assistant
                    </span>
                  </div>
                  <p className="text-xs text-white/50">
                    BuildFlow · Se Fire Tech
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                  title="Clear chat"
                  aria-label="Clear chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {messages.map((m, idx) => {
                const isAssistant = m.role === "assistant";
                return (
                  <div
                    key={idx}
                    className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
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
                  </div>
                );
              })}

              {/* Starter suggestion chips (empty state) */}
              {showSuggestions && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSend(suggestion)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/30 text-white/70 hover:text-white transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}

              {loading && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-white/60 w-fit">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:300ms]" />
                  </span>
                  <span>Spark is thinking…</span>
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
                placeholder="Ask Spark about apps, prices, or your project idea…"
                maxLength={2000}
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-black flex items-center justify-center font-bold transition-all shrink-0"
                aria-label="Send message"
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
