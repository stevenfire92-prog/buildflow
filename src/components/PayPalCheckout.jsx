// ============================================================================
// PayPalCheckout.jsx — drop-in PayPal replacement for the Stripe ProUpgrade flow
// SAVE AS: src/components/PayPalCheckout.jsx
//
// Requires (see templates/paypal-env.md):
//   - VITE_PAYPAL_CLIENT_ID exposed to the client (or GET /api/paypal/config)
// Server endpoints required (see templates/paypal-api.js):
//   POST /api/paypal/create-order        { amount, description } -> { id }
//   POST /api/paypal/capture-order       { orderId }             -> { status, ... }
//   GET  /api/paypal/plans                                       -> { monthly, yearly } (PayPal plan IDs)
//   GET  /api/paypal/subscription/:id                            -> { status, ... } (verify)
//   GET  /api/paypal/config                                      -> { clientId?, configured }
// ============================================================================

import { useState, useEffect, useRef } from 'react';
import { Crown, X, Check, ArrowLeft, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PLANS = [
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: '$4.99',
    amount: '4.99',
    period: '/month',
    type: 'subscription',
    features: ['All features unlocked', 'Priority support', 'No ads', 'Cloud sync'],
  },
  {
    id: 'yearly',
    name: 'Pro Yearly',
    price: '$49.99',
    amount: '49.99',
    period: '/year',
    type: 'subscription',
    features: ['Everything in Monthly', '2 months free', 'Early access', 'Exclusive themes'],
    highlight: true,
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$99.99',
    amount: '99.99',
    period: 'one-time',
    type: 'one-time',
    features: ['Pay once, own forever', 'All future updates', 'VIP support', 'Founder badge'],
  },
];

// TEMPORARY: Free access for ALL users until payments go live.
// Steve's order Nov 2, 2026: "Make all free accounts have all paid services till we figure out Stripe"
// To revert: set to false and redeploy.
const FREE_ACCESS_UNTIL_STRIPE = true;

const FOUNDER_KEY = 'sfi:founder';
const PRO_KEY = 'sfi:pro';

export function isFounder() {
  try {
    if (FREE_ACCESS_UNTIL_STRIPE) return true;
    return localStorage.getItem(FOUNDER_KEY) === 'true';
  } catch {
    return FREE_ACCESS_UNTIL_STRIPE;
  }
}

// True when the user has paid (PayPal) or has founder/free access.
export function hasProAccess() {
  try {
    if (FREE_ACCESS_UNTIL_STRIPE) return true;
    if (localStorage.getItem(FOUNDER_KEY) === 'true') return true;
    const raw = localStorage.getItem(PRO_KEY);
    if (!raw) return false;
    const pro = JSON.parse(raw);
    return !!(pro && (pro.orderId || pro.subscriptionId));
  } catch {
    return FREE_ACCESS_UNTIL_STRIPE;
  }
}

function markPro(purchase) {
  try {
    localStorage.setItem(
      PRO_KEY,
      JSON.stringify({ provider: 'paypal', date: new Date().toISOString(), ...purchase })
    );
  } catch {
    // storage unavailable — access check will fall back to flag
  }
}

function isRealFounder() {
  try {
    return localStorage.getItem(FOUNDER_KEY) === 'true';
  } catch {
    return false;
  }
}

// --- PayPal JS SDK loader (one instance per intent; subscription vs one-time need different params) ---
const sdkPromises = {};

function loadPayPalSdk(clientId, { subscription } = {}) {
  const key = subscription ? 'sub' : 'once';
  const wantIntent = subscription ? 'subscription' : 'capture';
  if (sdkPromises[key]) return sdkPromises[key];

  sdkPromises[key] = new Promise((resolve, reject) => {
    if (window.paypal && window.paypal.__sefire_intent === wantIntent) {
      resolve(window.paypal);
      return;
    }
    // Drop any previously loaded SDK with a different intent (only one may exist per page).
    document.querySelectorAll('script[data-sefire-paypal]').forEach((s) => s.remove());
    try {
      delete window.paypal;
    } catch {
      // ignore
    }
    const params = new URLSearchParams({
      'client-id': clientId,
      currency: 'USD',
      components: 'buttons',
      intent: wantIntent,
    });
    if (subscription) params.set('vault', 'true');

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
    script.dataset.sefirePaypal = '1';
    script.onload = () => {
      if (window.paypal) {
        window.paypal.__sefire_intent = wantIntent;
        resolve(window.paypal);
      } else {
        delete sdkPromises[key];
        reject(new Error('PayPal SDK failed to initialize'));
      }
    };
    script.onerror = () => {
      delete sdkPromises[key];
      reject(new Error('PayPal SDK failed to load — check your connection'));
    };
    document.head.appendChild(script);
  });

  return sdkPromises[key];
}

async function resolveClientId() {
  const envId =
    typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.VITE_PAYPAL_CLIENT_ID
      : null;
  if (envId) return envId;
  const r = await fetch('/api/paypal/config');
  const d = await r.json();
  if (!d.clientId) throw new Error('PayPal is not configured yet');
  return d.clientId;
}

export default function PayPalCheckout({ appName = 'this app' }) {
  const [showModal, setShowModal] = useState(false);
  const [plan, setPlan] = useState(null); // selected plan object, null = plan picker step
  const [sdkState, setSdkState] = useState('idle'); // idle | loading | ready | error
  const [sdkError, setSdkError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [paypalReady, setPaypalReady] = useState(false);
  const buttonsRef = useRef(null);

  // Check server-side PayPal configuration on mount.
  useEffect(() => {
    let cancelled = false;
    resolveClientId()
      .then(() => {
        if (!cancelled) setPaypalReady(true);
      })
      .catch(() => {
        if (!cancelled) setPaypalReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load the SDK and render Smart Buttons whenever a plan is chosen.
  useEffect(() => {
    if (!showModal || !plan) return;
    let cancelled = false;
    setSdkState('loading');
    setSdkError('');

    (async () => {
      try {
        const clientId = await resolveClientId();
        let planId = null;
        if (plan.type === 'subscription') {
          const pr = await fetch('/api/paypal/plans');
          const pd = await pr.json();
          planId = pd[plan.id];
          if (!planId) throw new Error('PayPal subscription plan is not configured yet');
        }
        const paypal = await loadPayPalSdk(clientId, { subscription: plan.type === 'subscription' });
        if (cancelled) return;
        setSdkState('ready');

        requestAnimationFrame(() => {
          if (cancelled || !buttonsRef.current || !window.paypal) return;
          buttonsRef.current.innerHTML = '';

          const buttonConfig = {
            style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' },
            onCancel: () => toast.info('Checkout cancelled.'),
            onError: () => toast.error('PayPal checkout failed. Please try again.'),
          };

          if (plan.type === 'subscription') {
            buttonConfig.createSubscription = (data, actions) =>
              actions.subscription.create({ plan_id: planId });
            buttonConfig.onApprove = async (data) => {
              setVerifying(true);
              try {
                const r = await fetch(`/api/paypal/subscription/${data.subscriptionID}`);
                const d = await r.json();
                if (d.status === 'ACTIVE' || d.status === 'APPROVAL_PENDING') {
                  markPro({ plan: plan.id, subscriptionId: data.subscriptionID });
                  toast.success('Subscription active — Pro unlocked! 🎉');
                  setShowModal(false);
                  setPlan(null);
                } else {
                  throw new Error('Subscription not active');
                }
              } catch {
                toast.error('Could not verify the subscription. Please try again.');
              } finally {
                setVerifying(false);
              }
            };
          } else {
            buttonConfig.createOrder = async () => {
              const r = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  amount: plan.amount,
                  description: `${appName} — ${plan.name}`,
                }),
              });
              const d = await r.json();
              if (!d.id) throw new Error(d.error || 'Order creation failed');
              return d.id;
            };
            buttonConfig.onApprove = async (data) => {
              setVerifying(true);
              try {
                const r = await fetch('/api/paypal/capture-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ orderId: data.orderID }),
                });
                const d = await r.json();
                if (d.status === 'COMPLETED') {
                  markPro({ plan: plan.id, orderId: data.orderID });
                  toast.success('Payment successful — Pro unlocked! 🎉');
                  setShowModal(false);
                  setPlan(null);
                } else {
                  throw new Error('Capture not completed');
                }
              } catch {
                toast.error('Payment verification failed. Please try again.');
              } finally {
                setVerifying(false);
              }
            };
          }

          paypal.Buttons(buttonConfig).render(buttonsRef.current);
        });
      } catch (e) {
        if (!cancelled) {
          setSdkState('error');
          setSdkError(e.message || 'Could not load PayPal checkout');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [showModal, plan, appName]);

  const handleChoose = (p) => {
    if (isRealFounder()) {
      toast.success('Founder access — all Pro features unlocked! 👑');
      setShowModal(false);
      return;
    }
    if (!paypalReady) {
      toast.info('Payments coming soon — enjoy Pro free during construction! 🚧');
      setShowModal(false);
      return;
    }
    setPlan(p);
  };

  // Free-access period: show an "everything is free" badge instead of any paywall UI.
  if (FREE_ACCESS_UNTIL_STRIPE) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-400/10 text-emerald-300 border border-emerald-400/30">
        <Zap className="w-3.5 h-3.5" /> Pro free — limited time
      </span>
    );
  }

  // Real founder bypass: no paywall UI at all (mirrors ProUpgrade.jsx).
  if (isRealFounder()) return null;

  return (
    <>
      <button
        onClick={() => {
          setPlan(null);
          setShowModal(true);
        }}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:brightness-110 transition text-sm"
      >
        <Crown className="w-4 h-4" /> Go Pro
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => {
            setShowModal(false);
            setPlan(null);
          }}
        >
          <div
            className="bg-[#14141a] border border-white/10 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black flex items-center gap-2">
                {plan && (
                  <button
                    onClick={() => setPlan(null)}
                    className="p-1.5 rounded-lg hover:bg-white/10 mr-1"
                    aria-label="Back to plans"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <Crown className="w-6 h-6 text-amber-400" /> Go Pro
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setPlan(null);
                }}
                className="p-2 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!plan ? (
              <>
                <p className="text-slate-400 text-sm mb-6">
                  Unlock the full power of {appName}.{' '}
                  {paypalReady ? 'Choose your plan:' : 'Payments launching soon — lock in early pricing.'}
                </p>

                <div className="grid sm:grid-cols-3 gap-4">
                  {PLANS.map((p) => (
                    <div
                      key={p.id}
                      className={`rounded-xl border p-5 ${
                        p.highlight
                          ? 'border-amber-400/50 bg-amber-400/[0.05]'
                          : 'border-white/10 bg-white/[0.02]'
                      }`}
                    >
                      {p.highlight && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-400/20 text-amber-300 mb-3 inline-block">
                          BEST VALUE
                        </span>
                      )}
                      <h3 className="font-bold mb-1">{p.name}</h3>
                      <p className="mb-4">
                        <span className="text-2xl font-black">{p.price}</span>
                        <span className="text-xs text-slate-500"> {p.period}</span>
                      </p>
                      <ul className="space-y-2 mb-5">
                        {p.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> {f}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => handleChoose(p)}
                        className="w-full py-2.5 rounded-lg font-bold text-sm bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:brightness-110 transition"
                      >
                        Choose
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 mb-5 flex items-center justify-between">
                  <div>
                    <p className="font-bold">{plan.name}</p>
                    <p className="text-xs text-slate-500">
                      {plan.type === 'subscription' ? 'Recurring via PayPal' : 'One-time via PayPal'}
                    </p>
                  </div>
                  <p className="text-xl font-black">
                    {plan.price}
                    <span className="text-xs text-slate-500 font-normal"> {plan.period}</span>
                  </p>
                </div>

                {sdkState === 'loading' && (
                  <div className="flex items-center justify-center gap-2 py-10 text-slate-400 text-sm">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading secure PayPal checkout…
                  </div>
                )}

                {sdkState === 'error' && (
                  <div className="text-center py-8">
                    <p className="text-sm text-red-400 mb-4">{sdkError}</p>
                    <button
                      onClick={() => {
                        const p = plan;
                        setPlan(null);
                        setTimeout(() => setPlan(p), 50);
                      }}
                      className="px-5 py-2.5 rounded-lg font-bold text-sm bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:brightness-110 transition"
                    >
                      Retry
                    </button>
                  </div>
                )}

                <div ref={buttonsRef} className={sdkState === 'ready' ? '' : 'hidden'} />

                {verifying && (
                  <div className="flex items-center justify-center gap-2 py-4 text-slate-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying payment…
                  </div>
                )}
              </>
            )}

            <p className="text-center text-[11px] text-slate-600 mt-6 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3" /> Secure checkout via PayPal
            </p>
          </div>
        </div>
      )}
    </>
  );
}
