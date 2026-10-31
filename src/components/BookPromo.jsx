import { BookOpen, ExternalLink, Star, Flame } from 'lucide-react';

// Se Fire Tech — Book Promotion Component
// Showcases Steve's Shadow Path Kindle series
// Add to any app: <BookPromo />

const AUTHOR_URL = 'https://www.amazon.com/stores/author/B0G3PZGVKY';
const BOOKS = [
  {
    title: 'Shadow Path Book 1: The Burning City',
    url: 'https://www.amazon.ca/dp/B0H132QN3M',
    price: '$9.99',
    description: 'Step into the shadows… where fate is forged in blood, fire, and betrayal. When an unknown warrior is drawn into a rising war between ancient forces, he must face creatures long thought extinct and confront a power that threatens to consume everything.',
    badge: 'Book 1',
  },
  // Add more books here as they publish
];

export default function BookPromo({ compact = false }) {
  return (
    <div className={`rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-950/30 to-orange-950/20 p-6 ${compact ? '' : 'my-8'}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600">
          <BookOpen className="w-6 h-6 text-black" />
        </div>
        <div>
          <h3 className="text-xl font-black flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Shadow Path Series
          </h3>
          <p className="text-sm text-slate-400">by Steven Thomas Turcott</p>
        </div>
      </div>

      <p className="text-slate-300 text-sm mb-5 leading-relaxed">
        A 16-book dark fantasy epic. 9 books done, more to come.
        Perfect for fans of <em>The Witcher</em> and <em>The Blade Itself</em> —
        brutal, immersive, and impossible to put down.
      </p>

      <div className="space-y-4 mb-5">
        {BOOKS.map((book) => (
          <div key={book.title} className="rounded-xl bg-black/30 border border-white/10 p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="font-bold text-sm">{book.title}</h4>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-400/20 text-amber-300 shrink-0">
                {book.badge}
              </span>
            </div>
            {!compact && (
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">{book.description}</p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-amber-300">{book.price}</span>
              <a
                href={book.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:brightness-110 transition"
              >
                Buy on Kindle <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      <a
        href={AUTHOR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-amber-400/30 text-amber-300 font-bold text-sm hover:bg-amber-400/10 transition"
      >
        <Star className="w-4 h-4" />
        Follow Steven Thomas Turcott on Amazon
        <ExternalLink className="w-3.5 h-3.5" />
      </a>

      <p className="text-center text-[11px] text-slate-500 mt-3">
        Also available with Kindle Unlimited
      </p>
    </div>
  );
}

// Tab wrapper for apps with tab navigation
export function BookPromoTab() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <BookPromo />
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          About the Author
        </h4>
        <p className="text-sm text-slate-400 leading-relaxed">
          Steven Thomas Turcott was born up north in Ontario, Canada.
          He became an audio engineer in his church at age 6 and has released
          numerous tracks on Spotify, Apple Music, Deezer and more as <strong className="text-slate-200">Se Fire</strong>.
          Now writing ebooks, he enjoys creating immersive worlds for readers to explore.
        </p>
      </div>
    </div>
  );
}
