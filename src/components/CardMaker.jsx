import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Download, RotateCw, X, User, Briefcase, Building2, Phone, Mail, Globe, AtSign } from 'lucide-react';
import { toast } from 'sonner';
import { getCards, addCard, updateCard, deleteCard, downloadVCard } from '../lib/cards';

const THEMES = [
  { id: 'ember', name: 'Ember', bg: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)', text: '#ffffff', accent: '#fdba74' },
  { id: 'midnight', name: 'Midnight', bg: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', text: '#e0e7ff', accent: '#818cf8' },
  { id: 'forest', name: 'Forest', bg: 'linear-gradient(135deg, #065f46 0%, #064e3b 100%)', text: '#d1fae5', accent: '#6ee7b7' },
  { id: 'royal', name: 'Royal', bg: 'linear-gradient(135deg, #6b21a8 0%, #3b0764 100%)', text: '#f5f3ff', accent: '#c4b5fd' },
  { id: 'ocean', name: 'Ocean', bg: 'linear-gradient(135deg, #0c4a6e 0%, #082f49 100%)', text: '#e0f2fe', accent: '#7dd3fc' },
  { id: 'onyx', name: 'Onyx', bg: 'linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)', text: '#fafaf9', accent: '#fbbf24' },
];

const emptyForm = {
  name: '', title: '', company: '', phone: '', email: '', website: '',
  twitter: '', instagram: '', linkedin: '', theme: 'ember',
};

function CardPreview({ data, flipped, onFlip }) {
  const theme = THEMES.find((t) => t.id === data.theme) || THEMES[0];
  const initials = (data.name || 'SF').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div
      onClick={onFlip}
      className="cursor-pointer select-none"
      style={{ perspective: '1200px' }}
      title="Click to flip"
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full aspect-[8/5]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden"
          style={{ background: theme.bg, color: theme.text, backfaceVisibility: 'hidden' }}
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-full grid place-items-center font-black text-lg"
              style={{ background: 'rgba(255,255,255,0.18)', color: theme.text }}>
              {initials}
            </div>
            <span className="text-xs font-bold uppercase tracking-widest opacity-70">Se Fire Cards</span>
          </div>
          <div>
            <p className="text-2xl font-black leading-tight">{data.name || 'Your Name'}</p>
            {data.title && <p className="text-sm opacity-80 mt-0.5">{data.title}</p>}
            {data.company && <p className="text-sm font-semibold mt-1" style={{ color: theme.accent }}>{data.company}</p>}
          </div>
          <div className="space-y-1 text-xs opacity-85">
            {data.phone && <p>📞 {data.phone}</p>}
            {data.email && <p>✉️ {data.email}</p>}
            {data.website && <p>🌐 {data.website}</p>}
          </div>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center gap-3 overflow-hidden"
          style={{ background: theme.bg, color: theme.text, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="w-16 h-16 rounded-full grid place-items-center font-black text-xl"
            style={{ background: 'rgba(255,255,255,0.18)', color: theme.text }}>
            {initials}
          </div>
          <p className="font-black text-lg">{data.name || 'Your Name'}</p>
          <div className="flex gap-3 text-sm opacity-90">
            {data.twitter && <span>@{data.twitter.replace(/^@/, '')}</span>}
            {data.instagram && <span>IG: {data.instagram.replace(/^@/, '')}</span>}
            {data.linkedin && <span>in/{data.linkedin}</span>}
          </div>
          {!data.twitter && !data.instagram && !data.linkedin && (
            <p className="text-xs opacity-60">Add social links in the editor</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

const fields = [
  { key: 'name', label: 'Full name', icon: User, placeholder: 'Steven Turcott' },
  { key: 'title', label: 'Job title', icon: Briefcase, placeholder: 'Founder, Se Fire Tech' },
  { key: 'company', label: 'Company', icon: Building2, placeholder: 'Se Fire Tech' },
  { key: 'phone', label: 'Phone', icon: Phone, placeholder: '+1 416 555 0100', type: 'tel' },
  { key: 'email', label: 'Email', icon: Mail, placeholder: 'you@example.com', type: 'email' },
  { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://sefire.tech' },
  { key: 'twitter', label: 'X / Twitter', icon: AtSign, placeholder: '@sefire' },
  { key: 'instagram', label: 'Instagram', icon: AtSign, placeholder: '@sefire' },
  { key: 'linkedin', label: 'LinkedIn', icon: AtSign, placeholder: 'sefire' },
];

export default function CardMaker() {
  const [cards, setCards] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    setCards(getCards());
  }, []);

  const refresh = () => setCards(getCards());

  const handleChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = (e) => {
    e?.preventDefault();
    if (!form.name.trim()) {
      toast.error('Give your card a name first');
      return;
    }
    if (editingId) {
      updateCard(editingId, form);
      toast.success('Card updated ✓');
    } else {
      addCard(form);
      toast.success('Card saved! 🎴');
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowEditor(false);
    refresh();
  };

  const handleEdit = (card) => {
    setForm({
      name: card.name || '', title: card.title || '', company: card.company || '',
      phone: card.phone || '', email: card.email || '', website: card.website || '',
      twitter: card.twitter || '', instagram: card.instagram || '',
      linkedin: card.linkedin || '', theme: card.theme || 'ember',
    });
    setEditingId(card.id);
    setFlipped(false);
    setShowEditor(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id, name) => {
    deleteCard(id);
    refresh();
    toast.success(`"${name}" deleted`);
  };

  const handleNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFlipped(false);
    setShowEditor(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">Digital Business Cards</h1>
          <p className="text-slate-400 text-sm mt-1">
            {cards.length} card{cards.length !== 1 ? 's' : ''} saved · click a card to flip it
          </p>
        </div>
        <button
          onClick={() => (showEditor ? setShowEditor(false) : handleNew())}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition"
        >
          {showEditor ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showEditor ? 'Cancel' : 'New card'}
        </button>
      </div>

      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Editor form */}
              <form onSubmit={handleSave} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
                {fields.map(({ key, label, icon: Icon, placeholder, type }) => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-slate-400 mb-1 block">{label}</label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        value={form[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={placeholder}
                        type={type || 'text'}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-orange-400/50"
                      />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-2 block">Theme</label>
                  <div className="grid grid-cols-3 gap-2">
                    {THEMES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleChange('theme', t.id)}
                        className={`rounded-xl p-2 text-left transition ${form.theme === t.id ? 'ring-2 ring-orange-400' : 'opacity-70 hover:opacity-100'}`}
                        style={{ background: t.bg }}
                      >
                        <span className="text-xs font-bold" style={{ color: t.text }}>{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition"
                >
                  {editingId ? 'Save changes' : 'Save card'}
                </button>
              </form>

              {/* Live preview */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Live preview</span>
                  <button
                    type="button"
                    onClick={() => setFlipped(!flipped)}
                    className="flex items-center gap-1.5 text-xs font-bold text-orange-300 hover:text-orange-200"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Flip
                  </button>
                </div>
                <CardPreview data={form} flipped={flipped} onFlip={() => setFlipped(!flipped)} />
                <button
                  type="button"
                  onClick={() => {
                    downloadVCard(form);
                    toast.success('vCard downloaded — import it anywhere 📇');
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold border border-white/15 hover:border-orange-400/40 transition text-sm"
                >
                  <Download className="w-4 h-4" /> Download .vcf
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {cards.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/10">
          <User className="w-12 h-12 mx-auto text-slate-700 mb-4" />
          <p className="text-slate-400 mb-2">No cards yet</p>
          <p className="text-sm text-slate-500">Create your first digital business card above.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <CardPreview data={card} flipped={false} onFlip={() => handleEdit(card)} />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEdit(card)}
                  className="flex-1 py-2 rounded-xl text-sm font-bold border border-white/10 hover:border-orange-400/40 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    downloadVCard(card);
                    toast.success('vCard downloaded 📇');
                  }}
                  className="flex-1 py-2 rounded-xl text-sm font-bold border border-white/10 hover:border-emerald-400/40 transition flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> vCard
                </button>
                <button
                  onClick={() => handleDelete(card.id, card.name)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
