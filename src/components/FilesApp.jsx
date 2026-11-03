import { useState, useMemo } from 'react';
import { Plus, Trash2, Pencil, X, Search, FolderOpen, Folder, FileText, Tag, Star } from 'lucide-react';
import { toast } from 'sonner';

const KEY = 'sffiles:docs';

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const save = (d) => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} };

const TYPE_ICONS = { pdf: '📕', doc: '📄', sheet: '📊', image: '🖼️', video: '🎬', audio: '🎵', zip: '🗜️', other: '📎' };

export default function FilesApp() {
  const [docs, setDocs] = useState(load);
  const [search, setSearch] = useState('');
  const [folderFilter, setFolderFilter] = useState('all');
  const [favOnly, setFavOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fName, setFName] = useState('');
  const [fFolder, setFFolder] = useState('');
  const [fType, setFType] = useState('doc');
  const [fTags, setFTags] = useState('');
  const [fNote, setFNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const persist = (n) => { setDocs(n); save(n); };

  const folders = useMemo(() => {
    const m = {};
    docs.forEach((d) => { const f = d.folder || 'Unfiled'; m[f] = (m[f] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [docs]);

  const allTags = useMemo(() => {
    const s = new Set();
    docs.forEach((d) => (d.tags || []).forEach((t) => s.add(t)));
    return [...s].sort();
  }, [docs]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return docs
      .filter((d) => folderFilter === 'all' || (d.folder || 'Unfiled') === folderFilter)
      .filter((d) => !favOnly || d.fav)
      .filter((d) => !q || (d.name || '').toLowerCase().includes(q) || (d.note || '').toLowerCase().includes(q) || (d.tags || []).some((t) => t.toLowerCase().includes(q)))
      .slice().sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }, [docs, search, folderFilter, favOnly]);

  const openNew = () => { setEditing(null); setFName(''); setFFolder(''); setFType('doc'); setFTags(''); setFNote(''); setShowModal(true); };
  const openEdit = (d) => { setEditing(d); setFName(d.name || ''); setFFolder(d.folder || ''); setFType(d.type || 'doc'); setFTags((d.tags || []).join(', ')); setFNote(d.note || ''); setShowModal(true); };
  const saveDoc = () => {
    if (!fName.trim()) { toast.error('Name is required'); return; }
    const payload = { name: fName.trim(), folder: fFolder.trim() || 'Unfiled', type: fType, tags: fTags.split(',').map((t) => t.trim()).filter(Boolean), note: fNote.trim() };
    if (editing) {
      persist(docs.map((d) => (d.id === editing.id ? { ...d, ...payload } : d)));
      toast.success('Updated');
    } else {
      persist([{ ...payload, id: Date.now().toString(), fav: false, ts: Date.now() }, ...docs]);
      toast.success('Filed away');
    }
    setShowModal(false);
  };
  const doDelete = (id) => { persist(docs.filter((d) => d.id !== id)); setConfirmDelete(null); toast.success('Deleted'); };
  const toggleFav = (id) => persist(docs.map((d) => (d.id === id ? { ...d, fav: !d.fav } : d)));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:sticky lg:top-4">
            <p className="font-black text-sm mb-3 flex items-center gap-2"><Folder className="w-4 h-4 text-orange-400" /> Folders</p>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              <button onClick={() => setFolderFilter('all')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${folderFilter === 'all' ? 'bg-orange-500/10 border border-orange-500/30 text-orange-200 font-bold' : 'hover:bg-white/5'}`}>
                All files <span className="text-xs text-slate-500">({docs.length})</span>
              </button>
              {folders.map(([f, n]) => (
                <button key={f} onClick={() => setFolderFilter(folderFilter === f ? 'all' : f)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition truncate ${folderFilter === f ? 'bg-orange-500/10 border border-orange-500/30 text-orange-200 font-bold' : 'hover:bg-white/5'}`}>
                  📁 {f} <span className="text-xs text-slate-500">({n})</span>
                </button>
              ))}
            </div>
            <button onClick={() => setFavOnly(!favOnly)}
              className={`mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${favOnly ? 'border-amber-400 bg-amber-400/10 text-amber-300' : 'border-white/10 hover:bg-white/5'}`}>
              <Star className="w-3.5 h-3.5" /> {favOnly ? 'Showing starred' : 'Starred only'}
            </button>
            {allTags.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((t) => (
                    <button key={t} onClick={() => setSearch(t)}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-orange-300 hover:border-orange-500/30 transition">
                      #{t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, notes, tags…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            </div>
            <button onClick={openNew} className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
              <Plus className="w-4 h-4" /> Add File
            </button>
          </div>

          {visible.length === 0 ? (
            <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
              <FolderOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="font-bold text-slate-300">{docs.length === 0 ? 'No files yet' : 'No files match'}</p>
              <p className="text-sm text-slate-500">{docs.length === 0 ? 'Catalog your first document.' : 'Try a different search.'}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {visible.map((d) => (
                <div key={d.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start gap-3">
                    <p className="text-3xl shrink-0">{TYPE_ICONS[d.type] || TYPE_ICONS.other}</p>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{d.name}</p>
                      <p className="text-[11px] text-slate-500">📁 {d.folder}</p>
                      {d.note && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{d.note}</p>}
                      {(d.tags || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {d.tags.map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300">#{t}</span>)}
                        </div>
                      )}
                    </div>
                    <button onClick={() => toggleFav(d.id)} className="p-1 rounded-lg hover:bg-white/10 transition shrink-0">
                      <Star className={`w-4 h-4 ${d.fav ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                    </button>
                  </div>
                  <div className="flex gap-1.5 mt-3">
                    <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition"><Pencil className="w-3.5 h-3.5 text-slate-400" /></button>
                    <button onClick={() => setConfirmDelete(d.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition"><Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" /></button>
                  </div>
                  {confirmDelete === d.id && (
                    <div className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 flex items-center justify-between gap-2">
                      <p className="text-xs text-red-300 font-semibold">Delete?</p>
                      <div className="flex gap-1.5">
                        <button onClick={() => doDelete(d.id)} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600">Yes</button>
                        <button onClick={() => setConfirmDelete(null)} className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10">No</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">{editing ? 'Edit File' : 'Add File'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="File name *" autoFocus className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={fFolder} onChange={(e) => setFFolder(e.target.value)} placeholder="Folder" list="file-folders" className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
              <datalist id="file-folders">{folders.map(([f]) => <option key={f} value={f} />)}</datalist>
              <select value={fType} onChange={(e) => setFType(e.target.value)} className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500">
                {Object.keys(TYPE_ICONS).map((t) => <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>)}
              </select>
            </div>
            <input value={fTags} onChange={(e) => setFTags(e.target.value)} placeholder="Tags (comma separated)" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <textarea value={fNote} onChange={(e) => setFNote(e.target.value)} placeholder="Note (optional)" rows={2} className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="flex gap-2 pt-1">
              <button onClick={saveDoc} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">{editing ? 'Save' : 'File It'}</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
