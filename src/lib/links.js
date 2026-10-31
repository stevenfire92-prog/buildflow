// Link-in-bio engine — localStorage backed
const KEY = 'sflinks:profile';

const DEFAULT = {
  name: 'Se Fire',
  bio: 'Artist · Builder · Se Fire Tech',
  avatar: '🔥',
  theme: '#f97316',
  links: [
    { id: '1', title: 'Latest music 🎵', url: 'https://open.spotify.com/artist/0pvxsVN3Cj3MochJhfROvm', visible: true },
    { id: '2', title: 'Se Fire Tech services', url: 'https://globalscalemonetizer.com', visible: true },
  ],
};

export function getProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    const p = JSON.parse(raw);
    return { ...DEFAULT, ...p, links: Array.isArray(p.links) ? p.links : [] };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveProfile(profile) {
  localStorage.setItem(KEY, JSON.stringify(profile));
}

export function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
