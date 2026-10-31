import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Pencil, Check, X, GripVertical, Copy,
  Link as LinkIcon, User, ExternalLink, Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { getProfile, saveProfile, makeId } from '../lib/links';

const THEMES = ['#f97316', '#ef4444', '#8b5cf6', '#10b981', '#3b82f6', '#ec4899', '#f59e0b'];

function normalizeUrl(url) {
  const u = url.trim();
  if (!u) return '';
  return /^https?:\/\//i.test(u) ? u : 'https://' + u;
}

export default function LinkBio() {
  const [profile, setProfile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ title: '', url: '' });
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  if (!profile) return null;

  const update = (patch) => {
    const next = { ...profile, ...patch };
    setProfile(next);
    saveProfile(next);
  };

  const visibleLinks = profile.links.filter((l) => l.visible);

  // ---- link CRUD ----
  const startAdd = () => {
    setDraft({ title: '', url: '' });
    setShowAdd(true);
    setEditingId(null);
  };

  const startEdit = (link) => {
    setDraft({ title: link.title, url: link.url });
    setEditingId(link.id);
    setShowAdd(false);
  };

  const saveLink = (e) => {
    e?.preventDefault();
    const title = draft.title.trim();
    const url = normalizeUrl(draft.url);
    if (!title || !url) {
      toast.error('Give the link a title and a URL');
      return;
    }
    let links;
    if (editingId) {
      links = profile.links.map((l) => (l.id === editingId ? { ...l, title, url } : l));
      toast.success('Link updated');
    } else {
      links = [...profile.links, { id: makeId(), title, url, visible: true }];
      toast.success('Link added 🔗');
    }
    update({ links });
    setEditingId(null);
    setShowAdd(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAdd(false);
  };

  const removeLink = (id) => {
    update({ links: profile.links.filter((l) => l.id !== id) });
    toast.success('Link removed');
  };

  const toggleVisible = (id) => {
    update({
      links: profile.links.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    });
  };

  const move = (id, dir) => {
    const idx = profile.links.findIndex((l) => l.id === id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= profile.links.length) return;
    const links = [...profile.links];
    [links[idx], links[j]] = [links[j], links[idx]];
    update({ links });
  };

  const copyPreview = () => {
    const lines = [
      profile.name,
      profile.bio,
      '',
      ...visibleLinks.map((l) => `• ${l.title}: ${l.url}`),
    ].join('\n');
    navigator.clipboard
      ?.writeText(lines)
      .then(() => toast.success('Preview copied — paste it anywhere 📋'))
      .catch(() => toast.error('Copy failed'));
  };

  const initials = profile.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isEmojiAvatar = /\p{Extended_Pictographic}/u.test(profile.avatar || '');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-2 gap-8">
      {/* ---------- Editor ---------- */}
      <div>
        <h1 className="text-3xl font-black mb-1">Se Fire Links</h1>
        <p className="text-slate-400 text-sm mb-8">Build your link-in-bio page. Preview updates live.</p>

        {/* Profile */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6">
          <p className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-4">
            <User className="w-4 h-4" /> Profile
          </p>
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-full grid place-items-center text-2xl font-black shrink-0"
              style={{ background: `linear-gradient(135deg, ${profile.theme}, #7f1d1d)` }}
            >
              {isEmojiAvatar ? profile.avatar : initials || '?'}
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <input
                value={profile.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Your name"
                className="col-span-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-orange-400/50"
              />
              <input
                value={profile.avatar}
                onChange={(e) => update({ avatar: e.target.value.slice(0, 4) })}
                placeholder="🔥 or initials"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-orange-400/50"
              />
              <div className="flex items-center gap-1.5">
                {THEMES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => update({ theme: c })}
                    className={`w-7 h-7 rounded-full transition ${profile.theme === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <textarea
            value={profile.bio}
            onChange={(e) => update({ bio: e.target.value })}
            placeholder="Short bio..."
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-orange-400/50 resize-none"
          />
        </div>

        {/* Links */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="flex items-center gap-2 text-sm font-bold text-slate-300">
              <LinkIcon className="w-4 h-4" /> Links ({profile.links.length})
            </p>
            <button
              onClick={startAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition"
            >
              <Plus className="w-4 h-4" /> Add link
            </button>
          </div>

          <AnimatePresence>
            {(showAdd || editingId) && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={saveLink}
                className="overflow-hidden mb-4"
              >
                <div className="rounded-xl border border-orange-400/30 bg-orange-400/[0.05] p-4 space-y-3">
                  <input
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="Link title (e.g. My latest track 🎵)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-orange-400/50"
                    autoFocus
                  />
                  <input
                    value={draft.url}
                    onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                    placeholder="https://..."
                    inputMode="url"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-orange-400/50"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" /> {editingId ? 'Save' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2.5 rounded-xl border border-white/15 hover:border-white/30 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {profile.links.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-8">No links yet — add your first one above.</p>
          ) : (
            <div className="space-y-2">
              {profile.links.map((l, i) => (
                <motion.div
                  key={l.id}
                  layout
                  className={`flex items-center gap-2 rounded-xl border p-3 ${l.visible ? 'border-white/10 bg-white/[0.02]' : 'border-white/5 bg-transparent opacity-50'}`}
                >
                  <div className="flex flex-col text-slate-600">
                    <button onClick={() => move(l.id, -1)} disabled={i === 0} className="hover:text-white disabled:opacity-20 leading-none">▲</button>
                    <button onClick={() => move(l.id, 1)} disabled={i === profile.links.length - 1} className="hover:text-white disabled:opacity-20 leading-none">▼</button>
                  </div>
                  <GripVertical className="w-4 h-4 text-slate-700 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{l.title}</p>
                    <p className="text-xs text-slate-500 truncate">{l.url}</p>
                  </div>
                  <button
                    onClick={() => toggleVisible(l.id)}
                    title={l.visible ? 'Hide' : 'Show'}
                    className={`p-2 rounded-lg transition ${l.visible ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-slate-600 hover:bg-white/5'}`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => startEdit(l)} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeLink(l.id)} className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          <button
            onClick={copyPreview}
            className="mt-4 w-full py-3 rounded-xl font-bold border border-white/15 hover:border-orange-400/40 transition flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" /> Copy shareable preview
          </button>
        </div>
      </div>

      {/* ---------- Live preview (mobile style) ---------- */}
      <div className="lg:sticky lg:top-8 self-start">
        <p className="text-sm font-bold text-slate-400 mb-3 text-center">Live preview</p>
        <div className="mx-auto w-full max-w-[340px] rounded-[2rem] border border-white/15 bg-[#0a0a0f] p-6 shadow-2xl">
          <div className="text-center mb-6">
            <div
              className="w-20 h-20 rounded-full grid place-items-center text-3xl font-black mx-auto mb-3"
              style={{ background: `linear-gradient(135deg, ${profile.theme}, #7f1d1d)` }}
            >
              {isEmojiAvatar ? profile.avatar : initials || '?'}
            </div>
            <p className="font-black text-lg">{profile.name || 'Your name'}</p>
            {profile.bio && <p className="text-sm text-slate-400 mt-1">{profile.bio}</p>}
          </div>
          <div className="space-y-3">
            {visibleLinks.length === 0 && (
              <p className="text-center text-slate-600 text-sm py-6">Links you add will appear here</p>
            )}
            {visibleLinks.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 w-full rounded-2xl px-5 py-4 font-semibold text-white transition hover:brightness-110"
                style={{ background: `linear-gradient(135deg, ${profile.theme}, #991b1b)` }}
              >
                <span className="truncate">{l.title}</span>
                <ExternalLink className="w-4 h-4 shrink-0 opacity-70" />
              </a>
            ))}
          </div>
          <p className="text-center text-[10px] text-slate-600 mt-6">Made with Se Fire Links 🔥</p>
        </div>
      </div>
    </div>
  );
}
