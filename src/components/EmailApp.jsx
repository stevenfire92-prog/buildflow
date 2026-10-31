import { useState, useMemo } from 'react';
import { Plus, Trash2, Pencil, X, Search, Mail, Users, Send, FileText, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

const SUB_KEY = 'sfemail:subscribers';
const CAMP_KEY = 'sfemail:campaigns';

const load = (k) => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const TEMPLATES = [
  { id: 'promo', name: 'Promo Blast', subject: '🔥 Limited time: 20% off everything', body: 'Hey {{name}},\n\nFor 48 hours only, take 20% off everything in the store. Use code SAVE20 at checkout.\n\nDon\'t sleep on this.\n\n— The Team' },
  { id: 'welcome', name: 'Welcome Series', subject: 'Welcome aboard, {{name}}! 👋', body: 'Hey {{name}},\n\nThanks for joining us. Here\'s what to expect:\n\n1. Weekly tips & drops\n2. Early access to new products\n3. Subscriber-only deals\n\nGlad you\'re here.\n\n— The Team' },
  { id: 'news', name: 'Newsletter', subject: 'This week: what\'s new 📰', body: 'Hey {{name}},\n\nHere\'s what happened this week:\n\n• New product launch\n• Behind-the-scenes story\n• Community spotlight\n\nRead more on the blog.\n\n— The Team' },
];
const tplOf = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];

export default function EmailApp() {
  const [tab, setTab] = useState('campaigns');
  const [subs, setSubs] = useState(() => load(SUB_KEY));
  const [campaigns, setCampaigns] = useState(() => load(CAMP_KEY));
  const [search, setSearch] = useState('');
  const [showSubModal, setShowSubModal] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [sEmail, setSEmail] = useState('');
  const [sName, setSName] = useState('');
  const [sTags, setSTags] = useState('');
  const [showCampModal, setShowCampModal] = useState(false);
  const [editingCamp, setEditingCamp] = useState(null);
  const [cName, setCName] = useState('');
  const [cTpl, setCTpl] = useState('promo');
  const [cSubject, setCSubject] = useState('');
  const [cBody, setCBody] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [previewCamp, setPreviewCamp] = useState(null);

  const persistS = (n) => { setSubs(n); save(SUB_KEY, n); };
  const persistC = (n) => { setCampaigns(n); save(CAMP_KEY, n); };

  const visibleSubs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subs.filter((s) => !q || (s.email || '').toLowerCase().includes(q) || (s.name || '').toLowerCase().includes(q));
  }, [subs, search]);

  const openAddSub = () => { setEditingSub(null); setSEmail(''); setSName(''); setSTags(''); setShowSubModal(true); };
  const openEditSub = (s) => { setEditingSub(s); setSEmail(s.email || ''); setSName(s.name || ''); setSTags((s.tags || []).join(', ')); setShowSubModal(true); };
  const saveSub = () => {
    if (!sEmail.trim() || !sEmail.includes('@')) { toast.error('Valid email is required'); return; }
    const payload = { email: sEmail.trim().toLowerCase(), name: sName.trim(), tags: sTags.split(',').map((t) => t.trim()).filter(Boolean) };
    if (editingSub) {
      persistS(subs.map((s) => (s.id === editingSub.id ? { ...s, ...payload } : s)));
      toast.success('Subscriber updated');
    } else {
      if (subs.some((s) => s.email === payload.email)) { toast.error('Already subscribed'); return; }
      persistS([{ ...payload, id: Date.now().toString(), ts: Date.now() }, ...subs]);
      toast.success('Subscriber added');
    }
    setShowSubModal(false);
  };
  const deleteSub = (id) => { persistS(subs.filter((s) => s.id !== id)); setConfirmDelete(null); toast.success('Subscriber removed'); };

  const pickTemplate = (id) => {
    const t = tplOf(id); setCTpl(id); setCSubject(t.subject); setCBody(t.body);
  };
  const openAddCamp = () => {
    setEditingCamp(null); setCName(''); pickTemplate('promo'); setShowCampModal(true);
  };
  const openEditCamp = (c) => {
    setEditingCamp(c); setCName(c.name || ''); setCTpl(c.tpl || 'promo');
    setCSubject(c.subject || ''); setCBody(c.body || ''); setShowCampModal(true);
  };
  const saveCamp = (asDraft = true) => {
    if (!cName.trim()) { toast.error('Campaign name is required'); return; }
    const payload = { name: cName.trim(), tpl: cTpl, subject: cSubject, body: cBody, status: asDraft ? 'draft' : 'sent', sentAt: asDraft ? null : Date.now(), recipients: subs.length };
    if (editingCamp) {
      persistC(campaigns.map((c) => (c.id === editingCamp.id ? { ...c, ...payload } : c)));
      toast.success(asDraft ? 'Draft saved' : 'Campaign sent! (Demo)');
    } else {
      persistC([{ ...payload, id: Date.now().toString(), ts: Date.now() }, ...campaigns]);
      toast.success(asDraft ? 'Draft saved' : `Campaign sent to ${subs.length} subscribers! (Demo)`);
    }
    setShowCampModal(false);
  };
  const sendCamp = (c) => {
    persistC(campaigns.map((x) => (x.id === c.id ? { ...x, status: 'sent', sentAt: Date.now(), recipients: subs.length } : x)));
    toast.success(`Sent to ${subs.length} subscribers! (Demo)`);
  };
  const deleteCamp = (id) => { persistC(campaigns.filter((c) => c.id !== id)); setConfirmDelete(null); toast.success('Campaign deleted'); };

  const renderBody = (body) => (body || '').replace(/\{\{name\}\}/g, 'Alex');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Subscribers', value: subs.length, icon: Users },
          { label: 'Campaigns', value: campaigns.length, icon: Send },
          { label: 'Sent', value: campaigns.filter((c) => c.status === 'sent').length, icon: BarChart3 },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <s.icon className="w-4 h-4 text-orange-400 mx-auto mb-1" />
            <p className="text-xl font-black">{s.value}</p>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { id: 'campaigns', label: 'Campaigns', icon: Send },
          { id: 'subscribers', label: 'Subscribers', icon: Users },
          { id: 'templates', label: 'Templates', icon: FileText },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition ${tab === t.id ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'campaigns' && (
        <>
          <button onClick={openAddCamp} className="mb-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
            <Plus className="w-4 h-4" /> New Campaign
          </button>
          {campaigns.length === 0 ? (
            <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
              <Mail className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="font-bold text-slate-300">No campaigns yet</p>
              <p className="text-sm text-slate-500">Create your first campaign from a template.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((c) => (
                <div key={c.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold">{c.name}</p>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${c.status === 'sent' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
                          {c.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1 truncate">{c.subject}</p>
                      <p className="text-xs text-slate-500">{c.tpl ? tplOf(c.tpl).name : ''}{c.status === 'sent' ? ` · Sent to ${c.recipients || 0}` : ' · Draft'}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => setPreviewCamp(c)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition">Preview</button>
                      {c.status === 'draft' && (
                        <>
                          <button onClick={() => sendCamp(c)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">Send</button>
                          <button onClick={() => openEditCamp(c)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition"><Pencil className="w-3.5 h-3.5 text-slate-400" /></button>
                        </>
                      )}
                      <button onClick={() => setConfirmDelete(`c-${c.id}`)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition"><Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" /></button>
                    </div>
                  </div>
                  {confirmDelete === `c-${c.id}` && (
                    <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 flex items-center justify-between gap-3">
                      <p className="text-sm text-red-300 font-semibold">Delete campaign?</p>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => deleteCamp(c.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600">Delete</button>
                        <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'subscribers' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search email or name…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            </div>
            <button onClick={openAddSub} className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
              <Plus className="w-4 h-4" /> Add Subscriber
            </button>
          </div>
          {visibleSubs.length === 0 ? (
            <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="font-bold text-slate-300">{subs.length === 0 ? 'No subscribers yet' : 'No matches'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {visibleSubs.map((s) => (
                <div key={s.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-sm">{s.name || s.email}</p>
                    {s.name && <p className="text-xs text-slate-500">{s.email}</p>}
                    {s.tags && s.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {s.tags.map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300">{t}</span>)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => openEditSub(s)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition"><Pencil className="w-3.5 h-3.5 text-slate-400" /></button>
                    <button onClick={() => setConfirmDelete(`s-${s.id}`)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition"><Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" /></button>
                  </div>
                  {confirmDelete === `s-${s.id}` && (
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => deleteSub(s.id)} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600">Yes</button>
                      <button onClick={() => setConfirmDelete(null)} className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10">No</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'templates' && (
        <div className="grid sm:grid-cols-3 gap-4">
          {TEMPLATES.map((t) => (
            <div key={t.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <FileText className="w-6 h-6 text-orange-400 mb-2" />
              <p className="font-bold mb-1">{t.name}</p>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2">Subject: {t.subject}</p>
              <button onClick={() => { openAddCamp(); pickTemplate(t.id); }} className="w-full py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition">
                Use Template
              </button>
            </div>
          ))}
        </div>
      )}

      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowSubModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">{editingSub ? 'Edit Subscriber' : 'Add Subscriber'}</h3>
              <button onClick={() => setShowSubModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input value={sEmail} onChange={(e) => setSEmail(e.target.value)} type="email" placeholder="Email *" autoFocus className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <input value={sName} onChange={(e) => setSName(e.target.value)} placeholder="Name" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <input value={sTags} onChange={(e) => setSTags(e.target.value)} placeholder="Tags (comma separated)" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="flex gap-2 pt-1">
              <button onClick={saveSub} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">{editingSub ? 'Save' : 'Subscribe'}</button>
              <button onClick={() => setShowSubModal(false)} className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showCampModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowCampModal(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">{editingCamp ? 'Edit Campaign' : 'New Campaign'}</h3>
              <button onClick={() => setShowCampModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input value={cName} onChange={(e) => setCName(e.target.value)} placeholder="Campaign name *" autoFocus className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div>
              <p className="text-xs text-slate-500 mb-2">Template</p>
              <div className="flex gap-2 flex-wrap">
                {TEMPLATES.map((t) => (
                  <button key={t.id} onClick={() => pickTemplate(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${cTpl === t.id ? 'border-orange-500 bg-orange-500/10 text-orange-300' : 'border-white/10 hover:bg-white/5'}`}>{t.name}</button>
                ))}
              </div>
            </div>
            <input value={cSubject} onChange={(e) => setCSubject(e.target.value)} placeholder="Subject line" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <textarea value={cBody} onChange={(e) => setCBody(e.target.value)} rows={8} placeholder="Email body — use {{name}} to personalize"
              className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500 font-mono" />
            <div className="flex gap-2 pt-1">
              <button onClick={() => saveCamp(true)} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition">Save Draft</button>
              <button onClick={() => saveCamp(false)} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">Send Now ({subs.length})</button>
            </div>
          </div>
        </div>
      )}

      {previewCamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setPreviewCamp(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#121218] p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg">Preview</h3>
              <button onClick={() => setPreviewCamp(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="rounded-xl border border-white/10 bg-white text-black p-5">
              <p className="font-bold text-sm border-b border-black/10 pb-2 mb-3">Subject: {renderBody(previewCamp.subject)}</p>
              <pre className="text-sm whitespace-pre-wrap font-sans">{renderBody(previewCamp.body)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
