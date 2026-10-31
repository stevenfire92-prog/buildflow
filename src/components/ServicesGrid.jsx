import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Smartphone, Gamepad2, Code, Music, BookOpen, Check, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const SERVICES = [
  {
    id: 'websites',
    icon: Globe,
    name: 'Websites',
    tagline: 'Stunning sites that convert',
    price: 'from $2,500',
    market: '$2,000+ elsewhere',
    features: ['Custom design', 'Mobile responsive', 'SEO optimized', 'Fast loading', 'Contact forms'],
  },
  {
    id: 'webapps',
    icon: Code,
    name: 'Web Apps',
    tagline: 'Powerful apps in your browser',
    price: 'from $2,800',
    market: '$5,000+ elsewhere',
    features: ['User accounts', 'Dashboards', 'Real-time data', 'API integrations', 'Admin panels'],
  },
  {
    id: 'apps',
    icon: Smartphone,
    name: 'Mobile Apps',
    tagline: 'iOS & Android apps',
    price: 'from $3,500',
    market: '$10,000+ elsewhere',
    features: ['iOS + Android', 'Push notifications', 'Offline mode', 'App store launch', 'Analytics'],
  },
  {
    id: 'games',
    icon: Gamepad2,
    name: 'Games',
    tagline: 'Addictive games that entertain',
    price: 'from $2,500',
    market: '$5,000+ elsewhere',
    features: ['2D/3D gameplay', 'Leaderboards', 'Achievements', 'Sound design', 'Multi-platform'],
  },
  {
    id: 'software',
    icon: Sparkles,
    name: 'Custom Software',
    tagline: 'Tools built for your workflow',
    price: 'from $2,000',
    market: '$4,000+ elsewhere',
    features: ['Desktop apps', 'Automation tools', 'Data processing', 'Custom integrations', 'Support'],
  },
  {
    id: 'music',
    icon: Music,
    name: 'Music Production',
    tagline: 'Beats, mixing & features',
    price: 'from $150',
    market: '$300+ elsewhere',
    features: ['Custom beats', 'Mixing & mastering', 'Features', 'Cover art', 'Distribution'],
  },
  {
    id: 'books',
    icon: BookOpen,
    name: 'Books & eBooks',
    tagline: 'From manuscript to published',
    price: 'from $500',
    market: '$1,000+ elsewhere',
    features: ['Ghostwriting', 'Editing', 'Cover design', 'Kindle publishing', 'Marketing'],
  },
];

export default function ServicesGrid() {
  const [selected, setSelected] = useState(null);

  const handleInquire = (service) => {
    setSelected(service.id);
    toast.success(`Inquiry started for ${service.name} — we'll be in touch!`);
    // In production, this would open a contact form or booking flow
  };

  return (
    <div className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
          Everything digital, <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">one roof</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Professional quality at prices that beat the competition. Every project built with care and a positive impact in mind.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SERVICES.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-orange-400/40 transition-colors"
          >
            <span className="grid place-items-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 mb-4">
              <s.icon className="w-6 h-6 text-white" />
            </span>
            <h3 className="text-xl font-bold mb-1">{s.name}</h3>
            <p className="text-sm text-slate-400 mb-3">{s.tagline}</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-extrabold text-orange-300">{s.price}</span>
              <span className="text-xs text-slate-500 line-through">{s.market}</span>
            </div>
            <ul className="space-y-2 mb-5">
              {s.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleInquire(s)}
              className="w-full rounded-xl py-3 font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition flex items-center justify-center gap-2"
            >
              Get a quote <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-xs text-slate-500 mt-8">
        All prices in USD. Final quote depends on project scope. Free consultation included.
      </p>
    </div>
  );
}
