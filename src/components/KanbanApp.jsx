import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Pencil, X, Check, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

const KEY = 'sfkan:cards';
const COLS = [
  { id: 'todo', name: 'To Do', accent: 'from-slate-500/20' },
  { id: 'progress', name: 'In Progress', accent: 'from-orange-500/20' },
  { id: 'done', name: 'Done', accent: 'from-emerald-500/20' },
];

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export default function KanbanApp() {
  const [cards, setCards] = useState(load);
  const [adding, setAdding] = useState(null); // column id
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [editing, setEditing] = useState(null); // card id
  const [dragId, setDragId] = useState(null);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(cards));
  }, [cards]);

  const save = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Give the card a title.');
      return;
    }
    if (editing) {
      setCards((cs) => cs.map((c) => (c.id === editing ? { ...c, title: title.trim(), desc: desc.trim() } : c)));
      toast.success('Card updated.');
    } else {
      setCards((cs) => [...cs, { id: Date.now().toString(), title: title.trim(), desc: desc.trim(), col: adding }]);
      toast.success('Card added.');
    }
    setTitle('');
    setDesc('');
    setAdding(null);
    setEditing(null);
  };

  const startEdit = (card) => {
    setEditing(card.id);
    setAdding(card.col);
    setTitle(card.title);
    setDesc(card.desc || '');
  };

  const cancel = () => {
    setAdding(null);
    setEditing(null);
    setTitle('');
    setDesc('');
  };

  const remove = (id) => {
    setCards((cs) => cs.filter((c) => c.id !== id));
    toast.info('Card deleted.');
  };

  const onDropCol = (colId) => {
    if (!dragId) return;
    setCards((cs) => cs.map((c) => (c.id === dragId ? { ...c, col: colId } : c)));
    setDragId(null);
  };

  const formOpen = adding !== null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-4 items-start">
        {COLS.map((col) => {
          const colCards = cards.filter((c) => c.col === col.id);
          return (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDropCol(col.id)}
              className={`rounded-2xl border border-white/10 bg-gradient-to-b ${col.accent} to-transparent p-3 min-h-[320px]`}
            >
              <div className="flex items-center justify-between px-2 py-2 mb-2">
                <h3 className="font-bold text-sm">
                  {col.name}{' '}
                  <span className="text-xs text-slate-500 font-normal">({colCards.length})</span>
                </h3>
                <button
                  onClick={() => { cancel(); setAdding(col.id); }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"
                  aria-label={`Add card to ${col.name}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <AnimatePresence>
                  {colCards.map((card) => (
                    <motion.div
                      key={card.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      draggable
                      onDragStart={() => setDragId(card.id)}
                      onDragEnd={() => setDragId(null)}
                      className={`rounded-xl border border-white/10 bg-[#14141a] p-3 cursor-grab active:cursor-grabbing ${
                        dragId === card.id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm break-words">{card.title}</p>
                          {card.desc && <p className="text-xs text-slate-500 mt-1 break-words">{card.desc}</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => startEdit(card)} className="p-1.5 rounded hover:bg-white/10 text-slate-500" aria-label="Edit card">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => remove(card.id)} className="p-1.5 rounded hover:bg-white/10 text-slate-500 hover:text-red-400" aria-label="Delete card">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {colCards.length === 0 && (
                  <p className="text-xs text-slate-600 text-center py-6">Drop cards here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={cancel}>
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#14141a] border border-white/10 rounded-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">{editing ? 'Edit card' : 'New card'}</h3>
              <button type="button" onClick={cancel} className="p-1.5 rounded-lg hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Card title"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500/60 mb-3"
            />
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Description (optional)"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500/60 mb-4"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition text-sm inline-flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> {editing ? 'Save changes' : 'Add card'}
            </button>
          </form>
        </div>
      )}

      <p className="text-center text-xs text-slate-600 mt-6">Tip: drag cards between columns to move them.</p>
    </div>
  );
}
