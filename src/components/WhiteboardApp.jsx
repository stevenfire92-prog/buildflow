import { useState, useEffect, useRef } from 'react';
import { Eraser, Trash2, Save, Brush, Pipette, Download, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const PREFIX = 'sfwb:';
const COLORS = ['#FFFFFF', '#FF6B35', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#000000'];
const SIZES = [2, 5, 10, 20, 40];

function load(key, fallback) {
  try {
    const v = localStorage.getItem(PREFIX + key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); } catch {}
}

export default function WhiteboardApp() {
  const canvasRef = useRef(null);
  const [color, setColor] = useState('#FF6B35');
  const [customColor, setCustomColor] = useState('#FF6B35');
  const [size, setSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [saved, setSaved] = useState(() => load('drawings', []));
  const [lastPos, setLastPos] = useState(null);

  useEffect(() => { save('drawings', saved); }, [saved]);

  // Restore last drawing on mount
  useEffect(() => {
    if (saved.length > 0) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#0a0a0f';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = saved[0].dataUrl;
    } else {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setDrawing(true);
    setLastPos(getPos(e));
  };

  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#0a0a0f' : color;
    ctx.lineWidth = isEraser ? size * 2 : size;
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setLastPos(pos);
  };

  const stopDraw = () => { setDrawing(false); setLastPos(null); };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    toast.success('Canvas cleared');
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    setSaved([{ id: 'w' + Date.now(), dataUrl, date: new Date().toISOString() }, ...saved].slice(0, 20));
    toast.success('Drawing saved! 💾');
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `sefire-whiteboard-${Date.now()}.png`;
    a.click();
    toast.success('Downloaded!');
  };

  const loadDrawing = (dataUrl) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
    toast.success('Drawing loaded');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Toolbar */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Colors */}
          <div className="flex items-center gap-1.5">
            {COLORS.map(c => (
              <button key={c} onClick={() => { setColor(c); setIsEraser(false); }}
                className={`w-8 h-8 rounded-full border-2 transition ${color === c && !isEraser ? 'border-white scale-110' : 'border-white/20'}`}
                style={{ backgroundColor: c }} title={c} />
            ))}
            <label className="w-8 h-8 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center cursor-pointer overflow-hidden" title="Custom color">
              <input type="color" value={customColor} onChange={e => { setCustomColor(e.target.value); setColor(e.target.value); setIsEraser(false); }} className="opacity-0 absolute w-8 h-8 cursor-pointer" />
              <Pipette className="w-4 h-4 text-slate-400" />
            </label>
          </div>

          <div className="w-px h-8 bg-white/10" />

          {/* Sizes */}
          <div className="flex items-center gap-1.5">
            {SIZES.map(s => (
              <button key={s} onClick={() => setSize(s)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition ${size === s ? 'bg-orange-500/20 border-orange-500/40' : 'bg-white/[0.03] border-white/10'}`}
                title={`${s}px`}>
                <span className="rounded-full bg-current text-orange-300" style={{ width: Math.min(s, 20), height: Math.min(s, 20) }} />
              </button>
            ))}
          </div>

          <div className="w-px h-8 bg-white/10" />

          {/* Tools */}
          <button onClick={() => setIsEraser(false)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition ${!isEraser ? 'bg-orange-500/20 border-orange-500/40 text-orange-200' : 'bg-white/[0.03] border-white/10 text-slate-400'}`}>
            <Brush className="w-4 h-4" /> Brush
          </button>
          <button onClick={() => setIsEraser(true)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition ${isEraser ? 'bg-orange-500/20 border-orange-500/40 text-orange-200' : 'bg-white/[0.03] border-white/10 text-slate-400'}`}>
            <Eraser className="w-4 h-4" /> Eraser
          </button>

          <div className="flex-1" />

          <button onClick={clear} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10">
            <Trash2 className="w-4 h-4" /> Clear
          </button>
          <button onClick={saveDrawing} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-sm font-bold hover:brightness-110">
            <Save className="w-4 h-4" /> Save
          </button>
          <button onClick={downloadDrawing} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10">
            <Download className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Brush: <span className="font-mono" style={{ color }}>{isEraser ? 'Eraser' : color}</span> · Size: {size}px · Draw with mouse or touch
        </p>
      </div>

      {/* Canvas */}
      <div className="rounded-2xl overflow-hidden border border-white/10 touch-none select-none">
        <canvas
          ref={canvasRef}
          width={1200}
          height={700}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          className="w-full h-auto cursor-crosshair block"
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Saved drawings */}
      {saved.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold flex items-center gap-2 mb-4"><ImageIcon className="w-4 h-4 text-orange-400" /> Saved drawings ({saved.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {saved.map(s => (
              <div key={s.id} className="rounded-xl overflow-hidden border border-white/10 group relative">
                <img src={s.dataUrl} alt="Saved drawing" className="w-full h-28 object-cover cursor-pointer" onClick={() => loadDrawing(s.dataUrl)} />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button onClick={() => loadDrawing(s.dataUrl)} className="px-3 py-1.5 rounded-lg bg-white/15 text-xs font-bold">Load</button>
                  <button onClick={() => { setSaved(saved.filter(x => x.id !== s.id)); toast.success('Deleted'); }}
                    className="px-3 py-1.5 rounded-lg bg-red-500/30 text-xs font-bold text-red-200">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
