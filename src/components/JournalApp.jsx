import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Search,
  Trash2,
  Flame,
  BookOpen,
  Type,
  Check,
} from 'lucide-react';
import {
  MOODS,
  toKey,
  keyToDate,
  todayKey,
  formatLong,
  formatShort,
  moodById,
  loadEntries,
  saveEntry,
  deleteEntry,
  searchEntries,
  wordCount,
  currentStreak,
} from '../lib/journal';

function shiftDay(key, delta) {
  const d = keyToDate(key);
  d.setDate(d.getDate() + delta);
  return toKey(d);
}

function Calendar({ viewedMonth, entries, onSelect, selectedKey }) {
  const year = viewedMonth.getFullYear();
  const month = viewedMonth.getMonth();
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = viewedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const [mYear, mMonth] = [viewedMonth.getFullYear(), viewedMonth.getMonth()];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => onSelect('month', -1)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <CalendarIcon size={16} className="text-amber-400" />
          {monthLabel}
        </span>
        <button
          onClick={() => onSelect('month', 1)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-gray-500">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={`e-${i}`} />;
          const key = `${mYear}-${String(mMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const hasEntry = !!entries[key];
          const isSelected = key === selectedKey;
          const isToday = key === todayKey();
          return (
            <button
              key={key}
              onClick={() => onSelect('day', key)}
              className={`relative flex h-9 flex-col items-center justify-center rounded-lg text-xs transition ${
                isSelected
                  ? 'bg-amber-500 font-bold text-black'
                  : isToday
                    ? 'bg-white/10 font-bold text-white'
                    : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              {d}
              {hasEntry && !isSelected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function JournalApp() {
  const [currentKey, setCurrentKey] = useState(todayKey());
  const [entries, setEntries] = useState(() => loadEntries());
  const [mood, setMood] = useState(null);
  const [text, setText] = useState('');
  const [savedTick, setSavedTick] = useState(0);
  const [query, setQuery] = useState('');
  const [viewedMonth, setViewedMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const saveTimer = useRef(null);

  const currentEntry = entries[currentKey];

  // Load entry data when the date changes
  useEffect(() => {
    const e = entries[currentKey];
    setMood(e?.mood || null);
    setText(e?.text || '');
    setConfirmDelete(false);
    setSavedTick(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey]);

  // Debounced autosave
  const scheduleSave = useCallback(
    (nextText, nextMood) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const updated = saveEntry(currentKey, nextMood, nextText);
        setEntries(updated);
        setSavedTick((t) => t + 1);
      }, 800);
    },
    [currentKey]
  );

  useEffect(() => () => saveTimer.current && clearTimeout(saveTimer.current), []);

  const handleTextChange = (v) => {
    setText(v);
    scheduleSave(v, mood);
  };

  const handleMoodChange = (m) => {
    setMood(m);
    if (text.trim()) scheduleSave(text, m);
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    const updated = deleteEntry(currentKey);
    setEntries(updated);
    setText('');
    setMood(null);
    setConfirmDelete(false);
    setSavedTick(0);
    toast.success('Entry deleted');
  };

  const handleCalendar = (action, payload) => {
    if (action === 'month') {
      setViewedMonth((m) => new Date(m.getFullYear(), m.getMonth() + payload, 1));
    } else if (action === 'day') {
      setCurrentKey(payload);
      const d = keyToDate(payload);
      setViewedMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  };

  const results = useMemo(() => searchEntries(query), [query, entries]);
  const words = wordCount(text);
  const totalEntries = Object.keys(entries).length;
  const totalWords = useMemo(
    () => Object.values(entries).reduce((sum, e) => sum + wordCount(e.text), 0),
    [entries]
  );
  const streak = useMemo(() => currentStreak(entries), [entries]);

  const snippet = (t) =>
    t.length > 90 ? t.slice(0, 90).trim() + '…' : t;

  return (
    <div className="w-full">
      {/* Stats row */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <BookOpen size={22} className="shrink-0 text-amber-400" />
          <div>
            <div className="text-2xl font-bold text-white">{totalEntries}</div>
            <div className="text-xs text-gray-400">Entries</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <Type size={22} className="shrink-0 text-amber-400" />
          <div>
            <div className="text-2xl font-bold text-white">{totalWords.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Words</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <Flame size={22} className="shrink-0 text-amber-400" />
          <div>
            <div className="text-2xl font-bold text-white">{streak}</div>
            <div className="text-xs text-gray-400">Day streak</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main editor panel */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
          {/* Date navigation */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setCurrentKey((k) => shiftDay(k, -1))}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-gray-300 hover:bg-white/10"
            >
              <ChevronLeft size={18} /> Prev
            </button>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{formatLong(currentKey)}</div>
              {currentKey !== todayKey() && (
                <button
                  onClick={() => setCurrentKey(todayKey())}
                  className="mt-1 rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30"
                >
                  Jump to Today
                </button>
              )}
            </div>
            <button
              onClick={() => setCurrentKey((k) => shiftDay(k, 1))}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-gray-300 hover:bg-white/10"
            >
              Next <ChevronRight size={18} />
            </button>
          </div>

          <div className="mb-5">
            <input
              type="date"
              value={currentKey}
              max={todayKey()}
              onChange={(e) => e.target.value && setCurrentKey(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white [color-scheme:dark]"
            />
          </div>

          {/* Mood selector */}
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
            How are you feeling?
          </div>
          <div className="mb-5 flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m.id}
                onClick={() => handleMoodChange(m.id)}
                title={m.label}
                className={`flex flex-col items-center rounded-xl border px-4 py-2.5 transition ${
                  mood === m.id
                    ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                    : 'border-white/10 bg-black/30 hover:border-white/25'
                }`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className={`mt-1 text-[10px] ${mood === m.id ? 'text-amber-300' : 'text-gray-400'}`}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Dear diary… what's on your mind today?"
            rows={12}
            className="w-full resize-y rounded-xl border border-white/10 bg-black/40 p-4 text-[16px] leading-relaxed text-white placeholder-gray-500 outline-none focus:border-amber-400/60"
          />

          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {words} {words === 1 ? 'word' : 'words'}
            </span>
            {savedTick > 0 && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <Check size={14} /> Saved
              </span>
            )}
          </div>

          {currentEntry && (
            <button
              onClick={handleDelete}
              className={`mt-4 flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
                confirmDelete
                  ? 'border-red-500 bg-red-500/20 text-red-300'
                  : 'border-white/10 text-gray-400 hover:border-red-500/50 hover:text-red-300'
              }`}
            >
              <Trash2 size={16} />
              {confirmDelete ? 'Tap again to confirm delete' : 'Delete entry'}
            </button>
          )}
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-6">
          <Calendar
            viewedMonth={viewedMonth}
            entries={entries}
            onSelect={handleCalendar}
            selectedKey={currentKey}
          />

          {/* Search */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2">
              <Search size={16} className="shrink-0 text-gray-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your journal…"
                className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none"
              />
            </div>
            {query.trim() && (
              <div className="max-h-72 overflow-y-auto">
                {results.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-500">No matches found.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {results.map(({ key, entry }) => {
                      const m = moodById(entry.mood);
                      return (
                        <button
                          key={key}
                          onClick={() => setCurrentKey(key)}
                          className="rounded-xl border border-white/10 bg-black/30 p-3 text-left transition hover:border-amber-400/40"
                        >
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span className="font-semibold text-gray-300">{formatShort(key)}</span>
                            {m && <span className="text-base" title={m.label}>{m.emoji}</span>}
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm text-gray-300">
                            {snippet(entry.text.replace(/\s+/g, ' '))}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
