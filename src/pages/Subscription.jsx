import React, { useState, useEffect } from "react";
import { CreditCard, Crown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AppHeader from "@/components/AppHeader";
import PlanCard from "@/components/subscription/PlanCard";

const freeFeatures = ["3 active projects", "Community support", "Basic analytics"];
const proFeatures = [
  "Unlimited projects",
  "Priority support",
  "Advanced analytics",
  "Custom domains",
];

export default function Subscription() {
  const [plan, setPlan] = useState(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPlan(localStorage.getItem("bf_plan") === "pro" ? "pro" : "free");
  }, []);

  const startCheckout = async () => {
    setError("");
    if (window.self !== window.top) {
      setError("Checkout works only from the published app — open the app in a new tab to upgrade.");
      return;
    }
    setUpgradeLoading(true);
    try {
      const res = await base44.functions.invoke("createCheckoutSession", {});
      window.location.href = res.data.url;
    } catch {
      setError("Could not start checkout. Please try again.");
      setUpgradeLoading(false);
    }
  };

  const openPortal = async () => {
    setError("");
    const sessionId = localStorage.getItem("bf_checkout_session");
    if (!sessionId) {
      setError("Upgrade to Pro first — your payment methods appear after your first checkout.");
      return;
    }
    if (window.self !== window.top) {
      setError("The billing portal works only from the published app — open the app in a new tab.");
      return;
    }
    setPortalLoading(true);
    try {
      const res = await base44.functions.invoke("createBillingPortalSession", { sessionId });
      window.location.href = res.data.url;
    } catch {
      setError("Could not open the billing portal. Please try again.");
      setPortalLoading(false);
    }
  };

  if (plan === null) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const planDate = localStorage.getItem("bf_plan_date");

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
          <PlanCard
            title="Pro"
            price="$16/month"
            features={proFeatures}
            current={plan === "pro"}
            highlighted
            onCta={startCheckout}
            ctaLabel="Upgrade to Pro"
            ctaLoading={upgradeLoading}
          />
        </div>

        <div className="mt-4 rounded-2xl bg-white/[0.03] border border-white/10 p-6">
          <div className="flex items-center gap-2 text-white/70">
            <CreditCard className="w-4 h-4" />
            <h3 className="font-medium">Payment methods</h3>
          </div>
          <p className="mt-2 text-sm text-white/45">
            Update your card, billing address, or cancel your subscription any time through the
            secure Stripe billing portal.
          </p>
          <button
            onClick={openPortal}
            disabled={portalLoading}
            className="mt-4 px-5 py-2.5 text-sm font-medium text-white bg-white/10 border border-white/15 rounded-full hover:bg-white/15 transition-colors disabled:opacity-60"
          >
            {portalLoading ? "Opening portal..." : "Open billing portal"}
          </button>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}