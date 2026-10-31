import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, AlertTriangle, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import {
  CATEGORIES, loadData, saveData, monthKey, monthLabel, shiftMonth,
  expensesForMonth, monthSummary,
} from '../lib/budget';

function money(n) {
  return '$' + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function BudgetApp() {
  const [data, setData] = useState(loadData);
  const [mkey, setMkey] = useState(() => monthKey());
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [amt, setAmt] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState('food');

  const persist = (next) => { setData(next); saveData(next); };

  const summary = useMemo(() => monthSummary(data, mkey), [data, mkey]);
  const expenses = useMemo(() => expensesForMonth(data, mkey).slice().reverse(), [data, mkey]);

  const openBudgetEdit = (id, current) => {
    setEditingBudget(id);
    setBudgetInput(String(current || ''));
  };

  const saveBudget = () => {
    const v = parseFloat(budgetInput);
    if (isNaN(v) || v < 0) { toast.error('Enter a valid budget amount'); return; }
    const next = { ...data, budgets: { ...(data.budgets || {}), [editingBudget]: v } };
    persist(next);
    setEditingBudget(null);
    toast.success('Budget updated');
  };

  const addExpense = () => {
    const v = parseFloat(amt);
    if (isNaN(v) || v <= 0) { toast.error('Enter a valid amount'); return; }
    const next = {
      ...data,
      expenses: [...(data.expenses || []), {
        id: Date.now().toString(),
        amount: v,
        desc: desc.trim() || 'Expense',
        category: cat,
        month: mkey,
        ts: Date.now(),
      }],
    };
    persist(next);
    setAmt(''); setDesc('');
    setShowAdd(false);
    // Overspend alert
    const row = monthSummary(next, mkey).rows.find((r) => r.id === cat);
    if (row && row.budget > 0 && row.spent > row.budget) {
      toast.warning(`⚠️ Over budget on ${row.name}!`, { description: `Spent ${money(row.spent)} of ${money(row.budget)}` });
    } else {
      toast.success('Expense added');
    }
  };

  const deleteExpense = (id) => {
    persist({ ...data, expenses: (data.expenses || []).filter((e) => e.id !== id) });
    toast.success('Expense removed');
  };

  const remaining = summary.totalBudget - summary.totalSpent;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setMkey(shiftMonth(mkey, -1))} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-black">{monthLabel(mkey)}</h2>
        <button onClick={() => setMkey(shiftMonth(mkey, 1))} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Budget</p>
          <p className="text-lg font-black">{money(summary.totalBudget)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Spent</p>
          <p className="text-lg font-black text-orange-400">{money(summary.totalSpent)}</p>
        </div>
        <div className={`rounded-2xl border p-4 text-center ${remaining < 0 ? 'border-red-500/40 bg-red-500/10' : 'border-white/10 bg-white/[0.03]'}`}>
          <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Remaining</p>
          <p className={`text-lg font-black ${remaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>{money(remaining)}</p>
        </div>
      </div>

      {summary.overspentTotal && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 mb-6">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300 font-semibold">You're over budget this month. Time to tighten up!</p>
        </div>
      )}

      {/* Category rows */}
      <div className="space-y-3 mb-8">
        {summary.rows.map((row) => (
          <div key={row.id} className={`rounded-2xl border p-4 ${row.overspent ? 'border-red-500/40 bg-red-500/[0.06]' : 'border-white/10 bg-white/[0.03]'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{row.icon}</span>
                <div>
                  <p className="font-bold text-sm">{row.name}</p>
                  <p className="text-xs text-slate-500">{money(row.spent)} of {money(row.budget)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {row.overspent && <AlertTriangle className="w-4 h-4 text-red-400" />}
                <span className={`text-sm font-black ${row.overspent ? 'text-red-400' : 'text-slate-300'}`}>{row.pct}%</span>
                <button onClick={() => openBudgetEdit(row.id, row.budget)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition" title="Set budget">
                  <Pencil className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
            <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${row.pct}%`,
                  background: row.overspent ? 'linear-gradient(to right,#ef4444,#f97316)' : `linear-gradient(to right,${row.color},#f97316)`,
                }}
              />
            </div>
            {editingBudget === row.id && (
              <div className="flex gap-2 mt-3">
                <input
                  type="number" min="0" step="0.01"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  placeholder="Monthly budget"
                  className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500"
                  autoFocus
                />
                <button onClick={saveBudget} className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600">Save</button>
                <button onClick={() => setEditingBudget(null)} className="px-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10">Cancel</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add expense */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-lg">Expenses</h3>
        <button onClick={() => setShowAdd(!showAdd)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {showAdd && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input type="number" min="0" step="0.01" value={amt} onChange={(e) => setAmt(e.target.value)} placeholder="Amount" className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => setCat(c.id)} className={`rounded-xl border px-2 py-2 text-xs font-semibold transition ${cat === c.id ? 'border-orange-500 bg-orange-500/15 text-orange-200' : 'border-white/10 bg-white/[0.02] text-slate-400'}`}>
                <span className="block text-base mb-0.5">{c.icon}</span>{c.name}
              </button>
            ))}
          </div>
          <button onClick={addExpense} className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">Add Expense</button>
        </div>
      )}

      <div className="space-y-2">
        {expenses.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No expenses this month yet.</p>}
        {expenses.map((e) => {
          const c = CATEGORIES.find((x) => x.id === e.category) || CATEGORIES[5];
          return (
            <div key={e.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">{c.icon}</span>
                <div>
                  <p className="text-sm font-semibold">{e.desc}</p>
                  <p className="text-[11px] text-slate-500">{c.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm">{money(e.amount)}</span>
                <button onClick={() => deleteExpense(e.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition">
                  <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
