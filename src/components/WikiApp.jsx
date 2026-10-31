import { useState, useMemo } from 'react';
import { Plus, Trash2, Pencil, X, Search, BookOpen, Folder, Star } from 'lucide-react';
import { toast } from 'sonner';

const KEY = 'sfwiki:articles';

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const save = (a) => { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch {} };

export default function WikiApp() {
  const [articles, setArticles] = useState(load);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [favOnly, setFavOnly] = useState(false);
  const [reading, setReading] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fTitle, setFTitle] = useState('');
  const [fCat, setFCat] = useState('');
  const [fBody, setFBody] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const persist = (n) => { setArticles(n); save(n); };

  const cats = useMemo(() => {
    const m = {};
    articles.forEach((a) => { const c = a.cat || 'General'; m[c] = (m[c] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [articles]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles
      .filter((a) => catFilter === 'all' || (a.cat || 'General') === catFilter)
      .filter((a) => !favOnly || a.fav)
      .filter((a) => !q || (a.title || '').toLowerCase().includes(q) || (a.body || '').toLowerCase().includes(q))
      .slice().sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }, [articles, search, catFilter, favOnly]);

  const openNew = () => { setEditing(null); setFTitle(''); setFCat(''); setFBody(''); setShowModal(true); };
  const openEdit = (a) => { setEditing(a); setFTitle(a.title || ''); setFCat(a.cat || ''); setFBody(a.body || ''); setShowModal(true); };
  const saveArticle = () => {
    if (!fTitle.trim()) { toast.error('Title is required'); return; }
    const payload = { title: fTitle.trim(), cat: fCat.trim() || 'General', body: fBody.trim() };
    if (editing) {
      persist(articles.map((a) => (a.id === editing.id ? { ...a, ...payload } : a)));
      toast.success('Article updated');
    } else {
      persist([{ ...payload, id: Date.now().toString(), fav: false, ts: Date.now() }, ...articles]);
      toast.success('Article published');
    }
    setShowModal(false);
  };
  const doDelete = (id) => { persist(articles.filter((a) => a.id !== id)); setConfirmDelete(null); setReading(null); toast.success('Article deleted'); };
  const toggleFav = (id) => persist(articles.map((a) => (a.id === id ? { ...a, fav: !a.fav } : a)));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:sticky lg:top-4">
            <p className="font-black text-sm mb-3 flex items-center gap-2"><Folder className="w-4 h-4 text-orange-400" /> Categories</p>
            <div className="space-y-1">
              <button onClick={() => setCatFilter('all')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${catFilter === 'all' ? 'bg-orange-500/10 border border-orange-500/30 text-orange-200 font-bold' : 'hover:bg-white/5'}`}>
                All articles <span className="text-xs text-slate-500">({articles.length})</span>
              </button>
              {cats.map(([c, n]) => (
                <button key={c} onClick={() => setCatFilter(catFilter === c ? 'all' : c)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${catFilter === c ? 'bg-orange-500/10 border border-orange-500/30 text-orange-200 font-bold' : 'hover:bg-white/5'}`}>
                  {c} <span className="text-xs text-slate-500">({n})</span>
                </button>
              ))}
            </div>
            <button onClick={() => setFavOnly(!favOnly)}
              className={`mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${favOnly ? 'border-amber-400 bg-amber-400/10 text-amber-300' : 'border-white/10 hover:bg-white/5'}`}>
              <Star className="w-3.5 h-3.5" /> {favOnly ? 'Showing starred' : 'Starred only'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search the wiki…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            </div>
            <button onClick={openNew} className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
              <Plus className="w-4 h-4" /> New Article
            </button>
          </div>

          {visible.length === 0 ? (
            <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="font-bold text-slate-300">{articles.length === 0 ? 'Wiki is empty' : 'No articles match'}</p>
              <p className="text-sm text-slate-500">{articles.length === 0 ? 'Write the first article of your team brain.' : 'Try a different search.'}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {visible.map((a) => (
                <div key={a.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.05] transition">
                  <div className="flex items-start justify-between gap-2">
                    <button onClick={() => setReading(a)} className="text-left flex-1 min-w-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300">{a.cat}</span>
                      <p className="font-bold mt-1.5 hover:text-orange-200 transition">{a.title}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-3 whitespace-pre-wrap">{a.body}</p>
                    </button>
                    <button onClick={() => toggleFav(a.id)} className="p-1.5 rounded-lg hover:bg-white/10 transition shrink-0" title="Star">
                      <Star className={`w-4 h-4 ${a.fav ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                    </button>
                  </div>
                  <div className="flex gap-1.5 mt-3">
                    <button onClick={() => setReading(a)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition">Read</button>
                    <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition"><Pencil className="w-3.5 h-3.5 text-slate-400" /></button>
                    <button onClick={() => setConfirmDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition"><Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" /></button>
                  </div>
                  {confirmDelete === a.id && (
                    <div className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 flex items-center justify-between gap-2">
                      <p className="text-xs text-red-300 font-semibold">Delete?</p>
                      <div className="flex gap-1.5">
                        <button onClick={() => doDelete(a.id)} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600">Yes</button>
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

      {reading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setReading(null)}>
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#121218] p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300">{reading.cat}</span>
                <h3 className="font-black text-xl mt-2">{reading.title}</h3>
              </div>
              <button onClick={() => setReading(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition shrink-0"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{reading.body || 'No content.'}</p>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">{editing ? 'Edit Article' : 'New Article'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder="Title *" autoFocus className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <input value={fCat} onChange={(e) => setFCat(e.target.value)} placeholder="Category (e.g. Getting Started)" list="wiki-cats" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <datalist id="wiki-cats">{cats.map(([c]) => <option key={c} value={c} />)}</datalist>
            <textarea value={fBody} onChange={(e) => setFBody(e.target.value)} placeholder="Write the article… (plain text, line breaks kept)" rows={10} className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="flex gap-2 pt-1">
              <button onClick={saveArticle} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">{editing ? 'Save Changes' : 'Publish Article'}</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
