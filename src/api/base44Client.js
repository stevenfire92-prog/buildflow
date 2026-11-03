// LOCAL STUB — Replaces the Base44 SDK with independent localStorage-backed implementations.
// This file was formerly the Base44 SDK client. It has been replaced to remove
// all Base44 dependencies. All data operations use localStorage; auth is local-only.
// No network calls to Base44 are made.

function lsGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable — ignore
  }
}

function entityStore(name) {
  const key = `local:${name}`;
  return {
    async list(sort) {
      const items = lsGet(key, []);
      if (sort && sort.startsWith('-')) {
        const field = sort.slice(1);
        return [...items].sort((a, b) => (b[field] > a[field] ? 1 : -1));
      }
      return items;
    },
    async get(id) {
      const items = lsGet(key, []);
      return items.find((i) => i.id === id) || null;
    },
    async create(data) {
      const items = lsGet(key, []);
      const record = { ...data, id: data.id || `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, created_date: new Date().toISOString() };
      items.push(record);
      lsSet(key, items);
      return record;
    },
    async update(id, data) {
      const items = lsGet(key, []);
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) throw new Error('Not found');
      items[idx] = { ...items[idx], ...data, updated_date: new Date().toISOString() };
      lsSet(key, items);
      return items[idx];
    },
    async delete(id) {
      const items = lsGet(key, []);
      lsSet(key, items.filter((i) => i.id !== id));
      return { id };
    },
    async bulk(operation, records) {
      if (operation === 'create') {
        const results = [];
        for (const r of records) results.push(await this.create(r));
        return results;
      }
      return [];
    },
    filter() {
      // minimal chainable stub
      return this;
    },
    subscribe(callback) {
      // no-op subscription; return unsubscribe
      return () => {};
    },
  };
}

const entities = new Proxy(
  {},
  {
    get(_t, name) {
      if (typeof name !== 'string') return undefined;
      return entityStore(name);
    },
  }
);

const functions = {
  async invoke(name, data = {}) {
    // Local stub: backend functions are not available without a server.
    // Callers that need Vercel billing routes should use attachVercelBilling.
    console.warn(`[local stub] base44.functions.invoke("${name}") has no local implementation.`);
    return { data: null };
  },
};

const auth = {
  async me() {
    return lsGet('local:currentUser', null);
  },
  async login(email, password) {
    const user = { id: `user_${Date.now()}`, email };
    lsSet('local:currentUser', user);
    return user;
  },
  async logout(redirectUrl) {
    try {
      localStorage.removeItem('local:currentUser');
    } catch {
      // ignore
    }
    if (redirectUrl && typeof window !== 'undefined') window.location.href = redirectUrl;
  },
  async register(email, password, extra = {}) {
    const user = { id: `user_${Date.now()}`, email, ...extra };
    lsSet('local:currentUser', user);
    return user;
  },
};

const app = {
  async getPublicSettings() {
    return {};
  },
};

const users = {
  async list() {
    return [];
  },
  async me() {
    return auth.me();
  },
};

const integrations = {
  async invoke() {
    return { data: null };
  },
};

export const base44 = {
  entities,
  functions,
  auth,
  app,
  users,
  integrations,
};

export default base44;
