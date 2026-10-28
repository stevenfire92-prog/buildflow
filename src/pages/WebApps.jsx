import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Smartphone, Bot, Dumbbell, Receipt, Flame, Sparkles, Share2, Monitor } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import FitnessTrackerWeb from "@/components/webapps/FitnessTrackerWeb";
import SupportSuperagentWeb from "@/components/webapps/SupportSuperagentWeb";
import TeamExpenseSplitterWeb from "@/components/webapps/TeamExpenseSplitterWeb";
import HabitStreakWeb from "@/components/webapps/HabitStreakWeb";
import UpgradeButton from "@/components/dashboard/UpgradeButton";
import FounderMusicPlayer from "@/components/music/FounderMusicPlayer";
import FounderSocialsBanner from "@/components/socials/FounderSocialsBanner";
import { base44 } from "@/api/base44Client";
import { validatedCheckoutUrl } from "@/api/billingClient";
import { CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const appsList = [
  {
    id: "fitness",
    name: "Fitness Tracker Web Edition",
    tagline: "AI Workout Architect & Biometric Performance Suite",
    icon: Dumbbell,
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    pricing: "$9.99/mo or $29 One-Time",
    badge: "100% Complete · Live Web App",
  },
  {
    id: "support",
    name: "Support Superagent Web Portal",
    tagline: "Autonomous 24/7 AI Customer Success & CRM Automation",
    icon: Bot,
    accent: "text-purple-400 bg-purple-500/10 border-purple-500/25",
    pricing: "$49–$149/mo B2B Plan",
    badge: "100% Complete · Live Web App",
  },
  {
    id: "expenses",
    name: "Team Expense Splitter Web Platform",
    tagline: "Optimal Cash-Flow Graph & Automated Stripe Settlement",
    icon: Receipt,
    accent: "text-sky-400 bg-sky-500/10 border-sky-500/25",
    pricing: "Free + 1.5% Stripe Fee or $4.99/mo",
    badge: "100% Complete · Live Web App",
  },
  {
    id: "habits",
    name: "Habit Streak Web Suite",
    tagline: "Dopamine-Optimized Behavioral Streak Loops & Shields",
    icon: Flame,
    accent: "text-amber-400 bg-amber-500/10 border-amber-500/25",
    pricing: "$4.99/mo or $19.99/yr",
    badge: "100% Complete · Live Web App",
  },
];

export default function WebApps() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialApp = searchParams.get("app") || "fitness";
  const [activeApp, setActiveApp] = useState(initialApp);
  const [previewMode, setPreviewMode] = useState("desktop"); // 'desktop' or 'mobile'

  useEffect(() => {
    const requested = searchParams.get("app");
    if (requested && appsList.some((a) => a.id === requested)) {
      setActiveApp(requested);
    }
  }, [searchParams]);

  const selectApp = (id) => {
    setActiveApp(id);
    setSearchParams({ app: id });
  };

  const current = appsList.find((a) => a.id === activeApp) || appsList[0];
  const CurrentIcon = current.icon;

  const [buyingStripe, setBuyingStripe] = useState(false);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied!",
        description: `Direct link to ${current.name} copied to clipboard.`,
      });
    }
  };

  const handleStripeBuyApp = async (appId) => {
    setBuyingStripe(true);
    const targetApp = appsList.find(a => a.id === appId) || current;
    try {
      if (window.self !== window.top) {
        toast({
          title: "Open the published app",
          description: "Stripe secure checkout launches on the published app or in a new browser tab.",
        });
      }
      const res = await base44.functions.invoke("createCheckoutSession", {
        appSlug: targetApp.id,
        appName: targetApp.name,
      });
      window.location.assign(validatedCheckoutUrl(res.data?.url));
    } catch (error) {
      toast({
        title: "Checkout unavailable",
        description: error?.message || "Checkout could not be started. No charge was made.",
        variant: "destructive",
      });
    } finally {
      setBuyingStripe(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-6">
        <AppHeader />

        {/* Top Title Banner */}
        <div className="mt-8 mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Web Platform Editions · Se Fire Tech</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Web Editions of Your Apps
            </h1>
            <p className="mt-1 text-sm text-white/50 max-w-2xl">
              Fully responsive browser web applications with live interactivity, local persistence, real-time analytics, auto-connected Stripe payments, and Steven's motivational soundtrack.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleStripeBuyApp(activeApp)}
              disabled={buyingStripe}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-black bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 rounded-full transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{buyingStripe ? "Opening Stripe..." : `Buy ${current.name.split(" ")[0]} via Stripe`}</span>
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white/70 bg-white/5 border border-white/10 hover:text-white hover:border-white/25 rounded-full transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> Share Web App
            </button>
            <UpgradeButton />
          </div>
        </div>

        {/* Music Motivation Player Bar: Influencing buyers with Steven's original tracks */}
        <div className="mb-6">
          <FounderMusicPlayer
            activeApp={activeApp}
            onBuyWithStripe={() => handleStripeBuyApp(activeApp)}
          />
        </div>

        {/* App Switcher Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {appsList.map((app) => {
            const Icon = app.icon;
            const isSelected = activeApp === app.id;
            return (
              <button
                key={app.id}
                onClick={() => selectApp(app.id)}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? "bg-white/[0.08] border-white/40 ring-1 ring-white/20 shadow-xl"
                    : "bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center border ${app.accent}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
                <h3 className="font-semibold text-sm text-white truncate">{app.name}</h3>
                <p className="text-[11px] text-white/50 line-clamp-1 mt-0.5">{app.tagline}</p>
                <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
                  <span>{app.pricing}</span>
                  <span className="text-emerald-400 font-medium">Ready</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active App Header Bar */}
        <div className="rounded-2xl bg-gradient-to-r from-white/[0.06] to-transparent border border-white/10 p-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${current.accent}`}>
              <CurrentIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white">{current.name}</h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                  {current.badge}
                </span>
              </div>
              <p className="text-xs text-white/60 mt-0.5">{current.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1">
              <button
                onClick={() => setPreviewMode("desktop")}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  previewMode === "desktop" ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white"
                }`}
                title="Full width web view"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode("mobile")}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  previewMode === "mobile" ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white"
                }`}
                title="Mobile frame simulation"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            <Link
              to="/dashboard"
              className="px-3.5 py-1.5 text-xs font-medium text-white/70 bg-white/5 border border-white/10 rounded-xl hover:text-white hover:border-white/20 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Web App Canvas */}
        <div className={previewMode === "mobile" ? "max-w-md mx-auto my-6 border-4 border-white/20 rounded-[40px] p-4 bg-black shadow-2xl relative" : ""}>
          {previewMode === "mobile" && (
            <div className="w-32 h-4 bg-white/20 rounded-full mx-auto mb-4" />
          )}

          {activeApp === "fitness" && <FitnessTrackerWeb />}
          {activeApp === "support" && <SupportSuperagentWeb />}
          {activeApp === "expenses" && <TeamExpenseSplitterWeb />}
          {activeApp === "habits" && <HabitStreakWeb />}

          {previewMode === "mobile" && (
            <div className="w-24 h-1 bg-white/30 rounded-full mx-auto mt-6" />
          )}
        </div>

        {/* Auto-Connected Creator Hub & Profiles Banner */}
        <div className="mt-12 mb-6">
          <FounderSocialsBanner />
        </div>

        <AppFooter />
      </div>
    </div>
  );
}