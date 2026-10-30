import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutTemplate, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppShell from '../components/AppShell';
import { BLUEPRINTS } from '../engine';

const DESCRIPTIONS = {
  landing: 'High-converting landing pages for any business.',
  dashboard: 'Analytics dashboards with stats and tables.',
  store: 'Online stores with cart and checkout.',
  portfolio: 'Stunning portfolios and galleries.',
  saas: 'Full SaaS workspaces with teams and billing.',
};

export default function Templates() {
  const navigate = useNavigate();
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Templates</h1>
        <p className="text-sm text-slate-500 mt-1">Start from a blueprint — Dr Build customizes it for you.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(BLUEPRINTS).map((bp, i) => (
          <motion.div key={bp.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="border-white/10 bg-white/[0.03] hover:border-violet-400/40 transition-colors h-full">
              <CardContent className="p-6">
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400/20 to-fuchsia-400/10 text-violet-300">
                  <LayoutTemplate className="w-5 h-5" />
                </span>
                <h3 className="mt-4 font-semibold">{bp.name}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{DESCRIPTIONS[bp.id]}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 border-white/10"
                  onClick={() => navigate('/builder')}
                >
                  Build with this <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}
