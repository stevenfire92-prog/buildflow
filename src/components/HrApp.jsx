import { useState, useMemo } from 'react';
import { Plus, Trash2, Pencil, X, Search, IdCard, Palmtree, ClipboardCheck, Check, Ban } from 'lucide-react';
import { toast } from 'sonner';

const EMP_KEY = 'sfhr:employees';
const LEAVE_KEY = 'sfhr:leave';
const ONB_KEY = 'sfhr:onboarding';

const load = (k) => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const ONBOARD_TEMPLATE = ['Signed offer letter', 'Completed tax forms', 'IT setup & accounts', 'Team introductions', 'First-week goals set'];

export default function HrApp() {
  const [tab, setTab] = useState('employees');
  const [employees, setEmployees] = useState(() => load(EMP_KEY));
  const [leaves, setLeaves] = useState(() => load(LEAVE_KEY));
  const [onboarding, setOnboarding] = useState(() => load(ONB_KEY));
  const [search, setSearch] = useState('');
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [fName, setFName] = useState('');
  const [fRole, setFRole] = useState('');
  const [fDept, setFDept] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fStart, setFStart] = useState('');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [lEmp, setLEmp] = useState('');
  const [lType, setLType] = useState('Vacation');
  const [lFrom, setLFrom] = useState('');
  const [lTo, setLTo] = useState('');
  const [lNote, setLNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const persistE = (n) => { setEmployees(n); save(EMP_KEY, n); };
  const persistL = (n) => { setLeaves(n); save(LEAVE_KEY, n); };
  const persistO = (n) => { setOnboarding(n); save(ONB_KEY, n); };

  const visibleEmps = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((e) => !q || (e.name || '').toLowerCase().includes(q) || (e.role || '').toLowerCase().includes(q) || (e.dept || '').toLowerCase().includes(q));
  }, [employees, search]);

  const pendingLeaves = leaves.filter((l) => l.status === 'pending').length;

  const openAddEmp = () => {
    setEditingEmp(null); setFName(''); setFRole(''); setFDept(''); setFEmail(''); setFStart(''); setShowEmpModal(true);
  };
  const openEditEmp = (e) => {
    setEditingEmp(e); setFName(e.name || ''); setFRole(e.role || ''); setFDept(e.dept || '');
    setFEmail(e.email || ''); setFStart(e.start || ''); setShowEmpModal(true);
  };
  const saveEmp = () => {
    if (!fName.trim()) { toast.error('Name is required'); return; }
    const payload = { name: fName.trim(), role: fRole.trim(), dept: fDept.trim(), email: fEmail.trim(), start: fStart };
    if (editingEmp) {
      persistE(employees.map((e) => (e.id === editingEmp.id ? { ...e, ...payload } : e)));
      toast.success('Employee updated');
    } else {
      const emp = { ...payload, id: Date.now().toString(), ts: Date.now() };
      persistE([emp, ...employees]);
      persistO([{ empId: emp.id, items: ONBOARD_TEMPLATE.map((t) => ({ text: t, done: false })) }, ...onboarding]);
      toast.success('Employee added — onboarding checklist created');
    }
    setShowEmpModal(false);
  };
  const deleteEmp = (id) => {
    persistE(employees.filter((e) => e.id !== id));
    persistO(onboarding.filter((o) => o.empId !== id));
    setConfirmDelete(null); toast.success('Employee removed');
  };

  const requestLeave = () => {
    if (!lEmp) { toast.error('Select an employee'); return; }
    if (!lFrom || !lTo) { toast.error('Pick start and end dates'); return; }
    persistL([{ id: Date.now().toString(), empId: lEmp, type: lType, from: lFrom, to: lTo, note: lNote.trim(), status: 'pending', ts: Date.now() }, ...leaves]);
    setShowLeaveModal(false); setLEmp(''); setLFrom(''); setLTo(''); setLNote('');
    toast.success('Time-off request submitted');
  };
  const setLeaveStatus = (id, status) => {
    persistL(leaves.map((l) => (l.id === id ? { ...l, status } : l)));
    toast.success(status === 'approved' ? 'Request approved' : 'Request denied');
  };

  const toggleOnboard = (empId, idx) => {
    persistO(onboarding.map((o) => o.empId === empId ? { ...o, items: o.items.map((it, i) => i === idx ? { ...it, done: !it.done } : it) } : o));
  };
  const empName = (id) => (employees.find((e) => e.id === id) || {}).name || 'Unknown';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: 'employees', label: 'Employees', icon: IdCard },
          { id: 'leave', label: `Time Off${pendingLeaves ? ` (${pendingLeaves})` : ''}`, icon: Palmtree },
          { id: 'onboarding', label: 'Onboarding', icon: ClipboardCheck },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition ${tab === t.id ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'employees' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, role, department…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            </div>
            <button onClick={openAddEmp} className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
              <Plus className="w-4 h-4" /> Add Employee
            </button>
          </div>
          {visibleEmps.length === 0 ? (
            <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
              <IdCard className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="font-bold text-slate-300">{employees.length === 0 ? 'No employees yet' : 'No matches'}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleEmps.map((e) => (
                <div key={e.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center font-black text-sm shrink-0">
                      {(e.name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => openEditEmp(e)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition"><Pencil className="w-3.5 h-3.5 text-slate-400" /></button>
                      <button onClick={() => setConfirmDelete(e.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition"><Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" /></button>
                    </div>
                  </div>
                  <p className="font-bold mt-2">{e.name}</p>
                  <p className="text-sm text-slate-400">{e.role || 'No role set'}</p>
                  <p className="text-xs text-slate-500 mt-1">{[e.dept, e.start ? `Started ${e.start}` : null].filter(Boolean).join(' · ')}</p>
                  {e.email && <a href={`mailto:${e.email}`} className="text-xs text-orange-300 hover:underline">{e.email}</a>}
                  {confirmDelete === e.id && (
                    <div className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 flex items-center justify-between gap-2">
                      <p className="text-xs text-red-300 font-semibold">Remove?</p>
                      <div className="flex gap-1.5">
                        <button onClick={() => deleteEmp(e.id)} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600">Yes</button>
                        <button onClick={() => setConfirmDelete(null)} className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10">No</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'leave' && (
        <>
          <button onClick={() => setShowLeaveModal(true)} className="mb-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
            <Plus className="w-4 h-4" /> Request Time Off
          </button>
          {leaves.length === 0 ? (
            <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
              <Palmtree className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="font-bold text-slate-300">No time-off requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaves.map((l) => (
                <div key={l.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold">{empName(l.empId)} <span className="text-xs font-normal text-slate-500">· {l.type}</span></p>
                    <p className="text-sm text-slate-400">{l.from} → {l.to}</p>
                    {l.note && <p className="text-xs text-slate-500 mt-0.5">"{l.note}"</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${l.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : l.status === 'denied' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
                      {l.status.toUpperCase()}
                    </span>
                    {l.status === 'pending' && (
                      <>
                        <button onClick={() => setLeaveStatus(l.id, 'approved')} className="p-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 transition" title="Approve"><Check className="w-4 h-4 text-emerald-400" /></button>
                        <button onClick={() => setLeaveStatus(l.id, 'denied')} className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 transition" title="Deny"><Ban className="w-4 h-4 text-red-400" /></button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'onboarding' && (
        employees.length === 0 ? (
          <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
            <ClipboardCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="font-bold text-slate-300">Add employees to generate onboarding checklists</p>
          </div>
        ) : (
          <div className="space-y-4">
            {employees.map((e) => {
              const ob = onboarding.find((o) => o.empId === e.id);
              const items = ob ? ob.items : [];
              const done = items.filter((i) => i.done).length;
              return (
                <div key={e.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold">{e.name}</p>
                    <p className="text-xs text-slate-500">{done}/{items.length} complete</p>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-3">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all" style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} />
                  </div>
                  <div className="space-y-2">
                    {items.map((it, i) => (
                      <button key={i} onClick={() => toggleOnboard(e.id, i)} className="w-full flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-left hover:bg-white/[0.05] transition">
                        <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${it.done ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}>
                          {it.done && <Check className="w-3.5 h-3.5 text-white" />}
                        </span>
                        <span className={`text-sm ${it.done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{it.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {showEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowEmpModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">{editingEmp ? 'Edit Employee' : 'Add Employee'}</h3>
              <button onClick={() => setShowEmpModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Full name *" autoFocus className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="grid grid-cols-2 gap-3">
              <input value={fRole} onChange={(e) => setFRole(e.target.value)} placeholder="Role / title" className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
              <input value={fDept} onChange={(e) => setFDept(e.target.value)} placeholder="Department" className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            </div>
            <input value={fEmail} onChange={(e) => setFEmail(e.target.value)} type="email" placeholder="Email" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <input value={fStart} onChange={(e) => setFStart(e.target.value)} type="date" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="flex gap-2 pt-1">
              <button onClick={saveEmp} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">{editingEmp ? 'Save Changes' : 'Add Employee'}</button>
              <button onClick={() => setShowEmpModal(false)} className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowLeaveModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">Request Time Off</h3>
              <button onClick={() => setShowLeaveModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <select value={lEmp} onChange={(e) => setLEmp(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500">
              <option value="">Select employee *</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <select value={lType} onChange={(e) => setLType(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500">
              {['Vacation', 'Sick', 'Personal', 'Remote', 'Other'].map((t) => <option key={t}>{t}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input value={lFrom} onChange={(e) => setLFrom(e.target.value)} type="date" className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
              <input value={lTo} onChange={(e) => setLTo(e.target.value)} type="date" className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            </div>
            <input value={lNote} onChange={(e) => setLNote(e.target.value)} placeholder="Note (optional)" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="flex gap-2 pt-1">
              <button onClick={requestLeave} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">Submit Request</button>
              <button onClick={() => setShowLeaveModal(false)} className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
