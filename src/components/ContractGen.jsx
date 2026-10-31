import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Briefcase, Handshake, ShieldCheck, Music2,
  Save, Printer, Trash2, Plus, FolderOpen, AlertTriangle, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { TEMPLATES, getTemplate, getContracts, saveContract, deleteContract, newRecord } from '../lib/templates';

const ICONS = { freelance: Briefcase, service: Handshake, nda: ShieldCheck, music: Music2 };

function FieldInput({ field, value, onChange }) {
  const base = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400/50 text-white placeholder:text-slate-600';
  if (field.type === 'textarea') {
    return (
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5">{field.label}</label>
        <textarea value={value || ''} onChange={(e) => onChange(field.key, e.target.value)} placeholder={field.placeholder} rows={3} className={base} />
      </div>
    );
  }
  if (field.type === 'select') {
    return (
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5">{field.label}</label>
        <select value={value || field.options[0]} onChange={(e) => onChange(field.key, e.target.value)} className={base}>
          {field.options.map((o) => <option key={o} value={o} className="bg-slate-900">{o}</option>)}
        </select>
      </div>
    );
  }
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1.5">{field.label}</label>
      <input type={field.type} value={value || ''} onChange={(e) => onChange(field.key, e.target.value)} placeholder={field.placeholder} className={base} />
    </div>
  );
}

export default function ContractGen() {
  const [templateId, setTemplateId] = useState('freelance');
  const [record, setRecord] = useState(() => newRecord('freelance'));
  const [saved, setSaved] = useState(() => getContracts());
  const [showLibrary, setShowLibrary] = useState(false);

  const template = useMemo(() => getTemplate(templateId), [templateId]);

  const setField = (key, value) => {
    setRecord((r) => ({ ...r, data: { ...r.data, [key]: value }, updated: new Date().toISOString() }));
  };

  const switchTemplate = (id) => {
    setTemplateId(id);
    setRecord((r) => ({ ...r, templateId: id, data: {} }));
  };

  const handleSave = () => {
    const name = record.name?.trim() || `${template.name} — ${new Date().toLocaleDateString()}`;
    const rec = { ...record, name, templateId, updated: new Date().toISOString() };
    saveContract(rec);
    setRecord(rec);
    setSaved(getContracts());
    toast.success('Contract saved');
  };

  const handleNew = () => {
    setRecord(newRecord(templateId));
    toast.success('New contract started');
  };

  const handleLoad = (c) => {
    setTemplateId(c.templateId);
    setRecord(c);
    setShowLibrary(false);
    toast.success(`Loaded "${c.name}"`);
  };

  const handleDelete = (id) => {
    deleteContract(id);
    setSaved(getContracts());
    if (record.id === id) setRecord(newRecord(templateId));
    toast.success('Deleted');
  };

  const handlePrint = () => window.print();

  const sections = template.render(record.data);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-black">Contract Generator</h1>
          <p className="text-slate-400 text-sm mt-1">Pick a template, fill the form, print a professional contract.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowLibrary(!showLibrary)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 text-sm font-bold hover:border-orange-400/40 transition">
            <FolderOpen className="w-4 h-4" /> Saved ({saved.length})
          </button>
          <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 text-sm font-bold hover:border-orange-400/40 transition">
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
      </div>

      {/* Legal disclaimer */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/[0.06] p-4 mb-6">
        <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/90 leading-relaxed">
          <span className="font-bold">Template only — not legal advice.</span> These are starting-point
          templates, not a substitute for a lawyer. Consult a licensed attorney before signing anything important.
        </p>
      </div>

      {/* Template picker */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {TEMPLATES.map((t) => {
          const Icon = ICONS[t.id] || FileText;
          const active = t.id === templateId;
          return (
            <button
              key={t.id}
              onClick={() => switchTemplate(t.id)}
              className={`text-left rounded-2xl border p-4 transition ${active ? 'border-orange-400/60 bg-orange-400/[0.08]' : 'border-white/10 bg-white/[0.03] hover:border-white/25'}`}
            >
              <Icon className={`w-6 h-6 mb-2 ${active ? 'text-orange-300' : 'text-slate-400'}`} />
              <p className="font-bold text-sm">{t.name}</p>
              <p className="text-xs text-slate-500 mt-1 leading-snug">{t.blurb}</p>
            </button>
          );
        })}
      </div>

      {/* Saved library */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              {saved.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No saved contracts yet.</p>
              ) : (
                <div className="space-y-2">
                  {saved.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                      <FileText className="w-4 h-4 text-orange-300 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{c.name}</p>
                        <p className="text-xs text-slate-500">{getTemplate(c.templateId).name} · {new Date(c.updated).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => handleLoad(c)} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-200 hover:bg-orange-500/30 transition">Load</button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor + preview */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="font-bold mb-1">{template.name}</h2>
          <p className="text-xs text-slate-500 mb-5">Fill in the details — the preview updates live.</p>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Contract label (for your files)</label>
            <input value={record.name || ''} onChange={(e) => setRecord((r) => ({ ...r, name: e.target.value }))} placeholder="e.g. Website build — Acme Co" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400/50 text-white placeholder:text-slate-600" />
          </div>
          <div className="space-y-4">
            {template.fields.map((f) => (
              <FieldInput key={f.key} field={f} value={record.data[f.key]} onChange={setField} />
            ))}
          </div>
          <div className="flex gap-2 mt-6">
            <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition text-sm">
              <Save className="w-4 h-4" /> Save contract
            </button>
            <button onClick={handlePrint} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold border border-white/15 hover:border-orange-400/40 transition text-sm">
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
        </div>

        {/* Live preview — paper style */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm text-slate-400">LIVE PREVIEW</h2>
            <span className="text-xs text-slate-600">Prints cleanly on paper</span>
          </div>
          <div id="contract-paper" className="rounded-2xl bg-white text-slate-900 p-8 md:p-10 shadow-2xl max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:shadow-none print:rounded-none">
            <div className="text-center mb-8 border-b-2 border-slate-900 pb-6">
              <h1 className="text-2xl font-black tracking-tight uppercase">{template.name}</h1>
              <p className="text-xs text-slate-500 mt-2">Generated with Se Fire Contracts · {today}</p>
            </div>
            {sections.map((s, i) => (
              <div key={i} className="mb-5">
                <h3 className="font-bold text-sm mb-1.5">{s.heading}</h3>
                {s.body.map((p, j) => (
                  <p key={j} className="text-[13px] leading-relaxed text-slate-700 mb-2">{p}</p>
                ))}
              </div>
            ))}
            <div className="mt-10 pt-6 border-t border-slate-300 grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs text-slate-500 mb-8">Signature</p>
                <div className="border-b border-slate-400 mb-2 h-8" />
                <p className="text-xs text-slate-500">Print name · Date</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-8">Signature</p>
                <div className="border-b border-slate-400 mb-2 h-8" />
                <p className="text-xs text-slate-500">Print name · Date</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-8 italic">
              Template only — not legal advice. Consult a licensed attorney before signing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
