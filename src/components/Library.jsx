import { useState } from 'react';
import { toast } from 'sonner';
import { BookOpen, FileText, BookMarked, Plus, X, Minus, Check, Trash2, StickyNote, ArrowLeft } from 'lucide-react';
import { getBooks, saveBooks, addBook, updateBook, deleteBook, addNote, deleteNote } from '../lib/books';

const COVER_COLORS = {
  orange: 'from-orange-500 to-red-600',
  red: 'from-red-500 to-rose-700',
  amber: 'from-amber-500 to-orange-700',
  rose: 'from-rose-500 to-pink-700',
  emerald: 'from-emerald-500 to-teal-700',
  blue: 'from-blue-500 to-indigo-700',
};

function progressPct(book) {
  if (!book.totalPages || book.totalPages <= 0) return 0;
  return Math.min(100, Math.round((book.currentPage / book.totalPages) * 100));
}

export default function Library() {
  const [books, setBooks] = useState(() => getBooks());
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Add form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [coverColor, setCoverColor] = useState('orange');

  // Note form state
  const [noteText, setNoteText] = useState('');
  const [notePage, setNotePage] = useState('');

  const stats = {
    booksFinished: books.filter((b) => b.status === 'finished').length,
    totalPagesRead: books.reduce((sum, b) => sum + (Number(b.currentPage) || 0), 0),
    booksReading: books.filter((b) => b.status === 'reading').length,
  };

  const refresh = () => setBooks(getBooks());
  const selected = books.find((b) => b.id === selectedId) || null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Give the book a title first.');
      return;
    }
    addBook({ title, author, totalPages: totalPages === '' ? 0 : Number(totalPages), coverColor });
    toast.success(`"${title.trim()}" added to your shelf.`);
    setTitle(''); setAuthor(''); setTotalPages(''); setCoverColor('orange');
    setShowAdd(false);
    refresh();
  };

  const handleProgress = (book, value) => {
    const next = Math.max(0, Math.min(book.totalPages > 0 ? book.totalPages : value, Math.round(value)));
    saveBooks(getBooks().map((b) => (b.id === book.id ? { ...b, currentPage: next } : b)));
    refresh();
  };

  const handleMarkFinished = (book) => {
    updateBook(book.id, {
      status: 'finished',
      currentPage: book.totalPages > 0 ? book.totalPages : book.currentPage,
      finishedAt: Date.now(),
    });
    toast.success(`Finished "${book.title}"! Nice work.`);
    refresh();
  };

  const handleDelete = (book) => {
    if (!window.confirm(`Delete "${book.title}" and all its notes?`)) return;
    deleteBook(book.id);
    toast.success('Book deleted.');
    if (selectedId === book.id) setSelectedId(null);
    refresh();
  };

  const handleAddNote = (book) => {
    if (!noteText.trim()) {
      toast.error('Write the note first.');
      return;
    }
    addNote(book.id, { text: noteText, page: notePage === '' ? null : notePage });
    toast.success('Note saved.');
    setNoteText(''); setNotePage('');
    refresh();
  };

  const handleDeleteNote = (book, noteId) => {
    if (!window.confirm('Delete this note?')) return;
    deleteNote(book.id, noteId);
    toast.success('Note deleted.');
    refresh();
  };

  // ---------- Detail view ----------
  if (selected) {
    const pct = progressPct(selected);
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button
          onClick={() => { setSelectedId(null); setNoteText(''); setNotePage(''); }}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to shelf
        </button>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5 md:p-6">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className={`w-28 h-40 shrink-0 rounded-lg bg-gradient-to-br ${COVER_COLORS[selected.coverColor] || COVER_COLORS.orange} flex flex-col justify-between p-3 shadow-lg`}>
              <BookOpen className="w-5 h-5 text-white/80" />
              <div>
                <p className="text-white text-xs font-bold leading-tight line-clamp-3">{selected.title}</p>
                {selected.author && <p className="text-white/70 text-[10px] mt-1 line-clamp-1">{selected.author}</p>}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold truncate">{selected.title}</h2>
                  {selected.author && <p className="text-slate-400 text-sm mt-0.5">by {selected.author}</p>}
                </div>
                <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${selected.status === 'finished' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' : 'bg-orange-500/15 text-orange-300 border border-orange-500/25'}`}>
                  {selected.status === 'finished' ? 'Finished' : 'Reading'}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span>Progress</span>
                  <span>{selected.currentPage}{selected.totalPages > 0 ? ` / ${selected.totalPages}` : ''} pages · {pct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all" style={{ width: `${pct}%` }} />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => handleProgress(selected, selected.currentPage - 10)} className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/15 flex items-center justify-center" aria-label="Back 10 pages">
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={selected.totalPages > 0 ? selected.totalPages : 1000}
                    value={selected.currentPage}
                    onChange={(e) => handleProgress(selected, Number(e.target.value))}
                    className="flex-1 accent-orange-500"
                    aria-label="Reading progress"
                  />
                  <button onClick={() => handleProgress(selected, selected.currentPage + 10)} className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/15 flex items-center justify-center" aria-label="Forward 10 pages">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {selected.status !== 'finished' && (
                  <button
                    onClick={() => handleMarkFinished(selected)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 font-semibold text-sm hover:opacity-90"
                  >
                    <Check className="w-4 h-4" /> Mark Finished
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <h3 className="font-bold flex items-center gap-2 mb-3">
              <StickyNote className="w-4 h-4 text-orange-400" /> Notes
            </h3>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write a note or quote..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50"
              />
              <input
                value={notePage}
                onChange={(e) => setNotePage(e.target.value.replace(/\D/g, ''))}
                placeholder="Page #"
                inputMode="numeric"
                className="w-full sm:w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50"
              />
              <button
                onClick={() => handleAddNote(selected)}
                className="px-4 py-2 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-200 text-sm font-semibold hover:bg-orange-500/30"
              >
                Add
              </button>
            </div>
            {(selected.notes || []).length === 0 ? (
              <p className="text-sm text-slate-500">No notes yet — capture your first thought.</p>
            ) : (
              <ul className="space-y-2">
                {selected.notes.map((n) => (
                  <li key={n.id} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm">{n.text}</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {n.page !== null && n.page !== undefined ? `Page ${n.page} · ` : ''}
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteNote(selected, n.id)} className="text-slate-500 hover:text-red-400 shrink-0" aria-label="Delete note">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
            <button
              onClick={() => handleDelete(selected)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-sm font-semibold hover:bg-red-500/20"
            >
              <Trash2 className="w-4 h-4" /> Delete Book
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Shelf view ----------
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <BookMarked className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
          <p className="text-2xl font-black">{stats.booksFinished}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Books Finished</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <FileText className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
          <p className="text-2xl font-black">{stats.totalPagesRead.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Pages Read</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <BookOpen className="w-5 h-5 text-orange-400 mx-auto mb-1.5" />
          <p className="text-2xl font-black">{stats.booksReading}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Currently Reading</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Your Shelf</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 font-semibold text-sm hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Add Book
        </button>
      </div>

      {books.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl py-14 px-6 text-center">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold">Your shelf is empty — add your first book!</p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 font-semibold text-sm hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Add Book
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {books.map((book) => {
            const pct = progressPct(book);
            return (
              <button
                key={book.id}
                onClick={() => setSelectedId(book.id)}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-left hover:border-orange-500/40 hover:bg-white/[0.07] transition"
              >
                <div className={`h-36 rounded-lg bg-gradient-to-br ${COVER_COLORS[book.coverColor] || COVER_COLORS.orange} flex flex-col justify-between p-3 shadow-lg mb-3`}>
                  <BookOpen className="w-5 h-5 text-white/80" />
                  <div>
                    <p className="text-white text-xs font-bold leading-tight line-clamp-3">{book.title}</p>
                    {book.author && <p className="text-white/70 text-[10px] mt-1 line-clamp-1">{book.author}</p>}
                  </div>
                </div>
                <p className="text-sm font-semibold truncate">{book.title}</p>
                {book.author && <p className="text-xs text-slate-500 truncate">{book.author}</p>}
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>{pct}%</span>
                  <span className={`font-semibold ${book.status === 'finished' ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {book.status === 'finished' ? 'Finished' : 'Reading'}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500" style={{ width: `${pct}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Add Book modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowAdd(false)} />
          <form
            onSubmit={handleAdd}
            className="relative w-full max-w-md bg-[#121218] border border-white/10 rounded-xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Add a Book</h3>
              <button type="button" onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Book title"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 mb-4"
            />

            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Author</label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 mb-4"
            />

            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Total pages</label>
            <input
              value={totalPages}
              onChange={(e) => setTotalPages(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 320"
              inputMode="numeric"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 mb-4"
            />

            <label className="block text-xs font-semibold text-slate-400 mb-2">Cover color</label>
            <div className="flex gap-2.5 mb-6">
              {Object.entries(COVER_COLORS).map(([name, gradient]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setCoverColor(name)}
                  aria-label={`${name} cover`}
                  title={name}
                  className={`w-10 h-14 rounded-md bg-gradient-to-br ${gradient} ${coverColor === name ? 'ring-2 ring-white ring-offset-2 ring-offset-[#121218]' : 'opacity-70 hover:opacity-100'}`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 text-sm font-semibold hover:bg-white/15"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-sm font-semibold hover:opacity-90"
              >
                Add Book
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
