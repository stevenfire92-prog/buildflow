import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Download, Trash2, Copy, Check, History, Link2, Type } from 'lucide-react';
import { toast } from 'sonner';
import QRCodeLib from 'react-qr-code';
import QRCode from 'qrcode';

const HISTORY_KEY = 'sfqr:history';
const SIZES = [128, 256, 512];

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveHistory(items) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 30)));
}

export default function QRGenerator() {
  const [text, setText] = useState('');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#0a0a0f');
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const svgWrapperRef = useRef(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const trimmed = text.trim();

  const addToHistory = (value) => {
    const items = getHistory().filter((h) => h.value !== value);
    items.unshift({ value, at: new Date().toISOString() });
    saveHistory(items);
    setHistory(items);
  };

  const handleDownload = async () => {
    if (!trimmed) return;
    try {
      const dataUrl = await QRCode.toDataURL(trimmed, {
        width: size,
        color: { dark: fgColor, light: bgColor },
        margin: 2,
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `sefire-qr-${Date.now()}.png`;
      a.click();
      addToHistory(trimmed);
      toast.success('QR code downloaded! 📥');
    } catch {
      toast.error('Failed to generate PNG. Try again.');
    }
  };

  const handleCopy = async () => {
    if (!trimmed) return;
    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Copy failed.');
    }
  };

  const clearHistory = () => {
    saveHistory([]);
    setHistory([]);
    toast.success('History cleared');
  };

  const loadFromHistory = (value) => {
    setText(value);
    setShowHistory(false);
    toast.success('Loaded from history');
  };

  const deleteHistoryItem = (value) => {
    const items = getHistory().filter((h) => h.value !== value);
    saveHistory(items);
    setHistory(items);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">QR Generator</h1>
          <p className="text-slate-400 text-sm mt-1">Turn any text or link into a scannable QR code</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold border border-white/15 hover:border-orange-400/40 transition text-sm"
        >
          <History className="w-4 h-4" />
          History ({history.length})
        </button>
      </div>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Recent QRs</h3>
                {history.length > 0 && (
                  <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> Clear all
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No history yet — generate a QR and it'll show up here.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {history.map((h) => (
                    <div key={h.value + h.at} className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-4 py-2.5">
                      <button onClick={() => loadFromHistory(h.value)} className="flex-1 text-left truncate text-sm hover:text-orange-300 transition">
                        {h.value}
                      </button>
                      <button onClick={() => deleteHistoryItem(h.value)} className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <label className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
            <Type className="w-4 h-4 text-orange-400" /> Text or URL
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="https://example.com — or any text…"
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-5 outline-none focus:border-orange-400/50 resize-none"
          />

          <label className="text-sm font-bold text-slate-300 mb-2 block">Size</label>
          <div className="flex gap-2 mb-5">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition ${
                  size === s ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-white/5 border border-white/10 hover:border-orange-400/30'
                }`}
              >
                {s}px
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-bold text-slate-300 mb-2 block">Foreground</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-white/10"
                />
                <span className="text-xs text-slate-500 font-mono">{fgColor}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-300 mb-2 block">Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-white/10"
                />
                <span className="text-xs text-slate-500 font-mono">{bgColor}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              disabled={!trimmed}
              className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Download PNG
            </button>
            <button
              onClick={handleCopy}
              disabled={!trimmed}
              className="px-4 py-3 rounded-xl border border-white/15 hover:border-orange-400/40 transition disabled:opacity-40"
              title="Copy text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Preview panel */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col items-center justify-center min-h-[380px]">
          {trimmed ? (
            <motion.div
              key={trimmed + size + fgColor + bgColor}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-5"
              style={{ background: bgColor }}
              ref={svgWrapperRef}
            >
              <QRCodeLib value={trimmed} size={Math.min(size, 280)} fgColor={fgColor} bgColor={bgColor} />
            </motion.div>
          ) : (
            <div className="text-center">
              <QrCode className="w-16 h-16 mx-auto text-slate-700 mb-4" />
              <p className="text-slate-400 mb-1">Your QR code appears here</p>
              <p className="text-xs text-slate-600">Type something to generate it live</p>
            </div>
          )}
          {trimmed && (
            <p className="mt-4 text-xs text-slate-500 flex items-center gap-1.5 max-w-full">
              <Link2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{trimmed}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
