import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, FolderOpen, Printer, Copy, FileText } from 'lucide-react';
import { toast } from 'sonner';

const KEY = 'sfquote:quotes';
const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

const blankItem = () => ({ id: Date.now().toString() + Math.random().toString(16).slice(2), desc: '', qty: 1, rate: 0 });

export default function QuotesApp() {
  const [client, setClient] = useState({ name: '', company: '', email: '' });
  const [items, setItems] = useState([blankItem()]);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(load);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(saved));
  }, [saved]);

  const subtotal = items.reduce((a, i) => a + (Number(i.qty) || 0) * (Number(i.rate) || 0), 0);
  const taxAmt = subtotal * ((Number(tax) || 0) / 100);
  const total = subtotal + taxAmt;

  const setItem = (id, field, value) =>
    setItems((its) => its.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const addItem = () => setItems((its) => [...its, blankItem()]);
  const removeItem = (id) => setItems((its) => (its.length > 1 ? its.filter((i) => i.id !== id) : its));

  const saveQuote = () => {
    if (!client.name.trim()) {
      toast.error('Add a client name first.');
      return;
    }
    const q = {
      id: Date.now().toString(),
      at: new Date().toLocaleString(),
      client: { ...client },
      items: items.filter((i) => i.desc.trim()),
      tax: Number(tax) || 0,
      notes,
      total,
    };
    setSaved((s) => [q, ...s]);
    toast.success('Quote saved! 💾');
  };

  const loadQuote = (q) => {
    setClient(q.client);
    setItems(q.items.length ? q.items.map((i) => ({ ...i, id: i.id || blankItem().id })) : [blankItem()]);
    setTax(q.tax);
    setNotes(q.notes || '');
    setShowSaved(false);
    toast.success('Quote loaded.');
  };

  const deleteQuote = (id) => {
    setSaved((s) => s.filter((q) => q.id !== id));
    toast.info('Quote deleted.');
  };

  const copySummary = async () => {
    const lines = [
      `QUOTE — ${client.name}${client.company ? ` (${client.company})` : ''}`,
      ...items.filter((i) => i.desc.trim()).map((i) => `• ${i.desc} — ${i.qty} × ${money(i.rate)} = ${money(i.qty * i.rate)}`),
      `Subtotal: ${money(subtotal)}`,
      `Tax (${tax}%): ${money(taxAmt)}`,
      `TOTAL: ${money(total)}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(lines);
      toast.success('Quote copied to clipboard!');
    } catch {
      toast.error('Copy failed.');
    }
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500/60';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-slate-400">Client</h3>
          <div className="space-y-3">
            <input value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} placeholder="Client name" className={inputCls} />
            <input value={client.company} onChange={(e) => setClient({ ...client, company: e.target.value })} placeholder="Company (optional)" className={inputCls} />
            <input value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} placeholder="Email (optional)" className={inputCls} />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-slate-400">Totals</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-400"><span>Subtotal</span><span className="tabular-nums">{money(subtotal)}</span></div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Tax %</span>
              <input type="number" min="0" max="100" value={tax} onChange={(e) => setTax(e.target.value)} className="w-20 px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-sm text-right tabular-nums" />
            </div>
            <div className="flex justify-between text-slate-400"><span>Tax amount</span><span className="tabular-nums">{money(taxAmt)}</span></div>
            <div className="flex justify-between font-black text-xl pt-2 border-t border-white/10">
              <span>Total</span>
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent tabular-nums">{money(total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Line items</h3>
          <button onClick={addItem} className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-300 hover:bg-orange-500/25">
            <Plus className="w-3.5 h-3.5" /> Add item
          </button>
        </div>
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-12 gap-2 items-center">
                <input value={item.desc} onChange={(e) => setItem(item.id, 'desc', e.target.value)} placeholder="Description" className={`${inputCls} col-span-6`} />
                <input type="number" min="0" value={item.qty} onChange={(e) => setItem(item.id, 'qty', e.target.value)} placeholder="Qty" className={`${inputCls} col-span-2 text-right tabular-nums`} />
                <input type="number" min="0" step="0.01" value={item.rate} onChange={(e) => setItem(item.id, 'rate', e.target.value)} placeholder="Rate" className={`${inputCls} col-span-3 text-right tabular-nums`} />
                <button onClick={() => removeItem(item.id)} className="col-span-1 p-2 rounded-lg hover:bg-white/10 text-slate-500 hover:text-red-400 justify-self-center" aria-label="Remove item">
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes / terms (optional)" rows={2} className={`${inputCls} mt-4`} />
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <button onClick={saveQuote} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition text-sm">
          <Save className="w-4 h-4" /> Save quote
        </button>
        <button onClick={() => setShowSaved((s) => !s)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold border border-white/15 hover:bg-white/5 transition text-sm">
          <FolderOpen className="w-4 h-4" /> Saved ({saved.length})
        </button>
        <button onClick={copySummary} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold border border-white/15 hover:bg-white/5 transition text-sm">
          <Copy className="w-4 h-4" /> Copy
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold border border-white/15 hover:bg-white/5 transition text-sm">
          <Printer className="w-4 h-4" /> Print
        </button>
      </div>

      {showSaved && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-orange-400" /> Saved quotes</h3>
          {saved.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">Nothing saved yet.</p>
          ) : (
            <ul className="space-y-2">
              {saved.map((q) => (
                <li key={q.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-black/30 border border-white/5 text-sm">
                  <div>
                    <p className="font-bold">{q.client.name}</p>
                    <p className="text-xs text-slate-500">{q.at} · {money(q.total)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => loadQuote(q)} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-300">Load</button>
                    <button onClick={() => deleteQuote(q.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
