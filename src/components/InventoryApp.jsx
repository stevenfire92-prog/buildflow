import { useState, useMemo } from 'react';
import { Plus, Trash2, Pencil, X, Search, Boxes, TriangleAlert, ArrowUp, ArrowDown, Truck } from 'lucide-react';
import { toast } from 'sonner';

const KEY = 'sfinv:products';

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};
const save = (p) => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {} };
const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;

export default function InventoryApp() {
  const [products, setProducts] = useState(load);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fSku, setFSku] = useState('');
  const [fName, setFName] = useState('');
  const [fQty, setFQty] = useState('');
  const [fThreshold, setFThreshold] = useState('');
  const [fSupplier, setFSupplier] = useState('');
  const [fPrice, setFPrice] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [adjustId, setAdjustId] = useState(null);
  const [adjustAmt, setAdjustAmt] = useState('');

  const persist = (next) => { setProducts(next); save(next); };

  const stats = useMemo(() => {
    const low = products.filter((p) => (Number(p.qty) || 0) <= (Number(p.threshold) || 0));
    const value = products.reduce((s, p) => s + (Number(p.qty) || 0) * (Number(p.price) || 0), 0);
    const units = products.reduce((s, p) => s + (Number(p.qty) || 0), 0);
    return { skus: products.length, units, low: low.length, value };
  }, [products]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => {
        if (filter === 'low') return (Number(p.qty) || 0) <= (Number(p.threshold) || 0);
        if (filter === 'out') return (Number(p.qty) || 0) === 0;
        return true;
      })
      .filter((p) => !q || (p.name || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q) || (p.supplier || '').toLowerCase().includes(q))
      .slice().sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }, [products, search, filter]);

  const openAdd = () => {
    setEditing(null); setFSku(''); setFName(''); setFQty(''); setFThreshold('10');
    setFSupplier(''); setFPrice(''); setShowModal(true);
  };
  const openEdit = (p) => {
    setEditing(p); setFSku(p.sku || ''); setFName(p.name || ''); setFQty(String(p.qty ?? ''));
    setFThreshold(String(p.threshold ?? '')); setFSupplier(p.supplier || ''); setFPrice(String(p.price ?? ''));
    setShowModal(true);
  };
  const saveProduct = () => {
    if (!fName.trim()) { toast.error('Product name is required'); return; }
    const payload = {
      sku: fSku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      name: fName.trim(), qty: Math.max(0, Number(fQty) || 0),
      threshold: Math.max(0, Number(fThreshold) || 0),
      supplier: fSupplier.trim(), price: Math.max(0, Number(fPrice) || 0),
    };
    if (editing) {
      persist(products.map((p) => (p.id === editing.id ? { ...p, ...payload } : p)));
      toast.success('Product updated');
    } else {
      persist([{ ...payload, id: Date.now().toString(), ts: Date.now() }, ...products]);
      toast.success('Product added');
    }
    setShowModal(false);
  };
  const doDelete = (id) => { persist(products.filter((p) => p.id !== id)); setConfirmDelete(null); toast.success('Product deleted'); };
  const adjust = (id, dir) => {
    const amt = Math.abs(Number(adjustAmt) || 0);
    if (!amt) { toast.error('Enter a quantity'); return; }
    persist(products.map((p) => p.id === id ? { ...p, qty: Math.max(0, (Number(p.qty) || 0) + (dir === 'in' ? amt : -amt)) } : p));
    setAdjustId(null); setAdjustAmt('');
    toast.success(dir === 'in' ? `Stocked in ${amt} units` : `Stocked out ${amt} units`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'SKUs', value: stats.skus, color: '#fff' },
          { label: 'Total Units', value: stats.units, color: '#3b82f6' },
          { label: 'Low Stock', value: stats.low, color: stats.low ? '#ef4444' : '#22c55e' },
          { label: 'Inventory Value', value: money(stats.value), color: '#eab308' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">{s.label}</p>
            <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {stats.low > 0 && (
        <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 flex items-center gap-3">
          <TriangleAlert className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300 font-semibold">{stats.low} product{stats.low === 1 ? '' : 's'} at or below reorder level — restock soon.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, SKU, supplier…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500">
          <option value="all">All products</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
        <button onClick={openAdd} className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
          <Boxes className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="font-bold text-slate-300 mb-1">{products.length === 0 ? 'No products yet' : 'No products match'}</p>
          <p className="text-sm text-slate-500 mb-4">{products.length === 0 ? 'Add your first product to start tracking inventory.' : 'Try a different search or filter.'}</p>
          {products.length === 0 && (
            <button onClick={openAdd} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((p) => {
            const qty = Number(p.qty) || 0;
            const low = qty <= (Number(p.threshold) || 0);
            const out = qty === 0;
            return (
              <div key={p.id} className={`rounded-2xl border p-4 ${out ? 'border-red-500/40 bg-red-500/[0.04]' : low ? 'border-amber-500/40 bg-amber-500/[0.04]' : 'border-white/10 bg-white/[0.03]'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold">{p.name}</p>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 font-mono">{p.sku}</span>
                      {out && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">OUT OF STOCK</span>}
                      {!out && low && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">LOW STOCK</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {p.supplier && <span className="inline-flex items-center gap-1 mr-3"><Truck className="w-3 h-3" /> {p.supplier}</span>}
                      {money(p.price)} / unit · Reorder at {p.threshold}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-2xl font-black ${out ? 'text-red-400' : low ? 'text-amber-300' : 'text-white'}`}>{qty}</p>
                    <p className="text-[11px] text-slate-500">units</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  {adjustId === p.id ? (
                    <>
                      <input value={adjustAmt} onChange={(e) => setAdjustAmt(e.target.value)} type="number" min="1" placeholder="Qty"
                        className="w-24 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" autoFocus />
                      <button onClick={() => adjust(p.id, 'in')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:brightness-110 transition">
                        <ArrowUp className="w-3.5 h-3.5" /> In
                      </button>
                      <button onClick={() => adjust(p.id, 'out')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:brightness-110 transition">
                        <ArrowDown className="w-3.5 h-3.5" /> Out
                      </button>
                      <button onClick={() => { setAdjustId(null); setAdjustAmt(''); }} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10">Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => setAdjustId(p.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition">
                      Adjust stock
                    </button>
                  )}
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition" title="Edit">
                    <Pencil className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button onClick={() => setConfirmDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition" title="Delete">
                    <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" />
                  </button>
                </div>
                {confirmDelete === p.id && (
                  <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-red-300 font-semibold">Delete {p.name}?</p>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => doDelete(p.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:brightness-110 transition">Delete</button>
                      <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Product name *" autoFocus
              className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="grid grid-cols-2 gap-3">
              <input value={fSku} onChange={(e) => setFSku(e.target.value)} placeholder="SKU (auto if blank)"
                className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
              <input value={fSupplier} onChange={(e) => setFSupplier(e.target.value)} placeholder="Supplier"
                className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input value={fQty} onChange={(e) => setFQty(e.target.value)} type="number" min="0" placeholder="Qty"
                className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
              <input value={fThreshold} onChange={(e) => setFThreshold(e.target.value)} type="number" min="0" placeholder="Reorder at"
                className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
              <input value={fPrice} onChange={(e) => setFPrice(e.target.value)} type="number" min="0" step="0.01" placeholder="Price $"
                className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={saveProduct} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
                {editing ? 'Save Changes' : 'Add Product'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
