import { useState, useMemo } from 'react';
import { Plus, Trash2, X, CalendarClock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const EMP_KEY = 'sfsched:employees';
const SHIFT_KEY = 'sfsched:shifts';

const load = (k) => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const SHIFTS = [
  { id: 'off', label: 'Off', color: 'transparent', text: '#64748b' },
  { id: 'morning', label: 'Morning', short: 'AM', color: '#3b82f633', text: '#93c5fd' },
  { id: 'afternoon', label: 'Afternoon', short: 'PM', color: '#eab30833', text: '#fde68a' },
  { id: 'evening', label: 'Evening', short: 'EVE', color: '#a855f733', text: '#d8b4fe' },
  { id: 'full', label: 'Full Day', short: 'FULL', color: '#22c55e33', text: '#86efac' },
];
const shiftOf = (id) => SHIFTS.find((s) => s.id === id) || SHIFTS[0];

const mondayOf = (d) => {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
};
const fmt = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ScheduleApp() {
  const [employees, setEmployees] = useState(() => load(EMP_KEY));
  const [shifts, setShifts] = useState(() => load(SHIFT_KEY));
  const [weekStart, setWeekStart] = useState(() => fmt(mondayOf(new Date())));
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [fName, setFName] = useState('');
  const [fRole, setFRole] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editCell, setEditCell] = useState(null);

  const persistE = (n) => { setEmployees(n); save(EMP_KEY, n); };
  const persistS = (n) => { setShifts(n); save(SHIFT_KEY, n); };

  const weekDays = useMemo(() => {
    const base = new Date(weekStart + 'T00:00:00');
    return Array.from({ length: 7 }, (_, i) => fmt(addDays(base, i)));
  }, [weekStart]);

  const getShift = (empId, date) => {
    const rec = shifts.find((s) => s.empId === empId && s.date === date);
    return rec ? rec.shift : 'off';
  };
  const setShift = (empId, date, shift) => {
    const ex = shifts.find((s) => s.empId === empId && s.date === date);
    if (ex) persistS(shifts.map((s) => (s === ex ? { ...s, shift } : s)));
    else persistS([...shifts, { empId, date, shift }]);
    setEditCell(null);
  };

  const weekStats = useMemo(() => {
    let scheduled = 0;
    for (const d of weekDays) for (const e of employees) if (getShift(e.id, d) !== 'off') scheduled++;
    return { employees: employees.length, scheduled, total: employees.length * 7 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekDays, employees, shifts]);

  const copyPrevWeek = () => {
    const base = new Date(weekStart + 'T00:00:00');
    const prevStart = fmt(addDays(base, -7));
    const prev = shifts.filter((s) => {
      const d = new Date(s.date + 'T00:00:00');
      return d >= new Date(prevStart + 'T00:00:00') && d < base;
    });
    if (prev.length === 0) { toast.error('No shifts last week to copy'); return; }
    const existing = new Set(shifts.map((s) => `${s.empId}|${s.date}`));
    const copies = prev.map((s, i) => {
      const d = addDays(new Date(s.date + 'T00:00:00'), 7);
      return { empId: s.empId, date: fmt(d), shift: s.shift, _k: i };
    }).filter((s) => !existing.has(`${s.empId}|${s.date}`));
    persistS([...shifts, ...copies.map(({ _k, ...r }) => r)]);
    toast.success(`Copied ${copies.length} shifts from last week`);
  };

  const addEmployee = () => {
    if (!fName.trim()) { toast.error('Name is required'); return; }
    persistE([{ id: Date.now().toString(), name: fName.trim(), role: fRole.trim(), ts: Date.now() }, ...employees]);
    setShowEmpModal(false); setFName(''); setFRole('');
    toast.success('Team member added');
  };
  const deleteEmp = (id) => {
    persistE(employees.filter((e) => e.id !== id));
    persistS(shifts.filter((s) => s.empId !== id));
    setConfirmDelete(null); toast.success('Removed');
  };

  const weekLabel = () => {
    const s = new Date(weekDays[0] + 'T00:00:00');
    const e = new Date(weekDays[6] + 'T00:00:00');
    const o = { month: 'short', day: 'numeric' };
    return `${s.toLocaleDateString('en-US', o)} – ${e.toLocaleDateString('en-US', o)}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Team Members', value: weekStats.employees },
          { label: 'Shifts This Week', value: weekStats.scheduled },
          { label: 'Coverage', value: weekStats.total ? `${Math.round((weekStats.scheduled / weekStats.total) * 100)}%` : '—' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <p className="text-xl font-black">{s.value}</p>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekStart(fmt(addDays(new Date(weekStart + 'T00:00:00'), -7)))} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="font-black min-w-[180px] text-center">{weekLabel()}</p>
          <button onClick={() => setWeekStart(fmt(addDays(new Date(weekStart + 'T00:00:00'), 7)))} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <button onClick={() => setWeekStart(fmt(mondayOf(new Date())))} className="px-3 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition">This week</button>
        <div className="flex gap-2 ml-auto">
          <button onClick={copyPrevWeek} className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition">Copy last week</button>
          <button onClick={() => setShowEmpModal(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
          <CalendarClock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="font-bold text-slate-300 mb-1">No team members yet</p>
          <p className="text-sm text-slate-500 mb-4">Add your team to start planning shifts.</p>
          <button onClick={() => setShowEmpModal(true)} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 px-4 text-left text-[11px] uppercase tracking-wide text-slate-500 w-44">Team</th>
                {weekDays.map((d, i) => (
                  <th key={d} className="py-3 px-2 text-center text-[11px] uppercase tracking-wide text-slate-500">
                    {DAY_NAMES[i]}<span className="block text-slate-600 normal-case">{d.slice(5)}</span>
                  </th>
                ))}
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id} className="border-b border-white/5">
                  <td className="py-2 px-4">
                    <p className="font-bold text-sm">{e.name}</p>
                    {e.role && <p className="text-[11px] text-slate-500">{e.role}</p>}
                  </td>
                  {weekDays.map((d) => {
                    const sh = shiftOf(getShift(e.id, d));
                    const isEditing = editCell === `${e.id}|${d}`;
                    return (
                      <td key={d} className="py-1.5 px-1 text-center">
                        {isEditing ? (
                          <select value={getShift(e.id, d)} autoFocus
                            onChange={(ev) => setShift(e.id, d, ev.target.value)}
                            onBlur={() => setEditCell(null)}
                            className="w-full px-1 py-1.5 rounded-lg bg-black border border-orange-500 text-xs outline-none">
                            {SHIFTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                          </select>
                        ) : (
                          <button onClick={() => setEditCell(`${e.id}|${d}`)}
                            className="w-full py-2 rounded-lg text-[11px] font-bold border transition hover:brightness-125"
                            style={{ backgroundColor: sh.color, color: sh.text, borderColor: sh.id === 'off' ? 'rgba(255,255,255,0.06)' : `${sh.text}44` }}>
                            {sh.short || '—'}
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td className="pr-2">
                    {confirmDelete === e.id ? (
                      <span className="inline-flex gap-1">
                        <button onClick={() => deleteEmp(e.id)} className="px-2 py-1 rounded-lg text-xs font-bold bg-red-600">Yes</button>
                        <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 rounded-lg text-xs bg-white/5 border border-white/10">No</button>
                      </span>
                    ) : (
                      <button onClick={() => setConfirmDelete(e.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition"><Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        {SHIFTS.filter((s) => s.id !== 'off').map((s) => (
          <span key={s.id} className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: s.color, border: `1px solid ${s.text}44` }} /> {s.label}
          </span>
        ))}
        <span className="text-[11px] text-slate-600 ml-auto">Tap any cell to set a shift</span>
      </div>

      {showEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowEmpModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">Add Team Member</h3>
              <button onClick={() => setShowEmpModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Full name *" autoFocus className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <input value={fRole} onChange={(e) => setFRole(e.target.value)} placeholder="Role (e.g. Cashier)" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="flex gap-2 pt-1">
              <button onClick={addEmployee} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">Add Member</button>
              <button onClick={() => setShowEmpModal(false)} className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
