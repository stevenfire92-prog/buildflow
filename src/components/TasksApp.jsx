import { useState, useMemo } from 'react';
import { Plus, Trash2, X, Search, ListChecks, Check, ChevronDown, Flag } from 'lucide-react';
import { toast } from 'sonner';

const KEY = 'sftasks:tasks';
const PRIOS = [
  { id: 'low', label: 'Low', color: '#22c55e' },
  { id: 'medium', label: 'Medium', color: '#eab308' },
  { id: 'high', label: 'High', color: '#ef4444' },
];
const prioOf = (id) => PRIOS.find((p) => p.id === id) || PRIOS[1];

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const save = (t) => { try { localStorage.setItem(KEY, JSON.stringify(t)); } catch {} };

export default function TasksApp() {
  const [tasks, setTasks] = useState(load);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [quick, setQuick] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fTitle, setFTitle] = useState('');
  const [fPrio, setFPrio] = useState('medium');
  const [fDue, setFDue] = useState('');
  const [fSubs, setFSubs] = useState([]);
  const [subInput, setSubInput] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const persist = (n) => { setTasks(n); save(n); };
  const today = new Date().toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const open = tasks.filter((t) => !t.done);
    return {
      total: tasks.length,
      open: open.length,
      done: tasks.length - open.length,
      overdue: open.filter((t) => t.due && t.due < today).length,
      dueToday: open.filter((t) => t.due === today).length,
    };
  }, [tasks, today]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks
      .filter((t) => {
        if (filter === 'open') return !t.done;
        if (filter === 'done') return t.done;
        if (filter === 'overdue') return !t.done && t.due && t.due < today;
        if (filter === 'today') return !t.done && t.due === today;
        return true;
      })
      .filter((t) => !q || (t.title || '').toLowerCase().includes(q))
      .slice()
      .sort((a, b) => {
        if (!!a.done !== !!b.done) return a.done ? 1 : -1;
        const pa = PRIOS.findIndex((p) => p.id === a.prio);
        const pb = PRIOS.findIndex((p) => p.id === b.prio);
        if (pa !== pb) return pb - pa;
        return (b.ts || 0) - (a.ts || 0);
      });
  }, [tasks, search, filter, today]);

  const quickAdd = () => {
    if (!quick.trim()) { toast.error('Type a task first'); return; }
    persist([{ id: Date.now().toString(), title: quick.trim(), prio: 'medium', due: '', subs: [], done: false, ts: Date.now() }, ...tasks]);
    setQuick('');
    toast.success('Task added');
  };

  const toggleDone = (id) => {
    persist(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const openEdit = (t) => {
    setEditing(t); setFTitle(t.title || ''); setFPrio(t.prio || 'medium');
    setFDue(t.due || ''); setFSubs(t.subs || []); setSubInput(''); setShowModal(true);
  };
  const addSub = () => {
    if (!subInput.trim()) return;
    setFSubs([...fSubs, { id: Date.now().toString(), text: subInput.trim(), done: false }]);
    setSubInput('');
  };
  const toggleFSub = (id) => setFSubs(fSubs.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  const delFSub = (id) => setFSubs(fSubs.filter((s) => s.id !== id));
  const saveTask = () => {
    if (!fTitle.trim()) { toast.error('Title is required'); return; }
    persist(tasks.map((t) => (t.id === editing.id ? { ...t, title: fTitle.trim(), prio: fPrio, due: fDue, subs: fSubs } : t)));
    setShowModal(false);
    toast.success('Task updated');
  };
  const doDelete = (id) => { persist(tasks.filter((t) => t.id !== id)); setConfirmDelete(null); toast.success('Task deleted'); };
  const toggleSub = (taskId, subId) => {
    persist(tasks.map((t) => t.id === taskId ? { ...t, subs: (t.subs || []).map((s) => (s.id === subId ? { ...s, done: !s.done } : s)) } : t));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Open', value: stats.open, color: '#3b82f6' },
          { label: 'Done', value: stats.done, color: '#22c55e' },
          { label: 'Overdue', value: stats.overdue, color: stats.overdue ? '#ef4444' : '#64748b' },
          { label: 'Due Today', value: stats.dueToday, color: '#eab308' },
          { label: 'Total', value: stats.total, color: '#fff' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">{s.label}</p>
            <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <input value={quick} onChange={(e) => setQuick(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && quickAdd()}
          placeholder="Quick add a task… (Enter)"
          className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
        <button onClick={quickAdd} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
        </div>
        <div className="flex gap-2">
          {[['all', 'All'], ['open', 'Open'], ['today', 'Today'], ['overdue', 'Overdue'], ['done', 'Done']].map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${filter === id ? 'border-orange-500 bg-orange-500/10 text-orange-300' : 'border-white/10 hover:bg-white/5'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
          <ListChecks className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="font-bold text-slate-300">{tasks.length === 0 ? 'All clear!' : 'No tasks match'}</p>
          <p className="text-sm text-slate-500">{tasks.length === 0 ? 'Add your first task above.' : 'Try a different filter.'}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visible.map((t) => {
            const p = prioOf(t.prio);
            const overdue = !t.done && t.due && t.due < today;
            const subs = t.subs || [];
            const doneSubs = subs.filter((s) => s.done).length;
            const isOpen = expanded === t.id;
            return (
              <div key={t.id} className={`rounded-2xl border p-4 transition ${t.done ? 'border-white/5 bg-white/[0.015] opacity-60' : overdue ? 'border-red-500/30 bg-red-500/[0.03]' : 'border-white/10 bg-white/[0.03]'}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleDone(t.id)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${t.done ? 'bg-emerald-500 border-emerald-500' : 'border-white/25 hover:border-emerald-400'}`}>
                    {t.done && <Check className="w-4 h-4 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-bold ${t.done ? 'line-through text-slate-500' : ''}`}>{t.title}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${p.color}22`, color: p.color, border: `1px solid ${p.color}44` }}>
                        <Flag className="w-2.5 h-2.5" /> {p.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                      {t.due && <span className={overdue ? 'text-red-400 font-bold' : t.due === today ? 'text-amber-300 font-bold' : ''}>📅 {t.due}{overdue ? ' — overdue' : t.due === today ? ' — today' : ''}</span>}
                      {subs.length > 0 && <span>☑ {doneSubs}/{subs.length} subtasks</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {subs.length > 0 && (
                      <button onClick={() => setExpanded(isOpen ? null : t.id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition">
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                    <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition text-xs font-bold text-slate-400 px-2.5">Edit</button>
                    <button onClick={() => setConfirmDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition">
                      <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" />
                    </button>
                  </div>
                </div>
                {isOpen && subs.length > 0 && (
                  <div className="ml-9 mt-3 space-y-1.5">
                    {subs.map((s) => (
                      <button key={s.id} onClick={() => toggleSub(t.id, s.id)} className="w-full flex items-center gap-2 text-left text-sm">
                        <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${s.done ? 'bg-emerald-500 border-emerald-500' : 'border-white/25'}`}>
                          {s.done && <Check className="w-3 h-3 text-white" />}
                        </span>
                        <span className={s.done ? 'line-through text-slate-500' : 'text-slate-300'}>{s.text}</span>
                      </button>
                    ))}
                  </div>
                )}
                {confirmDelete === t.id && (
                  <div className="ml-9 mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 flex items-center justify-between gap-2">
                    <p className="text-xs text-red-300 font-semibold">Delete?</p>
                    <div className="flex gap-1.5">
                      <button onClick={() => doDelete(t.id)} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600">Yes</button>
                      <button onClick={() => setConfirmDelete(null)} className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10">No</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">Edit Task</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder="Title *" autoFocus className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={fPrio} onChange={(e) => setFPrio(e.target.value)} className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500">
                {PRIOS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
              <input value={fDue} onChange={(e) => setFDue(e.target.value)} type="date" className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 mb-2">Subtasks ({fSubs.length})</p>
              <div className="space-y-1.5 mb-2">
                {fSubs.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5">
                    <button onClick={() => toggleFSub(s.id)} className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${s.done ? 'bg-emerald-500 border-emerald-500' : 'border-white/25'}`}>
                      {s.done && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className={`text-sm flex-1 ${s.done ? 'line-through text-slate-500' : ''}`}>{s.text}</span>
                    <button onClick={() => delFSub(s.id)} className="text-slate-500 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={subInput} onChange={(e) => setSubInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSub()} placeholder="Add subtask…"
                  className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
                <button onClick={addSub} className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition">Add</button>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={saveTask} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">Save Changes</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
