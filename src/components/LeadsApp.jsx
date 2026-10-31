import { useState, useMemo } from 'react';
import { Plus, Trash2, Pencil, X, Search, Target, Bell, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

const KEY = 'sfleads:leads';

const STAGES = [
  { id: 'new', label: 'New', color: '#3b82f6' },
  { id: 'contacted', label: 'Contacted', color: '#eab308' },
  { id: 'qualified', label: 'Qualified', color: '#a855f7' },
  { id: 'proposal', label: 'Proposal', color: '#f97316' },
  { id: 'won', label: 'Won', color: '#22c55e' },
  { id: 'lost', label: 'Lost', color: '#64748b' },
];
const SOURCES = ['Website', 'Referral', 'Social', 'Cold Call', 'Email', 'Event', 'Other'];

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const save = (l) => { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch {} };
const stageOf = (id) => STAGES.find((s) => s.id === id) || STAGES[0];
const money = (n) => n ? `$${Number(n).toLocaleString()}` : '—';

export default function LeadsApp() {
  const [leads, setLeads] = useState(load);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fName, setFName] = useState('');
  const [fCompany, setFCompany] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fValue, setFValue] = useState('');
  const [fSource, setFSource] = useState('Website');
  const [fStage, setFStage] = useState('new');
  const [fFollowup, setFFollowup] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const persist = (next) => { setLeads(next); save(next); };
  const today = new Date().toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const active = leads.filter((l) => !['won', 'lost'].includes(l.stage));
    const overdue = active.filter((l) => l.followup && l.followup < today);
    const pipeValue = active.reduce((s, l) => s + (Number(l.value) || 0), 0);
    const wonValue = leads.filter((l) => l.stage === 'won').reduce((s, l) => s + (Number(l.value) || 0), 0);
    return { total: leads.length, active: active.length, overdue: overdue.length, pipeValue, wonValue };
  }, [leads, today]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads
      .filter((l) => stageFilter === 'all' || l.stage === stageFilter)
      .filter((l) => !q || (l.name || '').toLowerCase().includes(q) || (l.company || '').toLowerCase().includes(q) || (l.email || '').toLowerCase().includes(q))
      .slice().sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }, [leads, search, stageFilter]);

  const openAdd = () => {
    setEditing(null); setFName(''); setFCompany(''); setFEmail(''); setFPhone('');
    setFValue(''); setFSource('Website'); setFStage('new'); setFFollowup(''); setShowModal(true);
  };
  const openEdit = (l) => {
    setEditing(l); setFName(l.name || ''); setFCompany(l.company || ''); setFEmail(l.email || '');
    setFPhone(l.phone || ''); setFValue(String(l.value ?? '')); setFSource(l.source || 'Website');
    setFStage(l.stage || 'new'); setFFollowup(l.followup || ''); setShowModal(true);
  };
  const saveLead = () => {
    if (!fName.trim()) { toast.error('Name is required'); return; }
    const payload = {
      name: fName.trim(), company: fCompany.trim(), email: fEmail.trim(), phone: fPhone.trim(),
      value: Math.max(0, Number(fValue) || 0), source: fSource, stage: fStage, followup: fFollowup,
    };
    if (editing) {
      persist(leads.map((l) => (l.id === editing.id ? { ...l, ...payload } : l)));
      toast.success('Lead updated');
    } else {
      persist([{ ...payload, id: Date.now().toString(), ts: Date.now() }, ...leads]);
      toast.success('Lead captured');
    }
    setShowModal(false);
  };
  const moveStage = (id, stage) => {
    persist(leads.map((l) => (l.id === id ? { ...l, stage } : l)));
    toast.success(`Moved to ${stageOf(stage).label}`);
  };
  const doDelete = (id) => { persist(leads.filter((l) => l.id !== id)); setConfirmDelete(null); toast.success('Lead deleted'); };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total Leads', value: stats.total, color: '#fff' },
          { label: 'Active', value: stats.active, color: '#3b82f6' },
          { label: 'Follow-ups Due', value: stats.overdue, color: stats.overdue ? '#ef4444' : '#22c55e' },
          { label: 'Pipeline Value', value: money(stats.pipeValue), color: '#eab308' },
          { label: 'Won Value', value: money(stats.wonValue), color: '#22c55e' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">{s.label}</p>
            <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {stats.overdue > 0 && (
        <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 flex items-center gap-3">
          <Bell className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300 font-semibold">{stats.overdue} follow-up{stats.overdue === 1 ? '' : 's'} overdue — reach out today.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, company, email…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
        </div>
        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500">
          <option value="all">All stages</option>
          {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <button onClick={openAdd} className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
          <Target className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="font-bold text-slate-300 mb-1">{leads.length === 0 ? 'No leads yet' : 'No leads match'}</p>
          <p className="text-sm text-slate-500 mb-4">{leads.length === 0 ? 'Capture your first lead and start the pipeline.' : 'Try a different search.'}</p>
          {leads.length === 0 && (
            <button onClick={openAdd} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
              <Plus className="w-4 h-4" /> Add Lead
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((l) => {
            const st = stageOf(l.stage);
            const overdue = l.followup && l.followup < today && !['won', 'lost'].includes(l.stage);
            const dueToday = l.followup === today && !['won', 'lost'].includes(l.stage);
            return (
              <div key={l.id} className={`rounded-2xl border p-4 ${overdue ? 'border-red-500/40 bg-red-500/[0.04]' : 'border-white/10 bg-white/[0.03]'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold">{l.name}</p>
                    <p className="text-xs text-slate-500">{[l.company, l.source].filter(Boolean).join(' · ')}</p>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: `${st.color}22`, color: st.color, border: `1px solid ${st.color}44` }}>
                    {st.label}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-lg font-black text-orange-300">{money(l.value)}</p>
                  {l.followup && (
                    <p className={`text-[11px] inline-flex items-center gap-1 ${overdue ? 'text-red-400 font-bold' : dueToday ? 'text-amber-300 font-bold' : 'text-slate-500'}`}>
                      <Bell className="w-3 h-3" /> {l.followup}{overdue ? ' — overdue' : dueToday ? ' — today' : ''}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  {l.email && <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1 text-slate-400 hover:text-orange-300"><Mail className="w-3.5 h-3.5" /> Email</a>}
                  {l.phone && <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1 text-slate-400 hover:text-orange-300"><Phone className="w-3.5 h-3.5" /> Call</a>}
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  <select value={l.stage} onChange={(e) => moveStage(l.id, e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs outline-none focus:border-orange-500">
                    {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <button onClick={() => openEdit(l)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition" title="Edit">
                    <Pencil className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button onClick={() => setConfirmDelete(l.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition" title="Delete">
                    <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" />
                  </button>
                </div>
                {confirmDelete === l.id && (
                  <div className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 flex items-center justify-between gap-2">
                    <p className="text-xs text-red-300 font-semibold">Delete?</p>
                    <div className="flex gap-1.5">
                      <button onClick={() => doDelete(l.id)} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600">Yes</button>
                      <button onClick={() => setConfirmDelete(null)} className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10">No</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">{editing ? 'Edit Lead' : 'Add Lead'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Name *" autoFocus className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <input value={fCompany} onChange={(e) => setFCompany(e.target.value)} placeholder="Company" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="grid grid-cols-2 gap-3">
              <input value={fEmail} onChange={(e) => setFEmail(e.target.value)} type="email" placeholder="Email" className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
              <input value={fPhone} onChange={(e) => setFPhone(e.target.value)} type="tel" placeholder="Phone" className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input value={fValue} onChange={(e) => setFValue(e.target.value)} type="number" min="0" placeholder="Deal value $" className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
              <select value={fSource} onChange={(e) => setFSource(e.target.value)} className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500">
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select value={fStage} onChange={(e) => setFStage(e.target.value)} className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500">
                {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <input value={fFollowup} onChange={(e) => setFFollowup(e.target.value)} type="date" title="Follow-up date" className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={saveLead} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">{editing ? 'Save Changes' : 'Add Lead'}</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
