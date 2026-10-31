import { useEffect, useState } from 'react';
import {
  Search, Bookmark, X, Loader2, Sun, CloudSun, Cloud, CloudFog,
  CloudDrizzle, CloudRain, CloudRainWind, CloudSnow, CloudLightning,
  Droplets, Wind, Thermometer,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  geocode, getForecast, weatherInfo,
  getSaved, saveLocation, removeLocation,
  getLastViewed, setLastViewed,
} from '../lib/weather';

const ICONS = {
  Sun, CloudSun, Cloud, CloudFog, CloudDrizzle,
  CloudRain, CloudRainWind, CloudSnow, CloudLightning,
};

const TORONTO = { name: 'Toronto', country: 'Canada', lat: 43.65, lon: -79.38 };

function WeatherIcon({ name, size = 32, className = '' }) {
  const Cmp = ICONS[name] || Cloud;
  return <Cmp size={size} className={className} />;
}

function dayName(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

export default function WeatherDash() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [location, setLocation] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(getSaved());

  const loadLocation = async (loc) => {
    setLoading(true);
    setLocation(loc);
    setLastViewed(loc);
    try {
      const data = await getForecast(loc.lat, loc.lon);
      setForecast(data);
      setResults([]);
      setQuery('');
    } catch (e) {
      toast.error('Could not load the forecast. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const last = getLastViewed();
    loadLocation(last || TORONTO);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    try {
      const list = await geocode(q);
      setResults(list);
      if (list.length === 0) toast.info('No locations found for that search.');
    } catch (e) {
      toast.error('Search failed. Check your connection and try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleSave = (loc) => {
    const list = saveLocation(loc);
    setSaved(list);
    toast.success(`${loc.name} saved.`);
  };

  const handleRemove = (name) => {
    const list = removeLocation(name);
    setSaved(list);
  };

  const isSaved = location && saved.some((s) => s.name === location.name && s.country === location.country);

  const current = forecast?.current;
  const currentInfo = current ? weatherInfo(current.weather_code) : null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            placeholder="Search a city..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-orange-400/60"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={searching}
          className="shrink-0 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-xl px-5 py-3 font-semibold flex items-center gap-2 disabled:opacity-60"
        >
          {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          Search
        </button>
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <div className="mt-3 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {results.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0"
            >
              <button onClick={() => loadLocation(r)} className="text-left flex-1">
                <span className="text-white font-medium">{r.name}</span>
                {r.country && <span className="text-white/50 text-sm ml-2">{r.country}</span>}
              </button>
              <button
                onClick={() => handleSave(r)}
                className="text-white/40 hover:text-amber-400 p-1"
                aria-label={`Save ${r.name}`}
              >
                <Bookmark size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Saved locations */}
      {saved.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {saved.map((s) => (
            <div
              key={`${s.name}-${s.country}`}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                location && location.name === s.name && location.country === s.country
                  ? 'border-orange-400/60 bg-orange-400/10 text-white'
                  : 'border-white/10 bg-white/5 text-white/70'
              }`}
            >
              <button onClick={() => loadLocation(s)} className="hover:text-white">
                {s.name}
              </button>
              <button
                onClick={() => handleRemove(s.name)}
                className="text-white/40 hover:text-red-400"
                aria-label={`Remove ${s.name}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-8 flex flex-col items-center gap-3 text-white/60">
          <Loader2 size={36} className="animate-spin text-orange-400" />
          <p className="text-sm">Loading forecast...</p>
        </div>
      )}

      {/* Current conditions */}
      {!loading && forecast && current && location && (
        <div className="mt-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">{location.name}</h2>
                {location.country && <p className="text-white/50 text-sm">{location.country}</p>}
              </div>
              {!isSaved && (
                <button
                  onClick={() => handleSave(location)}
                  className="flex items-center gap-1.5 text-sm text-amber-300/80 hover:text-amber-300 border border-amber-500/30 rounded-full px-3 py-1.5"
                >
                  <Bookmark size={14} /> Save
                </button>
              )}
            </div>
            <div className="mt-4 flex items-center gap-5">
              <WeatherIcon name={currentInfo.icon} size={64} className="text-orange-400" />
              <div>
                <p className="text-5xl sm:text-6xl font-bold text-white">{Math.round(current.temperature_2m)}°</p>
                <p className="text-white/60 mt-1">{currentInfo.label}</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <Thermometer size={18} className="mx-auto text-orange-300/80" />
                <p className="text-white/50 text-xs mt-1">Feels like</p>
                <p className="text-white font-semibold">{Math.round(current.apparent_temperature)}°C</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <Droplets size={18} className="mx-auto text-sky-300/80" />
                <p className="text-white/50 text-xs mt-1">Humidity</p>
                <p className="text-white font-semibold">{current.relative_humidity_2m}%</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <Wind size={18} className="mx-auto text-emerald-300/80" />
                <p className="text-white/50 text-xs mt-1">Wind</p>
                <p className="text-white font-semibold">{Math.round(current.wind_speed_10m)} km/h</p>
              </div>
            </div>
          </div>

          {/* 7-day forecast */}
          <h3 className="mt-8 mb-3 text-lg font-bold text-white">7-day forecast</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {forecast.daily.time.map((t, i) => {
              const info = weatherInfo(forecast.daily.weather_code[i]);
              return (
                <div key={t} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-white/60 text-xs font-medium">{i === 0 ? 'Today' : dayName(t)}</p>
                  <WeatherIcon name={info.icon} size={28} className="mx-auto mt-2 text-orange-300" />
                  <p className="text-white/40 text-[11px] mt-1 h-4 truncate">{info.label}</p>
                  <p className="text-white text-sm font-semibold mt-1">
                    {Math.round(forecast.daily.temperature_2m_max[i])}°
                    <span className="text-white/40 font-normal"> / {Math.round(forecast.daily.temperature_2m_min[i])}°</span>
                  </p>
                  <p className="text-sky-300/70 text-xs mt-1">
                    <Droplets size={11} className="inline -mt-0.5" /> {forecast.daily.precipitation_probability_max[i] ?? 0}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
