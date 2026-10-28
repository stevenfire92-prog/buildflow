import React, { useState } from "react";
import { Bot, Send, Sparkles, CheckCircle2, Calendar, ShieldCheck, Heart, User, Star } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const initialMessages = [
  {
    sender: "bot",
    text: "Hello! I am Support Superagent, your 24/7 AI customer success copilot. How can I resolve your inquiry today?",
    time: "10:00 AM",
    sentiment: "neutral",
  },
  {
    sender: "user",
    text: "I was charged twice on my monthly invoice for the Pro tier. Can you fix this?",
    time: "10:01 AM",
    sentiment: "urgent",
  },
  {
    sender: "bot",
    text: "I see the duplicate transaction in your Stripe billing history. I have processed an immediate refund of $16.00 back to your original payment method and synced this with Zendesk ticket #4819. You will see the credit within 2-3 business days.",
    time: "10:01 AM",
    sentiment: "positive",
  },
];

export default function SupportSuperagentWeb() {
  const { toast } = useToast();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [crmSync, setCrmSync] = useState("HubSpot & Zendesk (Live)");
  const [csatScore, setCsatScore] = useState(5);
  const [sentimentStatus, setSentimentStatus] = useState("Positive (98.4%)");
  const [bookingScheduled, setBookingScheduled] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userText = input.trim();
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMsg = {
      sender: "user",
      text: userText,
      time: now,
      sentiment: userText.toLowerCase().includes("urgent") || userText.toLowerCase().includes("fail") ? "urgent" : "neutral",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    // Simulate agent AI auto-response
    setTimeout(() => {
      let botResponse = "";
      if (userText.toLowerCase().includes("book") || userText.toLowerCase().includes("call") || userText.toLowerCase().includes("demo")) {
        botResponse = "I've generated a 1-on-1 VIP calendar link for you. Thursday at 2:00 PM EST is currently open with our lead engineer Steven. Would you like me to confirm?";
        setSentimentStatus("High Intent / Demo Booking");
      } else if (userText.toLowerCase().includes("api") || userText.toLowerCase().includes("webhook") || userText.toLowerCase().includes("code")) {
        botResponse = "Our REST API documentation is accessible directly through your Base44 backend function hooks. You can issue bearer tokens and listen to the real-time websocket endpoint.";
        setSentimentStatus("Technical Support / Resolution: 100%");
      } else {
        botResponse = `Understood. I have verified your account telemetry. Your request regarding "${userText.slice(0, 30)}..." has been resolved and logged into your CRM dashboard.`;
        setSentimentStatus("Resolved / Positive");
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sentiment: "positive",
        },
      ]);
      toast({ title: "Superagent Responded", description: "Sub-second AI latency resolution logged." });
    }, 800);
  };

  const handleScheduleDemo = () => {
    setBookingScheduled(true);
    toast({
      title: "Calendar Event Created",
      description: "Google Calendar invite dispatched to your registered email.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Superagent Telemetry & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolution Rate
          </div>
          <p className="text-2xl font-bold text-white">94.8%</p>
          <p className="text-[11px] text-white/50">Zero human intervention</p>
        </div>

        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
          <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Latency
          </div>
          <p className="text-2xl font-bold text-white">410 ms</p>
          <p className="text-[11px] text-white/50">Sub-second reasoning</p>
        </div>

        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium mb-1">
            <Star className="w-3.5 h-3.5" /> CSAT Score
          </div>
          <p className="text-2xl font-bold text-white">4.9 / 5.0</p>
          <p className="text-[11px] text-white/50">Based on 1,240 ratings</p>
        </div>

        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
          <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> CRM Status
          </div>
          <p className="text-xs font-semibold text-white truncate mt-1">{crmSync}</p>
          <p className="text-[11px] text-white/50">Two-way webhook sync</p>
        </div>
      </div>

      {/* Live Agent Chat Interface */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col h-[520px] overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-white">Superagent Core v3.4</h4>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-white/50">Live Multi-Turn Knowledge Base Trained</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/25">
              Sentiment: {sentimentStatus}
            </span>
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                  m.sender === "user"
                    ? "bg-white text-black font-semibold"
                    : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                }`}
              >
                {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-white text-black rounded-tr-sm"
                    : "bg-white/[0.06] border border-white/10 text-white/90 rounded-tl-sm"
                }`}
              >
                <p>{m.text}</p>
                <span
                  className={`block text-[10px] mt-1.5 ${
                    m.sender === "user" ? "text-black/50 text-right" : "text-white/40"
                  }`}
                >
                  {m.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-white/[0.01] border-t border-white/5 flex gap-2 overflow-x-auto text-xs">
          {[
            "Book a technical onboarding call",
            "How do I set up Stripe webhook subscriptions?",
            "Can you export my support SLA logs to CSV?",
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => setInput(prompt)}
              className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-white/10 flex items-center gap-2 bg-white/[0.02]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Superagent anything or request an action..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400"
          />
          <button
            type="submit"
            className="p-2.5 bg-purple-500 hover:bg-purple-400 text-white rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Integration Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-2 text-sky-400">
            <Calendar className="w-4 h-4" />
            <h4 className="text-sm font-semibold text-white">Instant Booking Dispatcher</h4>
          </div>
          <p className="text-xs text-white/50 mb-3">
            Automate high-touch client consultations directly into Google Calendar.
          </p>
          <button
            onClick={handleScheduleDemo}
            disabled={bookingScheduled}
            className={`w-full py-2.5 text-xs font-medium rounded-xl border transition-colors ${
              bookingScheduled
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-white/10 hover:bg-white/15 text-white border-white/15"
            }`}
          >
            {bookingScheduled ? "✓ Consultation Booked for Thursday" : "Simulate Instant Booking"}
          </button>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-2 text-amber-400">
            <Heart className="w-4 h-4" />
            <h4 className="text-sm font-semibold text-white">Customer Satisfaction Benchmark</h4>
          </div>
          <p className="text-xs text-white/50 mb-3">Rate agent accuracy and reasoning clarity.</p>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => {
                  setCsatScore(star);
                  toast({ title: "Feedback Saved", description: `You rated ${star}/5 stars.` });
                }}
                className={`p-2 rounded-lg border transition-colors ${
                  csatScore >= star
                    ? "bg-amber-400 text-black border-amber-300"
                    : "bg-white/5 text-white/40 border-white/10"
                }`}
              >
                <Star className="w-4 h-4 fill-current" />
              </button>
            ))}
            <span className="text-xs text-white/60 ml-2">Score: {csatScore} / 5</span>
          </div>
        </div>
      </div>
    </div>
  );
}