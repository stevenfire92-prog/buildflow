import React, { useState } from "react";
import { Crown } from "lucide-react";
import { client } from "@/api/localClient";
import { validatedCheckoutUrl } from "@/api/billingClient";
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
      const res = await client.functions.invoke("createCheckoutSession", {});
      window.location.href = validatedCheckoutUrl(res.data?.url);
    } catch (error) {
      alert(error.message || t("up.errorAlert"));
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