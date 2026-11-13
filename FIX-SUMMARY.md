# GlobePay Checkout Fix — Summary (Nov 3, 2026 ~8:30 PM EST)

## Root cause: DNS, not code

`globalscalemonetizer.com` does **NOT** point to Vercel. DNS resolves through
Cloudflare to **Render.com** (response headers: `rndr-id`, `x-render-origin-server: uvicorn`,
`via: 1.1 Caddy`). The live site is an OLD **Base44-based Spanish build** of GlobePay
hosted on Render — bundle `assets/index-_V46cRe4.js` (546 KB, zero PayPal references).

The Vercel `globepay` project (Se Fire Tech team) builds the current code fine and shows
READY, but its deployments never reach the live domain because DNS doesn't point there.

## Why "Comenzar" shows "Checkout failed / Please try again"

The old Render build's checkout calls a Base44 backend function:

```js
Ap.functions.invoke('createCheckoutSession', { plan, billing })
```

`Ap.functions.invoke` is the Base44 SDK. That backend doesn't exist/work on the Render
deployment, the call throws, and the UI shows "Checkout failed / Please try again."
This flow exists **only** in the old Render build — it is not in the current codebase.

## Current codebase status: already correct, no rebuild needed

- `src/globepay/pages/Landing.jsx` is 100% English, identical on GitHub
  (`product/globepay` @ `3ad75ca`) and local. No "Comenzar", no Spanish, no Base44
  (`Ap.`, `functions.invoke`, `base44` — zero hits in `src/`).
- `PayPalCheckout` (same proven component as se-fire-aiwriter) is imported
  (line 9) and rendered on the Pro tier (line 190).
- API routes complete: `api/paypal/{config,create-order,capture-order,plans,subscription/[id]}.js`
  backed by `api/paypal.js` (`getAccessToken`, `createOrder`, `captureOrder`,
  `getSubscription`, `ensurePlans`).
- `FREE_ACCESS_ENABLED = false` (paywall live).
- Local `vite build` succeeds; fresh bundle contains PayPal code, English strings,
  zero Spanish. (Chunk-size warning only — 965 KB, non-blocking.)
- The Base44-free rebuild already happened earlier (commit `5082627`).

**No code changes were required, so nothing was pushed — `product/globepay` @ `3ad75ca`
already contains the correct code.**

## PayPal env vars (already on Vercel project "globepay", Project tab)

All 6 present, all environments: `VITE_PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_ID`,
`PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE=live`, `PAYPAL_PLAN_MONTHLY=P-50074034K0917772RNLVHSQA`,
`PAYPAL_PLAN_YEARLY=P-05436699AW0885827NLVHSQA`.

## What Steve needs to do (only he can do this)

**Point `globalscalemonetizer.com` DNS to Vercel.** In Cloudflare DNS for the domain,
replace the Render target with Vercel's (Vercel dashboard → globepay project →
Settings → Domains shows the required record). Until DNS moves, every Vercel redeploy
is invisible on the live domain.

Note: `builderflowstudio.com` and `dr-build-ai.com` also point to Render.com —
same situation if/when those are migrated.

## Verification after DNS moves

1. `curl -sI https://globalscalemonetizer.com/` should show Vercel headers
   (no `rndr-id` / `x-render-origin-server`).
2. The bundle hash will change from `index-_V46cRe4.js`; page renders English
   ("Start monetizing free").
3. Click Go Pro → Choose Pro Monthly → yellow PayPal button + card button render
   (same as se-fire-aiwriter, confirmed working Nov 3 ~7:19 PM EST).

## Lesson for next time

Before debugging "the live site doesn't match the code," check response headers /
DNS first: `curl -sI https://<domain>/ | grep -iE "server|rndr-id|x-render"`.
A READY deployment in the Vercel dashboard means nothing if DNS points elsewhere.
