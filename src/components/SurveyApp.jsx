import { useState, useMemo } from 'react';
import { Plus, Trash2, X, ChartPie, BarChart3, Vote, Check } from 'lucide-react';
import { toast } from 'sonner';

const SURVEY_KEY = 'sfsurvey:surveys';
const VOTE_KEY = 'sfsurvey:votes';

const load = (k) => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#eab308', '#ef4444', '#06b6d4', '#f472b6'];

export default function SurveyApp() {
  const [surveys, setSurveys] = useState(() => load(SURVEY_KEY));
  const [votes, setVotes] = useState(() => load(VOTE_KEY));
  const [tab, setTab] = useState('browse');
  const [editing, setEditing] = useState(null);
  const [sTitle, setSTitle] = useState('');
  const [sDesc, setSDesc] = useState('');
  const [sQuestions, setSQuestions] = useState([]);
  const [qText, setQText] = useState('');
  const [qOpts, setQOpts] = useState('');
  const [answering, setAnswering] = useState(null);
  const [answers, setAnswers] = useState({});
  const [resultsFor, setResultsFor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const persistS = (n) => { setSurveys(n); save(SURVEY_KEY, n); };
  const persistV = (n) => { setVotes(n); save(VOTE_KEY, n); };

  const openNew = () => { setEditing(null); setSTitle(''); setSDesc(''); setSQuestions([]); setTab('build'); };
  const openEdit = (s) => { setEditing(s); setSTitle(s.title || ''); setSDesc(s.desc || ''); setSQuestions(s.questions || []); setTab('build'); };

  const addQuestion = () => {
    if (!qText.trim()) { toast.error('Question text is required'); return; }
    const opts = qOpts.split('\n').map((o) => o.trim()).filter(Boolean);
    if (opts.length < 2) { toast.error('Add at least 2 options (one per line)'); return; }
    setSQuestions([...sQuestions, { id: Date.now().toString(), text: qText.trim(), options: opts }]);
    setQText(''); setQOpts('');
  };
  const delQuestion = (id) => setSQuestions(sQuestions.filter((q) => q.id !== id));

  const saveSurvey = () => {
    if (!sTitle.trim()) { toast.error('Title is required'); return; }
    if (sQuestions.length === 0) { toast.error('Add at least one question'); return; }
    const payload = { title: sTitle.trim(), desc: sDesc.trim(), questions: sQuestions };
    if (editing) {
      persistS(surveys.map((s) => (s.id === editing.id ? { ...s, ...payload } : s)));
      toast.success('Survey updated');
    } else {
      persistS([{ ...payload, id: Date.now().toString(), ts: Date.now() }, ...surveys]);
      toast.success('Survey published');
    }
    setTab('browse');
  };
  const deleteSurvey = (id) => {
    persistS(surveys.filter((s) => s.id !== id));
    persistV(votes.filter((v) => v.surveyId !== id));
    setConfirmDelete(null); toast.success('Survey deleted');
  };

  const openAnswer = (s) => {
    setAnswering(s);
    const a = {};
    s.questions.forEach((q) => { a[q.id] = ''; });
    setAnswers(a);
  };
  const submitAnswers = () => {
    const missing = answering.questions.filter((q) => !answers[q.id]);
    if (missing.length) { toast.error('Answer every question'); return; }
    const vs = answering.questions.map((q) => ({ surveyId: answering.id, qId: q.id, option: answers[q.id], ts: Date.now(), id: `${Date.now()}-${q.id}` }));
    persistV([...vs, ...votes]);
    setAnswering(null);
    setResultsFor(answering.id);
    toast.success('Vote counted!');
  };

  const results = useMemo(() => {
    if (!resultsFor) return null;
    const survey = surveys.find((s) => s.id === resultsFor);
    if (!survey) return null;
    const sv = votes.filter((v) => v.surveyId === resultsFor);
    return {
      survey,
      total: new Set(sv.map((v) => v.ts)).size,
      questions: survey.questions.map((q) => {
        const qv = sv.filter((v) => v.qId === q.id);
        const counts = q.options.map((o) => ({ option: o, count: qv.filter((v) => v.option === o).length }));
        const max = Math.max(1, ...counts.map((c) => c.count));
        return { ...q, counts, max, total: qv.length };
      }),
    };
  }, [resultsFor, surveys, votes]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex gap-2 mb-6">
        {[
          { id: 'browse', label: 'Surveys' },
          { id: 'build', label: editing ? 'Edit Survey' : 'Build Survey' },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${tab === t.id ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'browse' && (
        <>
          <button onClick={openNew} className="mb-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
            <Plus className="w-4 h-4" /> New Survey
          </button>
          {surveys.length === 0 ? (
            <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/[0.03]">
              <ChartPie className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="font-bold text-slate-300">No surveys yet</p>
              <p className="text-sm text-slate-500">Build one and watch the results roll in.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {surveys.map((s) => {
                const vc = votes.filter((v) => v.surveyId === s.id).length;
                return (
                  <div key={s.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="font-bold">{s.title}</p>
                    {s.desc && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{s.desc}</p>}
                    <p className="text-xs text-slate-500 mt-1">{s.questions.length} questions · {vc} votes</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <button onClick={() => openAnswer(s)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
                        <Vote className="w-3.5 h-3.5" /> Vote
                      </button>
                      <button onClick={() => setResultsFor(s.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition">
                        <BarChart3 className="w-3.5 h-3.5" /> Results
                      </button>
                      <button onClick={() => openEdit(s)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition">Edit</button>
                      <button onClick={() => setConfirmDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition"><Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" /></button>
                    </div>
                    {confirmDelete === s.id && (
                      <div className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 flex items-center justify-between gap-2">
                        <p className="text-xs text-red-300 font-semibold">Delete?</p>
                        <div className="flex gap-1.5">
                          <button onClick={() => deleteSurvey(s.id)} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600">Yes</button>
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

      {tab === 'build' && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
          <input value={sTitle} onChange={(e) => setSTitle(e.target.value)} placeholder="Survey title *" autoFocus className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
          <input value={sDesc} onChange={(e) => setSDesc(e.target.value)} placeholder="Description (optional)" className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
          <div className="border-t border-white/5 pt-3">
            <p className="text-xs font-bold text-slate-400 mb-2">Add question</p>
            <input value={qText} onChange={(e) => setQText(e.target.value)} placeholder="Question *" className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500 mb-2" />
            <textarea value={qOpts} onChange={(e) => setQOpts(e.target.value)} placeholder="Options — one per line (min 2)" rows={3} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500 mb-2" />
            <button onClick={addQuestion} className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition">Add Question</button>
          </div>
          <div className="space-y-2">
            {sQuestions.map((q, i) => (
              <div key={q.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold">Q{i + 1}: {q.text}</p>
                  <button onClick={() => delQuestion(q.id)} className="p-1 rounded-lg hover:bg-red-500/20 transition shrink-0"><Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" /></button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {q.options.map((o) => <span key={o} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">{o}</span>)}
                </div>
              </div>
            ))}
          </div>
          <button onClick={saveSurvey} className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
            {editing ? 'Save Changes' : 'Publish Survey'}
          </button>
        </div>
      )}

      {answering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setAnswering(null)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg">{answering.title}</h3>
              <button onClick={() => setAnswering(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            {answering.questions.map((q, qi) => (
              <div key={q.id}>
                <p className="text-sm font-bold mb-2">Q{qi + 1}: {q.text}</p>
                <div className="space-y-1.5">
                  {q.options.map((o) => (
                    <button key={o} onClick={() => setAnswers((p) => ({ ...p, [q.id]: o }))}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm border transition ${answers[q.id] === o ? 'border-orange-500 bg-orange-500/10 text-orange-200' : 'border-white/10 hover:bg-white/5'}`}>
                      <span className="inline-flex items-center gap-2">
                        {answers[q.id] === o && <Check className="w-3.5 h-3.5 text-orange-400" />}{o}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={submitAnswers} className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">Submit Vote</button>
          </div>
        </div>
      )}

      {resultsFor && results && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setResultsFor(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#121218] p-6 space-y-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg">Results — {results.survey.title}</h3>
              <button onClick={() => setResultsFor(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            {results.questions.map((q, qi) => (
              <div key={q.id}>
                <p className="text-sm font-bold mb-2">Q{qi + 1}: {q.text} <span className="text-xs font-normal text-slate-500">({q.total} votes)</span></p>
                <div className="space-y-1.5">
                  {q.counts.map((c, ci) => (
                    <div key={c.option}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-slate-300">{c.option}</span>
                        <span className="font-bold">{c.count} ({q.total ? Math.round((c.count / q.total) * 100) : 0}%)</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${(c.count / q.max) * 100}%`, backgroundColor: COLORS[ci % COLORS.length] }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
