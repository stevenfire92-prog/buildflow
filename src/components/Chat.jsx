import { useEffect, useRef, useState } from 'react';
import {
  MessageSquare, Plus, Trash2, Download, Send, Menu, X,
  Flame, Bot,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getConversations, saveConversation, deleteConversation,
  clearConversations, newConversation, deriveTitle,
  generateReply, makeMessage,
} from '../lib/aichat';

function fmtTime(ts) {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const thinkingTimer = useRef(null);

  // Load from localStorage on mount
  useEffect(() => {
    let convs = getConversations();
    if (convs.length === 0) {
      const fresh = newConversation();
      saveConversation(fresh);
      convs = [fresh];
    }
    setConversations(convs);
    setActiveId(convs[0].id);
    return () => {
      if (thinkingTimer.current) clearTimeout(thinkingTimer.current);
    };
  }, []);

  const active = conversations.find((c) => c.id === activeId) || conversations[0];

  // Persist helper — updates state + localStorage
  const persist = (conv) => {
    const saved = saveConversation(conv);
    setConversations((prev) => {
      const rest = prev.filter((c) => c.id !== saved.id);
      return [saved, ...rest].sort((a, b) => b.updatedAt - a.updatedAt);
    });
    return saved;
  };

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.messages?.length, thinking]);

  const send = () => {
    const text = input.trim();
    if (!text || thinking || !active) return;

    const conv = { ...active, messages: [...active.messages, makeMessage('user', text)] };
    if (conv.messages.length === 1 || conv.title === 'New chat') {
      conv.title = deriveTitle(text);
    }
    const saved = persist(conv);
    setInput('');
    setThinking(true);

    const delay = 700 + Math.random() * 900;
    thinkingTimer.current = setTimeout(() => {
      const reply = generateReply(text);
      const updated = {
        ...saved,
        messages: [...saved.messages, makeMessage('ai', reply)],
      };
      persist(updated);
      setThinking(false);
      inputRef.current?.focus();
    }, delay);
  };

  const startNew = () => {
    if (thinkingTimer.current) clearTimeout(thinkingTimer.current);
    setThinking(false);
    const fresh = newConversation();
    saveConversation(fresh);
    setConversations((prev) => [fresh, ...prev]);
    setActiveId(fresh.id);
    setSidebarOpen(false);
    inputRef.current?.focus();
  };

  const remove = (id, e) => {
    e.stopPropagation();
    deleteConversation(id);
    setConversations((prev) => {
      const rest = prev.filter((c) => c.id !== id);
      if (id === activeId) {
        if (rest.length > 0) {
          setActiveId(rest[0].id);
        } else {
          const fresh = newConversation();
          saveConversation(fresh);
          setActiveId(fresh.id);
          return [fresh];
        }
      }
      return rest;
    });
    toast.success('Chat deleted');
  };

  const clearAll = () => {
    if (!window.confirm('Delete all chats? This cannot be undone.')) return;
    if (thinkingTimer.current) clearTimeout(thinkingTimer.current);
    setThinking(false);
    clearConversations();
    const fresh = newConversation();
    saveConversation(fresh);
    setConversations([fresh]);
    setActiveId(fresh.id);
    toast.success('All chats cleared');
  };

  const exportAll = () => {
    try {
      const blob = new Blob([JSON.stringify(getConversations(), null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'se-fire-ai-chat.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Chats exported');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="mx-auto max-w-5xl w-full">
      <div className="flex h-[70vh] min-h-[480px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        {/* Sidebar — desktop */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-white/10 bg-black/30">
          <SidebarBody
            conversations={conversations}
            activeId={activeId}
            onSelect={setActiveId}
            onNew={startNew}
            onDelete={remove}
            onClear={clearAll}
            onExport={exportAll}
          />
        </aside>

        {/* Sidebar — mobile overlay */}
        <div
          className={`fixed inset-0 z-40 bg-black/70 transition-opacity md:hidden ${
            sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 shrink-0 flex-col border-r border-white/10 bg-[#0d0d13] transition-transform duration-300 md:hidden flex ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarBody
            conversations={conversations}
            activeId={activeId}
            onSelect={(id) => {
              setActiveId(id);
              setSidebarOpen(false);
            }}
            onNew={startNew}
            onDelete={remove}
            onClear={clearAll}
            onExport={exportAll}
          />
        </aside>

        {/* Main panel */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-3">
            <button
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open chats"
            >
              <Menu className="h-5 w-5" />
            </button>
            <MessageSquare className="h-5 w-5 text-orange-400" />
            <h2 className="truncate font-bold">Se Fire AI Chat</h2>
            <span className="ml-auto hidden items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-300 sm:flex">
              <Flame className="h-3 w-3" /> Free demo
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
            {active?.messages?.length === 0 && !thinking && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Bot className="mb-3 h-10 w-10 text-orange-400/60" />
                <p className="font-semibold text-slate-200">Start the conversation</p>
                <p className="mt-1 max-w-xs text-sm text-slate-500">
                  Ask me anything — ideas, questions, or just talk. I’m here for it.
                </p>
              </div>
            )}
            {active?.messages?.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 sm:max-w-[75%] ${
                    m.role === 'user'
                      ? 'rounded-br-md bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      : 'rounded-bl-md bg-white/[0.07] text-slate-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.text}</p>
                  <p className={`mt-1 text-right text-[10px] ${m.role === 'user' ? 'text-white/70' : 'text-slate-500'}`}>
                    {fmtTime(m.ts)}
                  </p>
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-white/[0.07] px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-orange-400" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-orange-400" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-orange-400" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-3 sm:p-4">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
                placeholder="Ask anything…"
                className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-orange-500/60 focus:outline-none"
              />
              <button
                onClick={send}
                disabled={!input.trim() || thinking}
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-slate-600">
              Demo AI — responses are simulated in your browser. Nothing leaves your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarBody({ conversations, activeId, onSelect, onNew, onDelete, onClear, onExport }) {
  return (
    <>
      <div className="p-3">
        <button
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New chat
        </button>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
        {conversations.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-slate-600">No chats yet.</p>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${
              c.id === activeId ? 'bg-orange-500/15 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="h-4 w-4 shrink-0 opacity-60" />
            <span className="min-w-0 flex-1 truncate">{c.title}</span>
            <button
              onClick={(e) => onDelete(c.id, e)}
              aria-label="Delete chat"
              className="shrink-0 rounded p-1 text-slate-600 opacity-0 transition group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-white/10 p-3">
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:bg-white/5 hover:text-slate-200"
        >
          <Download className="h-3.5 w-3.5" /> Export
        </button>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:bg-red-500/10 hover:text-red-400"
        >
          <X className="h-3.5 w-3.5" /> Clear all
        </button>
      </div>
    </>
  );
}
