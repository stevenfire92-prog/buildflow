import React, { useState } from "react";
import { Crown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function UpgradeButton() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (window.self !== window.top) {
      alert(t("up.iframeAlert"));
      return;
    }
    setLoading(true);
    try {
      const res = await base44.functions.invoke("createCheckoutSession", {});
      window.location.href = res.data.url;
    } catch {
      alert(t("up.errorAlert"));
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
      {loading ? t("up.startingCheckout") : t("up.upgradeToPro")}
    </button>
  );
}