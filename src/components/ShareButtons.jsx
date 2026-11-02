// Social share / promo buttons — works on any page.
import { useState } from 'react';
import { Share2, Link2, Check, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareButtons({ title, text, compact }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = text || title || 'Check this out';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied — go promote it!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed — long-press the URL to copy it.');
    }
  };

  const native = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, text: shareText, url }); } catch { /* dismissed */ }
    } else {
      copy();
    }
  };

  const links = [
    { name: 'X', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, label: '𝕏' },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, label: 'f' },
    { name: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + url)}`, label: '◉' },
    { name: 'Telegram', href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`, label: '✈' },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button onClick={native} className="flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-xs font-bold text-slate-300 hover:border-white/30">
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
        <button onClick={copy} className="flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-xs font-bold text-slate-300 hover:border-white/30">
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Link2 className="w-3.5 h-3.5" />} {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2 mb-1">
        <Share2 className="w-4 h-4 text-slate-300" />
        <h3 className="font-bold text-sm">Spread the word</h3>
      </div>
      <p className="text-xs text-slate-500 mb-4">Free promotion — every share brings new players and customers.</p>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.name}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-slate-300 hover:border-white/35 hover:text-white transition-colors"
          >
            {l.name}
          </a>
        ))}
        <button onClick={copy} className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-slate-300 hover:border-white/35 flex items-center gap-1.5">
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Link2 className="w-3.5 h-3.5" />} {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
    </div>
  );
}
