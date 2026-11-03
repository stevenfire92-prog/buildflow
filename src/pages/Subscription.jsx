import React, { useState, useEffect } from "react";
import { CreditCard, Crown, Check } from "lucide-react";
import { client } from "@/api/localClient";
import AppHeader from "@/components/AppHeader";
import PlanCard from "@/components/subscription/PlanCard";
import PayPalCheckout, { hasProAccess } from "@/components/PayPalCheckout";

const freeFeatures = ["3 active projects", "Community support", "Basic analytics"];
const proFeatures = [
  "Unlimited projects",
  "Priority support",
  "Advanced analytics",
  "Custom domains",
];

export default function Subscription() {
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Founder mode: check URL param or saved flag (inline)
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('founder') === 'sefire2026') {
        localStorage.setItem('sfi:founder', 'true');
        const url = new URL(window.location.href);
        url.searchParams.delete('founder');
        window.history.replaceState({}, '', url.toString());
      }
      if (localStorage.getItem('sfi:founder') === 'true') {
        setPlan("pro");
        return;
      }
      // PayPal purchase check (localStorage)
      if (hasProAccess()) {
        setPlan("pro");
        return;
      }
    } catch (e) { /* ignore */ }
    client.functions.invoke("getEntitlements", {})
      .then(({ data }) => setPlan(data.plan === "pro" ? "pro" : "free"))
      .catch(() => { setPlan("free"); setError("Your subscription could not be verified. Please try again later."); });
  }, []);

  if (plan === null) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const planDate = null;

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-4xl px-5 sm:px-8 py-6">
        <AppHeader />

        <div className="mt-10">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Subscription
          </h1>
          <p className="mt-2 text-white/50">Manage your plan, billing, and payment methods.</p>
        </div>

        <div className="mt-8 rounded-2xl bg-white/[0.03] border border-white/10 p-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                plan === "pro"
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-white/10 text-white/70"
              }`}
            >
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-white/40">Current plan</p>
              <p className="text-lg font-semibold text-white">{plan === "pro" ? "Pro" : "Free"}</p>
            </div>
          </div>
          <p className="text-xs text-white/40">
            {plan === "pro" && planDate
              ? `Pro active since ${new Date(planDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}`
              : "No payment method on file"}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PlanCard title="Free" price="$0" features={freeFeatures} current={plan === "free"} />
          <div className="rounded-2xl border p-6 border-white/40 bg-white/[0.06]">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium text-white">Pro</h3>
              {plan === "pro" && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-400">
                  Current plan
                </span>
              )}
            </div>
            <div className="mt-3 text-3xl font-semibold text-white">
              $4.99<span className="text-base font-normal text-white/50">/mo</span>
            </div>
            <ul className="mt-5 space-y-2.5">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                  <Check className="w-4 h-4 mt-0.5 text-white/40 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-center">
              {plan === "pro" ? (
                <button
                  disabled
                  className="w-full px-4 py-2.5 text-sm font-medium rounded-full bg-white/10 text-white/40 cursor-default"
                >
                  Current plan
                </button>
              ) : (
                <PayPalCheckout appName="BuildFlow" />
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white/[0.03] border border-white/10 p-6">
          <div className="flex items-center gap-2 text-white/70">
            <CreditCard className="w-4 h-4" />
            <h3 className="font-medium">Payment methods</h3>
          </div>
          <p className="mt-2 text-sm text-white/45">
            Payments are processed securely through PayPal. Manage your subscription
            any time from your PayPal account.
          </p>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}