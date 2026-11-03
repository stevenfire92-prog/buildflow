import { useState, useMemo } from 'react';
import { Plus, Trash2, X, Search, BellRing, Check, Repeat } from 'lucide-react';
import { toast } from 'sonner';

const KEY = 'sfremind:reminders';
const PRIOS = [
  { id: 'low', label: 'Low', color: '#22c55e' },
  { id: 'medium', label: 'Medium', color: '#eab308' },
  { id: 'high', label: 'High', color: '#ef4444' },
];
const REPEATS = [
  { id: 'none', label: 'No repeat' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
];
const prioOf = (id) => PRIOS.find((p) => p.id === id) || PRIOS[1];

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const save = (r) => { try { localStorage.setItem(KEY, JSON.stringify(r)); } catch {} };
const addDays = (ds, n) => { const d = new Date(ds + 'T00:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

export default function RemindersApp() {
  const [reminders, setReminders] = useState(load);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('upcoming');
  const [showModal, setShowModal] = useState(false);
  const [fTitle, setFTitle] = useState('');
  const [fDate, setFDate] = useState(new Date().toISOString().slice(0, 10));
  const [fTime, setFTime] = useState('');
  const [fPrio, setFPrio] = useState('medium');
  const [fRepeat, setFRepeat] = useState('none');
  const [fNote, setFNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const persist = (n) => { setReminders(n); save(n); };
  const today = new Date().toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const active = reminders.filter((r) => !r.done);
    return {
      upcoming: active.filter((r) => !r.date || r.date >= today).length,
      overdue: active.filter((r) => r.date && r.date < today).length,
      doneToday: reminders.filter((r) => r.done && r.doneDate === today).length,
      total: reminders.length,
    };
  }, [reminders, today]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reminders
      .filter((r) => {
        if (filter === 'upcoming') return !r.done;
        if (filter === 'overdue') return !r.done && r.date && r.date < today;
        if (filter === 'done') return r.done;
        return true;
      })
      .filter((r) => !q || (r.title || '').toLowerCase().includes(q) || (r.note || '').toLowerCase().includes(q))
      .slice()
      .sort((a, b) => {
        if (!!a.done !== !!b.done) return a.done ? 1 : -1;
        return (a.date || '9999').localeCompare(b.date || '9999') || (a.time || '').localeCompare(b.time || '');
      });
  }, [reminders, search, filter, today]);

  const addReminder = () => {
    if (!fTitle.trim()) { toast.error('Title is required'); return; }
    persist([{ id: Date.now().toString(), title: fTitle.trim(), date: fDate, time: fTime, prio: fPrio, repeat: fRepeat, note: fNote.trim(), done: false, ts: Date.now() }, ...reminders]);
    setShowModal(false); setFTitle(''); setFTime(''); setFPrio('medium'); setFRepeat('none'); setFNote('');
    toast.success('Reminder set');
  };

  const complete = (r) => {
    let next = reminders.map((x) => (x.id === r.id ? { ...x, done: true, doneDate: today } : x));
    if (r.repeat !== 'none' && r.date) {
      const n = r.repeat === 'daily' ? 1 : r.repeat === 'weekly' ? 7 : 30;
      next = [{ ...r, id: Date.now().toString(), date: addDays(r.date, n), done: false, doneDate: null, ts: Date.now() }, ...next];
      toast.success(`Done! Next one scheduled for ${addDays(r.date, n)}`);
    } else {
      toast.success('Marked done');
    }
    persist(next);
  };
  const reopen = (id) => persist(reminders.map((r) => (r.id === id ? { ...r, done: false, doneDate: null } : r)));
  const doDelete = (id) => { persist(reminders.filter((r) => r.id !== id)); setConfirmDelete(null); toast.success('Deleted'); };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Upcoming', value: stats.upcoming, color: '#3b82f6' },
          { label: 'Overdue', value: stats.overdue, color: stats.overdue ? '#ef4444' : '#64748b' },
          { label: 'Done Today', value: stats.doneToday, color: '#22c55e' },
          { label: 'Total', value: stats.total, color: '#fff' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">{s.label}</p>
            <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reminders…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
        </div>
        <div className="flex gap-2">
          {[['upcoming', 'Upcoming'], ['overdue', 'Overdue'], ['done', 'Done'], ['all', 'All']].map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${filter === id ? 'border-orange-500 bg-orange-500/10 text-orange-300' : 'border-white/10 hover:bg-white/5'}`}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
          <Plus className="w-4 h-4" /> New
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
          <BellRing className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="font-bold text-slate-300">{reminders.length === 0 ? 'Nothing to remember yet' : 'No reminders match'}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visible.map((r) => {
            const p = prioOf(r.prio);
            const overdue = !r.done && r.date && r.date < today;
            return (
              <div key={r.id} className={`rounded-2xl border p-4 ${r.done ? 'border-white/5 bg-white/[0.015] opacity-60' : overdue ? 'border-red-500/30 bg-red-500/[0.03]' : 'border-white/10 bg-white/[0.03]'}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => (r.done ? reopen(r.id) : complete(r))}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${r.done ? 'bg-emerald-500 border-emerald-500' : 'border-white/25 hover:border-emerald-400'}`}>
                    {r.done && <Check className="w-4 h-4 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-bold ${r.done ? 'line-through text-slate-500' : ''}`}>{r.title}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${p.color}22`, color: p.color, border: `1px solid ${p.color}44` }}>{p.label}</span>
                      {r.repeat !== 'none' && <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400"><Repeat className="w-2.5 h-2.5" /> {r.repeat}</span>}
                    </div>
                    <p className={`text-xs mt-1 ${overdue ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                      {[r.date, r.time].filter(Boolean).join(' · ') || 'No date'}{overdue ? ' — overdue' : ''}
                    </p>
                    {r.note && <p className="text-xs text-slate-400 mt-1">{r.note}</p>}
                  </div>
                  <button onClick={() => setConfirmDelete(r.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition shrink-0">
                    <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" />
                  </button>
                </div>
                {confirmDelete === r.id && (
                  <div className="ml-9 mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 flex items-center justify-between gap-2">
                    <p className="text-xs text-red-300 font-semibold">Delete?</p>
                    <div className="flex gap-1.5">
                      <button onClick={() => doDelete(r.id)} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600">Yes</button>
                      <button onClick={() => setConfirmDelete(null)} className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10">No</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">New Reminder</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder="Remind me to… *" autoFocus className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={fDate} onChange={(e) => setFDate(e.target.value)} type="date" className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
              <input value={fTime} onChange={(e) => setFTime(e.target.value)} type="time" className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={fPrio} onChange={(e) => setFPrio(e.target.value)} className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500">
                {PRIOS.map((p) => <option key={p.id} value={p.id}>{p.label} priority</option>)}
              </select>
              <select value={fRepeat} onChange={(e) => setFRepeat(e.target.value)} className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500">
                {REPEATS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>
            <input value={fNote} onChange={(e) => setFNote(e.target.value)} placeholder="Note (optional)" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="flex gap-2 pt-1">
              <button onClick={addReminder} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">Set Reminder</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
