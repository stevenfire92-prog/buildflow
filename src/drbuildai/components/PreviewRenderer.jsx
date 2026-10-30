// Live preview renderer — turns a blueprint + app name into a real mini-app
// rendered inside the builder's preview panel.

function Shell({ children, appName }) {
  return (
    <div className="h-full bg-slate-950 text-slate-100 text-left overflow-auto">
      <div className="flex items-center gap-2 px-4 h-11 border-b border-white/10 bg-slate-900/60 sticky top-0">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
        </div>
        <span className="text-[11px] text-slate-500 font-medium truncate">{appName}</span>
      </div>
      {children}
    </div>
  );
}

function LandingPreview({ appName }) {
  return (
    <Shell appName={appName}>
      <div className="px-6 py-10 text-center">
        <div className="inline-block rounded-full bg-violet-400/15 border border-violet-400/30 px-3 py-1 text-[10px] text-violet-300 font-medium">New</div>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Welcome to {appName}</h1>
        <p className="mt-2 text-xs text-slate-400 max-w-xs mx-auto">The easiest way to get started. Beautiful, fast, and built for you.</p>
        <div className="mt-5 flex gap-2 justify-center">
          <span className="rounded-lg bg-violet-500 px-4 py-2 text-xs font-bold text-white">Get started</span>
          <span className="rounded-lg border border-white/15 px-4 py-2 text-xs text-slate-300">Learn more</span>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-2">
          {['Fast', 'Simple', 'Loved'].map((f) => (
            <div key={f} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs font-bold">{f}</p>
              <p className="text-[10px] text-slate-500 mt-1">Built-in from day one.</p>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function DashboardPreview({ appName }) {
  return (
    <Shell appName={appName}>
      <div className="p-4">
        <h1 className="text-base font-bold">{appName}</h1>
        <p className="text-[11px] text-slate-500">Here's what's happening today.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { l: 'Revenue', v: '$12.4k' },
            { l: 'Users', v: '8,392' },
            { l: 'Orders', v: '1,204' },
            { l: 'Growth', v: '+24%' },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">{s.l}</p>
              <p className="text-lg font-bold text-violet-300">{s.v}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[11px] font-semibold mb-2">Recent activity</p>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between py-1.5 border-t border-white/5 first:border-0 text-[11px]">
              <span className="text-slate-400">Event #{i}</span>
              <span className="text-slate-500">2m ago</span>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function StorePreview({ appName }) {
  return (
    <Shell appName={appName}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold">{appName}</h1>
          <span className="rounded-lg bg-violet-500/20 border border-violet-400/30 px-2.5 py-1 text-[10px] text-violet-300 font-bold">Cart (2)</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { n: 'Starter Kit', p: '$49' },
            { n: 'Pro Bundle', p: '$99' },
            { n: 'Addon Pack', p: '$29' },
            { n: 'Gift Card', p: '$25' },
          ].map((item) => (
            <div key={item.n} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="h-14 rounded-lg bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20" />
              <p className="mt-2 text-[11px] font-semibold">{item.n}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold text-violet-300">{item.p}</span>
                <span className="rounded-md bg-violet-500 px-2 py-0.5 text-[10px] font-bold text-white">Add</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function PortfolioPreview({ appName }) {
  return (
    <Shell appName={appName}>
      <div className="p-4">
        <h1 className="text-base font-bold">{appName}</h1>
        <p className="text-[11px] text-slate-500">Selected work</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`rounded-xl bg-gradient-to-br ${i % 2 ? 'from-violet-500/40 to-fuchsia-500/20' : 'from-fuchsia-500/30 to-violet-500/20'} ${i % 3 === 0 ? 'h-28' : 'h-20'}`} />
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
          <p className="text-[11px] font-semibold">Let's work together</p>
          <span className="inline-block mt-2 rounded-lg bg-violet-500 px-4 py-1.5 text-[10px] font-bold text-white">Contact</span>
        </div>
      </div>
    </Shell>
  );
}

function SaasPreview({ appName }) {
  return (
    <Shell appName={appName}>
      <div className="flex h-[calc(100%-44px)]">
        <div className="w-24 border-r border-white/10 p-2 space-y-1">
          {['Home', 'Projects', 'Team', 'Billing'].map((n, i) => (
            <div key={n} className={`rounded-md px-2 py-1.5 text-[10px] font-medium ${i === 0 ? 'bg-violet-500/20 text-violet-300' : 'text-slate-500'}`}>{n}</div>
          ))}
        </div>
        <div className="flex-1 p-3">
          <h1 className="text-sm font-bold">{appName} workspace</h1>
          <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-[11px] font-semibold">Welcome back 👋</p>
            <p className="text-[10px] text-slate-500 mt-1">Pick up where you left off.</p>
          </div>
          <div className="mt-2 space-y-1.5">
            {['Launch checklist', 'Invite team', 'Connect billing'].map((t) => (
              <div key={t} className="flex items-center gap-2 rounded-lg border border-white/10 px-2.5 py-2 text-[11px]">
                <span className="w-3.5 h-3.5 rounded border border-white/25" />
                <span className="text-slate-300">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

export default function PreviewRenderer({ blueprintId, appName }) {
  switch (blueprintId) {
    case 'dashboard': return <DashboardPreview appName={appName} />;
    case 'store': return <StorePreview appName={appName} />;
    case 'portfolio': return <PortfolioPreview appName={appName} />;
    case 'saas': return <SaasPreview appName={appName} />;
    default: return <LandingPreview appName={appName} />;
  }
}
