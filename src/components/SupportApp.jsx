import { useState, useMemo } from 'react';
import { Plus, Trash2, X, Search, LifeBuoy, BookOpen, MessageSquare, Clock } from 'lucide-react';
import { toast } from 'sonner';

const TICKET_KEY = 'sfsupport:tickets';
const KB_KEY = 'sfsupport:kb';

const load = (k) => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const STATUSES = [
  { id: 'open', label: 'Open', color: '#ef4444' },
  { id: 'pending', label: 'Pending', color: '#eab308' },
  { id: 'resolved', label: 'Resolved', color: '#22c55e' },
];
const PRIORITIES = [
  { id: 'low', label: 'Low', color: '#22c55e' },
  { id: 'medium', label: 'Medium', color: '#eab308' },
  { id: 'high', label: 'High', color: '#ef4444' },
  { id: 'urgent', label: 'Urgent', color: '#a855f7' },
];
const statusOf = (id) => STATUSES.find((s) => s.id === id) || STATUSES[0];
const prioOf = (id) => PRIORITIES.find((p) => p.id === id) || PRIORITIES[1];

export default function SupportApp() {
  const [tab, setTab] = useState('tickets');
  const [tickets, setTickets] = useState(() => load(TICKET_KEY));
  const [articles, setArticles] = useState(() => load(KB_KEY));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [replyInput, setReplyInput] = useState({});
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [tSubject, setTSubject] = useState('');
  const [tCustomer, setTCustomer] = useState('');
  const [tPrio, setTPrio] = useState('medium');
  const [tMsg, setTMsg] = useState('');
  const [showKbModal, setShowKbModal] = useState(false);
  const [kTitle, setKTitle] = useState('');
  const [kCat, setKCat] = useState('General');
  const [kBody, setKBody] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const persistT = (n) => { setTickets(n); save(TICKET_KEY, n); };
  const persistK = (n) => { setArticles(n); save(KB_KEY, n); };

  const stats = useMemo(() => ({
    open: tickets.filter((t) => t.status === 'open').length,
    pending: tickets.filter((t) => t.status === 'pending').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    urgent: tickets.filter((t) => t.prio === 'urgent' && t.status !== 'resolved').length,
  }), [tickets]);

  const visibleTickets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets
      .filter((t) => statusFilter === 'all' || t.status === statusFilter)
      .filter((t) => !q || (t.subject || '').toLowerCase().includes(q) || (t.customer || '').toLowerCase().includes(q))
      .slice().sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }, [tickets, search, statusFilter]);

  const visibleKb = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((a) => !q || (a.title || '').toLowerCase().includes(q) || (a.body || '').toLowerCase().includes(q) || (a.cat || '').toLowerCase().includes(q));
  }, [articles, search]);

  const createTicket = () => {
    if (!tSubject.trim()) { toast.error('Subject is required'); return; }
    const first = tMsg.trim() ? [{ id: Date.now().toString(), from: tCustomer.trim() || 'Customer', text: tMsg.trim(), ts: Date.now() }] : [];
    persistT([{ id: Date.now().toString(), subject: tSubject.trim(), customer: tCustomer.trim() || 'Anonymous', prio: tPrio, status: 'open', messages: first, ts: Date.now() }, ...tickets]);
    setShowTicketModal(false); setTSubject(''); setTCustomer(''); setTPrio('medium'); setTMsg('');
    toast.success('Ticket created');
  };
  const setStatus = (id, status) => {
    persistT(tickets.map((t) => (t.id === id ? { ...t, status } : t)));
    toast.success(`Ticket ${statusOf(status).label}`);
  };
  const addReply = (id) => {
    const text = (replyInput[id] || '').trim();
    if (!text) { toast.error('Write a reply first'); return; }
    persistT(tickets.map((t) => t.id === id ? { ...t, messages: [...(t.messages || []), { id: Date.now().toString(), from: 'Support', text, ts: Date.now() }] } : t));
    setReplyInput((p) => ({ ...p, [id]: '' }));
    toast.success('Reply sent');
  };
  const deleteTicket = (id) => { persistT(tickets.filter((t) => t.id !== id)); setConfirmDelete(null); toast.success('Ticket deleted'); };

  const saveArticle = () => {
    if (!kTitle.trim()) { toast.error('Title is required'); return; }
    persistK([{ id: Date.now().toString(), title: kTitle.trim(), cat: kCat.trim() || 'General', body: kBody.trim(), ts: Date.now() }, ...articles]);
    setShowKbModal(false); setKTitle(''); setKCat('General'); setKBody('');
    toast.success('Article published');
  };
  const deleteArticle = (id) => { persistK(articles.filter((a) => a.id !== id)); setConfirmDelete(null); toast.success('Article deleted'); };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Open', value: stats.open, color: '#ef4444' },
          { label: 'Pending', value: stats.pending, color: '#eab308' },
          { label: 'Resolved', value: stats.resolved, color: '#22c55e' },
          { label: 'Urgent', value: stats.urgent, color: '#a855f7' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">{s.label}</p>
            <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { id: 'tickets', label: 'Tickets', icon: LifeBuoy },
          { id: 'kb', label: 'Knowledge Base', icon: BookOpen },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition ${tab === t.id ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'tickets' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search subject or customer…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500">
              <option value="all">All statuses</option>
              {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <button onClick={() => setShowTicketModal(true)} className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
              <Plus className="w-4 h-4" /> New Ticket
            </button>
          </div>

          {visibleTickets.length === 0 ? (
            <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
              <LifeBuoy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="font-bold text-slate-300">{tickets.length === 0 ? 'No tickets yet' : 'No tickets match'}</p>
              <p className="text-sm text-slate-500">Every customer question lands here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleTickets.map((t) => {
                const st = statusOf(t.status); const p = prioOf(t.prio);
                const isOpen = expanded === t.id;
                const msgs = t.messages || [];
                return (
                  <div key={t.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <button onClick={() => setExpanded(isOpen ? null : t.id)} className="w-full text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold flex-1 min-w-[200px]">{t.subject}</p>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${st.color}22`, color: st.color, border: `1px solid ${st.color}44` }}>{st.label}</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${p.color}22`, color: p.color, border: `1px solid ${p.color}44` }}>{p.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{t.customer} · {msgs.length} message{msgs.length === 1 ? '' : 's'}</p>
                    </button>
                    {isOpen && (
                      <div className="mt-4 pt-4 border-t border-white/5 space-y-2.5">
                        {msgs.map((m) => (
                          <div key={m.id} className={`rounded-xl px-3 py-2 max-w-[85%] ${m.from === 'Support' ? 'ml-auto bg-orange-500/10 border border-orange-500/20' : 'bg-white/[0.04] border border-white/5'}`}>
                            <p className="text-[11px] font-bold text-slate-400 mb-0.5">{m.from}</p>
                            <p className="text-sm text-slate-200">{m.text}</p>
                          </div>
                        ))}
                        {msgs.length === 0 && <p className="text-xs text-slate-500">No messages yet — reply below.</p>}
                        <div className="flex gap-2 pt-1">
                          <input value={replyInput[t.id] || ''} onChange={(e) => setReplyInput((pr) => ({ ...pr, [t.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && addReply(t.id)} placeholder="Type a reply…"
                            className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
                          <button onClick={() => addReply(t.id)} className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">Reply</button>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {STATUSES.map((s) => (
                            <button key={s.id} onClick={() => setStatus(t.id, s.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${t.status === s.id ? 'border-orange-500 bg-orange-500/10 text-orange-300' : 'border-white/10 hover:bg-white/5'}`}>
                              Mark {s.label}
                            </button>
                          ))}
                          <button onClick={() => setConfirmDelete(t.id)} className="ml-auto px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition inline-flex items-center gap-1">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                        {confirmDelete === t.id && (
                          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 flex items-center justify-between gap-3">
                            <p className="text-sm text-red-300 font-semibold">Delete this ticket?</p>
                            <div className="flex gap-2 shrink-0">
                              <button onClick={() => deleteTicket(t.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600">Delete</button>
                              <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10">Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === 'kb' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            </div>
            <button onClick={() => setShowKbModal(true)} className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
              <Plus className="w-4 h-4" /> New Article
            </button>
          </div>
          {visibleKb.length === 0 ? (
            <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="font-bold text-slate-300">No articles yet</p>
              <p className="text-sm text-slate-500">Write self-serve answers to common questions.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {visibleKb.map((a) => (
                <div key={a.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300">{a.cat}</span>
                      <p className="font-bold mt-1.5">{a.title}</p>
                    </div>
                    <button onClick={() => setConfirmDelete(`kb-${a.id}`)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition shrink-0"><Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" /></button>
                  </div>
                  <p className="text-sm text-slate-400 mt-2 whitespace-pre-wrap line-clamp-4">{a.body}</p>
                  {confirmDelete === `kb-${a.id}` && (
                    <div className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 flex items-center justify-between gap-2">
                      <p className="text-xs text-red-300 font-semibold">Delete?</p>
                      <div className="flex gap-1.5">
                        <button onClick={() => deleteArticle(a.id)} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600">Yes</button>
                        <button onClick={() => setConfirmDelete(null)} className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10">No</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowTicketModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">New Ticket</h3>
              <button onClick={() => setShowTicketModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input value={tSubject} onChange={(e) => setTSubject(e.target.value)} placeholder="Subject *" autoFocus className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="grid grid-cols-2 gap-3">
              <input value={tCustomer} onChange={(e) => setTCustomer(e.target.value)} placeholder="Customer name" className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
              <select value={tPrio} onChange={(e) => setTPrio(e.target.value)} className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500">
                {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <textarea value={tMsg} onChange={(e) => setTMsg(e.target.value)} placeholder="Describe the issue…" rows={4} className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="flex gap-2 pt-1">
              <button onClick={createTicket} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">Create Ticket</button>
              <button onClick={() => setShowTicketModal(false)} className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showKbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowKbModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">New Article</h3>
              <button onClick={() => setShowKbModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input value={kTitle} onChange={(e) => setKTitle(e.target.value)} placeholder="Article title *" autoFocus className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <input value={kCat} onChange={(e) => setKCat(e.target.value)} placeholder="Category" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <textarea value={kBody} onChange={(e) => setKBody(e.target.value)} placeholder="Article content…" rows={6} className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="flex gap-2 pt-1">
              <button onClick={saveArticle} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">Publish</button>
              <button onClick={() => setShowKbModal(false)} className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
