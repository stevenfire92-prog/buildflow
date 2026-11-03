import { useState, useMemo } from 'react';
import { Plus, Trash2, X, ChevronLeft, ChevronRight, CalendarDays, Clock } from 'lucide-react';
import { toast } from 'sonner';

const KEY = 'sfcal:events';
const COLORS = [
  { id: 'orange', dot: '#f97316' },
  { id: 'blue', dot: '#3b82f6' },
  { id: 'green', dot: '#22c55e' },
  { id: 'purple', dot: '#a855f7' },
  { id: 'red', dot: '#ef4444' },
];
const colorOf = (id) => COLORS.find((c) => c.id === id) || COLORS[0];

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const save = (e) => { try { localStorage.setItem(KEY, JSON.stringify(e)); } catch {} };
const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function CalendarApp() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [events, setEvents] = useState(load);
  const [selected, setSelected] = useState(fmt(now));
  const [showModal, setShowModal] = useState(false);
  const [fTitle, setFTitle] = useState('');
  const [fTime, setFTime] = useState('');
  const [fColor, setFColor] = useState('orange');
  const [fNote, setFNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const persist = (n) => { setEvents(n); save(n); };
  const todayStr = fmt(now);

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const startDay = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < startDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(year, month, d));
    return arr;
  }, [year, month]);

  const byDate = useMemo(() => {
    const m = {};
    for (const e of events) {
      if (!m[e.date]) m[e.date] = [];
      m[e.date].push(e);
    }
    for (const k of Object.keys(m)) m[k].sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));
    return m;
  }, [events]);

  const upcoming = useMemo(() =>
    events.filter((e) => e.date >= todayStr).sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || ''))).slice(0, 8),
    [events, todayStr]);

  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  const addEvent = () => {
    if (!fTitle.trim()) { toast.error('Title is required'); return; }
    persist([{ id: Date.now().toString(), title: fTitle.trim(), date: selected, time: fTime, color: fColor, note: fNote.trim(), ts: Date.now() }, ...events]);
    setShowModal(false); setFTitle(''); setFTime(''); setFColor('orange'); setFNote('');
    toast.success('Event added');
  };
  const doDelete = (id) => { persist(events.filter((e) => e.id !== id)); setConfirmDelete(null); toast.success('Event deleted'); };

  const selEvents = byDate[selected] || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"><ChevronLeft className="w-4 h-4" /></button>
              <p className="font-black text-lg">{monthName}</p>
              <button onClick={nextMonth} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <p key={i} className="text-center text-[11px] font-bold text-slate-500 py-1">{d}</p>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((d, i) => {
                if (!d) return <div key={`e${i}`} />;
                const ds = fmt(d);
                const evts = byDate[ds] || [];
                const isToday = ds === todayStr;
                const isSel = ds === selected;
                return (
                  <button key={ds} onClick={() => setSelected(ds)}
                    className={`min-h-[64px] rounded-xl border p-1 text-left transition ${isSel ? 'border-orange-500 bg-orange-500/10' : isToday ? 'border-white/25 bg-white/[0.05]' : 'border-white/5 hover:bg-white/[0.04]'}`}>
                    <p className={`text-xs font-bold px-1 ${isToday ? 'text-orange-300' : 'text-slate-400'}`}>{d.getDate()}</p>
                    <div className="flex flex-wrap gap-0.5 px-0.5 mt-0.5">
                      {evts.slice(0, 3).map((e) => (
                        <span key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorOf(e.color).dot }} />
                      ))}
                      {evts.length > 3 && <span className="text-[10px] text-slate-500">+{evts.length - 3}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-black">{selected === todayStr ? 'Today' : selected}</p>
              <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            {selEvents.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No events this day.</p>
            ) : (
              <div className="space-y-2">
                {selEvents.map((e) => (
                  <div key={e.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colorOf(e.color).dot }} />
                        <p className="font-bold text-sm truncate">{e.title}</p>
                      </div>
                      <button onClick={() => setConfirmDelete(e.id)} className="p-1 rounded-lg hover:bg-red-500/20 transition shrink-0">
                        <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" />
                      </button>
                    </div>
                    {e.time && <p className="text-xs text-slate-500 mt-1 inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {e.time}</p>}
                    {e.note && <p className="text-xs text-slate-400 mt-1">{e.note}</p>}
                    {confirmDelete === e.id && (
                      <div className="mt-2 flex gap-1.5">
                        <button onClick={() => doDelete(e.id)} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600">Delete</button>
                        <button onClick={() => setConfirmDelete(null)} className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10">Cancel</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-black mb-3 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-orange-400" /> Upcoming</p>
            {upcoming.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-3">Nothing scheduled.</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((e) => (
                  <button key={e.id} onClick={() => setSelected(e.date)} className="w-full text-left rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 hover:bg-white/[0.05] transition">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colorOf(e.color).dot }} />
                      <p className="text-sm font-semibold truncate flex-1">{e.title}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{e.date}{e.time ? ` · ${e.time}` : ''}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">Add Event — {selected}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder="Event title *" autoFocus className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <input value={fTime} onChange={(e) => setFTime(e.target.value)} type="time" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <input value={fNote} onChange={(e) => setFNote(e.target.value)} placeholder="Note (optional)" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div>
              <p className="text-xs text-slate-500 mb-2">Color</p>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button key={c.id} onClick={() => setFColor(c.id)} className={`w-8 h-8 rounded-full border-2 transition ${fColor === c.id ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c.dot }} />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={addEvent} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">Add Event</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
