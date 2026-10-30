import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Plus, Target, Trash2, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppShell from '../components/AppShell';
import { SectionTitle } from '../components/widgets';
import { getStats, getGoals, saveGoal, deleteGoal, seedDefaultGoals } from '../api';

function Ring({ pct }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const done = pct >= 100;
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke={done ? '#34d399' : '#22d3ee'}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (Math.min(pct, 100) / 100) * c}
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-xs font-bold tabular-nums">
        {done ? '🎉' : `${Math.round(pct)}%`}
      </span>
    </div>
  );
}

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', target: '', metric: 'revenue' });
  const [celebrated, setCelebrated] = useState(() => {
    try { return JSON.parse(localStorage.getItem('globepay:celebrated') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [s, g] = await Promise.all([getStats(), Promise.resolve(seedDefaultGoals())]);
        setStats(s);
        setDemo(s.demo);
        setGoals(g);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const currentOf = (goal) => {
    if (!stats) return 0;
    if (goal.metric === 'mrr') return stats.mrrCents / 100;
    if (goal.metric === 'sales') return stats.salesCount;
    return stats.grossCents / 100;
  };

  const checkCelebrations = (list) => {
    list.forEach((g) => {
      const pct = (currentOf(g) / g.target) * 100;
      if (pct >= 100 && !celebrated.includes(g.id)) {
        const next = [...celebrated, g.id];
        setCelebrated(next);
        localStorage.setItem('globepay:celebrated', JSON.stringify(next));
        confetti({ particleCount: 160, spread: 80, origin: { y: 0.4 }, colors: ['#34d399', '#22d3ee', '#fbbf24', '#a78bfa'] });
        toast.success(`Goal smashed: "${g.title}" 🎉`, { duration: 6000 });
      }
    });
  };

  useEffect(() => {
    if (goals.length && stats) checkCelebrations(goals);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals, stats]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.title || !form.target) return;
    const next = saveGoal({ title: form.title, target: Number(form.target), metric: form.metric, createdAt: Date.now() });
    setGoals(next);
    setOpen(false);
    setForm({ title: '', target: '', metric: 'revenue' });
    toast.success('Goal set — now go get it.');
  };

  const remove = (id) => {
    setGoals(deleteGoal(id));
    toast.success('Goal removed.');
  };

  return (
    <AppShell demo={demo}>
      <SectionTitle
        title="Revenue goals"
        sub="Set targets, watch the rings fill, celebrate the wins."
        action={
          <Button onClick={() => setOpen(true)} className="bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold">
            <Plus className="w-4 h-4 mr-1.5" /> New goal
          </Button>
        }
      />

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">{[1, 2].map((i) => <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse" />)}</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence>
            {goals.map((g, i) => {
              const cur = currentOf(g);
              const pct = g.target > 0 ? (cur / g.target) * 100 : 0;
              const done = pct >= 100;
              const curLabel = g.metric === 'sales' ? `${cur}` : `$${Math.round(cur).toLocaleString()}`;
              const targetLabel = g.metric === 'sales' ? `${g.target} sales` : `$${Number(g.target).toLocaleString()}${g.metric === 'mrr' ? ' MRR' : ''}`;
              return (
                <motion.div key={g.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} exit={{ opacity: 0, scale: 0.96 }}>
                  <Card className={`border-white/10 bg-white/[0.03] ${done ? 'border-emerald-400/40' : ''}`}>
                    <CardContent className="p-5 flex items-center gap-4">
                      <Ring pct={pct} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{g.title}</h3>
                          {done && <Trophy className="w-4 h-4 text-amber-300 shrink-0" />}
                        </div>
                        <p className="text-sm text-slate-500 mt-1 tabular-nums">{curLabel} / {targetLabel}</p>
                        <div className="mt-2.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${done ? 'bg-emerald-400' : 'bg-cyan-400'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </div>
                      <button onClick={() => remove(g.id)} className="text-slate-600 hover:text-rose-300 transition-colors shrink-0" aria-label="Delete goal">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-slate-100">
          <DialogHeader>
            <DialogTitle>New revenue goal</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Goal name</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="First $10k month" required className="mt-1.5 bg-white/5 border-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Target</Label>
                <Input type="number" min="1" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} placeholder="10000" required className="mt-1.5 bg-white/5 border-white/10" />
              </div>
              <div>
                <Label>Metric</Label>
                <select value={form.metric} onChange={(e) => setForm({ ...form, metric: e.target.value })} className="mt-1.5 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm">
                  <option value="revenue">Revenue ($)</option>
                  <option value="mrr">MRR ($)</option>
                  <option value="sales">Sales (count)</option>
                </select>
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold">
              <Target className="w-4 h-4 mr-2" /> Set goal
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
