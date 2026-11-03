import { useState, useMemo } from 'react';
import { Plus, Trash2, Pencil, X, Wallet, Users, Receipt, Play } from 'lucide-react';
import { toast } from 'sonner';

const EMP_KEY = 'sfpayroll:employees';
const RUN_KEY = 'sfpayroll:runs';

const load = (k) => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;

export default function PayrollApp() {
  const [tab, setTab] = useState('runs');
  const [employees, setEmployees] = useState(() => load(EMP_KEY));
  const [runs, setRuns] = useState(() => load(RUN_KEY));
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [fName, setFName] = useState('');
  const [fType, setFType] = useState('hourly');
  const [fRate, setFRate] = useState('');
  const [fTax, setFTax] = useState('20');
  const [showRunModal, setShowRunModal] = useState(false);
  const [rLabel, setRLabel] = useState('');
  const [rHours, setRHours] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [viewRun, setViewRun] = useState(null);

  const persistE = (n) => { setEmployees(n); save(EMP_KEY, n); };
  const persistR = (n) => { setRuns(n); save(RUN_KEY, n); };

  const totals = useMemo(() => {
    const gross = runs.reduce((s, r) => s + (Number(r.totalGross) || 0), 0);
    const net = runs.reduce((s, r) => s + (Number(r.totalNet) || 0), 0);
    return { runs: runs.length, gross, net, employees: employees.length };
  }, [runs, employees]);

  const openAddEmp = () => { setEditingEmp(null); setFName(''); setFType('hourly'); setFRate(''); setFTax('20'); setShowEmpModal(true); };
  const openEditEmp = (e) => { setEditingEmp(e); setFName(e.name || ''); setFType(e.type || 'hourly'); setFRate(String(e.rate ?? '')); setFTax(String(e.tax ?? '20')); setShowEmpModal(true); };
  const saveEmp = () => {
    if (!fName.trim()) { toast.error('Name is required'); return; }
    const payload = { name: fName.trim(), type: fType, rate: Math.max(0, Number(fRate) || 0), tax: Math.min(60, Math.max(0, Number(fTax) || 0)) };
    if (editingEmp) {
      persistE(employees.map((e) => (e.id === editingEmp.id ? { ...e, ...payload } : e)));
      toast.success('Employee updated');
    } else {
      persistE([{ ...payload, id: Date.now().toString(), ts: Date.now() }, ...employees]);
      toast.success('Employee added');
    }
    setShowEmpModal(false);
  };
  const deleteEmp = (id) => { persistE(employees.filter((e) => e.id !== id)); setConfirmDelete(null); toast.success('Employee removed'); };

  const openRun = () => {
    if (employees.length === 0) { toast.error('Add employees first'); return; }
    setRLabel(`Pay run — ${new Date().toISOString().slice(0, 10)}`);
    const h = {};
    employees.forEach((e) => { h[e.id] = e.type === 'hourly' ? '40' : ''; });
    setRHours(h); setShowRunModal(true);
  };
  const processRun = () => {
    if (!rLabel.trim()) { toast.error('Label is required'); return; }
    const lines = employees.map((e) => {
      const hours = e.type === 'hourly' ? Math.max(0, Number(rHours[e.id]) || 0) : 0;
      const gross = e.type === 'hourly' ? hours * (Number(e.rate) || 0) : (Number(e.rate) || 0) / 26;
      const taxAmt = gross * ((Number(e.tax) || 0) / 100);
      const net = gross - taxAmt;
      return { empId: e.id, name: e.name, type: e.type, rate: e.rate, hours, gross, taxRate: e.tax, taxAmt, net };
    });
    const totalGross = lines.reduce((s, l) => s + l.gross, 0);
    const totalNet = lines.reduce((s, l) => s + l.net, 0);
    persistR([{ id: Date.now().toString(), label: rLabel.trim(), date: new Date().toISOString().slice(0, 10), lines, totalGross, totalNet, ts: Date.now() }, ...runs]);
    setShowRunModal(false);
    toast.success(`Pay run processed — ${money(totalNet)} net`);
  };
  const deleteRun = (id) => { persistR(runs.filter((r) => r.id !== id)); setConfirmDelete(null); setViewRun(null); toast.success('Pay run deleted'); };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Employees', value: totals.employees, color: '#fff' },
          { label: 'Pay Runs', value: totals.runs, color: '#3b82f6' },
          { label: 'Total Gross', value: money(totals.gross), color: '#eab308' },
          { label: 'Total Net Paid', value: money(totals.net), color: '#22c55e' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">{s.label}</p>
            <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { id: 'runs', label: 'Pay Runs', icon: Receipt },
          { id: 'employees', label: 'Employees', icon: Users },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition ${tab === t.id ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'runs' && (
        <>
          <button onClick={openRun} className="mb-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
            <Play className="w-4 h-4" /> New Pay Run
          </button>
          {viewRun ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-lg">{viewRun.label}</h3>
                  <p className="text-xs text-slate-500">{viewRun.date} · {viewRun.lines.length} employees</p>
                </div>
                <button onClick={() => setViewRun(null)} className="px-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition">Back</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-white/10">
                      <th className="py-2 pr-4">Employee</th>
                      <th className="py-2 pr-4 text-right">Hours</th>
                      <th className="py-2 pr-4 text-right">Gross</th>
                      <th className="py-2 pr-4 text-right">Tax</th>
                      <th className="py-2 text-right">Net Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewRun.lines.map((l) => (
                      <tr key={l.empId} className="border-b border-white/5">
                        <td className="py-2.5 pr-4 font-semibold">{l.name}<span className="block text-[11px] font-normal text-slate-500">{l.type === 'hourly' ? `${money(l.rate)}/hr` : `${money(l.rate)}/yr`}</span></td>
                        <td className="py-2.5 pr-4 text-right">{l.type === 'hourly' ? l.hours : '—'}</td>
                        <td className="py-2.5 pr-4 text-right">{money(l.gross)}</td>
                        <td className="py-2.5 pr-4 text-right text-red-300">-{money(l.taxAmt)} <span className="text-[10px] text-slate-500">({l.taxRate}%)</span></td>
                        <td className="py-2.5 text-right font-black text-emerald-300">{money(l.net)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-black">
                      <td className="py-3 pr-4">Totals</td>
                      <td></td>
                      <td className="py-3 pr-4 text-right">{money(viewRun.totalGross)}</td>
                      <td className="py-3 pr-4 text-right text-red-300">-{money(viewRun.totalGross - viewRun.totalNet)}</td>
                      <td className="py-3 text-right text-emerald-300">{money(viewRun.totalNet)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <button onClick={() => setConfirmDelete(viewRun.id)} className="mt-4 px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition inline-flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> Delete pay run
              </button>
              {confirmDelete === viewRun.id && (
                <div className="mt-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 flex items-center justify-between gap-3">
                  <p className="text-sm text-red-300 font-semibold">Delete this pay run?</p>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => deleteRun(viewRun.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600">Delete</button>
                    <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ) : runs.length === 0 ? (
            <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
              <Wallet className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="font-bold text-slate-300">No pay runs yet</p>
              <p className="text-sm text-slate-500">Process your first payroll in one click.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {runs.map((r) => (
                <button key={r.id} onClick={() => setViewRun(r)} className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06] transition">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold">{r.label}</p>
                      <p className="text-xs text-slate-500">{r.date} · {r.lines.length} employees</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-emerald-300">{money(r.totalNet)}</p>
                      <p className="text-[11px] text-slate-500">net · {money(r.totalGross)} gross</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'employees' && (
        <>
          <button onClick={openAddEmp} className="mb-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
            <Plus className="w-4 h-4" /> Add Employee
          </button>
          {employees.length === 0 ? (
            <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="font-bold text-slate-300">No employees yet</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((e) => (
                <div key={e.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold">{e.name}</p>
                    <div className="flex gap-1.5">
                      <button onClick={() => openEditEmp(e)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition"><Pencil className="w-3.5 h-3.5 text-slate-400" /></button>
                      <button onClick={() => setConfirmDelete(e.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition"><Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" /></button>
                    </div>
                  </div>
                  <p className="text-sm text-orange-300 font-bold mt-1">{e.type === 'hourly' ? `${money(e.rate)}/hour` : `${money(e.rate)}/year`}</p>
                  <p className="text-xs text-slate-500">Tax rate: {e.tax}%</p>
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

      {showEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowEmpModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">{editingEmp ? 'Edit Employee' : 'Add Employee'}</h3>
              <button onClick={() => setShowEmpModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Full name *" autoFocus className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={fType} onChange={(e) => setFType(e.target.value)} className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500">
                <option value="hourly">Hourly</option>
                <option value="salary">Salary</option>
              </select>
              <input value={fRate} onChange={(e) => setFRate(e.target.value)} type="number" min="0" step="0.01" placeholder={fType === 'hourly' ? 'Rate $/hr' : 'Salary $/yr'} className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            </div>
            <input value={fTax} onChange={(e) => setFTax(e.target.value)} type="number" min="0" max="60" placeholder="Tax withholding %" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="flex gap-2 pt-1">
              <button onClick={saveEmp} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">{editingEmp ? 'Save' : 'Add'}</button>
              <button onClick={() => setShowEmpModal(false)} className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showRunModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowRunModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">New Pay Run</h3>
              <button onClick={() => setShowRunModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input value={rLabel} onChange={(e) => setRLabel(e.target.value)} placeholder="Pay run label *" autoFocus className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="space-y-2">
              {employees.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
                  <p className="text-sm font-semibold flex-1">{e.name}<span className="block text-[11px] font-normal text-slate-500">{e.type === 'hourly' ? `${money(e.rate)}/hr` : 'salary'}</span></p>
                  {e.type === 'hourly' ? (
                    <input value={rHours[e.id] || ''} onChange={(ev) => setRHours((p) => ({ ...p, [e.id]: ev.target.value }))} type="number" min="0" step="0.5" placeholder="Hours"
                      className="w-24 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
                  ) : (
                    <p className="text-sm text-slate-400">{money((Number(e.rate) || 0) / 26)} <span className="text-[10px]">/ period</span></p>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={processRun} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">Process Payroll</button>
              <button onClick={() => setShowRunModal(false)} className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
