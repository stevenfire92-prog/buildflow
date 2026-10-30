import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function StatCard({ label, value, sub, icon: Icon, accent = 'emerald', delay = 0 }) {
  const accents = {
    emerald: 'from-emerald-400/20 to-emerald-400/5 text-emerald-300',
    cyan: 'from-cyan-400/20 to-cyan-400/5 text-cyan-300',
    violet: 'from-violet-400/20 to-violet-400/5 text-violet-300',
    amber: 'from-amber-400/20 to-amber-400/5 text-amber-300',
    rose: 'from-rose-400/20 to-rose-400/5 text-rose-300',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="border-white/10 bg-white/[0.03] overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
              <p className="mt-1.5 text-2xl md:text-3xl font-bold tracking-tight tabular-nums">{value}</p>
              {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
            </div>
            {Icon && (
              <span className={cn('grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br', accents[accent])}>
                <Icon className="w-5 h-5" />
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function SectionTitle({ title, sub, action }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h1>
        {sub && <p className="text-sm text-slate-500 mt-1">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
