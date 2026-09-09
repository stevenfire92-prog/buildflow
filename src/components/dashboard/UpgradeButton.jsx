import React, { useState } from "react";
import { Crown } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (window.self !== window.top) {
      alert("Checkout works only from the published app — open the app in a new tab to upgrade.");
      return;
    }
    setLoading(true);
    try {
      const res = await base44.functions.invoke("createCheckoutSession", {});
      window.location.href = res.data.url;
    } catch {
      alert("Could not start checkout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-white/90 transition-colors disabled:opacity-60"
    >
      <Crown className="w-4 h-4" />
      {loading ? "Starting checkout..." : "Upgrade to Pro"}
    </button>
  );
}