import { useState, useMemo, useEffect } from 'react'
import {
  Lock, LockOpen, Plus, Search, Star, X, Save, Trash2,
  ShieldCheck, KeyRound, AlertTriangle, Eye, EyeOff,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  loadNotes, saveNotes, hasPin, setPin, verifyPin, clearVault,
  CATEGORIES, uid,
} from '../lib/vault'

const CATEGORY_COLORS = {
  Personal: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  Work: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
  Finance: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  Other: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/40',
}

function PinPad({ value, onChange, onSubmit, submitLabel, submitting }) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit() }}
      className="flex flex-col items-center gap-4"
    >
      <div className="flex gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-14 h-16 rounded-xl border-2 flex items-center justify-center text-3xl font-bold transition-colors ${
              value[i] ? 'border-amber-400 bg-amber-400/10 text-amber-300' : 'border-zinc-700 bg-zinc-900 text-transparent'
            }`}
          >
            {value[i] ? '•' : '·'}
          </div>
        ))}
      </div>
      <input
        type="password"
        inputMode="numeric"
        autoComplete="new-password"
        maxLength={4}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
        placeholder="Enter 4-digit PIN"
        className="w-56 text-center text-lg rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none focus:border-amber-400 placeholder:text-zinc-600"
        aria-label="PIN"
      />
      <button
        type="submit"
        disabled={submitting || value.length !== 4}
        className="w-56 rounded-xl bg-amber-400 text-black font-semibold py-3 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-300 transition-colors"
      >
        {submitting ? 'Working…' : submitLabel}
      </button>
    </form>
  )
}

export default function VaultApp() {
  const [pinSet, setPinSet] = useState(() => hasPin())
  const [unlocked, setUnlocked] = useState(false)
  const [pin, setPinInput] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [busy, setBusy] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [notes, setNotes] = useState(() => loadNotes())
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [editing, setEditing] = useState(null) // note object or 'new'

  useEffect(() => {
    if (unlocked) setNotes(loadNotes())
  }, [unlocked])

  const handleSetPin = async () => {
    if (pin.length !== 4) { toast.error('PIN must be 4 digits'); return }
    if (showConfirm && confirmPin !== pin) { toast.error('PINs do not match'); return }
    if (!showConfirm) { setShowConfirm(true); return }
    setBusy(true)
    const ok = await setPin(pin)
    setBusy(false)
    if (ok) {
      setPinSet(true)
      setUnlocked(true)
      setPinInput('')
      setConfirmPin('')
      setShowConfirm(false)
      toast.success('PIN set — vault unlocked')
    } else {
      toast.error('Could not save PIN')
    }
  }

  const handleUnlock = async () => {
    if (pin.length !== 4) { toast.error('Enter your 4-digit PIN'); return }
    setBusy(true)
    const ok = await verifyPin(pin)
    setBusy(false)
    if (ok) {
      setUnlocked(true)
      setPinInput('')
      toast.success('Vault unlocked')
    } else {
      toast.error('Wrong PIN — try again')
    }
  }

  const handleReset = () => {
    if (confirm('Reset vault? This permanently deletes your PIN and all notes.')) {
      clearVault()
      setPinSet(false)
      setUnlocked(false)
      setNotes([])
      setPinInput('')
      setConfirmPin('')
      setShowConfirm(false)
      toast.success('Vault reset')
    }
  }

  const persist = (next) => {
    setNotes(next)
    if (!saveNotes(next)) toast.error('Could not save notes')
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return notes
      .filter((n) => (categoryFilter === 'All' ? true : n.category === categoryFilter))
      .filter((n) => (favoritesOnly ? n.favorite : true))
      .filter((n) =>
        q
          ? (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q)
          : true
      )
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  }, [notes, query, categoryFilter, favoritesOnly])

  const toggleFavorite = (id) => {
    persist(notes.map((n) => (n.id === id ? { ...n, favorite: !n.favorite, updatedAt: new Date().toISOString() } : n)))
  }

  const saveNote = (note) => {
    if (!note.title.trim() && !note.content.trim()) { toast.error('Note is empty'); return }
    const now = new Date().toISOString()
    if (note.id) {
      persist(notes.map((n) => (n.id === note.id ? { ...note, updatedAt: now } : n)))
      toast.success('Note saved')
    } else {
      persist([...notes, { ...note, id: uid(), createdAt: now, updatedAt: now }])
      toast.success('Note created')
    }
    setEditing(null)
  }

  const deleteNote = (id) => {
    if (confirm('Delete this note permanently?')) {
      persist(notes.filter((n) => n.id !== id))
      setEditing(null)
      toast.success('Note deleted')
    }
  }

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return ''
    }
  }

  // ── Locked / setup screens ──────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="max-w-md mx-auto rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 text-center">
        <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
          {pinSet ? <Lock className="w-8 h-8 text-amber-300" /> : <KeyRound className="w-8 h-8 text-amber-300" />}
        </div>
        <h2 className="text-2xl font-bold mb-1">
          {pinSet ? 'Vault is locked' : 'Set your 4-digit PIN'}
        </h2>
        <p className="text-zinc-400 text-sm mb-6">
          {pinSet
            ? 'Enter your PIN to unlock your private notes.'
            : 'Choose a PIN only you know. Your notes stay on this device.'}
        </p>

        {pinSet ? (
          <PinPad value={pin} onChange={setPinInput} onSubmit={handleUnlock} submitLabel="Unlock vault" submitting={busy} />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-14 h-16 rounded-xl border-2 flex items-center justify-center text-3xl font-bold ${
                    pin[i] ? 'border-amber-400 bg-amber-400/10 text-amber-300' : 'border-zinc-700 bg-zinc-900 text-transparent'
                  }`}
                >
                  {pin[i] ? '•' : '·'}
                </div>
              ))}
            </div>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              maxLength={4}
              value={pin}
              onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4)); setShowConfirm(false) }}
              placeholder="Choose a 4-digit PIN"
              className="w-56 text-center text-lg rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none focus:border-amber-400 placeholder:text-zinc-600"
            />
            {showConfirm && (
              <input
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Confirm your PIN"
                className="w-56 text-center text-lg rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none focus:border-amber-400 placeholder:text-zinc-600"
              />
            )}
            <button
              onClick={handleSetPin}
              disabled={busy || pin.length !== 4}
              className="w-56 rounded-xl bg-amber-400 text-black font-semibold py-3 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-300 transition-colors"
            >
              {busy ? 'Working…' : showConfirm ? 'Confirm PIN' : 'Continue'}
            </button>
          </div>
        )}

        {pinSet && (
          <button onClick={handleReset} className="mt-6 text-xs text-zinc-500 hover:text-red-400 underline">
            Forgot PIN? Reset vault
          </button>
        )}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          PIN is hashed on this device — never leaves it.
        </div>
      </div>
    )
  }

  // ── Unlocked vault ──────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 text-amber-300 font-semibold">
          <LockOpen className="w-5 h-5" /> Vault open
        </div>
        <div className="flex-1" />
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            className="rounded-xl bg-zinc-900 border border-zinc-700 pl-9 pr-3 py-2 text-sm outline-none focus:border-amber-400 placeholder:text-zinc-600"
          />
        </div>
        <button
          onClick={() => setUnlocked(false)}
          className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:border-amber-400 hover:text-amber-300 transition-colors"
        >
          <Lock className="w-4 h-4" /> Lock
        </button>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-2 rounded-xl bg-amber-400 text-black font-semibold px-4 py-2 text-sm hover:bg-amber-300 transition-colors"
        >
          <Plus className="w-4 h-4" /> New note
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {['All', ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              categoryFilter === c
                ? 'bg-amber-400 text-black border-amber-400'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            {c}
          </button>
        ))}
        <button
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
            favoritesOnly
              ? 'bg-amber-400 text-black border-amber-400'
              : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
          }`}
        >
          <Star className="w-3.5 h-3.5" /> Favorites
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl">
          <Lock className="w-10 h-10 mx-auto mb-4 text-zinc-700" />
          <p className="text-zinc-400 font-medium">
            {notes.length === 0 ? 'Your vault is empty' : 'No notes match your search'}
          </p>
          <p className="text-zinc-600 text-sm mt-1">
            {notes.length === 0
              ? 'Tap "New note" to lock away your first secret.'
              : 'Try a different search or category.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((note) => (
            <div
              key={note.id}
              onClick={() => setEditing(note)}
              className="cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 hover:border-amber-400/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold truncate">{note.title || 'Untitled'}</h3>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(note.id) }}
                  className={`shrink-0 ${note.favorite ? 'text-amber-300' : 'text-zinc-600 hover:text-amber-300'}`}
                  aria-label="Toggle favorite"
                >
                  <Star className={`w-4 h-4 ${note.favorite ? 'fill-amber-300' : ''}`} />
                </button>
              </div>
              <p className="text-sm text-zinc-400 line-clamp-2 mb-3 min-h-[2.5rem]">
                {note.content || <span className="text-zinc-600 italic">Empty note</span>}
              </p>
              <div className="flex items-center justify-between">
                <span className={`text-xs border rounded-full px-2.5 py-0.5 ${CATEGORY_COLORS[note.category] || CATEGORY_COLORS.Other}`}>
                  {note.category}
                </span>
                <span className="text-xs text-zinc-600">{formatDate(note.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <NoteEditor
          note={editing === 'new' ? { title: '', content: '', category: 'Personal', favorite: false } : editing}
          onClose={() => setEditing(null)}
          onSave={saveNote}
          onDelete={deleteNote}
        />
      )}
    </div>
  )
}

function NoteEditor({ note, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(note.title || '')
  const [content, setContent] = useState(note.content || '')
  const [category, setCategory] = useState(note.category || 'Personal')
  const [favorite, setFavorite] = useState(!!note.favorite)
  const [showContent, setShowContent] = useState(true)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{note.id ? 'Edit note' : 'New note'}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 mb-3 outline-none focus:border-amber-400 placeholder:text-zinc-600"
        />

        <div className="flex items-center gap-3 mb-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm outline-none focus:border-amber-400"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={() => setFavorite(!favorite)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
              favorite ? 'border-amber-400 text-amber-300' : 'border-zinc-700 text-zinc-400'
            }`}
          >
            <Star className={`w-4 h-4 ${favorite ? 'fill-amber-300' : ''}`} /> Favorite
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setShowContent(!showContent)}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300"
          >
            {showContent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showContent ? 'Hide' : 'Show'}
          </button>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write it down… it's safe here."
          rows={8}
          className={`w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none focus:border-amber-400 placeholder:text-zinc-600 resize-y ${
            showContent ? '' : 'blur-md select-none'
          }`}
        />

        <div className="flex items-center gap-3 mt-5">
          {note.id && (
            <button
              onClick={() => onDelete(note.id)}
              className="flex items-center gap-2 rounded-xl border border-red-900/60 text-red-400 px-4 py-2.5 text-sm hover:bg-red-950/50 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm hover:border-zinc-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ ...note, title, content, category, favorite })}
            className="flex items-center gap-2 rounded-xl bg-amber-400 text-black font-semibold px-5 py-2.5 text-sm hover:bg-amber-300 transition-colors"
          >
            <Save className="w-4 h-4" /> Save
          </button>
        </div>

        <div className="mt-4 flex items-start gap-2 text-xs text-zinc-600">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          Notes are stored only in this browser. Losing your PIN means losing access — use "Forgot PIN? Reset vault" to start over.
        </div>
      </div>
    </div>
  )
}

