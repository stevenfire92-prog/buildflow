import { useState, useMemo } from 'react';
import { Plus, Trash2, Pencil, Printer, Eye, FileText, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { STATUSES, loadProposals, saveProposals, calcTotals } from '../lib/proposals';

function money(n) {
  return '$' + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const inputCls = 'px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500 w-full';

const statusStyle = {
  Draft: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  Sent: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Accepted: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

function blankProposal() {
  return {
    id: null,
    client: '',
    title: '',
    items: [{ desc: '', qty: 1, price: 0 }],
    taxRate: 0,
    terms: '',
    status: 'Draft',
    date: new Date().toISOString().slice(0, 10),
  };
}

export default function ProposalsApp() {
  const [list, setList] = useState(loadProposals);
  const [view, setView] = useState('list'); // list | edit | preview
  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState(blankProposal());

  const persist = (next) => { setList(next); saveProposals(next); };

  const active = useMemo(
    () => (view === 'preview' ? list.find((p) => p.id === activeId) : null),
    [list, view, activeId]
  );

  const stats = useMemo(() => {
    let pipeline = 0;
    let accepted = 0;
    for (const p of list) {
      const { total } = calcTotals(p.items, p.taxRate);
      if (p.status === 'Accepted') accepted += total;
      else pipeline += total;
    }
    return { count: list.length, pipeline, accepted };
  }, [list]);

  // ---------- list actions ----------
  const cycleStatus = (id) => {
    const next = list.map((p) => {
      if (p.id !== id) return p;
      const i = (STATUSES.indexOf(p.status) + 1) % STATUSES.length;
      return { ...p, status: STATUSES[i] };
    });
    persist(next);
    const p = next.find((x) => x.id === id);
    toast.success(`Marked as ${p.status}`);
  };

  const deleteProposal = (id) => {
    if (!window.confirm('Delete this proposal?')) return;
    persist(list.filter((p) => p.id !== id));
    toast.success('Proposal deleted');
  };

  // ---------- form actions ----------
  const startNew = () => {
    setForm(blankProposal());
    setActiveId(null);
    setView('edit');
  };

  const startEdit = (id) => {
    const p = list.find((x) => x.id === id);
    if (!p) return;
    setForm({ ...p, items: p.items.map((it) => ({ ...it })) });
    setActiveId(id);
    setView('edit');
  };

  const openPreview = (id) => {
    setActiveId(id);
    setView('preview');
  };

  const updateItem = (idx, field, value) => {
    const items = form.items.map((it, i) => (i === idx ? { ...it, [field]: value } : it));
    setForm({ ...form, items });
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { desc: '', qty: 1, price: 0 }] });
  };

  const removeItem = (idx) => {
    if (form.items.length === 1) { toast.error('At least one line item is required'); return; }
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const saveProposal = () => {
    if (!form.client.trim()) { toast.error('Enter a client name'); return; }
    if (!form.title.trim()) { toast.error('Enter a project title'); return; }
    const items = form.items.map((it) => ({
      desc: (it.desc || '').trim() || 'Item',
      qty: Number(it.qty) || 0,
      price: Number(it.price) || 0,
    }));
    if (activeId) {
      persist(list.map((p) => (p.id === activeId ? { ...form, items, id: activeId } : p)));
      toast.success('Proposal updated');
    } else {
      const proposal = {
        ...form,
        items,
        id: Date.now().toString(),
        date: new Date().toISOString().slice(0, 10),
      };
      persist([proposal, ...list]);
      toast.success('Proposal created');
    }
    setView('list');
    setActiveId(null);
  };

  const totals = useMemo(() => calcTotals(form.items, form.taxRate), [form.items, form.taxRate]);

  // ---------- preview ----------
  if (view === 'preview' && active) {
    const t = calcTotals(active.items, active.taxRate);
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; border-radius: 0; }
          }
        `}</style>
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setView('list')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>

        <div className="print-area rounded-2xl bg-white text-slate-900 p-8 md:p-10 shadow-xl">
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight">🔥 Se Fire Tech</h1>
              <p className="text-sm text-slate-500 mt-1">Proposals that close deals.</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-slate-500">Proposal</p>
              <p className="text-sm font-bold">{active.date}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Prepared for</p>
              <p className="font-bold text-lg">{active.client}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Project</p>
              <p className="font-bold text-lg">{active.title}</p>
            </div>
          </div>

          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-widest text-slate-500">
                <th className="py-2 pr-2">Description</th>
                <th className="py-2 pr-2 text-right">Qty</th>
                <th className="py-2 pr-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {active.items.map((it, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2.5 pr-2 font-medium">{it.desc}</td>
                  <td className="py-2.5 pr-2 text-right">{it.qty}</td>
                  <td className="py-2.5 pr-2 text-right">{money(it.price)}</td>
                  <td className="py-2.5 text-right font-semibold">{money(it.qty * it.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-semibold">{money(t.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tax ({active.taxRate || 0}%)</span><span className="font-semibold">{money(t.tax)}</span></div>
              <div className="flex justify-between border-t-2 border-slate-900 pt-2 text-base"><span className="font-black">Total</span><span className="font-black">{money(t.total)}</span></div>
            </div>
          </div>

          {active.terms && (
            <div className="mb-8">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Terms & Conditions</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{active.terms}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-8 mt-12 pt-6">
            <div>
              <div className="border-b border-slate-400 h-10" />
              <p className="text-xs text-slate-500 mt-1">Signature — Se Fire Tech</p>
            </div>
            <div>
              <div className="border-b border-slate-400 h-10" />
              <p className="text-xs text-slate-500 mt-1">Signature — Client ({active.client})</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- edit form ----------
  if (view === 'edit') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setView('list')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-xl font-black">{activeId ? 'Edit Proposal' : 'New Proposal'}</h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold block mb-1.5">Client name</label>
              <input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="Acme Corp" className={inputCls} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold block mb-1.5">Project title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Website redesign" className={inputCls} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black">Line items</h3>
          <button onClick={addItem} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition">
            <Plus className="w-3.5 h-3.5" /> Add row
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {form.items.map((it, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_70px_110px_40px] gap-3 items-end">
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold block mb-1.5">Description</label>
                  <input value={it.desc} onChange={(e) => updateItem(i, 'desc', e.target.value)} placeholder="Service or deliverable" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold block mb-1.5">Qty</label>
                  <input type="number" min="0" step="1" value={it.qty} onChange={(e) => updateItem(i, 'qty', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold block mb-1.5">Unit price</label>
                  <input type="number" min="0" step="0.01" value={it.price} onChange={(e) => updateItem(i, 'price', e.target.value)} className={inputCls} />
                </div>
                <button onClick={() => removeItem(i)} className="p-2.5 rounded-xl hover:bg-red-500/20 transition" title="Remove row">
                  <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-400" />
                </button>
              </div>
              <p className="text-right text-xs text-slate-500 mt-2">Line total: <span className="font-bold text-slate-300">{money(Number(it.qty || 0) * Number(it.price || 0))}</span></p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold block mb-1.5">Tax %</label>
              <input type="number" min="0" step="0.01" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: e.target.value })} placeholder="0" className={inputCls} />
            </div>
            <div className="rounded-xl bg-black/40 border border-white/10 p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-bold">{money(totals.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tax</span><span className="font-bold">{money(totals.tax)}</span></div>
              <div className="flex justify-between"><span className="text-orange-300 font-semibold">Total</span><span className="font-black text-orange-400">{money(totals.total)}</span></div>
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold block mb-1.5">Terms</label>
            <textarea value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} placeholder="Payment terms, timeline, validity…" rows={3} className={`${inputCls} resize-y`} />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={saveProposal} className="flex-1 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
            {activeId ? 'Save changes' : 'Create proposal'}
          </button>
          <button onClick={() => setView('list')} className="px-5 py-3 rounded-xl text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ---------- list ----------
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Proposals</p>
          <p className="text-lg font-black">{stats.count}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Pipeline</p>
          <p className="text-lg font-black text-orange-400">{money(stats.pipeline)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Accepted</p>
          <p className="text-lg font-black text-emerald-400">{money(stats.accepted)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-lg">All proposals</h2>
        <button onClick={startNew} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
          <Plus className="w-4 h-4" /> New Proposal
        </button>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] py-16 px-6 text-center">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="font-black text-lg mb-1">No proposals yet</h3>
          <p className="text-sm text-slate-500 mb-6">Create your first proposal and start closing deals.</p>
          <button onClick={startNew} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
            <Plus className="w-4 h-4" /> Create Proposal
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((p) => {
            const { total } = calcTotals(p.items, p.taxRate);
            return (
              <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{p.title}</p>
                    <p className="text-xs text-slate-500">{p.client} · {p.date}</p>
                  </div>
                  <button
                    onClick={() => cycleStatus(p.id)}
                    title="Click to change status"
                    className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold border transition hover:brightness-125 ${statusStyle[p.status] || statusStyle.Draft}`}
                  >
                    {p.status}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-black text-orange-400">{money(total)}</p>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openPreview(p.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition">
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <button onClick={() => startEdit(p.id)} className="p-1.5 rounded-lg hover:bg-white/10 transition" title="Edit">
                      <Pencil className="w-4 h-4 text-slate-400" />
                    </button>
                    <button onClick={() => deleteProposal(p.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition" title="Delete">
                      <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
