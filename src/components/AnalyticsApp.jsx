import { useState, useMemo } from 'react';
import { Plus, Trash2, X, ChartColumn, DollarSign, ShoppingBag, Eye, Percent, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const KEY = 'sfanalytics:metrics';

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const save = (m) => { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch {} };
const money = (n) => `$${(Number(n) || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AnalyticsApp() {
  const [metrics, setMetrics] = useState(load);
  const [showModal, setShowModal] = useState(false);
  const [fDate, setFDate] = useState(new Date().toISOString().slice(0, 10));
  const [fRevenue, setFRevenue] = useState('');
  const [fOrders, setFOrders] = useState('');
  const [fVisitors, setFVisitors] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const persist = (next) => { setMetrics(next); save(next); };

  const sorted = useMemo(() => metrics.slice().sort((a, b) => (a.date || '').localeCompare(b.date || '')), [metrics]);

  const totals = useMemo(() => {
    const revenue = metrics.reduce((s, m) => s + (Number(m.revenue) || 0), 0);
    const orders = metrics.reduce((s, m) => s + (Number(m.orders) || 0), 0);
    const visitors = metrics.reduce((s, m) => s + (Number(m.visitors) || 0), 0);
    const conv = visitors > 0 ? (orders / visitors) * 100 : 0;
    const aov = orders > 0 ? revenue / orders : 0;
    return { revenue, orders, visitors, conv, aov };
  }, [metrics]);

  const monthly = useMemo(() => {
    const map = {};
    for (const m of metrics) {
      const key = (m.date || '').slice(0, 7);
      if (!key) continue;
      if (!map[key]) map[key] = { revenue: 0, orders: 0, visitors: 0 };
      map[key].revenue += Number(m.revenue) || 0;
      map[key].orders += Number(m.orders) || 0;
      map[key].visitors += Number(m.visitors) || 0;
    }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).slice(-8);
  }, [metrics]);

  const maxRev = Math.max(1, ...monthly.map(([, d]) => d.revenue));

  const addMetric = () => {
    if (!fDate) { toast.error('Pick a date'); return; }
    persist([{ id: Date.now().toString(), date: fDate, revenue: Math.max(0, Number(fRevenue) || 0), orders: Math.max(0, Number(fOrders) || 0), visitors: Math.max(0, Number(fVisitors) || 0), ts: Date.now() }, ...metrics]);
    setShowModal(false); setFRevenue(''); setFOrders(''); setFVisitors('');
    toast.success('Metrics logged');
  };
  const doDelete = (id) => { persist(metrics.filter((m) => m.id !== id)); setConfirmDelete(null); toast.success('Entry deleted'); };

  const kpis = [
    { label: 'Total Revenue', value: money(totals.revenue), icon: DollarSign, color: '#22c55e' },
    { label: 'Total Orders', value: totals.orders.toLocaleString(), icon: ShoppingBag, color: '#3b82f6' },
    { label: 'Total Visitors', value: totals.visitors.toLocaleString(), icon: Eye, color: '#a855f7' },
    { label: 'Conversion', value: `${totals.conv.toFixed(1)}%`, icon: Percent, color: '#eab308' },
    { label: 'Avg Order Value', value: money(totals.aov), icon: TrendingUp, color: '#f97316' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <k.icon className="w-4 h-4 mb-1" style={{ color: k.color }} />
            <p className="text-lg font-black">{k.value}</p>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end mb-6">
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
          <Plus className="w-4 h-4" /> Log Day
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6">
        <h3 className="font-black mb-1 flex items-center gap-2"><ChartColumn className="w-4 h-4 text-orange-400" /> Monthly Revenue</h3>
        <p className="text-xs text-slate-500 mb-4">Last {monthly.length} months with data</p>
        {monthly.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">Log daily metrics to build your revenue chart.</p>
        ) : (
          <div className="flex items-end gap-2 h-44">
            {monthly.map(([key, d]) => {
              const [y, m] = key.split('-');
              const label = `${MONTHS[Number(m) - 1]} '${y.slice(2)}`;
              return (
                <div key={key} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end" title={`${label}: ${money(d.revenue)}`}>
                  <p className="text-[10px] font-bold text-slate-400">{money(d.revenue)}</p>
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-orange-600 to-red-500 transition-all" style={{ height: `${Math.max(4, (d.revenue / maxRev) * 100)}%` }} />
                  <p className="text-[10px] text-slate-500">{label}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-black mb-4">Daily Log</h3>
        {sorted.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No entries yet — log your first day above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-white/10">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4 text-right">Revenue</th>
                  <th className="py-2 pr-4 text-right">Orders</th>
                  <th className="py-2 pr-4 text-right">Visitors</th>
                  <th className="py-2 pr-4 text-right">Conv.</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.slice().reverse().map((m) => {
                  const conv = (Number(m.visitors) || 0) > 0 ? ((Number(m.orders) || 0) / (Number(m.visitors) || 1)) * 100 : 0;
                  return (
                    <tr key={m.id} className="border-b border-white/5">
                      <td className="py-2.5 pr-4 font-semibold">{m.date}</td>
                      <td className="py-2.5 pr-4 text-right text-emerald-300 font-bold">{money(m.revenue)}</td>
                      <td className="py-2.5 pr-4 text-right">{m.orders}</td>
                      <td className="py-2.5 pr-4 text-right">{m.visitors}</td>
                      <td className="py-2.5 pr-4 text-right text-slate-400">{conv.toFixed(1)}%</td>
                      <td className="py-2.5 text-right">
                        {confirmDelete === m.id ? (
                          <span className="inline-flex gap-1.5">
                            <button onClick={() => doDelete(m.id)} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600">Yes</button>
                            <button onClick={() => setConfirmDelete(null)} className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10">No</button>
                          </span>
                        ) : (
                          <button onClick={() => setConfirmDelete(m.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition"><Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" /></button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">Log Day</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input value={fDate} onChange={(e) => setFDate(e.target.value)} type="date" autoFocus className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="grid grid-cols-3 gap-3">
              <input value={fRevenue} onChange={(e) => setFRevenue(e.target.value)} type="number" min="0" step="0.01" placeholder="Revenue $" className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
              <input value={fOrders} onChange={(e) => setFOrders(e.target.value)} type="number" min="0" placeholder="Orders" className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
              <input value={fVisitors} onChange={(e) => setFVisitors(e.target.value)} type="number" min="0" placeholder="Visitors" className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={addMetric} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">Log Metrics</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
