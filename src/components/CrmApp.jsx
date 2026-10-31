import { useState, useMemo } from 'react';
import { Plus, Trash2, Pencil, ChevronDown, Search, Users, X, StickyNote } from 'lucide-react';
import { toast } from 'sonner';
import { STATUSES, loadContacts, saveContacts } from '../lib/crm';

const statusOf = (id) => STATUSES.find((s) => s.id === id) || STATUSES[0];

export default function CrmApp() {
  const [contacts, setContacts] = useState(loadContacts);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [noteInput, setNoteInput] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fName, setFName] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fCompany, setFCompany] = useState('');
  const [fStatus, setFStatus] = useState('lead');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const persist = (next) => { setContacts(next); saveContacts(next); };

  const counts = useMemo(() => {
    const out = { all: contacts.length };
    for (const s of STATUSES) out[s.id] = contacts.filter((c) => c.status === s.id).length;
    return out;
  }, [contacts]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts
      .filter((c) => filter === 'all' || c.status === filter)
      .filter((c) =>
        !q ||
        (c.name || '').toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q)
      )
      .slice()
      .sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }, [contacts, filter, search]);

  const openAdd = () => {
    setEditing(null);
    setFName(''); setFEmail(''); setFPhone(''); setFCompany(''); setFStatus('lead');
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setFName(c.name || ''); setFEmail(c.email || ''); setFPhone(c.phone || '');
    setFCompany(c.company || ''); setFStatus(c.status || 'lead');
    setShowModal(true);
  };

  const saveContact = () => {
    if (!fName.trim()) { toast.error('Name is required'); return; }
    const payload = {
      name: fName.trim(),
      email: fEmail.trim(),
      phone: fPhone.trim(),
      company: fCompany.trim(),
      status: fStatus,
    };
    if (editing) {
      persist(contacts.map((c) => (c.id === editing.id ? { ...c, ...payload } : c)));
      toast.success('Contact updated');
    } else {
      persist([{ ...payload, id: Date.now().toString(), notes: [], ts: Date.now() }, ...contacts]);
      toast.success('Contact added');
    }
    setShowModal(false);
  };

  const moveStatus = (id, status) => {
    persist(contacts.map((c) => (c.id === id ? { ...c, status } : c)));
    toast.success(`Moved to ${statusOf(status).label}`);
  };

  const doDelete = (id) => {
    persist(contacts.filter((c) => c.id !== id));
    setConfirmDelete(null);
    toast.success('Contact deleted');
  };

  const addNote = (id) => {
    const text = (noteInput[id] || '').trim();
    if (!text) { toast.error('Write a note first'); return; }
    persist(contacts.map((c) =>
      c.id === id ? { ...c, notes: [...(c.notes || []), { id: Date.now().toString(), text, ts: Date.now() }] } : c
    ));
    setNoteInput((prev) => ({ ...prev, [id]: '' }));
    toast.success('Note added');
  };

  const deleteNote = (contactId, noteId) => {
    persist(contacts.map((c) =>
      c.id === contactId ? { ...c, notes: (c.notes || []).filter((n) => n.id !== noteId) } : c
    ));
    toast.success('Note removed');
  };

  const toggleExpand = (id) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Stats row — clickable filter chips */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-2xl border p-4 text-center transition ${filter === 'all' ? 'border-orange-500/60 bg-orange-500/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}
        >
          <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">All</p>
          <p className="text-xl font-black">{counts.all}</p>
        </button>
        {STATUSES.map((s) => (
          <button
            key={s.id}
            onClick={() => setFilter(filter === s.id ? 'all' : s.id)}
            className={`rounded-2xl border p-4 text-center transition ${filter === s.id ? 'bg-orange-500/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}
            style={filter === s.id ? { borderColor: `${s.color}88` } : undefined}
          >
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">{s.label}</p>
            <p className="text-xl font-black" style={{ color: s.color }}>{counts[s.id]}</p>
          </button>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, company, email, phone…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500"
        >
          <option value="all">All stages</option>
          {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition"
        >
          <Plus className="w-4 h-4" /> Add Contact
        </button>
      </div>

      {/* Contact cards */}
      {visible.length === 0 ? (
        <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="font-bold text-slate-300 mb-1">
            {contacts.length === 0 ? 'No contacts yet' : 'No contacts match your search'}
          </p>
          <p className="text-sm text-slate-500 mb-4">
            {contacts.length === 0 ? 'Add your first contact and start building your pipeline.' : 'Try a different search or stage filter.'}
          </p>
          {contacts.length === 0 && (
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition"
            >
              <Plus className="w-4 h-4" /> Add Contact
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((c) => {
            const st = statusOf(c.status);
            const isOpen = expanded === c.id;
            const notes = c.notes || [];
            return (
              <div key={c.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-3">
                  <button onClick={() => toggleExpand(c.id)} className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold">{c.name}</p>
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${st.color}22`, color: st.color, border: `1px solid ${st.color}44` }}
                      >
                        {st.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {[c.company, c.email, c.phone].filter(Boolean).join(' · ') || 'No details yet'}
                    </p>
                    {notes.length > 0 && !isOpen && (
                      <p className="text-xs text-slate-500 mt-1 truncate">📝 {notes[notes.length - 1].text}</p>
                    )}
                  </button>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <select
                      value={c.status}
                      onChange={(e) => moveStatus(c.id, e.target.value)}
                      className="px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs outline-none focus:border-orange-500"
                      title="Move stage"
                    >
                      {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                    <button onClick={() => openEdit(c)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition" title="Edit">
                      <Pencil className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button onClick={() => setConfirmDelete(c.id)} className="p-2 rounded-lg hover:bg-red-500/20 transition" title="Delete">
                      <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" />
                    </button>
                    <button onClick={() => toggleExpand(c.id)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition" title={isOpen ? 'Collapse' : 'Expand'}>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                    {c.email && <p className="text-sm text-slate-400">✉️ <a href={`mailto:${c.email}`} className="hover:text-orange-300 underline">{c.email}</a></p>}
                    {c.phone && <p className="text-sm text-slate-400">📞 <a href={`tel:${c.phone}`} className="hover:text-orange-300 underline">{c.phone}</a></p>}
                    {c.company && <p className="text-sm text-slate-400">🏢 {c.company}</p>}
                    <div className="flex items-center gap-1.5 pt-1">
                      <StickyNote className="w-4 h-4 text-slate-500" />
                      <p className="text-sm font-bold text-slate-300">Notes ({notes.length})</p>
                    </div>
                    {notes.length === 0 && <p className="text-xs text-slate-500">No notes yet — log a call, meeting, or follow-up below.</p>}
                    {notes.map((n) => (
                      <div key={n.id} className="flex items-start justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
                        <p className="text-sm text-slate-300">{n.text}</p>
                        <button onClick={() => deleteNote(c.id, n.id)} className="p-1 rounded-lg hover:bg-red-500/20 transition shrink-0" title="Delete note">
                          <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2 pt-1">
                      <input
                        value={noteInput[c.id] || ''}
                        onChange={(e) => setNoteInput((prev) => ({ ...prev, [c.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && addNote(c.id)}
                        placeholder="Add a note…"
                        className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500"
                      />
                      <button onClick={() => addNote(c.id)} className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">Add</button>
                    </div>
                  </div>
                )}

                {confirmDelete === c.id && (
                  <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-red-300 font-semibold">Delete {c.name}? This can't be undone.</p>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => doDelete(c.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:brightness-110 transition">Delete</button>
                      <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">{editing ? 'Edit Contact' : 'Add Contact'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Name *" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" autoFocus />
            <input value={fCompany} onChange={(e) => setFCompany(e.target.value)} placeholder="Company" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="grid grid-cols-2 gap-3">
              <input value={fEmail} onChange={(e) => setFEmail(e.target.value)} placeholder="Email" type="email" className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
              <input value={fPhone} onChange={(e) => setFPhone(e.target.value)} placeholder="Phone" type="tel" className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            </div>
            <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500">
              {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <div className="flex gap-2 pt-1">
              <button onClick={saveContact} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
                {editing ? 'Save Changes' : 'Add Contact'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
