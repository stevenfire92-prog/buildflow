import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Trash2, Rocket, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppShell from '../components/AppShell';
import PreviewRenderer from '../components/PreviewRenderer';
import { getApps, deleteApp } from '../engine';

export default function MyApps() {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    setApps(getApps());
  }, []);

  const remove = (id, name) => {
    setApps(deleteApp(id));
    toast.success(`"${name}" deleted.`);
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">My Apps</h1>
        <p className="text-sm text-slate-500 mt-1">Everything Dr Build has made for you.</p>
      </div>

      {apps.length === 0 ? (
        <Card className="border-dashed border-white/15 bg-white/[0.02]">
          <CardContent className="py-16 text-center">
            <FolderOpen className="w-10 h-10 mx-auto text-slate-600" />
            <p className="mt-4 font-medium">No apps yet</p>
            <p className="text-sm text-slate-500 mt-1">Head to the builder and describe your first app.</p>
            <Button onClick={() => (window.location.href = '/builder')} className="mt-5 bg-gradient-to-r from-violet-500 to-fuchsia-500 font-bold">
              Start building
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app, i) => (
            <motion.div key={app.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-white/10 bg-white/[0.03] overflow-hidden">
                <div className="h-44 border-b border-white/10">
                  <PreviewRenderer blueprintId={app.blueprint} appName={app.name} />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{app.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{app.prompt}</p>
                    </div>
                    <button onClick={() => remove(app.id, app.name)} className="text-slate-600 hover:text-rose-300 shrink-0" aria-label="Delete app">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className="border-white/15 text-slate-400 text-[10px]">{app.blueprintName}</Badge>
                    {app.published && (
                      <Badge className="bg-emerald-400/15 text-emerald-300 border-emerald-400/30 text-[10px]">
                        <Rocket className="w-3 h-3 mr-1" /> Published
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
