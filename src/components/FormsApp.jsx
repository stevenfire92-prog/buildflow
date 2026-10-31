import { useState, useMemo } from 'react';
import { Plus, Trash2, X, ClipboardList, Eye, ChevronUp, ChevronDown, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

const FORMS_KEY = 'sfforms:forms';
const RESP_KEY = 'sfforms:responses';

const load = (k) => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const FIELD_TYPES = [
  { id: 'text', label: 'Short text' },
  { id: 'textarea', label: 'Long text' },
  { id: 'number', label: 'Number' },
  { id: 'email', label: 'Email' },
  { id: 'select', label: 'Dropdown' },
  { id: 'checkbox', label: 'Checkbox' },
];

export default function FormsApp() {
  const [forms, setForms] = useState(() => load(FORMS_KEY));
  const [responses, setResponses] = useState(() => load(RESP_KEY));
  const [tab, setTab] = useState('forms');
  const [editing, setEditing] = useState(null);
  const [fTitle, setFTitle] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fFields, setFFields] = useState([]);
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState('text');
  const [newOpts, setNewOpts] = useState('');
  const [newReq, setNewReq] = useState(false);
  const [filling, setFilling] = useState(null);
  const [fillVals, setFillVals] = useState({});
  const [viewing, setViewing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const persistF = (n) => { setForms(n); save(FORMS_KEY, n); };
  const persistR = (n) => { setResponses(n); save(RESP_KEY, n); };

  const openNew = () => {
    setEditing(null); setFTitle(''); setFDesc(''); setFFields([]); setTab('edit');
  };
  const openEdit = (f) => {
    setEditing(f); setFTitle(f.title || ''); setFDesc(f.desc || ''); setFFields(f.fields || []); setTab('edit');
  };
  const addField = () => {
    if (!newLabel.trim()) { toast.error('Field label is required'); return; }
    const field = {
      id: Date.now().toString(), label: newLabel.trim(), type: newType, required: newReq,
      options: newType === 'select' ? newOpts.split(',').map((o) => o.trim()).filter(Boolean) : [],
    };
    setFFields([...fFields, field]);
    setNewLabel(''); setNewType('text'); setNewOpts(''); setNewReq(false);
  };
  const moveField = (i, dir) => {
    const arr = [...fFields];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setFFields(arr);
  };
  const delField = (i) => setFFields(fFields.filter((_, x) => x !== i));

  const saveForm = () => {
    if (!fTitle.trim()) { toast.error('Form title is required'); return; }
    if (fFields.length === 0) { toast.error('Add at least one field'); return; }
    const payload = { title: fTitle.trim(), desc: fDesc.trim(), fields: fFields };
    if (editing) {
      persistF(forms.map((f) => (f.id === editing.id ? { ...f, ...payload } : f)));
      toast.success('Form updated');
    } else {
      persistF([{ ...payload, id: Date.now().toString(), ts: Date.now() }, ...forms]);
      toast.success('Form created');
    }
    setTab('forms');
  };
  const deleteForm = (id) => {
    persistF(forms.filter((f) => f.id !== id));
    persistR(responses.filter((r) => r.formId !== id));
    setConfirmDelete(null); toast.success('Form deleted');
  };

  const openFill = (f) => {
    setFilling(f);
    const vals = {};
    f.fields.forEach((fl) => { vals[fl.id] = fl.type === 'checkbox' ? false : ''; });
    setFillVals(vals);
  };
  const submitFill = () => {
    const missing = filling.fields.filter((fl) => fl.required && !String(fillVals[fl.id] || '').trim() && fillVals[fl.id] !== true);
    if (missing.length) { toast.error(`Required: ${missing.map((m) => m.label).join(', ')}`); return; }
    const answers = filling.fields.map((fl) => ({ fieldId: fl.id, label: fl.label, value: fillVals[fl.id] }));
    persistR([{ id: Date.now().toString(), formId: filling.id, answers, ts: Date.now() }, ...responses]);
    setFilling(null);
    toast.success('Response submitted!');
  };

  const formResponses = useMemo(() => viewing ? responses.filter((r) => r.formId === viewing.id) : [], [responses, viewing]);

  const renderFieldInput = (fl, val, setVal, dark = true) => {
    const cls = `w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-orange-500 ${dark ? 'bg-black/40 border-white/10' : 'bg-white border-black/10 text-black'}`;
    if (fl.type === 'textarea') return <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={3} className={cls} placeholder={fl.label} />;
    if (fl.type === 'select') return (
      <select value={val} onChange={(e) => setVal(e.target.value)} className={cls}>
        <option value="">Choose…</option>
        {fl.options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
    if (fl.type === 'checkbox') return (
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={!!val} onChange={(e) => setVal(e.target.checked)} className="w-4 h-4 accent-orange-500" />
        {fl.label}
      </label>
    );
    return <input value={val} onChange={(e) => setVal(e.target.value)} type={fl.type === 'number' ? 'number' : fl.type === 'email' ? 'email' : 'text'} placeholder={fl.label} className={cls} />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex gap-2 mb-6">
        {[
          { id: 'forms', label: 'My Forms' },
          { id: 'edit', label: editing ? 'Edit Form' : 'Build Form' },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${tab === t.id ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'forms' && (
        <>
          <button onClick={openNew} className="mb-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
            <Plus className="w-4 h-4" /> New Form
          </button>
          {forms.length === 0 ? (
            <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
              <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="font-bold text-slate-300">No forms yet</p>
              <p className="text-sm text-slate-500">Build your first form and start collecting responses.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {forms.map((f) => {
                const rc = responses.filter((r) => r.formId === f.id).length;
                return (
                  <div key={f.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="font-bold">{f.title}</p>
                    {f.desc && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{f.desc}</p>}
                    <p className="text-xs text-slate-500 mt-1">{f.fields.length} fields · {rc} responses</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <button onClick={() => openFill(f)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
                        <Eye className="w-3.5 h-3.5" /> Fill
                      </button>
                      <button onClick={() => { setViewing(f); }} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition">
                        <BarChart3 className="w-3.5 h-3.5" /> Responses ({rc})
                      </button>
                      <button onClick={() => openEdit(f)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition">Edit</button>
                      <button onClick={() => setConfirmDelete(f.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition"><Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" /></button>
                    </div>
                    {confirmDelete === f.id && (
                      <div className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 flex items-center justify-between gap-2">
                        <p className="text-xs text-red-300 font-semibold">Delete form + responses?</p>
                        <div className="flex gap-1.5">
                          <button onClick={() => deleteForm(f.id)} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600">Yes</button>
                          <button onClick={() => setConfirmDelete(null)} className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10">No</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === 'edit' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
            <h3 className="font-black">Builder</h3>
            <input value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder="Form title *" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <input value={fDesc} onChange={(e) => setFDesc(e.target.value)} placeholder="Description (optional)" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <div className="border-t border-white/5 pt-3">
              <p className="text-xs font-bold text-slate-400 mb-2">Add field</p>
              <div className="flex gap-2 mb-2">
                <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Label *" className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
                <select value={newType} onChange={(e) => setNewType(e.target.value)} className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500">
                  {FIELD_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              {newType === 'select' && (
                <input value={newOpts} onChange={(e) => setNewOpts(e.target.value)} placeholder="Options (comma separated)" className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500 mb-2" />
              )}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input type="checkbox" checked={newReq} onChange={(e) => setNewReq(e.target.checked)} className="w-4 h-4 accent-orange-500" /> Required
                </label>
                <button onClick={addField} className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition">Add Field</button>
              </div>
            </div>
            <div className="space-y-2">
              {fFields.map((fl, i) => (
                <div key={fl.id} className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveField(i, -1)} className="text-slate-500 hover:text-white"><ChevronUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => moveField(i, 1)} className="text-slate-500 hover:text-white"><ChevronDown className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{fl.label} {fl.required && <span className="text-red-400">*</span>}</p>
                    <p className="text-[11px] text-slate-500">{FIELD_TYPES.find((t) => t.id === fl.type)?.label}</p>
                  </div>
                  <button onClick={() => delField(i)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition"><Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" /></button>
                </div>
              ))}
              {fFields.length === 0 && <p className="text-xs text-slate-600 text-center py-3">No fields yet — add one above.</p>}
            </div>
            <button onClick={saveForm} className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
              {editing ? 'Save Changes' : 'Create Form'}
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white p-5 text-black h-fit">
            <h3 className="font-black mb-1 flex items-center gap-2"><Eye className="w-4 h-4" /> Live Preview</h3>
            <p className="text-xs text-black/50 mb-4">This is what respondents see.</p>
            <p className="font-black text-lg">{fTitle || 'Untitled Form'}</p>
            {fDesc && <p className="text-sm text-black/60 mb-4">{fDesc}</p>}
            <div className="space-y-3">
              {fFields.map((fl) => (
                <div key={fl.id}>
                  {fl.type !== 'checkbox' && <label className="text-xs font-bold text-black/70 block mb-1">{fl.label} {fl.required && <span className="text-red-500">*</span>}</label>}
                  {renderFieldInput(fl, '', () => {}, false)}
                </div>
              ))}
              {fFields.length === 0 && <p className="text-sm text-black/40 text-center py-6">Add fields to see the preview.</p>}
            </div>
          </div>
        </div>
      )}

      {filling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setFilling(null)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-3 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg">{filling.title}</h3>
              <button onClick={() => setFilling(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            {filling.desc && <p className="text-sm text-slate-400">{filling.desc}</p>}
            {filling.fields.map((fl) => (
              <div key={fl.id}>
                {fl.type !== 'checkbox' && <label className="text-xs font-bold text-slate-400 block mb-1">{fl.label} {fl.required && <span className="text-red-400">*</span>}</label>}
                {renderFieldInput(fl, fillVals[fl.id], (v) => setFillVals((p) => ({ ...p, [fl.id]: v })))}
              </div>
            ))}
            <button onClick={submitFill} className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">Submit</button>
          </div>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setViewing(null)}>
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#121218] p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg">Responses — {viewing.title} ({formResponses.length})</h3>
              <button onClick={() => setViewing(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            {formResponses.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No responses yet.</p>
            ) : (
              <div className="space-y-3">
                {formResponses.map((r) => (
                  <div key={r.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <p className="text-[11px] text-slate-500 mb-2">{new Date(r.ts).toLocaleString()}</p>
                    {r.answers.map((a) => (
                      <p key={a.fieldId} className="text-sm"><span className="text-slate-500">{a.label}:</span> <span className="font-semibold">{String(a.value) === 'true' ? '✓' : String(a.value) || '—'}</span></p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
