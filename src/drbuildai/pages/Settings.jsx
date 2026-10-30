import { useState } from 'react';
import { KeyRound, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import AppShell from '../components/AppShell';

export default function Settings() {
  const [key, setKey] = useState(() => localStorage.getItem('drbuildai:llm_key') || '');
  const saved = !!localStorage.getItem('drbuildai:llm_key');

  const save = (e) => {
    e.preventDefault();
    if (key.trim()) {
      localStorage.setItem('drbuildai:llm_key', key.trim());
      toast.success('AI key saved — Dr Build is now running on real AI.');
    }
  };

  const clear = () => {
    localStorage.removeItem('drbuildai:llm_key');
    setKey('');
    toast.success('Key removed — back to demo mode.');
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Power up Dr Build with real AI.</p>
      </div>

      <div className="max-w-2xl">
        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-violet-300" /> AI Engine
            </CardTitle>
            <CardDescription>
              Dr Build works out of the box in demo mode. Add your AI API key to unlock
              real generation — custom code, real content, your words brought to life.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              {saved ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span className="text-sm font-medium">Real AI connected</span>
                  <Badge className="bg-emerald-400/15 text-emerald-300 border-emerald-400/30">LIVE</Badge>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-slate-500" />
                  <span className="text-sm font-medium text-slate-300">Demo mode</span>
                  <Badge variant="outline" className="border-white/15 text-slate-400">SIMULATED</Badge>
                </>
              )}
            </div>
            <form onSubmit={save} className="space-y-3">
              <div>
                <Label>AI API key</Label>
                <Input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="sk-..."
                  className="mt-1.5 bg-white/5 border-white/10 font-mono text-sm"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">Stored only in this browser. Never sent anywhere except the AI provider.</p>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold">
                  <Zap className="w-4 h-4 mr-1.5" /> Connect AI
                </Button>
                {saved && (
                  <Button type="button" variant="outline" onClick={clear} className="border-white/10">
                    Remove
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
