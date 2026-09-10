import React, { useState, useEffect } from "react";
import { User, Bell, Mail } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AppHeader from "@/components/AppHeader";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AccountSettings() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [user, setUser] = useState(undefined);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    contact_email: "",
    product_updates: false,
    weekly_summary: false,
  });

  useEffect(() => {
    base44.auth
      .me()
      .then((me) => {
        setUser(me);
        setForm({
          display_name: me.display_name || "",
          contact_email: me.contact_email || "",
          product_updates: !!(me.preferences && me.preferences.product_updates),
          weekly_summary: !!(me.preferences && me.preferences.weekly_summary),
        });
      })
      .catch(() => setUser(null));
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        display_name: form.display_name.trim(),
        contact_email: form.contact_email.trim(),
        preferences: {
          product_updates: form.product_updates,
          weekly_summary: form.weekly_summary,
        },
      });
      toast({ title: t("acct.savedTitle"), description: t("acct.savedDesc") });
    } catch {
      toast({ title: t("acct.saveFailTitle"), description: t("acct.saveFailDesc") });
    }
    setSaving(false);
  };

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30";

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-2xl px-5 sm:px-8 py-6">
        <AppHeader />

        <div className="mt-10">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            {t("acct.title")}
          </h1>
          <p className="mt-2 text-white/50">
            {t("acct.subtitle")}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
            <div className="flex items-center gap-2 text-white/70 mb-5">
              <User className="w-4 h-4" />
              <h3 className="font-medium">{t("acct.profile")}</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">{t("acct.accountName")}</label>
                <input
                  value={user.full_name || ""}
                  disabled
                  className={`${inputCls} opacity-50 cursor-not-allowed`}
                />
                <p className="mt-1 text-[11px] text-white/30">
                  {t("acct.accountNameNote")}
                </p>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">{t("acct.signInEmail")}</label>
                <input
                  value={user.email || ""}
                  disabled
                  className={`${inputCls} opacity-50 cursor-not-allowed`}
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">{t("acct.displayName")}</label>
                <input
                  value={form.display_name}
                  onChange={(e) => set("display_name", e.target.value)}
                  placeholder={t("acct.displayNamePlaceholder")}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
            <div className="flex items-center gap-2 text-white/70 mb-5">
              <Mail className="w-4 h-4" />
              <h3 className="font-medium">{t("acct.contact")}</h3>
            </div>
            <label className="text-xs text-white/50 mb-1.5 block">{t("acct.contactEmail")}</label>
            <input
              type="email"
              value={form.contact_email}
              onChange={(e) => set("contact_email", e.target.value)}
              placeholder={t("acct.contactEmailPlaceholder")}
              className={inputCls}
            />
            <p className="mt-1 text-[11px] text-white/30">
              {t("acct.contactNote")}
            </p>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
            <div className="flex items-center gap-2 text-white/70 mb-5">
              <Bell className="w-4 h-4" />
              <h3 className="font-medium">{t("acct.preferences")}</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white">{t("acct.productUpdates")}</p>
                  <p className="text-xs text-white/40">{t("acct.productUpdatesDesc")}</p>
                </div>
                <Switch
                  checked={form.product_updates}
                  onCheckedChange={(v) => set("product_updates", v)}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white">{t("acct.weeklySummary")}</p>
                  <p className="text-xs text-white/40">{t("acct.weeklySummaryDesc")}</p>
                </div>
                <Switch
                  checked={form.weekly_summary}
                  onCheckedChange={(v) => set("weekly_summary", v)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 text-sm font-medium text-black bg-white rounded-full hover:bg-white/90 transition-colors disabled:opacity-60"
          >
            {saving ? t("acct.saving") : t("acct.saveChanges")}
          </button>
        </div>
      </div>
    </div>
  );
}