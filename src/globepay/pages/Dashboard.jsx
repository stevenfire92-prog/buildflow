import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Repeat, Flame, Wallet, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppShell from '../components/AppShell';
import { StatCard, SectionTitle } from '../components/widgets';
import { getStats } from '../api';

function timeAgo(ts) {
  const s = Math.floor(Date.now() / 1000) - ts;
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const load = async (d = days) => {
    setLoading(true);
    try {
      const s = await getStats(d);
      setStats(s);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changeDays = (d) => { setDays(d); load(d); };

  const celebrate = () => {
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.3 }, colors: ['#34d399', '#22d3ee', '#a78bfa', '#fbbf24'] });
  };

  if (loading || !stats) {
    return (
      <AppShell>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell demo={stats.demo}>
      <SectionTitle
        title={stats.demo ? 'Demo dashboard' : 'Revenue dashboard'}
        sub={stats.demo ? 'Sample data — connect Stripe to see your live numbers.' : 'Live from your Stripe account.'}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => load()} className="border-white/10">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
            </Button>
            <Button size="sm" onClick={celebrate} className="bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold">
              Celebrate 🎉
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Gross volume" value={stats.grossFormatted} sub={`last ${days} days`} icon={DollarSign} accent="emerald" delay={0} />
        <StatCard label="Sales" value={stats.salesCount} sub={`${stats.streakDays}-day streak`} icon={ShoppingBag} accent="cyan" delay={0.05} />
        <StatCard label="MRR" value={stats.mrrFormatted} sub={`${stats.activeSubscriptions} active subs`} icon={Repeat} accent="violet" delay={0.1} />
        <StatCard label="Sales streak" value={`${stats.streakDays} 🔥`} sub="days in a row" icon={Flame} accent="amber" delay={0.15} />
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-4">
        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Revenue</CardTitle>
            <div className="flex gap-1">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => changeDays(d)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium ${days === d ? 'bg-emerald-400/20 text-emerald-300' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.series}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} interval={Math.ceil(stats.series.length / 8)} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} width={52} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`$${v}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4">
        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent payments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {stats.recent.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02]">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid place-items-center w-9 h-9 rounded-full bg-emerald-400/10 text-emerald-300 shrink-0">
                      <Wallet className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.description}</p>
                      <p className="text-xs text-slate-500 truncate">{p.email} · {timeAgo(p.created)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="outline" className="border-emerald-400/30 text-emerald-300 text-[10px]">{p.status}</Badge>
                    <span className="text-sm font-bold tabular-nums text-emerald-300">+{p.amount}</span>
                  </div>
                </div>
              ))}
              {stats.recent.length === 0 && (
                <p className="px-5 py-8 text-sm text-slate-500 text-center">No payments yet — create a product and share a payment link to get your first sale.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AppShell>
  );
}
