import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import StatsRow from "@/components/dashboard/StatsRow";
import WeeklyChart from "@/components/dashboard/WeeklyChart";
import ProjectCard from "@/components/dashboard/ProjectCard";
import UpgradeButton from "@/components/dashboard/UpgradeButton";
import { useToast } from "@/components/ui/use-toast";

const tabs = ["All", "Draft", "Building", "Ready", "Published"];

export default function Dashboard() {
  const { toast } = useToast();
  const [projects, setProjects] = useState(null);
  const [tab, setTab] = useState("All");

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
      toast({ title: "Checkout cancelled", description: "No charge was made." });
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
              title: "Welcome to Pro!",
              description: "Your BuildFlow Pro subscription is now active.",
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
            <UpgradeButton />
            <Link
              to="/new-project"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-white/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> New project
            </Link>
          </div>
        </div>

        <div className="mt-10 mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Your projects
          </h1>
          <p className="mt-2 text-white/50">
            Every active build and its status, at a glance.
          </p>
        </div>

        {projects === null ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <StatsRow projects={projects} />

            <div className="mt-4">
              <WeeklyChart projects={projects} />
            </div>

            <div className="mt-8 mb-6 flex gap-2 overflow-x-auto pb-1">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                    tab === t
                      ? "bg-white text-black"
                      : "bg-white/5 text-white/60 hover:text-white border border-white/10"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {filtered && filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/15 py-20 text-center">
                <p className="text-white/60 font-medium">No projects here yet</p>
                <p className="mt-1 text-sm text-white/35">
                  Projects will appear as soon as you start building.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}