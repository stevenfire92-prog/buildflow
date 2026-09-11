import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, LayoutGrid, KanbanSquare, Users, ListChecks, LayoutTemplate, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { logActivity } from "@/lib/activityLog";
import StatsRow from "@/components/dashboard/StatsRow";
import WeeklyChart from "@/components/dashboard/WeeklyChart";
import ProjectCard from "@/components/dashboard/ProjectCard";
import UpgradeButton from "@/components/dashboard/UpgradeButton";
import ProjectBoard from "@/components/dashboard/ProjectBoard";
import ActivityLog from "@/components/dashboard/ActivityLog";
import BulkActions from "@/components/dashboard/BulkActions";
import MusicProfiles from "@/components/dashboard/MusicProfiles";
import RevenueSummary from "@/components/dashboard/RevenueSummary";
import GrowthSummary from "@/components/dashboard/GrowthSummary";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const tabs = ["All", "Draft", "Building", "Ready", "Published"];

export default function Dashboard() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const tabLabels = {
    All: t("dash.tabAll"),
    Draft: t("dash.tabDraft"),
    Building: t("dash.tabBuilding"),
    Ready: t("dash.tabReady"),
    Published: t("dash.tabPublished"),
  };
  const [projects, setProjects] = useState(null);
  const [tab, setTab] = useState("All");
  const [view, setView] = useState("grid");
  const [selectMode, setSelectMode] = useState(false);
  const [selection, setSelection] = useState([]);
  const [bulkBusy, setBulkBusy] = useState(false);

  const toggleSelected = (id) =>
    setSelection((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelection([]);
  };

  const applyBulkStatus = async (status) => {
    if (bulkBusy || selection.length === 0 || !projects) return;
    setBulkBusy(true);
    const targets = selection
      .map((id) => projects.find((p) => p.id === id))
      .filter(Boolean);
    try {
      const now = new Date().toISOString();
      await base44.entities.Project.bulkUpdate(
        selection.map((id) => ({ id, status, last_activity: now }))
      );
      const fresh = await base44.entities.Project.list("-updated_date", 100);
      setProjects(fresh);
      targets.forEach((p) =>
        logActivity({
          action: "status_changed",
          projectName: p.name,
          projectId: p.id,
          details: `moved to ${status}`,
        })
      );
      toast({
        title: t("dash.bulkStatusTitle"),
        description: t("dash.bulkStatusDesc")
          .replace("{n}", targets.length)
          .replace("{status}", status),
      });
      exitSelectMode();
    } catch {
      toast({ title: t("dash.bulkFailTitle"), description: t("dash.bulkFailDesc") });
    }
    setBulkBusy(false);
  };

  const applyBulkDelete = async () => {
    if (bulkBusy || selection.length === 0) return;
    setBulkBusy(true);
    const targets = (projects || []).filter((p) => selection.includes(p.id));
    try {
      await base44.entities.Project.deleteMany({ id: { $in: selection } });
      const fresh = await base44.entities.Project.list("-updated_date", 100);
      setProjects(fresh);
      targets.forEach((p) =>
        logActivity({ action: "deleted", projectName: p.name, projectId: p.id })
      );
      toast({
        title: t("dash.bulkDeleteTitle"),
        description: t("dash.bulkDeleteDesc").replace("{n}", targets.length),
      });
      exitSelectMode();
    } catch {
      toast({ title: t("dash.bulkFailTitle"), description: t("dash.bulkFailDesc") });
    }
    setBulkBusy(false);
  };

  const handleBoardUpdate = (id, updates) =>
    setProjects((prev) =>
      (prev || []).map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

  useEffect(() => {
    base44.entities.Project
      .list("-updated_date", 100)
      .then(setProjects)
      .catch(() => setProjects([]));
  }, []);

  // Handle return from Stripe checkout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");
    const checkout = urlParams.get("checkout");
    if (!sessionId && !checkout) return;

    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);

    if (checkout === "cancelled") {
      toast({ title: t("dash.checkoutCancelledTitle"), description: t("dash.checkoutCancelledDesc") });
      return;
    }
    if (sessionId) {
      base44.functions
        .invoke("verifyCheckoutSession", { sessionId })
        .then((res) => {
          if (res.data.paymentStatus === "paid") {
            localStorage.setItem("bf_plan", "pro");
            localStorage.setItem("bf_checkout_session", sessionId);
            localStorage.setItem("bf_plan_date", new Date().toISOString());
            toast({
              title: t("dash.welcomeProTitle"),
              description: t("dash.welcomeProDesc"),
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  const filtered =
    !projects || tab === "All"
      ? projects
      : projects.filter((p) => p.status === tab.toLowerCase());

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 text-white">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                <span className="text-black font-bold text-xs">S</span>
              </div>
              <span className="font-semibold tracking-tight">Se Fire Tech</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/growth-dashboard"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/25 rounded-full transition-colors"
            >
              <TrendingUp className="w-4 h-4" /> {t("dash.growth")}
            </Link>
            <Link
              to="/templates"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/25 rounded-full transition-colors"
            >
              <LayoutTemplate className="w-4 h-4" /> {t("dash.templates")}
            </Link>
            <Link
              to="/team"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/25 rounded-full transition-colors"
            >
              <Users className="w-4 h-4" /> {t("dash.team")}
            </Link>
            <UpgradeButton />
            <Link
              to="/new-project"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-white/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> {t("dash.newProject")}
            </Link>
          </div>
        </div>

        <div className="mt-10 mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              {t("dash.title")}
            </h1>
            <p className="mt-2 text-white/50">
              {t("dash.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {view === "grid" && (
              <button
                onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border transition-colors ${
                  selectMode
                    ? "bg-white text-black border-white"
                    : "text-white/70 border-white/10 hover:text-white hover:border-white/25"
                }`}
              >
                <ListChecks className="w-4 h-4" />
                {selectMode ? t("dash.doneSelect") : t("dash.select")}
              </button>
            )}
            <div className="flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10">
              <button
                onClick={() => setView("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full transition-colors ${
                  view === "grid" ? "bg-white text-black" : "text-white/60 hover:text-white"
                }`}
              >
                <LayoutGrid className="w-4 h-4" /> {t("dash.grid")}
              </button>
              <button
                onClick={() => setView("board")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full transition-colors ${
                  view === "board" ? "bg-white text-black" : "text-white/60 hover:text-white"
                }`}
              >
                <KanbanSquare className="w-4 h-4" /> {t("dash.board")}
              </button>
            </div>
          </div>
        </div>

        {projects === null ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <GrowthSummary projects={projects} />

            <StatsRow projects={projects} />

            <div className="mt-4">
              <WeeklyChart projects={projects} />
            </div>

            <div className="mt-4">
              <RevenueSummary />
            </div>

            <div className="mt-4">
              <ActivityLog />
            </div>

            <div className="mt-4">
              <MusicProfiles />
            </div>

            {view === "board" ? (
              <ProjectBoard
                projects={projects || []}
                onProjectUpdate={handleBoardUpdate}
              />
            ) : (
            <>
            <div className="mt-8 mb-6 flex gap-2 overflow-x-auto pb-1">
              {tabs.map((tb) => (
                <button
                  key={tb}
                  onClick={() => setTab(tb)}
                  className={`px-4 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                    tab === tb
                      ? "bg-white text-black"
                      : "bg-white/5 text-white/60 hover:text-white border border-white/10"
                  }`}
                >
                  {tabLabels[tb]}
                </button>
              ))}
            </div>

            {filtered && filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    selectable={selectMode}
                    selected={selection.includes(p.id)}
                    onToggle={() => toggleSelected(p.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/15 py-20 text-center">
                <p className="text-white/60 font-medium">{t("dash.emptyTitle")}</p>
                <p className="mt-1 text-sm text-white/35">
                  {t("dash.emptySub")}
                </p>
              </div>
            )}
            </>
            )}

            {selectMode && selection.length > 0 && (
              <BulkActions
                count={selection.length}
                busy={bulkBusy}
                onSetStatus={applyBulkStatus}
                onDelete={applyBulkDelete}
                onCancel={exitSelectMode}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}