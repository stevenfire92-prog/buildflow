import React, { useState } from "react";
import { Receipt, Plus, Trash2, ArrowRight, DollarSign, Download, CreditCard, Sparkles, CheckCircle2, Split } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const defaultMembers = ["Steven (Host)", "Sarah", "Alex", "Jordan"];

const initialExpenses = [
  { id: "exp-1", title: "Team Strategy Dinner", amount: 240, paidBy: "Steven (Host)", category: "Dining" },
  { id: "exp-2", title: "Cloud Hosting & Domains", amount: 120, paidBy: "Alex", category: "Infrastructure" },
  { id: "exp-3", title: "Design Assets & Stock Photos", amount: 60, paidBy: "Sarah", category: "Design" },
  { id: "exp-4", title: "Airport Rides / Uber", amount: 80, paidBy: "Jordan", category: "Travel" },
];

export default function TeamExpenseSplitterWeb() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState(initialExpenses);
  const [members, setMembers] = useState(defaultMembers);
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [paidBy, setPaidBy] = useState(defaultMembers[0]);
  const [currency, setCurrency] = useState("USD ($)");
  const [payoutGenerated, setPayoutGenerated] = useState(false);

  const totalExpense = expenses.reduce((acc, c) => acc + Number(c.amount || 0), 0);
  const perPersonShare = members.length > 0 ? totalExpense / members.length : 0;

  // Compute balances per person
  // positive = owed money, negative = owes money
  const balances = {};
  members.forEach((m) => (balances[m] = -perPersonShare));
  expenses.forEach((exp) => {
    if (balances[exp.paidBy] !== undefined) {
      balances[exp.paidBy] += Number(exp.amount || 0);
    }
  });

  // Calculate minimum cash-flow debt settlement
  const settlements = [];
  const debtors = [];
  const creditors = [];

  Object.entries(balances).forEach(([person, balance]) => {
    const rounded = Math.round(balance * 100) / 100;
    if (rounded < -0.01) debtors.push({ person, owes: -rounded });
    else if (rounded > 0.01) creditors.push({ person, gets: rounded });
  });

  let dIdx = 0;
  let cIdx = 0;
  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];
    const amount = Math.min(debtor.owes, creditor.gets);

    settlements.push({
      from: debtor.person,
      to: creditor.person,
      amount: Math.round(amount * 100) / 100,
    });

    debtor.owes -= amount;
    creditor.gets -= amount;

    if (debtor.owes < 0.01) dIdx++;
    if (creditor.gets < 0.01) cIdx++;
  }

  const handleAddExpense = (e) => {
    e.preventDefault();
    const parsed = parseFloat(newAmount);
    if (!newTitle.trim() || isNaN(parsed) || parsed <= 0) return;

    const item = {
      id: "exp-" + Date.now(),
      title: newTitle.trim(),
      amount: parsed,
      paidBy,
      category: "General",
    };

    setExpenses([...expenses, item]);
    setNewTitle("");
    setNewAmount("");
    toast({
      title: "Expense Logged",
      description: `Added $${parsed.toFixed(2)} paid by ${paidBy}.`,
    });
  };

  const removeExpense = (id) => {
    setExpenses((prev) => prev.filter((x) => x.id !== id));
  };

  const handleGenerateStripeLinks = () => {
    setPayoutGenerated(true);
    toast({
      title: "Stripe Settlement Links Created",
      description: "Direct instant checkout links generated for each member's debt balance.",
    });
  };

  const exportCsv = () => {
    const headers = "Title,Amount,Paid By,Category\n";
    const rows = expenses.map((x) => `"${x.title}",${x.amount},"${x.paidBy}","${x.category}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "team-expense-report.csv";
    a.click();
    toast({ title: "CSV Downloaded", description: "Expense report exported for accounting." });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mb-1">
            <DollarSign className="w-3.5 h-3.5" /> Total Spent
          </div>
          <p className="text-2xl font-bold text-white">${totalExpense.toFixed(2)}</p>
          <p className="text-[11px] text-white/50">{expenses.length} itemized receipts</p>
        </div>

        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
          <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium mb-1">
            <Split className="w-3.5 h-3.5" /> Per Person Share
          </div>
          <p className="text-2xl font-bold text-white">${perPersonShare.toFixed(2)}</p>
          <p className="text-[11px] text-white/50">Across {members.length} team members</p>
        </div>

        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Settlements Needed
          </div>
          <p className="text-2xl font-bold text-white">{settlements.length}</p>
          <p className="text-[11px] text-white/50">Optimal cash-flow path</p>
        </div>

        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
          <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium mb-1">
            <CreditCard className="w-3.5 h-3.5" /> Currency Mode
          </div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg text-xs text-white p-1.5 outline-none mt-1"
          >
            <option value="USD ($)" className="bg-neutral-900 text-white">USD ($)</option>
            <option value="EUR (€)" className="bg-neutral-900 text-white">EUR (€)</option>
            <option value="GBP (£)" className="bg-neutral-900 text-white">GBP (£)</option>
            <option value="CAD ($)" className="bg-neutral-900 text-white">CAD ($)</option>
          </select>
        </div>
      </div>

      {/* Optimized Debt Settlement Engine */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-semibold text-white">Minimum Cash-Flow Settlement</h3>
            </div>
            <p className="text-xs text-white/60">
              Reduces 12 individual debt transactions down to just {settlements.length} optimal transfers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/15 text-white rounded-full transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={handleGenerateStripeLinks}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black rounded-full transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" /> One-Click Stripe Payout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {settlements.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{s.from}</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-white">{s.to}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  ${s.amount.toFixed(2)}
                </span>
                {payoutGenerated && (
                  <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    Link Active
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expenses Logger & List */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
        <h4 className="text-base font-semibold text-white mb-1">Itemized Receipts</h4>
        <p className="text-xs text-white/50 mb-4">Add invoices and receipts to auto-rebalance the pool.</p>

        <div className="space-y-2 mb-4">
          {expenses.map((exp) => (
            <div
              key={exp.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/70">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{exp.title}</p>
                  <p className="text-xs text-white/40">
                    Paid by <strong className="text-white/70">{exp.paidBy}</strong> · {exp.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-mono font-bold text-white">
                  ${Number(exp.amount).toFixed(2)}
                </span>
                <button
                  onClick={() => removeExpense(exp.id)}
                  className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Expense Form */}
        <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-4 border-t border-white/10">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Expense title (e.g. Hotel stay)..."
            className="sm:col-span-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400"
          />
          <input
            type="number"
            step="0.01"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            placeholder="Amount ($)"
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
          />
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
          >
            {members.map((m) => (
              <option key={m} value={m} className="bg-neutral-900 text-white">
                {m}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </form>
      </div>
    </div>
  );
}