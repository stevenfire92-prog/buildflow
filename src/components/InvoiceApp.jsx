import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Printer, Check, X, FileText, Edit3, ArrowLeft, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import {
  getInvoices, upsertInvoice, deleteInvoice, setStatus,
  blankInvoice, calcTotals, formatMoney,
} from '../lib/invoices';

const STATUS_COLORS = {
  draft: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  sent: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  paid: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function InvoiceApp() {
  const [invoices, setInvoices] = useState([]);
  const [editing, setEditing] = useState(null); // invoice being edited
  const [previewing, setPreviewing] = useState(null); // invoice being previewed

  useEffect(() => {
    setInvoices(getInvoices());
  }, []);

  const refresh = () => setInvoices(getInvoices());

  const handleNew = () => {
    setEditing(blankInvoice());
    setPreviewing(null);
  };

  const handleEdit = (inv) => {
    setEditing(JSON.parse(JSON.stringify(inv)));
    setPreviewing(null);
  };

  const handleDelete = (id, number) => {
    deleteInvoice(id);
    refresh();
    toast.success(`Invoice ${number} deleted`);
  };

  const handleStatus = (id, status, number) => {
    setStatus(id, status);
    refresh();
    toast.success(`Invoice ${number} marked as ${status}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const updateField = (field, value) => {
    setEditing((e) => ({ ...e, [field]: value }));
  };

  const updateItem = (itemId, field, value) => {
    setEditing((e) => ({
      ...e,
      items: e.items.map((it) => (it.id === itemId ? { ...it, [field]: value } : it)),
    }));
  };

  const addItem = () => {
    setEditing((e) => ({
      ...e,
      items: [...e.items, { id: uid(), description: '', quantity: 1, rate: 0 }],
    }));
  };

  const removeItem = (itemId) => {
    setEditing((e) => ({
      ...e,
      items: e.items.length > 1 ? e.items.filter((it) => it.id !== itemId) : e.items,
    }));
  };

  const handleSave = (asStatus) => {
    if (!editing.clientName.trim()) {
      toast.error('Add a client name first');
      return;
    }
    const inv = { ...editing, status: asStatus || editing.status };
    upsertInvoice(inv);
    refresh();
    setEditing(null);
    toast.success(`Invoice ${inv.number} saved`);
  };

  /* ---------------- Print preview ---------------- */
  if (previewing) {
    const inv = previewing;
    const t = calcTotals(inv);
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 print:p-0 print:max-w-none">
        <div className="flex items-center gap-3 mb-6 print:hidden">
          <button
            onClick={() => setPreviewing(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 hover:border-orange-400/40 transition text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition text-sm"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-white text-slate-900 p-8 md:p-10 print:border-0 print:rounded-none print:shadow-none"
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight">{inv.businessName || 'Your Business'}</h1>
              {inv.businessEmail && <p className="text-sm text-slate-500">{inv.businessEmail}</p>}
              {inv.businessAddress && <p className="text-sm text-slate-500 whitespace-pre-line">{inv.businessAddress}</p>}
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-orange-600">INVOICE</p>
              <p className="text-sm font-bold mt-1">{inv.number}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
            <div>
              <p className="font-bold text-slate-400 uppercase text-xs mb-1">Bill to</p>
              <p className="font-bold text-lg">{inv.clientName}</p>
              {inv.clientEmail && <p className="text-slate-500">{inv.clientEmail}</p>}
              {inv.clientAddress && <p className="text-slate-500 whitespace-pre-line">{inv.clientAddress}</p>}
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-400 uppercase text-xs mb-1">Details</p>
              <p>Issue date: <span className="font-semibold">{inv.issueDate}</span></p>
              <p>Due date: <span className="font-semibold">{inv.dueDate}</span></p>
              <p>Status: <span className="font-bold uppercase text-orange-600">{inv.status}</span></p>
            </div>
          </div>

          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b-2 border-slate-200 text-left">
                <th className="py-2 pr-2">Description</th>
                <th className="py-2 px-2 text-right w-20">Qty</th>
                <th className="py-2 px-2 text-right w-24">Rate</th>
                <th className="py-2 pl-2 text-right w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              {inv.items.map((it) => (
                <tr key={it.id} className="border-b border-slate-100">
                  <td className="py-2 pr-2">{it.description || '—'}</td>
                  <td className="py-2 px-2 text-right">{it.quantity}</td>
                  <td className="py-2 px-2 text-right">{formatMoney(it.rate)}</td>
                  <td className="py-2 pl-2 text-right font-semibold">
                    {formatMoney((Number(it.quantity) || 0) * (Number(it.rate) || 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-8">
            <div className="w-64 text-sm space-y-1.5">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-semibold">{formatMoney(t.subtotal)}</span></div>
              {t.discount > 0 && (
                <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="font-semibold text-emerald-600">−{formatMoney(t.discount)}</span></div>
              )}
              {Number(inv.taxRate) > 0 && (
                <div className="flex justify-between"><span className="text-slate-500">Tax ({inv.taxRate}%)</span><span className="font-semibold">{formatMoney(t.tax)}</span></div>
              )}
              <div className="flex justify-between text-lg font-black border-t-2 border-slate-200 pt-2">
                <span>Total</span><span className="text-orange-600">{formatMoney(t.total)}</span>
              </div>
            </div>
          </div>

          {inv.notes && (
            <div className="text-sm">
              <p className="font-bold text-slate-400 uppercase text-xs mb-1">Notes</p>
              <p className="text-slate-600 whitespace-pre-line">{inv.notes}</p>
            </div>
          )}

          <p className="text-center text-xs text-slate-400 mt-10">Generated with Se Fire Invoices</p>
        </motion.div>
      </div>
    );
  }

  /* ---------------- Editor ---------------- */
  if (editing) {
    const t = calcTotals(editing);
    const inputCls =
      'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400/50 transition';
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setEditing(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 hover:border-orange-400/40 transition text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => handleSave('draft')}
              className="px-4 py-2 rounded-xl border border-white/15 hover:border-orange-400/40 transition text-sm font-bold"
            >
              Save draft
            </button>
            <button
              onClick={() => { handleSave('sent'); }}
              className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition text-sm"
            >
              Save & mark sent
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Invoice #</label>
              <input value={editing.number} onChange={(e) => updateField('number', e.target.value)} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Issue date</label>
                <input type="date" value={editing.issueDate} onChange={(e) => updateField('issueDate', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Due date</label>
                <input type="date" value={editing.dueDate} onChange={(e) => updateField('dueDate', e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="text-sm font-bold text-orange-300">Your business</p>
              <input placeholder="Business name" value={editing.businessName} onChange={(e) => updateField('businessName', e.target.value)} className={inputCls} />
              <input placeholder="Email" value={editing.businessEmail} onChange={(e) => updateField('businessEmail', e.target.value)} className={inputCls} />
              <textarea placeholder="Address" rows={2} value={editing.businessAddress} onChange={(e) => updateField('businessAddress', e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-3">
              <p className="text-sm font-bold text-orange-300">Client</p>
              <input placeholder="Client name *" value={editing.clientName} onChange={(e) => updateField('clientName', e.target.value)} className={inputCls} />
              <input placeholder="Client email" value={editing.clientEmail} onChange={(e) => updateField('clientEmail', e.target.value)} className={inputCls} />
              <textarea placeholder="Client address" rows={2} value={editing.clientAddress} onChange={(e) => updateField('clientAddress', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-orange-300">Line items</p>
              <button onClick={addItem} className="flex items-center gap-1 text-xs font-bold text-orange-300 hover:text-orange-200">
                <Plus className="w-3.5 h-3.5" /> Add item
              </button>
            </div>
            <div className="space-y-2">
              {editing.items.map((it) => (
                <div key={it.id} className="grid grid-cols-12 gap-2">
                  <input
                    placeholder="Description"
                    value={it.description}
                    onChange={(e) => updateItem(it.id, 'description', e.target.value)}
                    className={`${inputCls} col-span-6`}
                  />
                  <input
                    type="number" min="0" step="any" placeholder="Qty"
                    value={it.quantity}
                    onChange={(e) => updateItem(it.id, 'quantity', e.target.value)}
                    className={`${inputCls} col-span-2`}
                  />
                  <input
                    type="number" min="0" step="any" placeholder="Rate"
                    value={it.rate}
                    onChange={(e) => updateItem(it.id, 'rate', e.target.value)}
                    className={`${inputCls} col-span-3`}
                  />
                  <button
                    onClick={() => removeItem(it.id)}
                    className="col-span-1 grid place-items-center rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Tax %</label>
                <input type="number" min="0" step="any" value={editing.taxRate} onChange={(e) => updateField('taxRate', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Discount $</label>
                <input type="number" min="0" step="any" value={editing.discount} onChange={(e) => updateField('discount', e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 text-sm space-y-1">
              <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>{formatMoney(t.subtotal)}</span></div>
              <div className="flex justify-between text-slate-400"><span>Tax</span><span>{formatMoney(t.tax)}</span></div>
              <div className="flex justify-between font-black text-lg pt-1 border-t border-white/10">
                <span>Total</span><span className="text-orange-300">{formatMoney(t.total)}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Notes</label>
            <textarea placeholder="Payment terms, thank-you note..." rows={2} value={editing.notes} onChange={(e) => updateField('notes', e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- List ---------------- */
  const totalOutstanding = invoices
    .filter((i) => i.status !== 'paid')
    .reduce((s, i) => s + calcTotals(i).total, 0);
  const totalPaid = invoices
    .filter((i) => i.status === 'paid')
    .reduce((s, i) => s + calcTotals(i).total, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <p className="text-xs text-slate-400 font-bold uppercase">Invoices</p>
          <p className="text-2xl font-black">{invoices.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <p className="text-xs text-slate-400 font-bold uppercase">Outstanding</p>
          <p className="text-2xl font-black text-orange-300">{formatMoney(totalOutstanding)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <p className="text-xs text-slate-400 font-bold uppercase">Paid</p>
          <p className="text-2xl font-black text-emerald-300">{formatMoney(totalPaid)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black">All invoices</h2>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition text-sm"
        >
          <Plus className="w-4 h-4" /> New invoice
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/10">
          <FileText className="w-12 h-12 mx-auto text-slate-700 mb-4" />
          <p className="text-slate-400 mb-2">No invoices yet</p>
          <p className="text-sm text-slate-500">Create your first invoice and get paid.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {invoices.map((inv) => {
              const t = calcTotals(inv);
              return (
                <motion.div
                  key={inv.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-4"
                >
                  <div className="grid place-items-center w-11 h-11 rounded-xl bg-orange-500/15 shrink-0">
                    <DollarSign className="w-5 h-5 text-orange-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold">{inv.number}</p>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${STATUS_COLORS[inv.status]}`}>
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 truncate">{inv.clientName || 'No client'} · due {inv.dueDate}</p>
                  </div>
                  <p className="font-black text-lg hidden sm:block">{formatMoney(t.total)}</p>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setPreviewing(inv)} title="Preview / print"
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition">
                      <Printer className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(inv)} title="Edit"
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {inv.status !== 'paid' ? (
                      <button onClick={() => handleStatus(inv.id, 'paid', inv.number)} title="Mark paid"
                        className="p-2 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-400/10 transition">
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => handleStatus(inv.id, 'sent', inv.number)} title="Mark unpaid"
                        className="p-2 rounded-lg text-slate-400 hover:text-orange-300 hover:bg-orange-400/10 transition">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(inv.id, inv.number)} title="Delete"
                      className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
