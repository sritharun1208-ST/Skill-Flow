import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap, GitCompareArrows, Route, FolderGit2, Briefcase, KanbanSquare, ArrowRight, Trophy, Flame, Target, Rocket, Award,
} from "lucide-react";
import { api } from "@/lib/apiClient";
import CircularProgress from "@/components/CircularProgress";
import CountUp from "@/components/CountUp";
import PriorityBadge from "@/components/PriorityBadge";

const ICONS = { Trophy, Flame, Target, Rocket, Briefcase, Award };

export default function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: () => api.get("/dashboard").then((r) => r.data) });
  const { data: badges } = useQuery({ queryKey: ["badges"], queryFn: () => api.get("/badges").then((r) => r.data) });

  if (isLoading || !data) return <div className="animate-pulse text-[#6B7280]">Loading your Skill Flow…</div>;

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight">{greet}, {data.name} 👋</h1>
          <p className="text-[#6B7280] mt-1">Here's where you stand on your journey to <b className="text-[#111827]">{data.targetCareer || "your career"}</b>.</p>
        </div>
        <Link to="/app/skill-gap" data-testid="dash-analyze-btn" className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#FF6B00] text-white font-semibold hover:bg-[#e85f00] transition-colors self-start">
          <GitCompareArrows className="h-4 w-4" /> Analyze My Skill Gap
        </Link>
      </div>

      {/* Top: readiness + stats */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center justify-center">
          <p className="text-sm font-semibold text-[#111827] mb-1">Career Readiness</p>
          <p className="text-xs text-[#6B7280] mb-4">Target: {data.targetCareer}</p>
          <CircularProgress value={data.readiness} testId="readiness-ring" />
          <p className="text-[11px] text-[#9CA3AF] mt-4 text-center">Estimated readiness indicator — not a guarantee of employment.</p>
        </div>

        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          <StatCard to="/app/learning-path" icon={Route} label="Learning Progress" value={`${data.learning.completed} / ${data.learning.total}`} sub="steps completed" color="orange" />
          <StatCard to="/app/projects" icon={FolderGit2} label="Projects" value={data.projects} sub="projects completed" color="green" />
          <StatCard to="/app/opportunities" icon={Briefcase} label="Opportunities" value={data.opportunities} sub="matching you" color="blue" />
          <StatCard to="/app/applications" icon={KanbanSquare} label="Applications" value={data.applications} sub="in your tracker" color="purple" />
        </div>
      </div>

      {/* Skills + gaps */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Panel title="Current Skills" to="/app/skills" cta="Manage" icon={Zap}>
          <div className="space-y-3">
            {data.skills.slice(0, 6).map((s, i) => (
              <div key={s.name}>
                <div className="flex justify-between text-sm mb-1"><span className="font-medium">{s.name}</span><span className="text-[#6B7280] capitalize">{s.level}</span></div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-[#FF6B00]" initial={{ width: 0 }} animate={{ width: `${s.value}%` }} transition={{ duration: 0.8, delay: i * 0.08 }} />
                </div>
              </div>
            ))}
            {data.skills.length === 0 && <p className="text-sm text-[#9CA3AF]">No skills yet — add some in My Skills.</p>}
          </div>
        </Panel>

        <Panel title="Skill Gaps" to="/app/skill-gap" cta="View analysis" icon={GitCompareArrows}>
          <div className="space-y-2.5">
            {data.skillGaps.map((g) => (
              <div key={g.skill} className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-gray-100">
                <span className="text-sm font-medium">{g.skill}</span>
                <PriorityBadge priority={g.priority} />
              </div>
            ))}
            {data.skillGaps.length === 0 && <p className="text-sm text-[#9CA3AF]">No gaps — you're on track!</p>}
          </div>
        </Panel>
      </div>

      {/* Badges */}
      {badges && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold font-heading text-lg mb-4">Milestones</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {badges.map((b) => {
              const Icon = ICONS[b.icon] || Trophy;
              return (
                <div key={b.id} data-testid={`badge-${b.id}`} className={`rounded-xl border p-4 text-center ${b.earned ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-[#F8FAFC] opacity-60"}`}>
                  <div className={`h-10 w-10 mx-auto rounded-full flex items-center justify-center ${b.earned ? "bg-[#FF6B00] text-white" : "bg-gray-200 text-gray-400"}`}><Icon className="h-5 w-5" /></div>
                  <p className="text-xs font-semibold mt-2 leading-tight">{b.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ to, icon: Icon, label, value, sub, color }) {
  const colors = {
    orange: "bg-orange-50 text-[#FF6B00]", green: "bg-emerald-50 text-emerald-600",
    blue: "bg-sky-50 text-sky-600", purple: "bg-violet-50 text-violet-600",
  };
  return (
    <Link to={to} data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:-translate-y-1 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colors[color]}`}><Icon className="h-5 w-5" /></div>
        <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-[#FF6B00] transition-colors" />
      </div>
      <p className="text-2xl font-bold font-heading mt-3">{typeof value === "number" ? <CountUp value={value} /> : value}</p>
      <p className="text-sm font-medium text-[#111827]">{label}</p>
      <p className="text-xs text-[#6B7280]">{sub}</p>
    </Link>
  );
}

function Panel({ title, to, cta, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-orange-50 text-[#FF6B00] flex items-center justify-center"><Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} /></div>
          <h3 className="font-semibold font-heading text-lg">{title}</h3>
        </div>
        <Link to={to} className="text-sm font-medium text-[#FF6B00] inline-flex items-center gap-1">{cta} <ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>
      {children}
    </div>
  );
}
