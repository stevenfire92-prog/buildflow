import { useEffect, useMemo, useState } from 'react';
import { Search, Heart, Clock, Users, ChefHat, X, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  CATEGORIES,
  getRecipes,
  addRecipe,
  deleteRecipe,
  toggleFavorite,
} from '../lib/recipes';

export default function RecipeBook() {
  const [recipes, setRecipes] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [favOnly, setFavOnly] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [checked, setChecked] = useState([]);

  useEffect(() => {
    setRecipes(getRecipes());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes.filter((r) => {
      if (favOnly && !r.favorite) return false;
      if (category !== 'All' && r.category !== category) return false;
      if (q) {
        const inName = r.name.toLowerCase().includes(q);
        const inIngredients = (r.ingredients || []).some((i) => i.toLowerCase().includes(q));
        if (!inName && !inIngredients) return false;
      }
      return true;
    });
  }, [recipes, query, category, favOnly]);

  const openDetail = (r) => {
    setChecked(new Array((r.ingredients || []).length).fill(false));
    setSelected(r);
  };

  const handleToggleFavorite = (e, id) => {
    e.stopPropagation();
    setRecipes(toggleFavorite(id));
    if (selected && selected.id === id) {
      setSelected({ ...selected, favorite: !selected.favorite });
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this recipe? This cannot be undone.')) {
      setRecipes(deleteRecipe(id));
      setSelected(null);
      toast.success('Recipe deleted');
    }
  };

  const toggleChecked = (idx) => {
    setChecked((prev) => prev.map((c, i) => (i === idx ? !c : c)));
  };

  return (
    <section className="max-w-6xl mx-auto px-4 pb-20">
      {/* Controls */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search recipes or ingredients..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 outline-none focus:border-orange-400/60 focus:bg-white/10 transition"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setFavOnly(!favOnly)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition ${
                favOnly
                  ? 'bg-red-500/20 border-red-500/50 text-red-200'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              <Heart className={`w-4 h-4 ${favOnly ? 'fill-red-400 text-red-400' : ''}`} />
              Favorites
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold hover:opacity-90 transition"
            >
              <Plus className="w-4 h-4" />
              Add Recipe
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                category === c
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <ChefHat className="w-16 h-16 mx-auto text-white/20 mb-4" />
          <p className="text-white/60 text-lg">No recipes found.</p>
          <p className="text-white/40 text-sm mt-1">Try a different search, or add your own recipe.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r) => (
            <div
              key={r.id}
              onClick={() => openDetail(r)}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-orange-400/40 hover:bg-white/10 transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30">
                  {r.category}
                </span>
                <button
                  onClick={(e) => handleToggleFavorite(e, r.id)}
                  aria-label="Toggle favorite"
                  className="p-1.5 rounded-full hover:bg-white/10 transition"
                >
                  <Heart
                    className={`w-5 h-5 transition ${
                      r.favorite ? 'fill-red-400 text-red-400' : 'text-white/40 group-hover:text-white/70'
                    }`}
                  />
                </button>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{r.name}</h3>
              <div className="flex items-center gap-4 text-sm text-white/50">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {r.time} min
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  Serves {r.servings}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-[#121218] border border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[#121218]/95 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30">
                  {selected.category}
                </span>
                <h2 className="text-xl font-bold text-white mt-2">{selected.name}</h2>
                <div className="flex items-center gap-4 text-sm text-white/50 mt-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {selected.time} min
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> Serves {selected.servings}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="p-2 rounded-full bg-white/5 hover:bg-white/15 transition shrink-0"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            <div className="px-6 py-6 space-y-8">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-orange-300 mb-3">Ingredients</h3>
                <ul className="space-y-2">
                  {(selected.ingredients || []).map((ing, i) => (
                    <li key={i}>
                      <label className="flex items-start gap-3 cursor-pointer bg-white/5 hover:bg-white/10 rounded-xl px-4 py-3 transition">
                        <input
                          type="checkbox"
                          checked={!!checked[i]}
                          onChange={() => toggleChecked(i)}
                          className="mt-1 w-4 h-4 accent-orange-500"
                        />
                        <span className={`text-white/85 text-sm ${checked[i] ? 'line-through text-white/40' : ''}`}>
                          {ing}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-orange-300 mb-3">Steps</h3>
                <ol className="space-y-3">
                  {(selected.steps || []).map((step, i) => (
                    <li key={i} className="flex gap-4 bg-white/5 rounded-xl px-4 py-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-white/85 text-sm pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <button
                  onClick={(e) => handleToggleFavorite(e, selected.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                    selected.favorite
                      ? 'bg-red-500/20 border border-red-500/50 text-red-200'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${selected.favorite ? 'fill-red-400 text-red-400' : ''}`} />
                  {selected.favorite ? 'Favorited' : 'Add to favorites'}
                </button>
                <button
                  onClick={(e) => handleDelete(e, selected.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-red-300/80 hover:bg-red-500/15 hover:border-red-500/40 text-sm font-medium transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add recipe modal */}
      {showForm && (
        <AddRecipeForm
          onClose={() => setShowForm(false)}
          onSaved={(r) => {
            setRecipes((prev) => [r, ...prev]);
            setShowForm(false);
          }}
        />
      )}
    </section>
  );
}

function AddRecipeForm({ onClose, onSaved }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [time, setTime] = useState('30');
  const [servings, setServings] = useState('4');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const ingList = ingredients.split('\n').map((s) => s.trim()).filter(Boolean);
    const stepList = steps.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!name.trim()) {
      toast.error('Give your recipe a name');
      return;
    }
    if (ingList.length === 0) {
      toast.error('Add at least one ingredient');
      return;
    }
    if (stepList.length === 0) {
      toast.error('Add at least one step');
      return;
    }
    const recipe = addRecipe({
      name: name.trim(),
      category,
      time: Math.max(1, parseInt(time, 10) || 30),
      servings: Math.max(1, parseInt(servings, 10) || 4),
      ingredients: ingList,
      steps: stepList,
    });
    toast.success('Recipe saved!');
    onSaved(recipe);
  };

  const field =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-orange-400/60 focus:bg-white/10 transition';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-[#121218] border border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#121218]/95 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-orange-400" />
            Add a Recipe
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 transition"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Recipe name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Grandma's Apple Pie" className={field} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${field} bg-[#1a1a22]`}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#1a1a22]">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Time (min)</label>
              <input type="number" min="1" value={time} onChange={(e) => setTime(e.target.value)} className={field} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Servings</label>
              <input type="number" min="1" value={servings} onChange={(e) => setServings(e.target.value)} className={field} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Ingredients — one per line</label>
            <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows={5} placeholder={'2 cups flour\n1 tsp salt\n...'} className={`${field} resize-y`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Steps — one per line</label>
            <textarea value={steps} onChange={(e) => setSteps(e.target.value)} rows={5} placeholder={'Preheat the oven...\nMix everything...\n...'} className={`${field} resize-y`} />
          </div>
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:opacity-90 transition"
          >
            Save Recipe
          </button>
        </form>
      </div>
    </div>
  );
}
