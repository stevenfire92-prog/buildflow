import { useState, useMemo } from 'react';
import { Plus, Trash2, Pencil, X, Search, KanbanSquare, Clock, User, Flag } from 'lucide-react';
import { toast } from 'sonner';

const KEY = 'sfproj:tasks';
const COLUMNS = [
  { id: 'todo', label: 'To Do', color: '#3b82f6' },
  { id: 'progress', label: 'In Progress', color: '#eab308' },
  { id: 'review', label: 'Review', color: '#a855f7' },
  { id: 'done', label: 'Done', color: '#22c55e' },
];
const PRIORITIES = [
  { id: 'low', label: 'Low', color: '#22c55e' },
  { id: 'medium', label: 'Medium', color: '#eab308' },
  { id: 'high', label: 'High', color: '#ef4444' },
];

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};
const save = (t) => { try { localStorage.setItem(KEY, JSON.stringify(t)); } catch {} };
const prioOf = (id) => PRIORITIES.find((p) => p.id === id) || PRIORITIES[1];
const colOf = (id) => COLUMNS.find((c) => c.id === id) || COLUMNS[0];

export default function ProjectsApp() {
  const [tasks, setTasks] = useState(load);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fTitle, setFTitle] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fPrio, setFPrio] = useState('medium');
  const [fAssignee, setFAssignee] = useState('');
  const [fDue, setFDue] = useState('');
  const [fCol, setFCol] = useState('todo');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const persist = (next) => { setTasks(next); save(next); };
  const today = new Date().toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const out = { total: tasks.length, overdue: 0 };
    for (const c of COLUMNS) out[c.id] = tasks.filter((t) => t.col === c.id).length;
    out.overdue = tasks.filter((t) => t.due && t.due < today && t.col !== 'done').length;
    return out;
  }, [tasks, today]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) =>
      !q || (t.title || '').toLowerCase().includes(q) ||
      (t.assignee || '').toLowerCase().includes(q) ||
      (t.desc || '').toLowerCase().includes(q)
    );
  }, [tasks, search]);

  const openAdd = (col = 'todo') => {
    setEditing(null); setFTitle(''); setFDesc(''); setFPrio('medium');
    setFAssignee(''); setFDue(''); setFCol(col); setShowModal(true);
  };
  const openEdit = (t) => {
    setEditing(t); setFTitle(t.title || ''); setFDesc(t.desc || '');
    setFPrio(t.prio || 'medium'); setFAssignee(t.assignee || '');
    setFDue(t.due || ''); setFCol(t.col || 'todo'); setShowModal(true);
  };
  const saveTask = () => {
    if (!fTitle.trim()) { toast.error('Task title is required'); return; }
    const payload = { title: fTitle.trim(), desc: fDesc.trim(), prio: fPrio, assignee: fAssignee.trim(), due: fDue, col: fCol };
    if (editing) {
      persist(tasks.map((t) => (t.id === editing.id ? { ...t, ...payload } : t)));
      toast.success('Task updated');
    } else {
      persist([{ ...payload, id: Date.now().toString(), ts: Date.now() }, ...tasks]);
      toast.success('Task added');
    }
    setShowModal(false);
  };
  const moveTask = (id, col) => {
    persist(tasks.map((t) => (t.id === id ? { ...t, col } : t)));
    toast.success(`Moved to ${colOf(col).label}`);
  };
  const doDelete = (id) => { persist(tasks.filter((t) => t.id !== id)); setConfirmDelete(null); toast.success('Task deleted'); };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-6">
        {[{ label: 'Total', value: stats.total, color: '#fff' },
          ...COLUMNS.map((c) => ({ label: c.label, value: stats[c.id], color: c.color })),
          { label: 'Overdue', value: stats.overdue, color: '#ef4444' },
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks, assignees…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
        </div>
        <button onClick={() => openAdd()} className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
          <KanbanSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="font-bold text-slate-300 mb-1">{tasks.length === 0 ? 'No tasks yet' : 'No tasks match your search'}</p>
          <p className="text-sm text-slate-500 mb-4">{tasks.length === 0 ? 'Create your first task and start shipping.' : 'Try a different search.'}</p>
          {tasks.length === 0 && (
            <button onClick={() => openAdd()} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
              <Plus className="w-4 h-4" /> New Task
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = visible.filter((t) => t.col === col.id).sort((a, b) => (b.ts || 0) - (a.ts || 0));
            return (
              <div key={col.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between mb-3 px-1">
                  <p className="font-bold text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                    {col.label} <span className="text-slate-500 font-normal">({colTasks.length})</span>
                  </p>
                  <button onClick={() => openAdd(col.id)} className="p-1.5 rounded-lg hover:bg-white/10 transition" title={`Add to ${col.label}`}>
                    <Plus className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <div className="space-y-2.5">
                  {colTasks.map((t) => {
                    const p = prioOf(t.prio);
                    const overdue = t.due && t.due < today && t.col !== 'done';
                    return (
                      <div key={t.id} className="rounded-xl border border-white/10 bg-[#121218] p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-sm flex-1">{t.title}</p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: `${p.color}22`, color: p.color, border: `1px solid ${p.color}44` }}>
                            {p.label}
                          </span>
                        </div>
                        {t.desc && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.desc}</p>}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-slate-500">
                          {t.assignee && <span className="inline-flex items-center gap-1"><User className="w-3 h-3" /> {t.assignee}</span>}
                          {t.due && <span className={`inline-flex items-center gap-1 ${overdue ? 'text-red-400 font-bold' : ''}`}><Clock className="w-3 h-3" /> {t.due}{overdue ? ' — overdue' : ''}</span>}
                        </div>
                        <div className="flex items-center gap-1.5 mt-2.5">
                          <select value={t.col} onChange={(e) => moveTask(t.id, e.target.value)}
                            className="flex-1 px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs outline-none focus:border-orange-500">
                            {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                          </select>
                          <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition" title="Edit">
                            <Pencil className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                          <button onClick={() => setConfirmDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition" title="Delete">
                            <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" />
                          </button>
                        </div>
                        {confirmDelete === t.id && (
                          <div className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 flex items-center justify-between gap-2">
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
                  {colTasks.length === 0 && <p className="text-xs text-slate-600 text-center py-4">Drop tasks here</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">{editing ? 'Edit Task' : 'New Task'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <input value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder="Task title *" autoFocus
              className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <textarea value={fDesc} onChange={(e) => setFDesc(e.target.value)} placeholder="Description" rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={fPrio} onChange={(e) => setFPrio(e.target.value)} className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500">
                {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.label} priority</option>)}
              </select>
              <select value={fCol} onChange={(e) => setFCol(e.target.value)} className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500">
                {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={fAssignee} onChange={(e) => setFAssignee(e.target.value)} placeholder="Assignee"
                className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
              <input value={fDue} onChange={(e) => setFDue(e.target.value)} type="date"
                className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={saveTask} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
                {editing ? 'Save Changes' : 'Add Task'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
