import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Send, Bot, User, Loader2, Rocket, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppShell from '../components/AppShell';
import PreviewRenderer from '../components/PreviewRenderer';
import { detectBlueprint, extractAppName, aiGreeting, aiDoneMessage, saveApp } from '../engine';

const SUGGESTIONS = [
  'A landing page for my coffee shop',
  'A dashboard for my fitness app',
  'An online store for handmade candles',
  'A portfolio for my photography',
];

function ChatMessage({ msg }) {
  const isAI = msg.role === 'ai';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2.5 ${isAI ? '' : 'flex-row-reverse'}`}
    >
      <span className={`grid place-items-center w-8 h-8 rounded-full shrink-0 ${isAI ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500' : 'bg-white/10'}`}>
        {isAI ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-slate-300" />}
      </span>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isAI ? 'bg-white/[0.06] border border-white/10' : 'bg-violet-500 text-white'}`}>
        {msg.steps ? (
          <div className="space-y-1.5 py-1">
            {msg.steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-[13px]">
                {i < msg.stepsDone ? (
                  <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                ) : i === msg.stepsDone ? (
                  <Loader2 className="w-3.5 h-3.5 text-violet-300 animate-spin shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" />
                )}
                <span className={i < msg.stepsDone ? 'text-slate-500 line-through' : ''}>{s}</span>
              </div>
            ))}
          </div>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') }} />
        )}
      </div>
    </motion.div>
  );
}

export default function Builder() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hey, I'm **Dr Build** 🩺 — describe the app you want and I'll build it right here, live. Try one of the ideas below or surprise me." },
  ]);
  const [input, setInput] = useState('');
  const [building, setBuilding] = useState(false);
  const [preview, setPreview] = useState(null);
  const [builtApp, setBuiltApp] = useState(null);
  const [autonomous, setAutonomous] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const runBuild = async (prompt) => {
    const blueprint = detectBlueprint(prompt);
    const appName = extractAppName(prompt);
    setBuilding(true);
    setPreview(null);
    setBuiltApp(null);

    setMessages((m) => [...m, { role: 'user', text: prompt }]);
    await wait(600);
    setMessages((m) => [...m, { role: 'ai', text: aiGreeting(prompt, blueprint, appName) }]);
    await wait(800);

    const stepsMsg = { role: 'ai', steps: blueprint.steps, stepsDone: 0 };
    setMessages((m) => [...m, stepsMsg]);

    for (let i = 0; i < blueprint.steps.length; i++) {
      await wait(900 + Math.random() * 700);
      const done = i + 1;
      setMessages((m) => m.map((msg) => (msg === stepsMsg ? { ...msg, stepsDone: done } : msg)));
      if (done === 2) setPreview({ blueprintId: blueprint.id, appName, partial: true });
    }

    setPreview({ blueprintId: blueprint.id, appName, partial: false });
    const app = { name: appName, blueprint: blueprint.id, blueprintName: blueprint.name, prompt };
    setBuiltApp(app);
    await wait(500);
    // Autonomous: auto-approve and auto-publish, logical adjustments only
    if (autonomous) {
      saveApp({ ...app, published: true, autonomous: true });
      setMessages((m) => [...m, { role: 'ai', text: `**${appName}** auto-built and published ✓ — no approval needed. It's saved to **My Apps**. Describe your next app or ask me to adjust this one.` }]);
      confetti({ particleCount: 160, spread: 80, origin: { y: 0.4 }, colors: ['#a78bfa', '#e879f9', '#fbbf24', '#34d399'] });
      toast.success(`"${appName}" auto-published! 🚀`);
    } else {
      setMessages((m) => [...m, { role: 'ai', text: aiDoneMessage(appName, blueprint) }]);
      confetti({ particleCount: 90, spread: 65, origin: { y: 0.35 }, colors: ['#a78bfa', '#e879f9', '#fbbf24', '#34d399'] });
    }
    setBuilding(false);
  };

  const publish = () => {
    if (!builtApp) return;
    saveApp({ ...builtApp, published: true });
    confetti({ particleCount: 160, spread: 80, origin: { y: 0.4 }, colors: ['#a78bfa', '#e879f9', '#fbbf24'] });
    toast.success(`"${builtApp.name}" published! 🚀`);
    setMessages((m) => [...m, { role: 'ai', text: `**${builtApp.name}** is published and saved to **My Apps**. Want to tweak anything, or shall we build something new?` }]);
  };

  const submit = (e) => {
    e?.preventDefault();
    const prompt = input.trim();
    if (!prompt || building) return;
    setInput('');
    runBuild(prompt);
  };

  return (
    <AppShell>
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-120px)] min-h-[560px]">
        {/* Chat */}
        <div className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden min-h-[320px]">
          <div className="flex items-center gap-2.5 px-4 h-14 border-b border-white/10">
            <span className="grid place-items-center w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Bot className="w-4 h-4 text-white" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold">Dr Build</p>
              <p className="text-[11px] text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online — ready to build
              </p>
            </div>
            <button
              onClick={() => setAutonomous(!autonomous)}
              title={autonomous ? "Autonomous ON: auto-complete + auto-publish" : "Autonomous OFF: manual approval"}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                autonomous
                  ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
                  : 'bg-white/5 border border-white/10 text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${autonomous ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              {autonomous ? 'Auto' : 'Manual'}
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
            </AnimatePresence>
            {messages.length === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => runBuild(s)}
                    disabled={building}
                    className="text-left rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-[13px] text-slate-300 hover:border-violet-400/40 hover:bg-violet-400/10 transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 inline mr-1.5 text-violet-300" />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={submit} className="p-3 border-t border-white/10 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your app..."
              disabled={building}
              className="bg-white/5 border-white/10"
            />
            <Button type="submit" disabled={building || !input.trim()} className="bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold shrink-0">
              {building ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>

        {/* Preview */}
        <div className="flex-1 rounded-2xl border border-white/10 bg-slate-900/40 overflow-hidden flex flex-col min-h-[320px]">
          <div className="flex items-center justify-between px-4 h-14 border-b border-white/10">
            <p className="text-sm font-bold">Live preview</p>
            {builtApp && (
              <Button size="sm" onClick={publish} className="bg-gradient-to-r from-violet-500 to-fuchsia-500 font-bold">
                <Rocket className="w-3.5 h-3.5 mr-1.5" /> Publish
              </Button>
            )}
          </div>
          <div className="flex-1 relative">
            {preview ? (
              <motion.div key={preview.appName} initial={{ opacity: 0 }} animate={{ opacity: preview.partial ? 0.55 : 1 }} className="absolute inset-0">
                <PreviewRenderer blueprintId={preview.blueprintId} appName={preview.appName} />
                {preview.partial && (
                  <div className="absolute inset-0 grid place-items-center bg-slate-950/40 backdrop-blur-[1px]">
                    <p className="text-xs text-violet-300 font-medium flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Building...
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="absolute inset-0 grid place-items-center p-8 text-center">
                <div>
                  <Bot className="w-10 h-10 mx-auto text-slate-700" />
                  <p className="mt-3 text-sm text-slate-500">Your app will appear here<br />the moment Dr Build starts working.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
