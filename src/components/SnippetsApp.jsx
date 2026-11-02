import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Copy, Search, Tag, Code2, Check, X, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const PREFIX = 'sfsnip:';
const LANGS = ['javascript', 'python', 'html', 'css', 'sql', 'bash', 'json', 'other'];

function load(key, fallback) {
  try {
    const v = localStorage.getItem(PREFIX + key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); } catch {}
}

// Lightweight keyword highlighter (CSS-based, no deps)
function highlight(code, lang) {
  const keywords = {
    javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'from', 'new', 'class', 'await', 'async', 'try', 'catch', 'throw', 'typeof', 'true', 'false', 'null', 'undefined'],
    python: ['def', 'return', 'if', 'else', 'elif', 'for', 'while', 'import', 'from', 'class', 'try', 'except', 'with', 'as', 'lambda', 'True', 'False', 'None', 'pass', 'raise', 'in', 'not', 'and', 'or'],
    sql: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'ON', 'GROUP', 'ORDER', 'BY', 'HAVING', 'LIMIT', 'CREATE', 'TABLE', 'INTO', 'VALUES', 'SET', 'AND', 'OR', 'NOT', 'NULL', 'AS'],
    bash: ['echo', 'cd', 'ls', 'mkdir', 'rm', 'cp', 'mv', 'grep', 'find', 'if', 'then', 'else', 'fi', 'for', 'do', 'done', 'while', 'export', 'sudo', 'npm', 'git'],
    css: ['color', 'background', 'margin', 'padding', 'display', 'flex', 'grid', 'border', 'font-size', 'width', 'height'],
    html: ['div', 'span', 'p', 'a', 'img', 'html', 'head', 'body', 'script', 'style', 'class', 'id'],
    json: ['true', 'false', 'null'],
  };
  const kw = keywords[lang] || keywords.javascript;
  // Escape HTML first
  let esc = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Strings
  esc = esc.replace(/(&quot;.*?&quot;|".*?"|'.*?')/g, '<span class="tok-str">$1</span>');
  // Comments
  esc = esc.replace(/(\/\/.*$|#.*$|--.*$)/gm, '<span class="tok-com">$1</span>');
  // Keywords
  kw.forEach(k => {
    const re = new RegExp(`(?![\\w-])${k}(?![\\w-])`, 'g');
    esc = esc.replace(re, `<span class="tok-kw">${k}</span>`);
  });
  // Numbers
  esc = esc.replace(/\b(\d+\.?\d*)\b/g, '<span class="tok-num">$1</span>');
  return esc;
}

export default function SnippetsApp() {
  const [snippets, setSnippets] = useState(() => load('snippets', [
    { id: 's1', title: 'Debounce function', lang: 'javascript', tags: ['util', 'js'],
      code: 'function debounce(fn, ms) {\n  let t;\n  return (...args) => {\n    clearTimeout(t);\n    t = setTimeout(() => fn(...args), ms);\n  };\n}' },
    { id: 's2', title: 'Read JSON file (Python)', lang: 'python', tags: ['python', 'io'],
      code: 'import json\n\nwith open("data.json") as f:\n    data = json.load(f)\nprint(data)' },
  ]));
  const [query, setQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [langFilter, setLangFilter] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', lang: 'javascript', tags: '', code: '' });

  useEffect(() => { save('snippets', snippets); }, [snippets]);

  const allTags = useMemo(() => {
    const s = new Set();
    snippets.forEach(sn => (sn.tags || []).forEach(t => s.add(t)));
    return [...s].sort();
  }, [snippets]);

  const filtered = snippets.filter(sn => {
    const q = query.toLowerCase();
    const matchQ = !q || sn.title.toLowerCase().includes(q) || sn.code.toLowerCase().includes(q);
    const matchT = !tagFilter || (sn.tags || []).includes(tagFilter);
    const matchL = !langFilter || sn.lang === langFilter;
    return matchQ && matchT && matchL;
  });

  const addSnippet = () => {
    if (!form.title.trim() || !form.code.trim()) { toast.error('Title and code are required'); return; }
    const tags = form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    setSnippets([{ id: 's' + Date.now(), title: form.title.trim(), lang: form.lang, tags, code: form.code }, ...snippets]);
    setForm({ title: '', lang: 'javascript', tags: '', code: '' });
    setShowForm(false);
    toast.success('Snippet saved!');
  };

  const copyCode = async (sn) => {
    try {
      await navigator.clipboard.writeText(sn.code);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = sn.code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedId(sn.id);
    setTimeout(() => setCopiedId(null), 1500);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <style>{`
        .tok-kw { color: #fb923c; font-weight: 600; }
        .tok-str { color: #86efac; }
        .tok-com { color: #64748b; font-style: italic; }
        .tok-num { color: #f0abfc; }
      `}</style>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search snippets..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500/50" />
        </div>
        <select value={langFilter} onChange={e => setLangFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none">
          <option value="">All languages</option>
          {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={tagFilter} onChange={e => setTagFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none">
          <option value="">All tags</option>
          {allTags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-sm font-bold flex items-center gap-1.5 whitespace-nowrap">
          <Plus className="w-4 h-4" /> New
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-2xl border border-orange-500/25 bg-white/[0.02] p-5 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">New snippet</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title"
            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500/50" />
          <div className="flex gap-2">
            <select value={form.lang} onChange={e => setForm({ ...form, lang: e.target.value })}
              className="px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none">
              {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma separated)"
              className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500/50" />
          </div>
          <textarea value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="Paste your code here..."
            rows={6} spellCheck={false}
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-sm font-mono outline-none focus:border-orange-500/50" />
          <button onClick={addSnippet} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-sm font-bold">Save Snippet</button>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filtered.map(sn => (
          <div key={sn.id} className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <button onClick={() => setExpanded(expanded === sn.id ? null : sn.id)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/[0.02]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 shrink-0">
                  <Code2 className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{sn.title}</p>
                  <p className="text-xs text-slate-500">{sn.lang} · {(sn.tags || []).join(', ') || 'untagged'}</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${expanded === sn.id ? 'rotate-180' : ''}`} />
            </button>
            {expanded === sn.id && (
              <div className="px-5 pb-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-wrap gap-1.5">
                    {(sn.tags || []).map(t => (
                      <button key={t} onClick={() => setTagFilter(t)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-[11px]">
                        <Tag className="w-3 h-3" />{t}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copyCode(sn)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10">
                      {copiedId === sn.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === sn.id ? 'Copied!' : 'Copy'}
                    </button>
                    <button onClick={() => { setSnippets(snippets.filter(s => s.id !== sn.id)); toast.success('Deleted'); }}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <pre className="rounded-xl bg-black/60 border border-white/10 p-4 overflow-x-auto text-[13px] leading-relaxed font-mono">
                  <code dangerouslySetInnerHTML={{ __html: highlight(sn.code, sn.lang) }} />
                </pre>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-slate-500 py-10">No snippets found. Create your first one!</p>
        )}
      </div>
      <p className="text-center text-xs text-slate-600 mt-6">{snippets.length} snippets saved locally</p>
    </div>
  );
}
