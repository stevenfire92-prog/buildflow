import { useState, useEffect } from 'react';
import { ShieldCheck, KeyRound, Webhook, ExternalLink, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppShell from '../components/AppShell';
import { SectionTitle } from '../components/widgets';
import { getStatus } from '../api';

export default function Settings() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setStatus(await getStatus());
      setLoading(false);
    })();
  }, []);

  const connected = status?.connected;

  return (
    <AppShell demo={status && !connected}>
      <SectionTitle title="Settings" sub="Connect Stripe to go live." />

      <div className="grid md:grid-cols-2 gap-4 max-w-4xl">
        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-300" /> Stripe connection
            </CardTitle>
            <CardDescription>GlobePay reads your products, payments and subscriptions straight from Stripe.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
            ) : connected ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span className="font-medium">Connected</span>
                  {status.livemode
                    ? <Badge className="bg-emerald-400/15 text-emerald-300 border-emerald-400/30">LIVE</Badge>
                    : <Badge variant="outline" className="border-amber-400/30 text-amber-300">TEST MODE</Badge>}
                </div>
                <dl className="text-sm space-y-1.5 text-slate-400">
                  <div className="flex justify-between"><dt>Account</dt><dd className="font-mono text-slate-200">{status.accountId}</dd></div>
                  <div className="flex justify-between"><dt>Country</dt><dd className="text-slate-200">{status.country}</dd></div>
                  <div className="flex justify-between"><dt>Charges</dt><dd className="text-slate-200">{status.chargesEnabled ? 'Enabled' : 'Disabled'}</dd></div>
                  <div className="flex justify-between"><dt>Payouts</dt><dd className="text-slate-200">{status.payoutsEnabled ? 'Enabled' : 'Disabled'}</dd></div>
                </dl>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-slate-500" />
                  <span className="font-medium text-slate-300">Not connected</span>
                  <Badge variant="outline" className="border-white/15 text-slate-400">DEMO MODE</Badge>
                </div>
                <p className="text-sm text-slate-400">
                  Add your <code className="text-slate-200 font-mono text-xs">STRIPE_SECRET_KEY</code> as an environment
                  variable on your Vercel project, then redeploy. You're exploring with sample data until then.
                </p>
                <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="border-white/10">
                    Get Stripe API keys <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Webhook className="w-4 h-4 text-cyan-300" /> Webhooks
            </CardTitle>
            <CardDescription>Get instant sale alerts the second money lands.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-400 space-y-2.5">
            <p>Point a Stripe webhook at <code className="font-mono text-xs text-slate-200">/api/webhooks/stripe</code> with these events:</p>
            <ul className="list-disc list-inside text-xs font-mono text-slate-300 space-y-1">
              <li>checkout.session.completed</li>
              <li>customer.subscription.created</li>
              <li>invoice.paid</li>
              <li>invoice.payment_failed</li>
            </ul>
            <p className="text-xs text-slate-500 flex items-start gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-300" />
              Keys stay on the server — they never touch the browser.
            </p>
            <Button
              variant="outline" size="sm" className="border-white/10"
              onClick={() => toast.info('Webhook listener ships in the next update.')}
            >
              Enable sale alerts
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
