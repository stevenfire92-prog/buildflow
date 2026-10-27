import test from 'node:test';
import assert from 'node:assert/strict';
import projectsHandler from '../api/projects.js';
import sessionHandler from '../api/auth/session.js';
import healthHandler from '../api/health.js';

function response() {
  return {
    statusCode: 200, headers: {}, body: undefined,
    setHeader(k,v) { this.headers[k.toLowerCase()] = v; return this; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

test('health endpoint rejects mutations', async () => {
  const res = response();
  await healthHandler({ method: 'POST' }, res);
  assert.equal(res.statusCode, 405);
});

test('session endpoint refuses unconfigured identity', async () => {
  const res = response();
  await sessionHandler({ method: 'GET' }, res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.authenticated, false);
  assert.equal(res.headers['cache-control'], 'no-store');
});

test('session endpoint rejects unsupported methods', async () => {
  const res = response();
  await sessionHandler({ method: 'POST' }, res);
  assert.equal(res.statusCode, 405);
});

test('projects endpoint fails closed without database configuration', async () => {
  const original = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    const res = response();
    await projectsHandler({ method: 'GET', headers: { 'x-user-id': 'forged' } }, res);
    assert.equal(res.statusCode, 503);
    assert.equal(res.body.error, 'backend_not_configured');
  } finally {
    if (original === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = original;
  }
});

test('projects endpoint still refuses access with database URL but no authentication', async () => {
  const original = process.env.DATABASE_URL;
  process.env.DATABASE_URL = 'postgresql://example.invalid/test';
  try {
    const res = response();
    await projectsHandler({ method: 'GET' }, res);
    assert.equal(res.statusCode, 501);
    assert.equal(res.body.error, 'identity_provider_not_integrated');
  } finally {
    if (original === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = original;
  }
});

test('projects endpoint rejects non-read/write methods', async () => {
  const res = response();
  await projectsHandler({ method: 'DELETE' }, res);
  assert.equal(res.statusCode, 405);
});
