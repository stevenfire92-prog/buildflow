// Open-Meteo integration — no API key needed.
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export async function geocode(city) {
  const res = await fetch(`${GEO_URL}?name=${encodeURIComponent(city)}&count=5&language=en&format=json`);
  if (!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  if (!data.results || data.results.length === 0) return [];
  return data.results.map((r) => ({
    name: r.name,
    country: r.country || '',
    lat: r.latitude,
    lon: r.longitude,
  }));
}

export async function getForecast(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
  });
  const res = await fetch(`${FORECAST_URL}?${params.toString()}`);
  if (!res.ok) throw new Error('Forecast request failed');
  const data = await res.json();
  return { current: data.current, daily: data.daily };
}

const CODE_MAP = {
  0: { label: 'Clear sky', icon: 'Sun' },
  1: { label: 'Mostly clear', icon: 'CloudSun' },
  2: { label: 'Mostly clear', icon: 'CloudSun' },
  3: { label: 'Overcast', icon: 'Cloud' },
  45: { label: 'Fog', icon: 'CloudFog' },
  48: { label: 'Fog', icon: 'CloudFog' },
  51: { label: 'Drizzle', icon: 'CloudDrizzle' },
  53: { label: 'Drizzle', icon: 'CloudDrizzle' },
  55: { label: 'Drizzle', icon: 'CloudDrizzle' },
  61: { label: 'Rain', icon: 'CloudRain' },
  63: { label: 'Rain', icon: 'CloudRain' },
  65: { label: 'Rain', icon: 'CloudRain' },
  80: { label: 'Rain', icon: 'CloudRain' },
  81: { label: 'Rain', icon: 'CloudRain' },
  82: { label: 'Rain', icon: 'CloudRain' },
  66: { label: 'Freezing rain', icon: 'CloudRainWind' },
  67: { label: 'Freezing rain', icon: 'CloudRainWind' },
  71: { label: 'Snow', icon: 'CloudSnow' },
  73: { label: 'Snow', icon: 'CloudSnow' },
  75: { label: 'Snow', icon: 'CloudSnow' },
  77: { label: 'Snow', icon: 'CloudSnow' },
  85: { label: 'Snow', icon: 'CloudSnow' },
  86: { label: 'Snow', icon: 'CloudSnow' },
  95: { label: 'Thunderstorm', icon: 'CloudLightning' },
  96: { label: 'Storm w/ hail', icon: 'CloudLightning' },
  99: { label: 'Storm w/ hail', icon: 'CloudLightning' },
};

export function weatherInfo(code) {
  return CODE_MAP[code] || { label: 'Unknown', icon: 'Cloud' };
}

// Saved locations (localStorage)
const SAVED_KEY = 'sfweather:locations';
const LAST_KEY = 'sfweather:last';

export function getSaved() {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocation(loc) {
  const list = getSaved();
  if (!list.some((l) => l.name === loc.name && l.country === loc.country)) {
    list.push(loc);
    localStorage.setItem(SAVED_KEY, JSON.stringify(list));
  }
  return list;
}

export function removeLocation(name) {
  const list = getSaved().filter((l) => l.name !== name);
  localStorage.setItem(SAVED_KEY, JSON.stringify(list));
  return list;
}

export function getLastViewed() {
  try {
    const raw = localStorage.getItem(LAST_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLastViewed(loc) {
  localStorage.setItem(LAST_KEY, JSON.stringify(loc));
}
