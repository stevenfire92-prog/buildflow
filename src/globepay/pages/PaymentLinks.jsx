import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, Plus, Copy, ExternalLink, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppShell from '../components/AppShell';
import { SectionTitle } from '../components/widgets';
import { getPaymentLinks, createPaymentLink, getProducts } from '../api';

export default function PaymentLinks() {
  const [links, setLinks] = useState([]);
  const [products, setProducts] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [priceId, setPriceId] = useState('');
  const [copied, setCopied] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [l, p] = await Promise.all([getPaymentLinks(), getProducts()]);
      setLinks(l.links);
      setDemo(l.demo || p.demo);
      const all = [];
      p.products.forEach((prod) => (prod.prices || []).forEach((pr) => all.push({ ...pr, productName: prod.name })));
      setProducts(all);
      if (all[0]) setPriceId(all[0].id);
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
      toast.info('Demo mode — connect Stripe in Settings to create real links.');
      return;
    }
    setSaving(true);
    try {
      const link = await createPaymentLink({ priceId });
      setLinks([link, ...links]);
      setOpen(false);
      toast.success('Payment link created — share it anywhere.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copy = async (url, id) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      toast.success('Link copied — paste it anywhere you sell.');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Copy failed — long-press the link instead.');
    }
  };

  return (
    <AppShell demo={demo}>
      <SectionTitle
        title="Payment links"
        sub="Shareable checkout links — no website needed."
        action={
          <Button onClick={() => setOpen(true)} className="bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold">
            <Plus className="w-4 h-4 mr-1.5" /> New link
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)}</div>
      ) : links.length === 0 ? (
        <Card className="border-dashed border-white/15 bg-white/[0.02]">
          <CardContent className="py-16 text-center">
            <Link2 className="w-10 h-10 mx-auto text-slate-600" />
            <p className="mt-4 font-medium">No payment links yet</p>
            <p className="text-sm text-slate-500 mt-1">Create one and start selling in DMs, posts, and emails.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {links.map((l, i) => (
            <motion.div key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-white/10 bg-white/[0.03]">
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="grid place-items-center w-10 h-10 rounded-xl bg-cyan-400/10 text-cyan-300 shrink-0">
                    <Link2 className="w-5 h-5" />
                  </span>
                  <p className="flex-1 min-w-0 text-sm text-slate-400 truncate font-mono">{l.url}</p>
                  <Button size="sm" variant="outline" onClick={() => copy(l.url, l.id)} className="border-white/10 shrink-0">
                    {copied === l.id ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                  <a href={l.url} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline" className="border-white/10 shrink-0">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-slate-100">
          <DialogHeader>
            <DialogTitle>New payment link</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>What are you selling?</Label>
              <select value={priceId} onChange={(e) => setPriceId(e.target.value)} className="mt-1.5 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm">
                {products.map((pr) => (
                  <option key={pr.id} value={pr.id}>{pr.productName} — {pr.amount} ({pr.recurring})</option>
                ))}
              </select>
              {products.length === 0 && <p className="text-xs text-slate-500 mt-2">Create a product first.</p>}
            </div>
            <Button type="submit" disabled={saving || !priceId} className="w-full bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create link
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
