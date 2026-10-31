import { useState, useMemo, useEffect, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Trash2, Play, Square, Timer,
  Briefcase, Download, Clock, PencilLine,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  loadData, saveData, fmtDuration, weekStart, shiftWeek, weekLabel, entriesForWeek,
} from '../lib/timetrack';

const TIMER_KEY = 'sftime:activeTimer';

function money(n) {
  return '$' + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function earningsFor(entry, projects) {
  const p = projects.find((x) => x.id === entry.projectId);
  const rate = p ? Number(p.rate || 0) : 0;
  return ((entry.secs || 0) / 3600) * rate;
}

function projectName(projects, projectId) {
  const p = projects.find((x) => x.id === projectId);
  return p ? p.name : 'Deleted project';
}

const inputCls = 'px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500 w-full';
const btnGradient = 'bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition';

export default function TimetrackApp() {
  const [data, setData] = useState(loadData);
  const [wstart, setWstart] = useState(() => weekStart());

  // Active timer (restored from localStorage so a refresh doesn't lose it)
  const [timer, setTimer] = useState(() => {
    try {
      const raw = localStorage.getItem(TIMER_KEY);
      if (raw) {
        const t = JSON.parse(raw);
        if (t && t.startTs) return t;
      }
    } catch { /* ignore */ }
    return null;
  });
  const [elapsed, setElapsed] = useState(0);
  const [timerProject, setTimerProject] = useState('');
  const [timerDesc, setTimerDesc] = useState('');

  // Project manager form
  const [projName, setProjName] = useState('');
  const [projRate, setProjRate] = useState('');

  // Manual entry form
  const [showManual, setShowManual] = useState(false);
  const [mProject, setMProject] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mMins, setMMins] = useState('');
  const [mDate, setMDate] = useState(() => new Date().toISOString().slice(0, 10));

  const timerRef = useRef(null);
  const persist = (next) => { setData(next); saveData(next); };

  const saveTimer = (t) => {
    setTimer(t);
    try {
      if (t) localStorage.setItem(TIMER_KEY, JSON.stringify(t));
      else localStorage.removeItem(TIMER_KEY);
    } catch { /* ignore */ }
  };

  // Tick the live timer
  useEffect(() => {
    if (timer) {
      const tick = () => setElapsed(Math.floor((Date.now() - timer.startTs) / 1000));
      tick();
      timerRef.current = setInterval(tick, 1000);
      return () => clearInterval(timerRef.current);
    }
    setElapsed(0);
    return undefined;
  }, [timer]);

  const startTimer = () => {
    if (timer) return;
    if (!timerProject) { toast.error('Pick a project first'); return; }
    saveTimer({ projectId: timerProject, desc: timerDesc.trim() || 'Untitled', startTs: Date.now() });
    toast.success('Timer started');
  };

  const stopTimer = () => {
    if (!timer) return;
    const secs = Math.floor((Date.now() - timer.startTs) / 1000);
    if (secs < 1) { saveTimer(null); toast.info('Timer discarded — too short'); return; }
    const entry = {
      id: Date.now().toString(),
      projectId: timer.projectId,
      desc: timer.desc || 'Untitled',
      startTs: timer.startTs,
      endTs: Date.now(),
      secs,
    };
    persist({ ...data, entries: [...(data.entries || []), entry] });
    const earn = earningsFor(entry, data.projects || []);
    saveTimer(null);
    setTimerDesc('');
    toast.success(`Logged ${fmtDuration(secs)}`, {
      description: earn > 0 ? `Earned ${money(earn)}` : projectName(data.projects || [], timer.projectId),
    });
  };

  const addProject = () => {
    const name = projName.trim();
    if (!name) { toast.error('Enter a project name'); return; }
    const rate = parseFloat(projRate);
    if (isNaN(rate) || rate < 0) { toast.error('Enter a valid hourly rate'); return; }
    const next = {
      ...data,
      projects: [...(data.projects || []), { id: Date.now().toString(), name, rate }],
    };
    persist(next);
    setProjName(''); setProjRate('');
    toast.success(`Project "${name}" added`);
  };

  const deleteProject = (id) => {
    const p = (data.projects || []).find((x) => x.id === id);
    persist({ ...data, projects: (data.projects || []).filter((x) => x.id !== id) });
    if (timerProject === id) setTimerProject('');
    toast.success(`Project "${p ? p.name : ''}" deleted — its hours are kept`);
  };

  const addManual = () => {
    if (!mProject) { toast.error('Pick a project'); return; }
    const mins = parseFloat(mMins);
    if (isNaN(mins) || mins <= 0) { toast.error('Enter a valid duration in minutes'); return; }
    if (!mDate) { toast.error('Pick a date'); return; }
    const startTs = new Date(`${mDate}T12:00:00`).getTime();
    if (isNaN(startTs)) { toast.error('Invalid date'); return; }
    const secs = Math.round(mins * 60);
    const next = {
      ...data,
      entries: [...(data.entries || []), {
        id: Date.now().toString(),
        projectId: mProject,
        desc: mDesc.trim() || 'Manual entry',
        startTs,
        endTs: startTs + secs * 1000,
        secs,
      }],
    };
    persist(next);
    setMDesc(''); setMMins('');
    setShowManual(false);
    toast.success(`Added ${fmtDuration(secs)} for ${projectName(data.projects || [], mProject)}`);
  };

  const deleteEntry = (id) => {
    persist({ ...data, entries: (data.entries || []).filter((e) => e.id !== id) });
    toast.success('Entry removed');
  };

  const exportWeek = () => {
    const weekEntries = entriesForWeek(data, wstart);
    const per = {};
    let totalSecs = 0;
    let totalEarn = 0;
    for (const e of weekEntries) {
      const name = projectName(data.projects || [], e.projectId);
      const earn = earningsFor(e, data.projects || []);
      per[name] = per[name] || { secs: 0, earn: 0, count: 0 };
      per[name].secs += e.secs || 0;
      per[name].earn += earn;
      per[name].count += 1;
      totalSecs += e.secs || 0;
      totalEarn += earn;
    }
    const lines = [
      'SE FIRE TIMETRACK — WEEKLY SUMMARY',
      `Week: ${weekLabel(wstart)}`,
      '='.repeat(44),
      '',
    ];
    for (const [name, s] of Object.entries(per)) {
      lines.push(`${name}`);
      lines.push(`  Entries: ${s.count}   Hours: ${fmtDuration(s.secs)}   Earnings: ${money(s.earn)}`);
      lines.push('');
    }
    lines.push('='.repeat(44));
    lines.push(`TOTAL HOURS:  ${fmtDuration(totalSecs)}`);
    lines.push(`TOTAL EARNED: ${money(totalEarn)}`);
    lines.push('');
    lines.push('--- ENTRIES ---');
    for (const e of weekEntries.slice().sort((a, b) => b.startTs - a.startTs)) {
      lines.push(`${fmtDate(e.startTs)} | ${projectName(data.projects || [], e.projectId)} | ${e.desc} | ${fmtDuration(e.secs || 0)} | ${money(earningsFor(e, data.projects || []))}`);
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `se-fire-timetrack-weekly-${new Date(wstart).toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('Weekly report downloaded');
  };

  // Entries newest first
  const entries = useMemo(
    () => (data.entries || []).slice().sort((a, b) => (b.startTs || 0) - (a.startTs || 0)),
    [data]
  );

  // Weekly report
  const report = useMemo(() => {
    const weekEntries = entriesForWeek(data, wstart);
    const per = {};
    let totalSecs = 0;
    let totalEarn = 0;
    for (const e of weekEntries) {
      const name = projectName(data.projects || [], e.projectId);
      const earn = earningsFor(e, data.projects || []);
      per[name] = per[name] || { secs: 0, earn: 0 };
      per[name].secs += e.secs || 0;
      per[name].earn += earn;
      totalSecs += e.secs || 0;
      totalEarn += earn;
    }
    return {
      rows: Object.entries(per).map(([name, s]) => ({ name, ...s })).sort((a, b) => b.secs - a.secs),
      totalSecs, totalEarn,
    };
  }, [data, wstart]);

  const timerRunning = !!timer;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Live timer card */}
      <div className={`rounded-2xl border p-6 mb-6 ${timerRunning ? 'border-orange-500/50 bg-gradient-to-b from-orange-500/10 to-transparent' : 'border-white/10 bg-white/[0.03]'}`}>
        <div className="flex items-center gap-2 mb-4">
          <Timer className="w-5 h-5 text-orange-400" />
          <h2 className="font-black text-lg">Live Timer</h2>
          {timerRunning && (
            <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> RECORDING
            </span>
          )}
        </div>
        <div className="text-center mb-5">
          <p className="text-5xl font-black tabular-nums tracking-tight">
            {String(Math.floor(elapsed / 3600)).padStart(2, '0')}:{String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}
          </p>
          <p className="text-xs text-slate-500 mt-1">elapsed</p>
        </div>
        {!timerRunning && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <select
              value={timerProject}
              onChange={(e) => setTimerProject(e.target.value)}
              className={`${inputCls} bg-black/40`}
            >
              <option value="">Select project…</option>
              {(data.projects || []).map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {money(p.rate)}/hr</option>
              ))}
            </select>
            <input
              value={timerDesc}
              onChange={(e) => setTimerDesc(e.target.value)}
              placeholder="What are you working on?"
              className={inputCls}
            />
          </div>
        )}
        {timerRunning && (
          <p className="text-center text-sm text-slate-400 mb-4">
            <span className="font-bold text-white">{projectName(data.projects || [], timer.projectId)}</span>
            {' — '}{timer.desc}
          </p>
        )}
        <button
          onClick={timerRunning ? stopTimer : startTimer}
          className={`w-full py-4 rounded-2xl font-black text-lg inline-flex items-center justify-center gap-2 ${timerRunning ? 'bg-gradient-to-r from-red-600 to-red-500 hover:brightness-110 transition' : `${btnGradient} font-black`}`}
        >
          {timerRunning ? <><Square className="w-5 h-5" /> Stop & Save</> : <><Play className="w-5 h-5" /> Start Timer</>}
        </button>
      </div>

      {/* Projects manager */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-orange-400" />
          <h3 className="font-black text-lg">Projects</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-3 mb-4">
          <input value={projName} onChange={(e) => setProjName(e.target.value)} placeholder="Client / project name" className={inputCls} />
          <input type="number" min="0" step="0.01" value={projRate} onChange={(e) => setProjRate(e.target.value)} placeholder="Rate $/hr" className={inputCls} />
          <button onClick={addProject} className={`px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-1.5 ${btnGradient}`}>
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {(data.projects || []).length === 0 && (
            <p className="text-center text-sm text-slate-500 py-3">No projects yet — add your first client above.</p>
          )}
          {(data.projects || []).map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5">
              <div>
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-[11px] text-slate-500">{money(p.rate)} / hour</p>
              </div>
              <button onClick={() => deleteProject(p.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition" title="Delete project (hours kept)">
                <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-400" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Manual entry */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-lg">Time Entries</h3>
        <button onClick={() => setShowManual(!showManual)} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold ${btnGradient}`}>
          <PencilLine className="w-4 h-4" /> Log manually
        </button>
      </div>

      {showManual && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={mProject} onChange={(e) => setMProject(e.target.value)} className={`${inputCls} bg-black/40`}>
              <option value="">Select project…</option>
              {(data.projects || []).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input value={mDesc} onChange={(e) => setMDesc(e.target.value)} placeholder="Description" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" min="0" step="1" value={mMins} onChange={(e) => setMMins(e.target.value)} placeholder="Duration (minutes)" className={inputCls} />
            <input type="date" value={mDate} onChange={(e) => setMDate(e.target.value)} className={`${inputCls} text-slate-300`} />
          </div>
          <button onClick={addManual} className={`w-full py-2.5 rounded-xl font-bold text-sm ${btnGradient}`}>Add Entry</button>
        </div>
      )}

      <div className="space-y-2 mb-10">
        {entries.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No time logged yet. Start the timer above.</p>}
        {entries.map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <Clock className="w-4 h-4 text-orange-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{e.desc}</p>
                <p className="text-[11px] text-slate-500">
                  {projectName(data.projects || [], e.projectId)} · {fmtDate(e.startTs)} · {fmtDuration(e.secs || 0)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-bold text-sm text-emerald-400">{money(earningsFor(e, data.projects || []))}</span>
              <button onClick={() => deleteEntry(e.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition">
                <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly report */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setWstart(shiftWeek(wstart, -1))} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="font-black text-lg">Week of {weekLabel(wstart)}</h3>
          <button onClick={() => setWstart(shiftWeek(wstart, 1))} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-center">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Hours</p>
            <p className="text-lg font-black">{fmtDuration(report.totalSecs)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-center">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Earned</p>
            <p className="text-lg font-black text-emerald-400">{money(report.totalEarn)}</p>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          {report.rows.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-4">No hours logged this week.</p>
          )}
          {report.rows.map((r) => (
            <div key={r.name} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
              <div>
                <p className="text-sm font-semibold">{r.name}</p>
                <p className="text-[11px] text-slate-500">{fmtDuration(r.secs)}</p>
              </div>
              <span className="font-bold text-sm text-emerald-400">{money(r.earn)}</span>
            </div>
          ))}
        </div>

        <button onClick={exportWeek} className="w-full py-3 rounded-xl font-bold text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition inline-flex items-center justify-center gap-2">
          <Download className="w-4 h-4" /> Export weekly summary (.txt)
        </button>
      </div>
    </div>
  );
}
