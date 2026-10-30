// Dr Build AI engine — understands the prompt, picks the right blueprint,
// and narrates the build like a senior dev thinking out loud.

export const BLUEPRINTS = {
  landing: {
    id: 'landing',
    name: 'Landing Page',
    keywords: ['landing', 'homepage', 'website', 'site', 'page for my', 'business', 'company', 'startup', 'coffee', 'shop', 'restaurant', 'salon', 'gym', 'studio'],
    steps: ['Analyzing your concept', 'Designing hero section', 'Writing copy that converts', 'Adding social proof', 'Polishing call-to-action', 'Final touches'],
  },
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard',
    keywords: ['dashboard', 'admin', 'analytics', 'stats', 'metrics', 'panel', 'crm', 'overview'],
    steps: ['Analyzing data model', 'Building stat cards', 'Charting your metrics', 'Wiring live tables', 'Adding filters', 'Final touches'],
  },
  store: {
    id: 'store',
    name: 'Online Store',
    keywords: ['store', 'shop online', 'ecommerce', 'e-commerce', 'sell', 'products', 'cart', 'checkout', 'merch'],
    steps: ['Analyzing your catalog', 'Building product grid', 'Wiring the cart', 'Designing checkout flow', 'Adding product pages', 'Final touches'],
  },
  portfolio: {
    id: 'portfolio',
    name: 'Portfolio',
    keywords: ['portfolio', 'photography', 'design work', 'gallery', 'showcase', 'my work', 'artist'],
    steps: ['Curating layout', 'Building gallery grid', 'Adding lightbox views', 'Writing about section', 'Contact form', 'Final touches'],
  },
  saas: {
    id: 'saas',
    name: 'SaaS App',
    keywords: ['saas', 'app', 'platform', 'tool', 'software', 'subscription', 'ai'],
    steps: ['Mapping user flows', 'Building auth screens', 'Creating core workspace', 'Pricing & billing UI', 'Onboarding tour', 'Final touches'],
  },
};

export function detectBlueprint(prompt) {
  const lower = prompt.toLowerCase();
  let best = BLUEPRINTS.landing;
  let bestScore = 0;
  for (const bp of Object.values(BLUEPRINTS)) {
    const score = bp.keywords.filter((k) => lower.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      best = bp;
    }
  }
  return best;
}

export function extractAppName(prompt) {
  const lower = prompt.toLowerCase();
  const forMatch = lower.match(/for (?:my )?([a-z0-9 &'-]+?)(?:\.|,|$)/);
  if (forMatch) {
    const name = forMatch[1].trim();
    if (name.length > 2 && name.length < 40) return titleCase(name);
  }
  const myMatch = lower.match(/my ([a-z0-9'-]+(?: [a-z0-9'-]+){0,2})/);
  if (myMatch) return titleCase(myMatch[1]);
  return 'My App';
}

function titleCase(s) {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

export function aiGreeting(prompt, blueprint, appName) {
  const intros = [
    `Love it. Building **${appName}** as a ${blueprint.name.toLowerCase()} — here's my plan:`,
    `On it. **${appName}** is going to be a slick ${blueprint.name.toLowerCase()}. Watch this:`,
    `Great brief. Spinning up **${appName}** — ${blueprint.name.toLowerCase()} style, coming right up:`,
  ];
  return intros[Math.floor(Math.random() * intros.length)];
}

export function aiDoneMessage(appName, blueprint) {
  return `**${appName}** is live! 🎉 I built you a complete ${blueprint.name.toLowerCase()} — responsive, styled, and ready to share. Hit **Publish** to ship it, or tell me what to change and I'll iterate.`;
}

// --- Saved apps (local-first) ---
const APPS_KEY = 'drbuildai:apps';

export function getApps() {
  try {
    return JSON.parse(localStorage.getItem(APPS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveApp(app) {
  const apps = getApps();
  const next = app.id ? apps.map((a) => (a.id === app.id ? app : a)) : [{ ...app, id: `app_${Date.now()}`, createdAt: Date.now() }, ...apps];
  localStorage.setItem(APPS_KEY, JSON.stringify(next));
  return next;
}

export function deleteApp(id) {
  const next = getApps().filter((a) => a.id !== id);
  localStorage.setItem(APPS_KEY, JSON.stringify(next));
  return next;
}
