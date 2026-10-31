import { useState, useMemo } from 'react';
import { Plus, Trash2, Pencil, X, Search, Bookmark, ExternalLink, Star, Folder, Tag } from 'lucide-react';
import { toast } from 'sonner';

const KEY = 'sfbookmarks:bookmarks';

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const save = (b) => { try { localStorage.setItem(KEY, JSON.stringify(b)); } catch {} };
const normUrl = (u) => { const t = u.trim(); return /^https?:\/\//i.test(t) ? t : `https://${t}`; };
const domainOf = (u) => { try { return new URL(normUrl(u)).hostname.replace(/^www\./, ''); } catch { return ''; } };

export default function BookmarksApp() {
  const [bookmarks, setBookmarks] = useState(load);
  const [search, setSearch] = useState('');
  const [folderFilter, setFolderFilter] = useState('all');
  const [favOnly, setFavOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fTitle, setFTitle] = useState('');
  const [fUrl, setFUrl] = useState('');
  const [fFolder, setFFolder] = useState('');
  const [fTags, setFTags] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const persist = (n) => { setBookmarks(n); save(n); };

  const folders = useMemo(() => {
    const m = {};
    bookmarks.forEach((b) => { const f = b.folder || 'Unsorted'; m[f] = (m[f] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [bookmarks]);

  const allTags = useMemo(() => {
    const s = new Set();
    bookmarks.forEach((b) => (b.tags || []).forEach((t) => s.add(t)));
    return [...s].sort();
  }, [bookmarks]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookmarks
      .filter((b) => folderFilter === 'all' || (b.folder || 'Unsorted') === folderFilter)
      .filter((b) => !favOnly || b.fav)
      .filter((b) => !q || (b.title || '').toLowerCase().includes(q) || (b.url || '').toLowerCase().includes(q) || (b.tags || []).some((t) => t.toLowerCase().includes(q)))
      .slice().sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }, [bookmarks, search, folderFilter, favOnly]);

  const openNew = () => { setEditing(null); setFTitle(''); setFUrl(''); setFFolder(''); setFTags(''); setShowModal(true); };
  const openEdit = (b) => { setEditing(b); setFTitle(b.title || ''); setFUrl(b.url || ''); setFFolder(b.folder || ''); setFTags((b.tags || []).join(', ')); setShowModal(true); };
  const saveBookmark = () => {
    if (!fUrl.trim()) { toast.error('URL is required'); return; }
    const url = normUrl(fUrl);
    const payload = { title: fTitle.trim() || domainOf(url) || url, url, folder: fFolder.trim() || 'Unsorted', tags: fTags.split(',').map((t) => t.trim()).filter(Boolean) };
    if (editing) {
      persist(bookmarks.map((b) => (b.id === editing.id ? { ...b, ...payload } : b)));
      toast.success('Bookmark updated');
    } else {
      persist([{ ...payload, id: Date.now().toString(), fav: false, ts: Date.now() }, ...bookmarks]);
      toast.success('Bookmarked!');
    }
    setShowModal(false);
  };
  const doDelete = (id) => { persist(bookmarks.filter((b) => b.id !== id)); setConfirmDelete(null); toast.success('Deleted'); };
  const toggleFav = (id) => persist(bookmarks.map((b) => (b.id === id ? { ...b, fav: !b.fav } : b)));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:sticky lg:top-4">
            <p className="font-black text-sm mb-3 flex items-center gap-2"><Folder className="w-4 h-4 text-orange-400" /> Folders</p>
            <div className="space-y-1 max-h-56 overflow-y-auto">
              <button onClick={() => setFolderFilter('all')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${folderFilter === 'all' ? 'bg-orange-500/10 border border-orange-500/30 text-orange-200 font-bold' : 'hover:bg-white/5'}`}>
                All <span className="text-xs text-slate-500">({bookmarks.length})</span>
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
                      className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-orange-300 hover:border-orange-500/30 transition">#{t}</button>
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
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, URL, tags…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            </div>
            <button onClick={openNew} className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
              <Plus className="w-4 h-4" /> Add Bookmark
            </button>
          </div>

          {visible.length === 0 ? (
            <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
              <Bookmark className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="font-bold text-slate-300">{bookmarks.length === 0 ? 'No bookmarks yet' : 'No bookmarks match'}</p>
              <p className="text-sm text-slate-500">{bookmarks.length === 0 ? 'Save your first link.' : 'Try a different search.'}</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {visible.map((b) => (
                <div key={b.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3 hover:bg-white/[0.05] transition">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-orange-300 text-sm shrink-0">
                    {(domainOf(b.url)[0] || '?').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <a href={b.url} target="_blank" rel="noreferrer" className="font-bold hover:text-orange-200 transition truncate block">
                      {b.title} <ExternalLink className="w-3 h-3 inline-block ml-1 text-slate-500" />
                    </a>
                    <p className="text-xs text-slate-500 truncate">{domainOf(b.url)} · 📁 {b.folder}</p>
                    {(b.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {b.tags.map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300">#{t}</span>)}
                      </div>
                    )}
                  </div>
                  <button onClick={() => toggleFav(b.id)} className="p-1.5 rounded-lg hover:bg-white/10 transition shrink-0">
                    <Star className={`w-4 h-4 ${b.fav ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                  </button>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition"><Pencil className="w-3.5 h-3.5 text-slate-400" /></button>
                    <button onClick={() => setConfirmDelete(b.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition"><Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" /></button>
                  </div>
                  {confirmDelete === b.id && (
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => doDelete(b.id)} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600">Yes</button>
                      <button onClick={() => setConfirmDelete(null)} className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10">No</button>
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
              <h3 className="font-black text-lg">{editing ? 'Edit Bookmark' : 'Add Bookmark'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input value={fUrl} onChange={(e) => setFUrl(e.target.value)} placeholder="https://example.com *" autoFocus className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <input value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder="Title (auto from domain if blank)" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <input value={fFolder} onChange={(e) => setFFolder(e.target.value)} placeholder="Folder" list="bm-folders" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <datalist id="bm-folders">{folders.map(([f]) => <option key={f} value={f} />)}</datalist>
            <input value={fTags} onChange={(e) => setFTags(e.target.value)} placeholder="Tags (comma separated)" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="flex gap-2 pt-1">
              <button onClick={saveBookmark} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">{editing ? 'Save' : 'Bookmark It'}</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
