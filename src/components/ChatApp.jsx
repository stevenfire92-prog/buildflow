import { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Trash2, X, MessagesSquare, Hash, Send, Smile } from 'lucide-react';
import { toast } from 'sonner';

const CH_KEY = 'sfchat:channels';
const MSG_KEY = 'sfchat:messages';
const NAME_KEY = 'sfchat:name';

const load = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fb; } catch { return fb; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const DEFAULT_CHANNELS = [
  { id: 'general', name: 'general' },
  { id: 'random', name: 'random' },
  { id: 'announcements', name: 'announcements' },
];

export default function ChatApp() {
  const [name, setName] = useState(() => load(NAME_KEY, ''));
  const [nameInput, setNameInput] = useState('');
  const [channels, setChannels] = useState(() => { const c = load(CH_KEY, null); return c || DEFAULT_CHANNELS; });
  const [messages, setMessages] = useState(() => load(MSG_KEY, []));
  const [active, setActive] = useState('general');
  const [input, setInput] = useState('');
  const [showChModal, setShowChModal] = useState(false);
  const [chName, setChName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const bottomRef = useRef(null);

  const persistC = (n) => { setChannels(n); save(CH_KEY, n); };
  const persistM = (n) => { setMessages(n); save(MSG_KEY, n); };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, active]);

  const activeMsgs = useMemo(() =>
    messages.filter((m) => m.ch === active).sort((a, b) => (a.ts || 0) - (b.ts || 0)).slice(-100),
    [messages, active]);

  const join = () => {
    if (!nameInput.trim()) { toast.error('Pick a display name'); return; }
    setName(nameInput.trim()); save(NAME_KEY, nameInput.trim());
    toast.success(`Welcome, ${nameInput.trim()}!`);
  };

  const send = () => {
    if (!input.trim()) return;
    persistM([...messages, { id: Date.now().toString(), ch: active, from: name, text: input.trim(), ts: Date.now() }]);
    setInput('');
  };

  const addChannel = () => {
    const n = chName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (!n) { toast.error('Channel name is required'); return; }
    if (channels.some((c) => c.name === n)) { toast.error('Channel exists'); return; }
    const ch = { id: Date.now().toString(), name: n };
    persistC([...channels, ch]);
    setActive(ch.id); setShowChModal(false); setChName('');
    toast.success(`#${n} created`);
  };
  const deleteChannel = (id) => {
    if (DEFAULT_CHANNELS.some((c) => c.id === id)) { toast.error("Can't delete default channels"); return; }
    persistC(channels.filter((c) => c.id !== id));
    persistM(messages.filter((m) => m.ch !== id));
    if (active === id) setActive('general');
    setConfirmDelete(null);
    toast.success('Channel deleted');
  };
  const deleteMsg = (id) => persistM(messages.filter((m) => m.id !== id));

  const chNameOf = (id) => (channels.find((c) => c.id === id) || {}).name || id;
  const timeOf = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!name) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <MessagesSquare className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <h2 className="font-black text-2xl mb-2">Join the chat</h2>
          <p className="text-sm text-slate-400 mb-5">Pick a display name to start talking with your team.</p>
          <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && join()}
            placeholder="Your name" autoFocus maxLength={24}
            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500 mb-3 text-center" />
          <button onClick={join} className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">Join</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden" style={{ height: '560px' }}>
        <div className="flex h-full">
          <div className="w-56 shrink-0 border-r border-white/10 p-3 flex flex-col">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Channels</p>
              <button onClick={() => setShowChModal(true)} className="p-1.5 rounded-lg hover:bg-white/10 transition" title="New channel">
                <Plus className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-1 flex-1 overflow-y-auto">
              {channels.map((c) => {
                const unread = 0;
                return (
                  <div key={c.id} className={`group flex items-center rounded-xl ${active === c.id ? 'bg-orange-500/10 border border-orange-500/30' : 'hover:bg-white/5 border border-transparent'}`}>
                    <button onClick={() => setActive(c.id)} className="flex-1 flex items-center gap-2 px-3 py-2 text-left text-sm">
                      <Hash className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className={`truncate ${active === c.id ? 'text-orange-200 font-bold' : 'text-slate-300'}`}>{c.name}</span>
                    </button>
                    {!DEFAULT_CHANNELS.some((d) => d.id === c.id) && (
                      <button onClick={() => setConfirmDelete(c.id)} className="p-1.5 mr-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition">
                        <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {confirmDelete && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-2.5 mt-2">
                <p className="text-xs text-red-300 font-semibold mb-1.5">Delete #{chNameOf(confirmDelete)}?</p>
                <div className="flex gap-1.5">
                  <button onClick={() => deleteChannel(confirmDelete)} className="flex-1 py-1 rounded-lg text-xs font-bold bg-red-600">Yes</button>
                  <button onClick={() => setConfirmDelete(null)} className="flex-1 py-1 rounded-lg text-xs bg-white/5 border border-white/10">No</button>
                </div>
              </div>
            )}
            <div className="pt-3 mt-2 border-t border-white/10">
              <div className="flex items-center gap-2 px-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center font-black text-xs shrink-0">
                  {name.slice(0, 2).toUpperCase()}
                </div>
                <p className="text-sm font-bold truncate flex-1">{name}</p>
                <button onClick={() => { setName(''); save(NAME_KEY, ''); }} className="text-[11px] text-slate-500 hover:text-slate-300">switch</button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
              <Hash className="w-4 h-4 text-slate-500" />
              <p className="font-black">{chNameOf(active)}</p>
              <p className="text-xs text-slate-500 ml-auto">{activeMsgs.length} messages</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeMsgs.length === 0 ? (
                <div className="text-center py-10">
                  <Smile className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No messages yet — say hi! 👋</p>
                </div>
              ) : (
                activeMsgs.map((m) => {
                  const mine = m.from === name;
                  return (
                    <div key={m.id} className={`group flex gap-2.5 ${mine ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${mine ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-white/10'}`}>
                        {(m.from || '?').slice(0, 2).toUpperCase()}
                      </div>
                      <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${mine ? 'bg-orange-500/15 border border-orange-500/25' : 'bg-white/[0.05] border border-white/10'}`}>
                        <p className="text-[11px] font-bold text-slate-400">{m.from} <span className="font-normal text-slate-600">· {timeOf(m.ts)}</span></p>
                        <p className="text-sm mt-0.5 break-words">{m.text}</p>
                      </div>
                      {mine && (
                        <button onClick={() => deleteMsg(m.id)} className="self-center p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition">
                          <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>
            <div className="p-3 border-t border-white/10 flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={`Message #${chNameOf(active)}…`} maxLength={500}
                className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
              <button onClick={send} className="p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showChModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowChModal(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">New Channel</h3>
              <button onClick={() => setShowChModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input value={chName} onChange={(e) => setChName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addChannel()}
              placeholder="channel-name" autoFocus maxLength={24}
              className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <button onClick={addChannel} className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">Create Channel</button>
          </div>
        </div>
      )}
    </div>
  );
}
