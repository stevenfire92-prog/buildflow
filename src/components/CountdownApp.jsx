import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Timer, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';

const KEY = 'sfcd:events';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function parts(target) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor(diff / 3600000) % 24,
    m: Math.floor(diff / 60000) % 60,
    s: Math.floor(diff / 1000) % 60,
  };
}

const pad = (n) => String(n).padStart(2, '0');

export default function CountdownApp() {
  const [events, setEvents] = useState(load);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [, setTick] = useState(0);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const add = (e) => {
    e.preventDefault();
    if (!name.trim() || !date) {
      toast.error('Give the event a name and a date.');
      return;
    }
    if (new Date(date).getTime() <= Date.now()) {
      toast.error('Pick a date in the future.');
      return;
    }
    setEvents((ev) => [...ev, { id: Date.now().toString(), name: name.trim(), date }]);
    setName('');
    setDate('');
    toast.success('Countdown created! ⏱️');
  };

  const remove = (id) => {
    setEvents((ev) => ev.filter((x) => x.id !== id));
    toast.info('Event removed.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <form
        onSubmit={add}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-8 flex flex-col sm:flex-row gap-3"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Event name (e.g. Product launch)"
          className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500/60"
        />
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500/60 text-slate-300"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition text-sm"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </form>

      {events.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Timer className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="font-semibold">No countdowns yet</p>
          <p className="text-sm mt-1">Add your first event above and watch the clock tick.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {events.map((ev) => {
              const p = parts(ev.date);
              return (
                <motion.div
                  key={ev.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-orange-950/40 to-red-950/20 p-5"
                >
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div>
                      <h3 className="font-bold">{ev.name}</h3>
                      <p className="text-xs text-slate-500">
                        {new Date(ev.date).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => remove(ev.id)}
                      className="p-2 rounded-lg hover:bg-white/10 text-slate-500 hover:text-red-400"
                      aria-label="Delete event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {p ? (
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        [p.d, 'days'],
                        [pad(p.h), 'hrs'],
                        [pad(p.m), 'min'],
                        [pad(p.s), 'sec'],
                      ].map(([v, l]) => (
                        <div key={l} className="rounded-xl bg-black/40 border border-white/10 py-3">
                          <div className="text-2xl font-black tabular-nums bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                            {v}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-500">{l}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-400 font-bold py-2">
                      <PartyPopper className="w-5 h-5" /> It's time!
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
