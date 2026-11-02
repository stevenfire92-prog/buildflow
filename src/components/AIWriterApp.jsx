import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Save, Trash2, FolderOpen, PenLine } from 'lucide-react';
import { toast } from 'sonner';

const KEY = 'sfaiw:drafts';

const TEMPLATES = [
  { id: 'blog', name: 'Blog Post', icon: '📝' },
  { id: 'email', name: 'Email', icon: '✉️' },
  { id: 'story', name: 'Short Story', icon: '📖' },
  { id: 'product', name: 'Product Description', icon: '🏷️' },
];

const TONES = ['Professional', 'Friendly', 'Bold', 'Playful'];

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

// Demo-mode generator: builds structured placeholder copy from the template.
// Clearly labeled as demo — a real AI API would replace this function.
function demoGenerate(template, topic, tone) {
  const t = (topic || 'your topic').trim();
  const openers = {
    blog: `${tone} take: everything you need to know about ${t}.`,
    email: `Subject: Quick note about ${t}\n\nHi there,`,
    story: `The night ${t} changed everything.`,
    product: `Meet ${t} — built different.`,
  };
  const bodies = {
    blog: `In this post we break down ${t} into plain language: what it is, why it matters, and how to get started today. No fluff, just the essentials — plus a few hard-won lessons from people who have done it before.\n\nKey points:\n• Understand the fundamentals of ${t}\n• Avoid the three most common mistakes\n• A simple action plan you can start this week\n\nBottom line: ${t} rewards consistency over intensity. Start small, stay steady, and the results compound.`,
    email: `I wanted to reach out about ${t}. Here's the short version: it matters, the timing is right, and I'd love 15 minutes to walk you through it.\n\nLet me know what works for you this week.\n\nBest,`,
    story: `Nobody believed ${t} could happen — until it did. The lights flickered, the room went quiet, and in that single held breath, the whole story turned. What came next surprised everyone, most of all the one who started it.\n\nSome moments choose you. This was one of them.`,
    product: `${t} does one thing exceptionally well: it saves you time without cutting corners. Clean design, honest materials, and zero learning curve.\n\n• Ready in minutes, not hours\n• Built to last, priced to move\n• Loved by early users for its simplicity\n\nTry ${t} today — your future self will thank you.`,
  };
  return `${openers[template]}\n\n${bodies[template]}`;
}

const wordCount = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);

export default function AIWriterApp() {
  const [template, setTemplate] = useState('blog');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [output, setOutput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [drafts, setDrafts] = useState(load);
  const [showDrafts, setShowDrafts] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(drafts.slice(0, 50)));
  }, [drafts]);

  const generate = () => {
    if (!topic.trim()) {
      toast.error('Enter a topic first.');
      return;
    }
    setGenerating(true);
    setOutput('');
    setTimeout(() => {
      setOutput(demoGenerate(template, topic, tone));
      setGenerating(false);
    }, 900);
  };

  const saveDraft = () => {
    if (!output) {
      toast.error('Generate something first.');
      return;
    }
    const name = TEMPLATES.find((t) => t.id === template)?.name || template;
    setDrafts((d) => [{ id: Date.now().toString(), templateId: template, name, topic: topic.trim(), tone, output, at: new Date().toLocaleString() }, ...d].slice(0, 50));
    toast.success('Draft saved! 💾');
  };

  const loadDraft = (dr) => {
    setTemplate(TEMPLATES.some((t) => t.id === dr.templateId) ? dr.templateId : template);
    setTopic(dr.topic);
    setTone(dr.tone || 'Professional');
    setOutput(dr.output);
    setShowDrafts(false);
    toast.success('Draft loaded.');
  };

  const deleteDraft = (id) => {
    setDrafts((d) => d.filter((x) => x.id !== id));
    toast.info('Draft deleted.');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Copy failed.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
          <Sparkles className="w-4 h-4" /> Demo mode — output is template-generated. Connect an AI API for real generation.
        </div>

        <p className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-bold">Template</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`p-3 rounded-xl border text-sm font-bold transition ${
                template === t.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 border-transparent'
                  : 'border-white/10 bg-black/40 text-slate-400 hover:border-orange-500/40'
              }`}
            >
              <span className="mr-1.5">{t.icon}</span>{t.name}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic (e.g. morning routines)"
            className="sm:col-span-2 px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500/60"
          />
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500/60 text-slate-300"
          >
            {TONES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <button
          onClick={generate}
          disabled={generating}
          className="w-full py-3.5 rounded-xl font-black bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          <PenLine className="w-5 h-5" /> {generating ? 'Writing...' : 'Generate draft'}
        </button>
      </div>

      <AnimatePresence>
        {output && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Output · {wordCount(output)} words
              </span>
              <div className="flex gap-2">
                <button onClick={copy} className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-white/15 hover:bg-white/5">
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
                <button onClick={saveDraft} className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-300 hover:bg-orange-500/25">
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            </div>
            <div className="whitespace-pre-wrap text-sm text-slate-200 leading-relaxed max-h-96 overflow-y-auto">{output}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setShowDrafts((s) => !s)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold border border-white/15 hover:bg-white/5 transition text-sm mb-4"
      >
        <FolderOpen className="w-4 h-4" /> Drafts ({drafts.length})
      </button>

      {showDrafts && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          {drafts.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No drafts saved yet.</p>
          ) : (
            <ul className="space-y-2">
              {drafts.map((d) => (
                <li key={d.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-black/30 border border-white/5 text-sm">
                  <div className="min-w-0">
                    <p className="font-bold truncate">{d.topic}</p>
                    <p className="text-xs text-slate-500">{d.name} · {d.tone} · {d.at}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => loadDraft(d)} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-300">Load</button>
                    <button onClick={() => deleteDraft(d.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
