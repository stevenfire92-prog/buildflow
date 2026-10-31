import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, X, ChevronLeft, ChevronRight,
  UtensilsCrossed, Car, ShoppingBag, Receipt, Clapperboard, HeartPulse, Tag,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  CATEGORIES, getCategory, getExpenses, addExpense, deleteExpense,
  filterByMonth, getTotal, getCategoryBreakdown, formatMoney, formatDate, monthLabel,
} from '../lib/expenses';

const CATEGORY_ICONS = {
  food: UtensilsCrossed,
  transport: Car,
  shopping: ShoppingBag,
  bills: Receipt,
  entertainment: Clapperboard,
  health: HeartPulse,
  other: Tag,
};

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [month, setMonth] = useState(() => new Date().toISOString().split('T')[0].slice(0, 7));
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setExpenses(getExpenses());
  }, []);

  const refresh = () => setExpenses(getExpenses());

  const monthExpenses = useMemo(() => {
    const list = filterByMonth(expenses, month);
    return [...list].sort((a, b) => (b.date < a.date ? -1 : b.date > a.date ? 1 : 0));
  }, [expenses, month]);

  const total = useMemo(() => getTotal(monthExpenses), [monthExpenses]);
  const breakdown = useMemo(() => getCategoryBreakdown(monthExpenses), [monthExpenses]);
  const maxCat = breakdown.length ? breakdown[0].total : 1;

  const shiftMonth = (dir) => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    setMonth(d.toISOString().split('T')[0].slice(0, 7));
  };

  const handleAdd = (e) => {
    e?.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    const exp = addExpense({ amount: num, category, description, date });
    setAmount('');
    setDescription('');
    setCategory('food');
    setDate(new Date().toISOString().split('T')[0]);
    setShowAdd(false);
    refresh();
    // If the added expense belongs to a different month, jump there
    const mk = exp.date.slice(0, 7);
    if (mk !== month) setMonth(mk);
    toast.success(`${formatMoney(exp.amount)} added to ${getCategory(exp.category).name}`);
  };

  const handleDelete = (id) => {
    deleteExpense(id);
    refresh();
    toast.success('Expense deleted');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Month header + total */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/10 to-red-500/5 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => shiftMonth(-1)} className="p-2 rounded-lg hover:bg-white/5 transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold">{monthLabel(month)}</h2>
          <button onClick={() => shiftMonth(1)} className="p-2 rounded-lg hover:bg-white/5 transition">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Total spent</p>
          <motion.p
            key={month + total}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent"
          >
            {formatMoney(total)}
          </motion.p>
          <p className="text-xs text-slate-500 mt-1">{monthExpenses.length} expense{monthExpenses.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Wallet className="w-6 h-6 text-orange-400" /> Expenses
        </h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition"
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAdd ? 'Cancel' : 'Add expense'}
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            className="overflow-hidden mb-6"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs text-slate-500 uppercase tracking-wider">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-orange-400/50"
                    autoFocus
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs text-slate-500 uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-orange-400/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Category</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-2">
                  {CATEGORIES.map((c) => {
                    const Icon = CATEGORY_ICONS[c.id];
                    const active = category === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[10px] font-semibold transition ${active ? 'border-transparent text-white' : 'border-white/10 text-slate-400 hover:border-white/25'}`}
                        style={active ? { background: c.color } : {}}
                      >
                        <Icon className="w-4 h-4" />
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Note (optional)</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Groceries, Uber, Netflix..."
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-orange-400/50"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition"
              >
                Save expense
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Category breakdown */}
      {breakdown.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Breakdown</h3>
          <div className="space-y-3">
            {breakdown.map((b) => {
              const Icon = CATEGORY_ICONS[b.id];
              const pct = Math.round((b.total / maxCat) * 100);
              return (
                <div key={b.id}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2 font-semibold">
                      <span className="grid place-items-center w-7 h-7 rounded-lg" style={{ background: b.color + '22' }}>
                        <Icon className="w-4 h-4" style={{ color: b.color }} />
                      </span>
                      {b.name}
                      <span className="text-slate-500 font-normal">×{b.count}</span>
                    </span>
                    <span className="font-bold">{formatMoney(b.total)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: pct + '%' }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ background: b.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expense list */}
      {monthExpenses.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/10">
          <Wallet className="w-12 h-12 mx-auto text-slate-700 mb-4" />
          <p className="text-slate-400 mb-2">No expenses this month</p>
          <p className="text-sm text-slate-500">Add your first expense to start tracking.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {monthExpenses.map((e) => {
              const cat = getCategory(e.category);
              const Icon = CATEGORY_ICONS[cat.id];
              return (
                <motion.div
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-4"
                >
                  <span className="grid place-items-center w-11 h-11 rounded-xl shrink-0" style={{ background: cat.color + '22' }}>
                    <Icon className="w-5 h-5" style={{ color: cat.color }} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{e.description}</p>
                    <p className="text-xs text-slate-500">{cat.name} · {formatDate(e.date)}</p>
                  </div>
                  <span className="font-bold text-orange-300 whitespace-nowrap">{formatMoney(e.amount)}</span>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
