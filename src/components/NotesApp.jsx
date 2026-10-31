import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Pin, Trash2, X, StickyNote } from 'lucide-react';
import { toast } from 'sonner';
import { getNotes, addNote, updateNote, deleteNote, togglePin, sortedNotes } from '../lib/notes';

const COLORS = ['#f97316', '#ef4444', '#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'];

export default function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null); // note object or 'new'

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  const refresh = () => setNotes(getNotes());

  const filtered = sortedNotes(notes).filter((n) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
  });

  const openNew = () =>
    setEditing({ id: null, title: '', body: '', color: COLORS[0], pinned: false });
  const openEdit = (note) => setEditing({ ...note });
  const closeModal = () => setEditing(null);

  const save = () => {
    if (!editing.title.trim() && !editing.body.trim()) {
      toast.error('Note is empty — add some text first.');
      return;
    }
    if (editing.id) {
      updateNote(editing.id, {
        title: editing.title.trim(),
        body: editing.body,
        color: editing.color,
      });
      toast.success('Note saved ✓');
    } else {
      addNote({ title: editing.title.trim(), body: editing.body, color: editing.color });
      toast.success('Note created 📝');
    }
    closeModal();
    refresh();
  };

  const remove = (id) => {
    deleteNote(id);
    closeModal();
    refresh();
    toast.success('Note deleted');
  };

  const pin = (id) => {
    togglePin(id);
    refresh();
    if (editing && editing.id === id) {
      setEditing({ ...editing, pinned: !editing.pinned });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black">My Notes</h1>
          <p className="text-slate-400 text-sm mt-1">
            {notes.length} note{notes.length !== 1 ? 's' : ''} · {notes.filter((n) => n.pinned).length} pinned
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition shrink-0"
        >
          <Plus className="w-4 h-4" /> New note
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-orange-400/50 placeholder:text-slate-600"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/10">
          <StickyNote className="w-12 h-12 mx-auto text-slate-700 mb-4" />
          <p className="text-slate-400 mb-2">{query ? 'No notes match your search' : 'No notes yet'}</p>
          {!query && <p className="text-sm text-slate-500">Hit "New note" and jot something down.</p>}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                onClick={() => openEdit(note)}
                className="cursor-pointer rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-orange-400/30 transition-colors overflow-hidden relative"
              >
                <span
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ background: note.color }}
                />
                {note.pinned && (
                  <Pin className="absolute top-3 right-3 w-4 h-4 text-orange-400 fill-orange-400" />
                )}
                <h3 className="font-bold pr-6 truncate">{note.title || <span className="text-slate-600">Untitled</span>}</h3>
                <p className="text-sm text-slate-400 mt-1 line-clamp-4 whitespace-pre-wrap">{note.body}</p>
                <p className="text-[11px] text-slate-600 mt-3">
                  {new Date(note.updated).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Editor modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#121218] p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">{editing.id ? 'Edit note' : 'New note'}</h2>
                <button onClick={closeModal} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Title"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-3 outline-none focus:border-orange-400/50 font-bold placeholder:text-slate-600"
                autoFocus
              />
              <textarea
                value={editing.body}
                onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                placeholder="Write your note..."
                rows={7}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-4 outline-none focus:border-orange-400/50 resize-none placeholder:text-slate-600"
              />
              <div className="flex items-center gap-2 mb-5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEditing({ ...editing, color: c })}
                    className={`w-8 h-8 rounded-full transition ${editing.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#121218] scale-110' : ''}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={save}
                  className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition"
                >
                  Save note
                </button>
                {editing.id && (
                  <>
                    <button
                      onClick={() => pin(editing.id)}
                      className="px-4 py-3 rounded-xl border border-white/10 hover:border-orange-400/40 transition"
                      title={editing.pinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className={`w-4 h-4 ${editing.pinned ? 'text-orange-400 fill-orange-400' : 'text-slate-400'}`} />
                    </button>
                    <button
                      onClick={() => remove(editing.id)}
                      className="px-4 py-3 rounded-xl border border-white/10 text-red-400 hover:border-red-400/40 hover:bg-red-400/10 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
