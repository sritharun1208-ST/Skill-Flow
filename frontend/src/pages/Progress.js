import React from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Zap, Route, FolderGit2, Award, KanbanSquare, MessageSquare } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { api } from "@/lib/apiClient";
import PageHeader from "@/components/PageHeader";
import CircularProgress from "@/components/CircularProgress";
import CountUp from "@/components/CountUp";

export default function Progress() {
  const { data, isLoading } = useQuery({ queryKey: ["progress"], queryFn: () => api.get("/progress").then((r) => r.data) });
  if (isLoading || !data) return <div className="text-[#6B7280]">Loading your progress…</div>;

  const breakdown = Object.entries(data.breakdown).map(([name, value]) => ({ name, value }));
  const stats = [
    { icon: Zap, label: "Skills tracked", value: data.stats.skillsImproved },
    { icon: Route, label: "Learning done", value: `${data.stats.learningCompleted}/${data.stats.learningTotal}` },
    { icon: FolderGit2, label: "Projects completed", value: data.stats.projectsCompleted },
    { icon: Award, label: "Certifications", value: data.stats.certifications },
    { icon: KanbanSquare, label: "Applications", value: data.stats.applications },
    { icon: MessageSquare, label: "Interviews", value: data.stats.interviews },
  ];

  return (
    <div data-testid="progress-page">
      <PageHeader title="My Progress" icon={TrendingUp} subtitle="Watch your career readiness grow as you learn, build and apply." />

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center justify-center">
          <p className="font-semibold mb-4">Career Readiness Score</p>
          <CircularProgress value={data.readiness} label="of 100" testId="progress-readiness" />
          <p className="text-[11px] text-[#9CA3AF] mt-4 text-center">Estimated readiness indicator — not a guarantee of employment.</p>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold font-heading text-lg mb-4">Career readiness growth</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.history} margin={{ left: -20 }}>
              <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF6B00" stopOpacity={0.4} /><stop offset="100%" stopColor="#FF6B00" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }} formatter={(v) => [`${v}%`, "Readiness"]} />
              <Area type="monotone" dataKey="value" stroke="#FF6B00" strokeWidth={3} fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold font-heading text-lg mb-1">Readiness breakdown</h3>
          <p className="text-xs text-[#6B7280] mb-4">What makes up your score</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={breakdown} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: "#111827" }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "#F8FAFC" }} contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }} formatter={(v) => [`${v}%`, ""]} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={18}>
                {breakdown.map((e, i) => <Cell key={i} fill={e.value >= 70 ? "#16A34A" : e.value >= 45 ? "#FF6B00" : "#F59E0B"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 content-start">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center mb-3"><Icon className="h-5 w-5" /></div>
                <p className="text-2xl font-bold font-heading">{typeof s.value === "number" ? <CountUp value={s.value} /> : s.value}</p>
                <p className="text-sm text-[#6B7280]">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
