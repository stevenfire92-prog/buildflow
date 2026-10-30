import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppShell from '../components/AppShell';
import { SectionTitle } from '../components/widgets';
import { getProducts, createProduct } from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', amount: '', recurring: 'one-time' });

  const load = async () => {
    setLoading(true);
    try {
      const d = await getProducts();
      setProducts(d.products);
      setDemo(d.demo);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (demo) {
      toast.info('Demo mode — connect Stripe in Settings to create real products.');
      return;
    }
    setSaving(true);
    try {
      const p = await createProduct({
        name: form.name,
        description: form.description,
        amount: form.amount,
        recurring: form.recurring === 'one-time' ? undefined : form.recurring,
      });
      setProducts([p, ...products]);
      setOpen(false);
      setForm({ name: '', description: '', amount: '', recurring: 'one-time' });
      toast.success(`"${p.name}" is live and ready to sell.`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell demo={demo}>
      <SectionTitle
        title="Products"
        sub="Everything you sell, in one place."
        action={
          <Button onClick={() => setOpen(true)} className="bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold">
            <Plus className="w-4 h-4 mr-1.5" /> New product
          </Button>
        }
      />

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-xl bg-white/5 animate-pulse" />)}
        </div>
      ) : products.length === 0 ? (
        <Card className="border-dashed border-white/15 bg-white/[0.02]">
          <CardContent className="py-16 text-center">
            <Package className="w-10 h-10 mx-auto text-slate-600" />
            <p className="mt-4 font-medium">No products yet</p>
            <p className="text-sm text-slate-500 mt-1">Create your first product and start getting paid.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {products.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-white/10 bg-white/[0.03] hover:border-emerald-400/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <span className="grid place-items-center w-10 h-10 rounded-xl bg-emerald-400/10 text-emerald-300">
                        <Package className="w-5 h-5" />
                      </span>
                      {p.prices?.[0] && (
                        <Badge variant="outline" className="border-white/15 text-slate-300">
                          {p.prices[0].recurring === 'one-time' ? 'One-time' : `/${p.prices[0].recurring}`}
                        </Badge>
                      )}
                    </div>
                    <h3 className="mt-3 font-semibold">{p.name}</h3>
                    {p.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{p.description}</p>}
                    <p className="mt-3 text-xl font-bold text-emerald-300 tabular-nums">{p.prices?.[0]?.amount || '—'}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-slate-100">
          <DialogHeader>
            <DialogTitle>New product</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Pro Plan" required className="mt-1.5 bg-white/5 border-white/10" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What do buyers get?" className="mt-1.5 bg-white/5 border-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price (USD)</Label>
                <Input type="number" min="1" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="49.00" required className="mt-1.5 bg-white/5 border-white/10" />
              </div>
              <div>
                <Label>Billing</Label>
                <select value={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.value })} className="mt-1.5 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm">
                  <option value="one-time">One-time</option>
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>
            </div>
            <Button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create product
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
