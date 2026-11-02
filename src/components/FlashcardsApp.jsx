import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, RotateCcw, Check, X, Layers, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const PREFIX = 'sfflash:';

function load(key, fallback) {
  try {
    const v = localStorage.getItem(PREFIX + key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); } catch {}
}

export default function FlashcardsApp() {
  const [decks, setDecks] = useState(() => load('decks', [
    { id: 'd1', name: 'Sample Deck', cards: [
      { id: 'c1', front: 'What is the capital of France?', back: 'Paris', box: 1 },
      { id: 'c2', front: '2 + 2 = ?', back: '4', box: 1 },
    ]},
  ]));
  const [activeDeck, setActiveDeck] = useState(null);
  const [studyIdx, setStudyIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [showAddCard, setShowAddCard] = useState(false);

  useEffect(() => { save('decks', decks); }, [decks]);

  const deck = decks.find(d => d.id === activeDeck);
  const cards = deck ? [...deck.cards].sort((a, b) => (a.box || 1) - (b.box || 1)) : [];
  const card = cards[studyIdx];

  const addDeck = () => {
    if (!newDeckName.trim()) return;
    setDecks([...decks, { id: 'd' + Date.now(), name: newDeckName.trim(), cards: [] }]);
    setNewDeckName('');
    toast.success('Deck created!');
  };

  const deleteDeck = (id) => {
    setDecks(decks.filter(d => d.id !== id));
    if (activeDeck === id) { setActiveDeck(null); setStudyIdx(0); }
  };

  const addCard = () => {
    if (!newFront.trim() || !newBack.trim() || !deck) return;
    const updated = decks.map(d => d.id === deck.id
      ? { ...d, cards: [...d.cards, { id: 'c' + Date.now(), front: newFront.trim(), back: newBack.trim(), box: 1 }] }
      : d);
    setDecks(updated);
    setNewFront(''); setNewBack('');
    toast.success('Card added!');
  };

  const deleteCard = (cardId) => {
    setDecks(decks.map(d => d.id === deck.id
      ? { ...d, cards: d.cards.filter(c => c.id !== cardId) }
      : d));
    if (studyIdx >= cards.length - 1) setStudyIdx(Math.max(0, cards.length - 2));
  };

  // Spaced repetition: correct → box+1 (max 5), wrong → box 1
  const answer = (correct) => {
    if (!card) return;
    const newBox = correct ? Math.min((card.box || 1) + 1, 5) : 1;
    setDecks(decks.map(d => d.id === deck.id
      ? { ...d, cards: d.cards.map(c => c.id === card.id ? { ...c, box: newBox } : c) }
      : d));
    setFlipped(false);
    if (studyIdx < cards.length - 1) {
      setStudyIdx(studyIdx + 1);
    } else {
      toast.success('Deck complete! 🎉');
      setStudyIdx(0);
    }
  };

  const startStudy = (id) => { setActiveDeck(id); setStudyIdx(0); setFlipped(false); };

  if (activeDeck && deck) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => setActiveDeck(null)} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6">
          <ChevronLeft className="w-4 h-4" /> All decks
        </button>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{deck.name}</h2>
          <span className="text-xs text-slate-500">{cards.length ? `${studyIdx + 1} / ${cards.length}` : 'No cards'}</span>
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No cards yet. Add your first card below.</p>
          </div>
        ) : card && (
          <div className="mb-6">
            <div
              onClick={() => setFlipped(!flipped)}
              className="relative h-64 cursor-pointer"
              style={{ perspective: '1000px' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={flipped ? 'back' : 'front' + card.id}
                  initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`absolute inset-0 rounded-2xl border p-8 flex flex-col items-center justify-center text-center ${
                    flipped
                      ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30'
                      : 'bg-white/[0.03] border-white/10'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">
                    {flipped ? 'Answer' : 'Question'} · Box {card.box || 1}
                  </span>
                  <p className="text-lg font-medium leading-relaxed">{flipped ? card.back : card.front}</p>
                  <p className="text-xs text-slate-500 mt-4">Tap to flip</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {flipped ? (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={() => answer(false)} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 font-bold hover:bg-red-500/25">
                  <X className="w-4 h-4" /> Still learning
                </button>
                <button onClick={() => answer(true)} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold hover:bg-emerald-500/25">
                  <Check className="w-4 h-4" /> Got it
                </button>
              </div>
            ) : (
              <div className="flex justify-between mt-4">
                <button onClick={() => { setFlipped(false); setStudyIdx(Math.max(0, studyIdx - 1)); }} disabled={studyIdx === 0} className="p-2.5 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => deleteCard(card.id)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-red-400">
                  <Trash2 className="w-5 h-5" />
                </button>
                <button onClick={() => { setFlipped(false); setStudyIdx(Math.min(cards.length - 1, studyIdx + 1)); }} disabled={studyIdx === cards.length - 1} className="p-2.5 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 mt-6">
          <button onClick={() => setShowAddCard(!showAddCard)} className="flex items-center gap-2 text-sm font-bold text-orange-300">
            <Plus className="w-4 h-4" /> Add card to this deck
          </button>
          {showAddCard && (
            <div className="mt-4 space-y-3">
              <input value={newFront} onChange={e => setNewFront(e.target.value)} placeholder="Front (question)" className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500/50" />
              <input value={newBack} onChange={e => setNewBack(e.target.value)} placeholder="Back (answer)" className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500/50" />
              <button onClick={addCard} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-sm font-bold">Add Card</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex gap-2 mb-6">
        <input value={newDeckName} onChange={e => setNewDeckName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addDeck()} placeholder="New deck name..." className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500/50" />
        <button onClick={addDeck} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-sm font-bold flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Deck
        </button>
      </div>
      <div className="grid gap-3">
        {decks.map(deck => (
          <div key={deck.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex items-center justify-between hover:border-orange-500/30 transition">
            <button onClick={() => startStudy(deck.id)} className="flex items-center gap-3 text-left flex-1">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold">{deck.name}</p>
                <p className="text-xs text-slate-500">{deck.cards.length} cards</p>
              </div>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => startStudy(deck.id)} className="px-4 py-2 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-300 text-sm font-bold">Study</button>
              <button onClick={() => deleteDeck(deck.id)} className="p-2 rounded-xl text-slate-600 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {decks.length === 0 && (
          <p className="text-center text-slate-500 py-8">No decks yet — create your first one above.</p>
        )}
      </div>
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-slate-500 leading-relaxed">
        <p className="font-bold text-slate-400 mb-1">How spaced repetition works</p>
        <p>Cards start in Box 1. Get one right and it moves up a box (shown less often). Get it wrong and it drops back to Box 1 (shown more often). Cards are sorted so you always see the ones you need most.</p>
      </div>
    </div>
  );
}
