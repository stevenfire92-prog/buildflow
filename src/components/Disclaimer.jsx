import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

const SECTIONS = [
  { t: 'Provided "as is"', d: 'This product is provided for entertainment and general informational purposes only, "as is" and "as available," without warranties of any kind. Features and content may change at any time without notice.' },
  { t: 'No professional advice', d: 'Nothing here constitutes financial, legal, tax, or other professional advice. Dashboards, analytics, and revenue figures are informational estimates — consult a qualified professional before making business or financial decisions.' },
  { t: 'No guarantees', d: 'We do not guarantee earnings, results, or uptime. Past performance and demo data do not predict future results.' },
  { t: 'AI-generated content', d: 'AI features may produce inaccurate or incomplete outputs. Review everything before relying on it or publishing it.' },
  { t: 'Your responsibility', d: 'You are responsible for how you use this product, the content you create with it, and for complying with the laws in your jurisdiction.' },
  { t: 'Third-party services', d: 'Integrations such as Stripe for payments are governed by those services\u2019 own terms and privacy policies.' },
  { t: 'Limitation of liability', d: 'To the maximum extent permitted by law, the operator shall not be liable for indirect, incidental, or consequential damages arising from use of this product.' },
];

export default function Disclaimer({ accent = 'emerald', home = '/' }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link to={home} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-100 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert className="w-7 h-7 text-slate-300" />
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Disclaimer</h1>
        </div>
        <p className="text-xs text-slate-500 mb-8">Last updated: October 30, 2026</p>
        <div className="space-y-6">
          {SECTIONS.map((s) => (
            <section key={s.t}>
              <h2 className="font-bold text-sm mb-1.5">{s.t}</h2>
              <p className="text-sm text-slate-400 leading-relaxed">{s.d}</p>
            </section>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-10">Questions: stevenfire92@gmail.com</p>
      </div>
    </div>
  );
}
