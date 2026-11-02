import { useState, useEffect } from 'react';
import { Dices, Copy, Heart, Trash2, Check, Palette as PaletteIcon, Pipette } from 'lucide-react';
import { toast } from 'sonner';

const PREFIX = 'sfpal:';

function load(key, fallback) {
  try {
    const v = localStorage.getItem(PREFIX + key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); } catch {}
}

function randHex() {
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0').toUpperCase();
}

// Generate harmonious palette using HSL
function genPalette() {
  const baseHue = Math.floor(Math.random() * 360);
  const mode = Math.floor(Math.random() * 4);
  const colors = [];
  for (let i = 0; i < 5; i++) {
    let h, s, l;
    if (mode === 0) { // analogous
      h = (baseHue + i * 25 - 50 + 360) % 360; s = 55 + Math.random() * 30; l = 45 + Math.random() * 20;
    } else if (mode === 1) { // complementary pop
      h = i === 2 ? (baseHue + 180) % 360 : (baseHue + i * 15 - 15 + 360) % 360; s = 60 + Math.random() * 25; l = 45 + Math.random() * 20;
    } else if (mode === 2) { // monochrome
      h = baseHue; s = 40 + Math.random() * 40; l = 25 + i * 12;
    } else { // vibrant random
      h = Math.floor(Math.random() * 360); s = 60 + Math.random() * 30; l = 45 + Math.random() * 20;
    }
    colors.push(hslToHex(h, s, l));
  }
  return colors;
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const to = x => Math.round(255 * x).toString(16).padStart(2, '0');
  return ('#' + to(f(0)) + to(f(8)) + to(f(4))).toUpperCase();
}

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function isLight(hex) {
  const { l } = hexToHsl(hex);
  return l > 60;
}

export default function PaletteApp() {
  const [palette, setPalette] = useState(() => genPalette());
  const [favorites, setFavorites] = useState(() => load('favorites', []));
  const [copied, setCopied] = useState(null);
  const [customColor, setCustomColor] = useState('#FF6B35');

  useEffect(() => { save('favorites', favorites); }, [favorites]);

  const copyHex = async (hex) => {
    try { await navigator.clipboard.writeText(hex); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = hex; document.body.appendChild(ta);
      ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    }
    setCopied(hex);
    setTimeout(() => setCopied(null), 1200);
    toast.success(`${hex} copied!`);
  };

  const saveFavorite = () => {
    if (favorites.some(f => JSON.stringify(f) === JSON.stringify(palette))) {
      toast.info('Already in favorites');
      return;
    }
    setFavorites([{ id: 'f' + Date.now(), colors: [...palette] }, ...favorites]);
    toast.success('Palette saved to favorites! ❤️');
  };

  const shuffleOne = (idx) => {
    const next = [...palette];
    next[idx] = randHex();
    setPalette(next);
  };

  const addCustomToPalette = () => {
    setPalette([...palette.slice(0, 4), customColor.toUpperCase()]);
    toast.success('Custom color added!');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Current palette */}
      <div className="rounded-2xl overflow-hidden border border-white/10 mb-4">
        <div className="flex h-48 sm:h-56">
          {palette.map((hex, i) => (
            <button key={i} onClick={() => copyHex(hex)}
              className="flex-1 relative group transition-all hover:flex-[1.4]"
              style={{ backgroundColor: hex }}
              title="Click to copy">
              <span className={`absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-mono font-bold px-2 py-1 rounded-md backdrop-blur-sm ${
                isLight(hex) ? 'bg-black/20 text-black' : 'bg-white/15 text-white'
              }`}>
                {copied === hex ? '✓ Copied' : hex}
              </span>
              <span
                onClick={(e) => { e.stopPropagation(); shuffleOne(i); }}
                className={`absolute top-3 left-1/2 -translate-x-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition ${
                  isLight(hex) ? 'bg-black/20 text-black' : 'bg-white/15 text-white'
                }`}
                title="Shuffle this color">
                <Dices className="w-4 h-4" />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button onClick={() => setPalette(genPalette())}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 font-bold hover:brightness-110">
          <Dices className="w-5 h-5" /> Generate
        </button>
        <button onClick={saveFavorite}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/15 font-bold hover:bg-white/10">
          <Heart className="w-5 h-5 text-red-400" /> Save
        </button>
      </div>

      {/* Custom picker */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 mb-8">
        <h3 className="font-bold flex items-center gap-2 mb-4"><Pipette className="w-4 h-4 text-orange-400" /> Custom color</h3>
        <div className="flex items-center gap-4">
          <input type="color" value={customColor} onChange={e => setCustomColor(e.target.value)}
            className="w-16 h-16 rounded-xl cursor-pointer bg-transparent border border-white/15" />
          <div className="flex-1">
            <p className="font-mono font-bold text-lg">{customColor.toUpperCase()}</p>
            <p className="text-xs text-slate-500">HSL {(() => { const { h, s, l } = hexToHsl(customColor); return `${h}°, ${s}%, ${l}%`; })()}</p>
          </div>
          <button onClick={() => copyHex(customColor.toUpperCase())} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10">
            {copied === customColor.toUpperCase() ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
          </button>
          <button onClick={addCustomToPalette} className="px-4 py-3 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-300 text-sm font-bold">
            Add to palette
          </button>
        </div>
      </div>

      {/* Favorites */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2"><PaletteIcon className="w-4 h-4 text-orange-400" /> Favorites ({favorites.length})</h3>
          {favorites.length > 0 && (
            <button onClick={() => { setFavorites([]); toast.success('Favorites cleared'); }} className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
        </div>
        {favorites.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6 border border-dashed border-white/10 rounded-2xl">
            No favorites yet — generate a palette you love and hit Save.
          </p>
        ) : (
          <div className="grid gap-3">
            {favorites.map(f => (
              <div key={f.id} className="rounded-2xl border border-white/10 overflow-hidden">
                <div className="flex h-20">
                  {f.colors.map((hex, i) => (
                    <button key={i} onClick={() => copyHex(hex)} className="flex-1 hover:flex-[1.3] transition-all" style={{ backgroundColor: hex }} title={hex} />
                  ))}
                </div>
                <div className="flex items-center justify-between px-4 py-2.5 bg-black/30">
                  <span className="text-xs font-mono text-slate-400">{f.colors.join(' · ')}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { setPalette([...f.colors]); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="text-xs font-bold text-orange-300 hover:text-orange-200">Load</button>
                    <button onClick={() => setFavorites(favorites.filter(x => x.id !== f.id))} className="text-slate-600 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
