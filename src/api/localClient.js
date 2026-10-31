// BuildFlow local client — 100% independent, zero external dependencies.
// Provides: entities, auth, functions, app, integrations, users
// backed by localStorage and local API routes.

const LS_PREFIX = 'bf:entity:';
const AUTH_KEY = 'bf:auth:user';
const TOKEN_KEY = 'bf:auth:token';

// ---------- tiny event bus for subscriptions ----------
const bus = {};
function emit(entity, event) {
  (bus[entity] || []).forEach((cb) => { try { cb(event); } catch { /* ignore */ } });
}
function subscribe(entity, cb) {
  bus[entity] = bus[entity] || [];
  bus[entity].push(cb);
  return () => { bus[entity] = (bus[entity] || []).filter((f) => f !== cb); };
}

// ---------- localStorage entity store ----------
function readAll(entity) {
  try {
    return JSON.parse(localStorage.getItem(LS_PREFIX + entity) || '[]');
  } catch {
    return [];
  }
}
function writeAll(entity, rows) {
  localStorage.setItem(LS_PREFIX + entity, JSON.stringify(rows));
}
function uid() {
  return 'local_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function applySort(rows, sort) {
  if (!sort) return rows;
  const desc = sort.startsWith('-');
  const key = desc ? sort.slice(1) : sort;
  return [...rows].sort((a, b) => {
    const av = a[key] ?? '', bv = b[key] ?? '';
    if (av < bv) return desc ? 1 : -1;
    if (av > bv) return desc ? -1 : 1;
    return 0;
  });
}
function matches(row, filter) {
  if (!filter) return true;
  return Object.entries(filter).every(([k, v]) => row[k] === v);
}

function makeEntity(name) {
  return {
    async list(sort, limit, filter) {
      let rows = readAll(name).filter((r) => matches(r, filter));
      rows = applySort(rows, sort);
      return typeof limit === 'number' ? rows.slice(0, limit) : rows;
    },
    async filter(filter, sort, limit) {
      return this.list(sort, limit, filter);
    },
    async get(id) {
      const row = readAll(name).find((r) => r.id === id);
      if (!row) throw Object.assign(new Error('Not found'), { status: 404 });
      return row;
    },
    async create(data) {
      const now = new Date().toISOString();
      const row = { id: uid(), created_date: now, updated_date: now, ...data };
      const rows = readAll(name);
      rows.push(row);
      writeAll(name, rows);
      emit(name, { type: 'create', data: row });
      return row;
    },
    async update(id, data) {
      const rows = readAll(name);
      const i = rows.findIndex((r) => r.id === id);
      if (i < 0) throw Object.assign(new Error('Not found'), { status: 404 });
      rows[i] = { ...rows[i], ...data, updated_date: new Date().toISOString() };
      writeAll(name, rows);
      emit(name, { type: 'update', data: rows[i] });
      return rows[i];
    },
    async delete(id) {
      const rows = readAll(name);
      const row = rows.find((r) => r.id === id);
      writeAll(name, rows.filter((r) => r.id !== id));
      emit(name, { type: 'delete', data: row });
      return { id };
    },
    async bulkUpdate(ids, data) {
      const rows = readAll(name);
      const now = new Date().toISOString();
      const updated = [];
      ids.forEach((id) => {
        const i = rows.findIndex((r) => r.id === id);
        if (i >= 0) { rows[i] = { ...rows[i], ...data, updated_date: now }; updated.push(rows[i]); }
      });
      writeAll(name, rows);
      return updated;
    },
    subscribe(cb) {
      return subscribe(name, cb);
    },
  };
}

// ---------- auth ----------
function getUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
  } catch {
    return null;
  }
}
function setUser(user) {
  if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  else localStorage.removeItem(AUTH_KEY);
}
function unauthorized() {
  return Object.assign(new Error('Not authenticated'), { status: 401 });
}

const auth = {
  async me() {
    const user = getUser();
    if (!user) throw unauthorized();
    return user;
  },
  async updateMe(data) {
    const user = { ...getUser(), ...data };
    setUser(user);
    return user;
  },
  setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  },
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  logout(redirectUrl) {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    if (redirectUrl) window.location.assign(redirectUrl);
  },
  async loginWithProvider() {
    throw new Error('Social login is not configured in this independent build.');
  },
  async register({ email, password, name }) {
    return this.registerViaEmailPassword(email, password, name);
  },
  async resendOtp() {
    throw new Error('OTP is not configured in this independent build.');
  },
  async resetPasswordRequest() {
    throw new Error('Password reset is not configured in this independent build.');
  },
  async loginLocal(email, name) {
    const user = {
      id: uid(),
      email,
      full_name: name || email.split('@')[0],
      created_date: new Date().toISOString(),
    };
    setUser(user);
    this.setToken('local_' + uid());
    return user;
  },
  // Local email/password auth (stored in this browser only).
  _getCredentials() {
    try {
      return JSON.parse(localStorage.getItem('bf:auth:creds') || '{}');
    } catch {
      return {};
    }
  },
  _saveCredentials(creds) {
    localStorage.setItem('bf:auth:creds', JSON.stringify(creds));
  },
  async loginViaEmailPassword(email, password) {
    const creds = this._getCredentials();
    const record = creds[email.toLowerCase()];
    if (!record || record.password !== btoa(password)) {
      throw Object.assign(new Error('Invalid email or password'), { status: 401 });
    }
    const user = { id: record.id, email, full_name: record.name, created_date: record.created };
    setUser(user);
    this.setToken('local_' + uid());
    return user;
  },
  async registerViaEmailPassword(email, password, name) {
    const creds = this._getCredentials();
    const key = email.toLowerCase();
    if (creds[key]) throw Object.assign(new Error('An account with this email already exists'), { status: 409 });
    const user = { id: uid(), email, full_name: name || email.split('@')[0], created_date: new Date().toISOString() };
    creds[key] = { id: user.id, password: btoa(password), name: user.full_name, created: user.created_date };
    this._saveCredentials(creds);
    setUser(user);
    this.setToken('local_' + uid());
    return user;
  },
};

// ---------- functions ----------
const BILLING_ROUTES = {
  createCheckoutSession: '/api/checkout',
  getEntitlements: '/api/entitlements',
  verifyCheckoutSession: '/api/verify-checkout',
  createBillingPortalSession: '/api/billing-portal',
};

async function invokeFunction(name, data = {}) {
  if (BILLING_ROUTES[name]) {
    const token = auth.getToken();
    const user = getUser();
    const response = await fetch(BILLING_ROUTES[name], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        ...data,
        // Independent build: identify the local user to the billing backend.
        bf_user: user ? { id: user.id, email: user.email } : undefined,
      }),
    });
    const result = await response.json().catch(() => ({ error: 'invalid_response' }));
    if (!response.ok) {
      throw Object.assign(new Error(result.message || 'Request failed'), {
        status: response.status,
        response: { status: response.status, data: result },
      });
    }
    return { data: result, status: response.status };
  }

  switch (name) {
    case 'getTranslations':
      return { data: { translations: {} }, status: 200 };
    case 'getSheetGrowthDashboard':
    case 'exportWeeklyMetricsToSheet':
    case 'sendWeeklyGmailReport':
    case 'syncProjectDeadlinesToCalendar':
      return { data: { ok: true, note: 'Connect Google services to enable.' }, status: 200 };
    case 'uploadProjectFileToDrive':
    case 'deleteProjectFileFromDrive':
      return { data: { ok: true, note: 'Connect Google Drive to enable.' }, status: 200 };
    case 'createBookCheckoutSession':
      return invokeFunction('createCheckoutSession', data);
    default:
      return { data: { ok: true }, status: 200 };
  }
}

// ---------- app ----------
const app = {
  async getPublicSettings() {
    return {
      paymentsBackend: 'vercel',
      appName: 'BuildFlow',
      independent: true,
    };
  },
};

// ---------- integrations ----------
const integrations = {
  Core: {
    async InvokeLLM() {
      throw new Error('AI features need an API key — add one in Settings.');
    },
    async SendEmail() {
      return { ok: false, note: 'Email is not configured in this independent build.' };
    },
  },
};

// ---------- users ----------
const users = {
  async inviteUser() {
    throw new Error('User invites are not available in this independent build.');
  },
};

// ---------- the client ----------
export const client = {
  entities: {
    Project: makeEntity('Project'),
    KindleBook: makeEntity('KindleBook'),
    ActivityLog: makeEntity('ActivityLog'),
    ProjectTemplate: makeEntity('ProjectTemplate'),
    User: makeEntity('User'),
    MusicProfile: makeEntity('MusicProfile'),
    Comment: makeEntity('Comment'),
    ProjectFile: makeEntity('ProjectFile'),
  },
  auth,
  functions: { invoke: invokeFunction },
  app,
  integrations,
  users,
};

// Token helper
export function getAccessToken() {
  return auth.getToken();
}

export default client;
