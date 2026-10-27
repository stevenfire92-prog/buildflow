import assert from "node:assert/strict";
import { test } from "node:test";
import session from "../api/session.js";
import google from "../api/auth/google.js";

function response() {
  return {
    statusCode: 200, headers: {}, body: null,
    setHeader(k,v) { this.headers[k] = v; return this; },
    status(n) { this.statusCode = n; return this; },
    json(data) { this.body = data; return this; }
  };
}
test("session denies anonymous callers", () => {
  const res = response();
  session({ method: "GET", headers: {} }, res);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.founder, false);
});
test("session rejects browser-provided founder identity", () => {
  const res = response();
  session({ method: "GET", headers: { authorization: "Bearer founder=true" }, query: { founder: "true" } }, res);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.founder, false);
});
test("session refuses unsupported methods", () => {
  const res = response();
  session({ method: "POST", headers: {} }, res);
  assert.equal(res.statusCode, 405);
});
test("Google exchange is disabled outside an explicitly configured preview", async () => {
  const original = process.env.AUTH_PREVIEW_ENABLED;
  const originalVercel = process.env.VERCEL_ENV;
  try {
    process.env.AUTH_PREVIEW_ENABLED = "false";
    process.env.VERCEL_ENV = "production";
    const res = response();
    await google({ method: "POST", body: { idToken: "fabricated", totp: "123456" } }, res);
    assert.equal(res.statusCode, 503);
  } finally {
    if(original===undefined) delete process.env.AUTH_PREVIEW_ENABLED; else process.env.AUTH_PREVIEW_ENABLED=original;
    if(originalVercel===undefined) delete process.env.VERCEL_ENV; else process.env.VERCEL_ENV=originalVercel;
  }
});
test("Google exchange refuses unsupported methods", async () => {
  const res = response();
  await google({ method: "GET" }, res);
  assert.equal(res.statusCode, 405);
});
