// Share bar — fixed for lucide-react (no brand icons)
import { Share2, Link2, MessageCircle, Send, Globe } from 'lucide-react';

export default function ShareBar({ title }) {
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const text = title || 'Check this out';

  const share = (platform) => {
    const encoded = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    const links = {
      x: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encoded}`,
      telegram: `https://t.me/share/url?url=${encoded}&text=${encodedText}`,
    };
    if (links[platform]) window.open(links[platform], '_blank', 'noopener');
  };

  return (
    <div className="flex gap-2 items-center">
      <button onClick={() => share('x')} title="Share on X" className="p-2 rounded hover:bg-white/10">
        <Share2 size={18} />
      </button>
      <button onClick={() => share('facebook')} title="Share on Facebook" className="p-2 rounded hover:bg-white/10">
        <Globe size={18} />
      </button>
      <button onClick={() => share('whatsapp')} title="Share on WhatsApp" className="p-2 rounded hover:bg-white/10">
        <MessageCircle size={18} />
      </button>
      <button onClick={() => share('telegram')} title="Share on Telegram" className="p-2 rounded hover:bg-white/10">
        <Send size={18} />
      </button>
      <button onClick={() => { navigator.clipboard.writeText(url); }} title="Copy link" className="p-2 rounded hover:bg-white/10">
        <Link2 size={18} />
      </button>
    </div>
  );
}
