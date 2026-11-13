import { useState, useMemo } from 'react';
import { Plus, Trash2, Pencil, X, Store, ShoppingCart, Minus, Check, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

const KEY = 'sfstore:products';
const CART_KEY = 'sfstore:cart';
const EMOJIS = ['📦', '👕', '👟', '⌚', '🎧', '💡', '☕', '🎒', '📱', '💻', '🕶️', '🧢'];

const load = (k) => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;

export default function StoreApp() {
  const [tab, setTab] = useState('shop');
  const [products, setProducts] = useState(() => load(KEY));
  const [cart, setCart] = useState(() => load(CART_KEY));
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fName, setFName] = useState('');
  const [fPrice, setFPrice] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fEmoji, setFEmoji] = useState('📦');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [checkedOut, setCheckedOut] = useState(false);

  const persistP = (next) => { setProducts(next); save(KEY, next); };
  const persistC = (next) => { setCart(next); save(CART_KEY, next); };

  const cartDetailed = useMemo(() =>
    cart.map((ci) => ({ ...ci, product: products.find((p) => p.id === ci.id) })).filter((ci) => ci.product),
    [cart, products]);
  const subtotal = useMemo(() =>
    cartDetailed.reduce((s, ci) => s + (Number(ci.product.price) || 0) * ci.qty, 0), [cartDetailed]);

  const addToCart = (id) => {
    const ex = cart.find((c) => c.id === id);
    persistC(ex ? cart.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c)) : [...cart, { id, qty: 1 }]);
    toast.success('Added to cart');
  };
  const setQty = (id, qty) => {
    if (qty <= 0) persistC(cart.filter((c) => c.id !== id));
    else persistC(cart.map((c) => (c.id === id ? { ...c, qty } : c)));
  };
  const checkout = () => {
    if (cartDetailed.length === 0) { toast.error('Your cart is empty'); return; }
    persistC([]); setCheckedOut(true);
    toast.success('Order placed! (Demo checkout)');
  };

  const openAdd = () => {
    setEditing(null); setFName(''); setFPrice(''); setFDesc(''); setFEmoji('📦'); setShowModal(true);
  };
  const openEdit = (p) => {
    setEditing(p); setFName(p.name || ''); setFPrice(String(p.price ?? ''));
    setFDesc(p.desc || ''); setFEmoji(p.emoji || '📦'); setShowModal(true);
  };
  const saveProduct = () => {
    if (!fName.trim()) { toast.error('Product name is required'); return; }
    const payload = { name: fName.trim(), price: Math.max(0, Number(fPrice) || 0), desc: fDesc.trim(), emoji: fEmoji };
    if (editing) {
      persistP(products.map((p) => (p.id === editing.id ? { ...p, ...payload } : p)));
      toast.success('Product updated');
    } else {
      persistP([{ ...payload, id: Date.now().toString(), ts: Date.now() }, ...products]);
      toast.success('Product listed');
    }
    setShowModal(false);
  };
  const doDelete = (id) => {
    persistP(products.filter((p) => p.id !== id));
    persistC(cart.filter((c) => c.id !== id));
    setConfirmDelete(null); toast.success('Product removed');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex gap-2 mb-6">
        {[
          { id: 'shop', label: 'Storefront', icon: Store },
          { id: 'cart', label: `Cart (${cartDetailed.reduce((s, c) => s + c.qty, 0)})`, icon: ShoppingCart },
          { id: 'manage', label: 'Manage', icon: Settings2 },
        ].map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setCheckedOut(false); }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition ${tab === t.id ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'shop' && (
        products.length === 0 ? (
          <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
            <Store className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="font-bold text-slate-300 mb-1">Your store is empty</p>
            <p className="text-sm text-slate-500 mb-4">Add products in the Manage tab to open your storefront.</p>
            <button onClick={() => setTab('manage')} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
              <Plus className="w-4 h-4" /> Add Products
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
                <p className="text-5xl mb-3">{p.emoji}</p>
                <p className="font-bold">{p.name}</p>
                {p.desc && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.desc}</p>}
                <p className="text-xl font-black text-orange-300 mt-2">{money(p.price)}</p>
                <button onClick={() => addToCart(p.id)} className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition inline-flex items-center justify-center gap-1.5">
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'cart' && (
        <div className="max-w-2xl mx-auto">
          {checkedOut ? (
            <div className="text-center py-14 rounded-2xl border border-emerald-500/40 bg-emerald-500/[0.06]">
              <Check className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="font-black text-xl mb-1">Order confirmed!</p>
              <p className="text-sm text-slate-400 mb-4">Demo checkout complete — no real payment was processed.</p>
              <button onClick={() => setTab('shop')} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
                Keep Shopping
              </button>
            </div>
          ) : cartDetailed.length === 0 ? (
            <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
              <ShoppingCart className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="font-bold text-slate-300 mb-1">Cart is empty</p>
              <p className="text-sm text-slate-500 mb-4">Browse the storefront and add something you love.</p>
              <button onClick={() => setTab('shop')} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
                Browse Store
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {cartDetailed.map((ci) => (
                  <div key={ci.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-4">
                    <p className="text-4xl">{ci.product.emoji}</p>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold">{ci.product.name}</p>
                      <p className="text-sm text-slate-400">{money(ci.product.price)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQty(ci.id, ci.qty - 1)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition"><Minus className="w-3.5 h-3.5" /></button>
                      <span className="font-bold w-6 text-center">{ci.qty}</span>
                      <button onClick={() => setQty(ci.id, ci.qty + 1)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                    <p className="font-black w-20 text-right">{money((Number(ci.product.price) || 0) * ci.qty)}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex justify-between text-sm text-slate-400 mb-1"><span>Subtotal</span><span>{money(subtotal)}</span></div>
                <div className="flex justify-between text-sm text-slate-400 mb-3"><span>Shipping</span><span>Free</span></div>
                <div className="flex justify-between font-black text-lg mb-4"><span>Total</span><span className="text-orange-300">{money(subtotal)}</span></div>
                <button onClick={checkout} className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
                  Checkout — {money(subtotal)}
                </button>
                <p className="text-center text-[11px] text-slate-600 mt-2">Demo checkout — real payments are processed through PayPal.</p>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'manage' && (
        <>
          <button onClick={openAdd} className="mb-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
            <Plus className="w-4 h-4" /> List Product
          </button>
          {products.length === 0 ? (
            <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
              <p className="font-bold text-slate-300">No products listed yet</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-3xl">{p.emoji}</p>
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition"><Pencil className="w-3.5 h-3.5 text-slate-400" /></button>
                      <button onClick={() => setConfirmDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition"><Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" /></button>
                    </div>
                  </div>
                  <p className="font-bold mt-2">{p.name}</p>
                  <p className="text-orange-300 font-black">{money(p.price)}</p>
                  {confirmDelete === p.id && (
                    <div className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 flex items-center justify-between gap-2">
                      <p className="text-xs text-red-300 font-semibold">Remove?</p>
                      <div className="flex gap-1.5">
                        <button onClick={() => doDelete(p.id)} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600">Yes</button>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">{editing ? 'Edit Product' : 'List Product'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Product name *" autoFocus
              className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <input value={fPrice} onChange={(e) => setFPrice(e.target.value)} type="number" min="0" step="0.01" placeholder="Price (USD) *"
              className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <textarea value={fDesc} onChange={(e) => setFDesc(e.target.value)} placeholder="Description" rows={2}
              className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div>
              <p className="text-xs text-slate-500 mb-2">Product icon</p>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((em) => (
                  <button key={em} onClick={() => setFEmoji(em)}
                    className={`text-2xl p-2 rounded-xl border transition ${fEmoji === em ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 hover:bg-white/5'}`}>
                    {em}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={saveProduct} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
                {editing ? 'Save Changes' : 'List Product'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
