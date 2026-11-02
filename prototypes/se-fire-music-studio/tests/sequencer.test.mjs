import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import { runInNewContext } from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(resolve(root, "index.html"), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, "Expected an inline application script");

test("Se Fire Tech prototype exposes transport, grid, import and export controls", () => {
  assert.match(html, /<title>Se Fire Music Studio/);
  for (const id of ["play", "stop", "tempo", "grid", "clear", "export", "import", "status"]) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
  assert.match(html, /aria-live="polite"/);
});

test("pattern validator rejects malformed or nonboolean 16-step tracks", () => {
  const declaration = script.match(/const valid=x=>[^;]+;/)?.[0];
  assert.ok(declaration, "Expected to find the actual pattern validator");
  const ctx = { TRACKS: ["Kick", "Snare", "Closed hat", "Clap"], STEPS: 16 };
  runInNewContext(declaration + "\n globalThis.validate=valid;", ctx);
  const good = Array.from({ length: 4 }, () => Array(16).fill(false));
  assert.equal(ctx.validate(good), true);
  assert.equal(ctx.validate(null), false);
  assert.equal(ctx.validate(good.slice(0, 3)), false);
  assert.equal(ctx.validate(good.map(row => row.slice(0, 15))), false);
  const bad = good.map(row => [...row]); bad[1][4] = "yes";
  assert.equal(ctx.validate(bad), false);
});

test("import/export has a format guard and an input size limit", () => {
  assert.match(script, /se-fire-studio-v1/);
  assert.match(script, /file\.size>100000/);
  assert.match(script, /!valid\(d\.pattern\)/);
  assert.match(script, /Math\.min\(180,Math\.max\(60,d\.tempo\)\)/);
});

test("prototype remains local-only and stops when hidden", () => {
  assert.match(script, /localStorage\.setItem/);
  assert.match(script, /visibilitychange/);
  assert.doesNotMatch(html, /<script\s+src=/i);
  assert.doesNotMatch(script, /fetch\(|XMLHttpRequest|WebSocket|sk_live_|sk_test_/);
});
