# Se Fire Music Studio — isolated browser prototype

This directory contains an **original** Web Audio 16-step drum sequencer with kick, snare, closed hat, and clap synthesis. No samples, melodies, or copyrighted recordings are included.

## Run locally
Open `index.html` in a modern browser. Press **Play** to authorize Web Audio. Toggle steps, change tempo, export/import a JSON pattern. The app stores patterns in localStorage only.

## Safety / release
- Isolated prototype under `prototypes/`; not wired to existing production Vercel apps or Stripe.
- No authentication, customer data, paid tiers, or founder entitlements.
- No analytics, network calls, or remote storage.
- Browser functional tests and accessibility review **not yet performed**.
- The original approved Se Fire Tech logo is saved as a ChatGPT reference asset but has not been committed here; text branding is temporary. Do not invent or replace the logo.
- Before a future public release: add the actual approved logo, browser tests (Safari/Chrome), audio timing and mobile checks, persistence/export tests, and deployment/source mapping verification.

## Revenue roadmap (not implemented)
Optional paid creator features could include multitrack recording, project cloud sync, WAV export, effects, and collaboration after secure identity, billing, entitlements and Stripe test-mode verification.

## Automated checks

Run `node --test prototypes/se-fire-music-studio/tests/sequencer.test.mjs` from the repository root (Node 20+). The dependency-free tests verify the presence of accessible controls, exercise the actual inline pattern validator in an isolated VM, and check import/export guards and local-only behavior.

On 2026-11-02, source-level checks against the GitHub branch passed (8 markup/guard assertions and 3 validator assertions). The new Node test file itself has **not** been run in a Node environment or GitHub Actions. Browser audio playback, timing, Safari/iOS compatibility, export/import UI, and accessibility still require functional testing before release.
