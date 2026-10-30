import { NavLink, useNavigate } from 'react-router-dom';
import { Stethoscope, Hammer, LayoutTemplate, FolderOpen, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/builder', label: 'Builder', icon: Hammer },
  { to: '/templates', label: 'Templates', icon: LayoutTemplate },
  { to: '/apps', label: 'My Apps', icon: FolderOpen },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function AppShell({ children }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="w-60 shrink-0 border-r border-white/10 bg-slate-900/60 backdrop-blur hidden md:flex flex-col">
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5 px-5 pt-6 pb-5 text-left">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25">
            <Stethoscope className="w-5 h-5 text-white" />
          </span>
          <span className="font-bold text-lg tracking-tight">Dr Build AI</span>
        </button>
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-violet-400/15 text-violet-300' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              )}
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Back to site
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 inset-x-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="flex items-center gap-2 px-4 h-14">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Stethoscope className="w-4 h-4 text-white" />
          </span>
          <span className="font-bold">Dr Build AI</span>
        </div>
        <nav className="flex gap-1 px-3 pb-2 overflow-x-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap',
                isActive ? 'bg-violet-400/15 text-violet-300' : 'text-slate-400'
              )}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <main className="flex-1 min-w-0 pt-28 md:pt-0">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">{children}</div>
      </main>
    </div>
  );
}
