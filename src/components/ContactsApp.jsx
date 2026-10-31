import { useState, useMemo } from 'react';
import { Plus, Trash2, Pencil, X, Search, Contact, Star, Phone, Mail, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';

const KEY = 'sfcontacts:contacts';

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const save = (c) => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {} };

export default function ContactsApp() {
  const [contacts, setContacts] = useState(load);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [favOnly, setFavOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fName, setFName] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fAddr, setFAddr] = useState('');
  const [fGroup, setFGroup] = useState('');
  const [fNote, setFNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [detail, setDetail] = useState(null);

  const persist = (n) => { setContacts(n); save(n); };

  const groups = useMemo(() => {
    const m = {};
    contacts.forEach((c) => { const g = c.group || 'Ungrouped'; m[g] = (m[g] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [contacts]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts
      .filter((c) => groupFilter === 'all' || (c.group || 'Ungrouped') === groupFilter)
      .filter((c) => !favOnly || c.fav)
      .filter((c) => !q || (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(q) || (c.email || '').toLowerCase().includes(q) || (c.note || '').toLowerCase().includes(q))
      .slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [contacts, search, groupFilter, favOnly]);

  const initials = (n) => (n || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const openNew = () => { setEditing(null); setFName(''); setFPhone(''); setFEmail(''); setFAddr(''); setFGroup(''); setFNote(''); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setFName(c.name || ''); setFPhone(c.phone || ''); setFEmail(c.email || ''); setFAddr(c.addr || ''); setFGroup(c.group || ''); setFNote(c.note || ''); setShowModal(true); };
  const saveContact = () => {
    if (!fName.trim()) { toast.error('Name is required'); return; }
    const payload = { name: fName.trim(), phone: fPhone.trim(), email: fEmail.trim(), addr: fAddr.trim(), group: fGroup.trim() || 'Ungrouped', note: fNote.trim() };
    if (editing) {
      persist(contacts.map((c) => (c.id === editing.id ? { ...c, ...payload } : c)));
      toast.success('Contact updated');
    } else {
      persist([{ ...payload, id: Date.now().toString(), fav: false, ts: Date.now() }, ...contacts]);
      toast.success('Contact added');
    }
    setShowModal(false);
  };
  const doDelete = (id) => { persist(contacts.filter((c) => c.id !== id)); setConfirmDelete(null); setDetail(null); toast.success('Contact deleted'); };
  const toggleFav = (id) => persist(contacts.map((c) => (c.id === id ? { ...c, fav: !c.fav } : c)));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:sticky lg:top-4">
            <p className="font-black text-sm mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-orange-400" /> Groups</p>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              <button onClick={() => setGroupFilter('all')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${groupFilter === 'all' ? 'bg-orange-500/10 border border-orange-500/30 text-orange-200 font-bold' : 'hover:bg-white/5'}`}>
                Everyone <span className="text-xs text-slate-500">({contacts.length})</span>
              </button>
              {groups.map(([g, n]) => (
                <button key={g} onClick={() => setGroupFilter(groupFilter === g ? 'all' : g)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition truncate ${groupFilter === g ? 'bg-orange-500/10 border border-orange-500/30 text-orange-200 font-bold' : 'hover:bg-white/5'}`}>
                  {g} <span className="text-xs text-slate-500">({n})</span>
                </button>
              ))}
            </div>
            <button onClick={() => setFavOnly(!favOnly)}
              className={`mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${favOnly ? 'border-amber-400 bg-amber-400/10 text-amber-300' : 'border-white/10 hover:bg-white/5'}`}>
              <Star className="w-3.5 h-3.5" /> {favOnly ? 'Showing favorites' : 'Favorites only'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone, email…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            </div>
            <button onClick={openNew} className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
              <Plus className="w-4 h-4" /> Add Contact
            </button>
          </div>

          {visible.length === 0 ? (
            <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
              <Contact className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="font-bold text-slate-300">{contacts.length === 0 ? 'Address book is empty' : 'No contacts match'}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {visible.map((c) => (
                <div key={c.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3 hover:bg-white/[0.05] transition">
                  <button onClick={() => setDetail(c)} className="w-11 h-11 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center font-black text-sm shrink-0">
                    {initials(c.name)}
                  </button>
                  <button onClick={() => setDetail(c)} className="flex-1 text-left min-w-0">
                    <p className="font-bold truncate">{c.name}</p>
                    <p className="text-xs text-slate-500 truncate">{[c.phone, c.group].filter(Boolean).join(' · ')}</p>
                  </button>
                  <button onClick={() => toggleFav(c.id)} className="p-1.5 rounded-lg hover:bg-white/10 transition shrink-0">
                    <Star className={`w-4 h-4 ${c.fav ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                  </button>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition"><Pencil className="w-3.5 h-3.5 text-slate-400" /></button>
                    <button onClick={() => setConfirmDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition"><Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" /></button>
                  </div>
                  {confirmDelete === c.id && (
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => doDelete(c.id)} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600">Yes</button>
                      <button onClick={() => setConfirmDelete(null)} className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10">No</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setDetail(null)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center font-black text-lg">{initials(detail.name)}</div>
                <div>
                  <h3 className="font-black text-xl">{detail.name}</h3>
                  <p className="text-xs text-slate-500">{detail.group}</p>
                </div>
              </div>
              <button onClick={() => setDetail(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="space-y-2.5">
              {detail.phone && <a href={`tel:${detail.phone}`} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 hover:bg-white/[0.06] transition"><Phone className="w-4 h-4 text-orange-400" /><span className="text-sm font-semibold">{detail.phone}</span></a>}
              {detail.email && <a href={`mailto:${detail.email}`} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 hover:bg-white/[0.06] transition"><Mail className="w-4 h-4 text-orange-400" /><span className="text-sm font-semibold break-all">{detail.email}</span></a>}
              {detail.addr && <p className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm"><MapPin className="w-4 h-4 text-orange-400 shrink-0" />{detail.addr}</p>}
              {detail.note && <p className="text-sm text-slate-400 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 whitespace-pre-wrap">{detail.note}</p>}
              {!detail.phone && !detail.email && !detail.addr && !detail.note && <p className="text-sm text-slate-500 text-center py-3">No details added yet.</p>}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">{editing ? 'Edit Contact' : 'Add Contact'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Full name *" autoFocus className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="grid grid-cols-2 gap-3">
              <input value={fPhone} onChange={(e) => setFPhone(e.target.value)} type="tel" placeholder="Phone" className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
              <input value={fEmail} onChange={(e) => setFEmail(e.target.value)} type="email" placeholder="Email" className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            </div>
            <input value={fAddr} onChange={(e) => setFAddr(e.target.value)} placeholder="Address" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <input value={fGroup} onChange={(e) => setFGroup(e.target.value)} placeholder="Group (e.g. Family, Work)" list="contact-groups" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <datalist id="contact-groups">{groups.map(([g]) => <option key={g} value={g} />)}</datalist>
            <textarea value={fNote} onChange={(e) => setFNote(e.target.value)} placeholder="Note (optional)" rows={2} className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="flex gap-2 pt-1">
              <button onClick={saveContact} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">{editing ? 'Save' : 'Add'}</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
