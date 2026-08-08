import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { GitCompareArrows, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { api } from "@/lib/apiClient";
import PageHeader from "@/components/PageHeader";
import PriorityBadge from "@/components/PriorityBadge";

export default function SkillGap() {
  const { data, isLoading } = useQuery({ queryKey: ["skill-gap"], queryFn: () => api.get("/skill-gap").then((r) => r.data) });
  if (isLoading || !data) return <div className="text-[#6B7280]">Analyzing your skill gap…</div>;

  const radar = data.rows.map((r) => ({ skill: r.skill.length > 12 ? r.skill.slice(0, 11) + "…" : r.skill, current: r.currentValue, required: r.requiredValue }));

  return (
    <div data-testid="skill-gap-page">
      <PageHeader title="AI Skill Gap Analysis" icon={GitCompareArrows} subtitle={`Comparing your skills against what a ${data.careerName} needs.`} />

      {/* Coverage banner */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">Overall skill coverage for {data.careerName}</span>
          <span className="text-xl font-bold font-heading text-[#FF6B00]">{data.coverage}%</span>
        </div>
        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
          <motion.div className="h-full rounded-full bg-[#FF6B00]" initial={{ width: 0 }} animate={{ width: `${data.coverage}%` }} transition={{ duration: 1 }} />
        </div>
      </div>

      {/* Category columns */}
      <div className="grid md:grid-cols-3 gap-4 mb-5">
        <CategoryCard title="Strong Skills" color="emerald" icon={CheckCircle2} items={data.strong} note="Meeting the target requirement" />
        <CategoryCard title="Improve" color="amber" icon={AlertTriangle} items={data.improve} note="Partial knowledge — level up" />
        <CategoryCard title="Missing Skills" color="red" icon={XCircle} items={data.missing} note="Need to learn from scratch" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 overflow-x-auto">
          <h3 className="font-semibold font-heading text-lg mb-4">Detailed breakdown</h3>
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="text-left text-[#6B7280] border-b border-gray-100">
                <th className="pb-2 font-medium">Skill</th><th className="pb-2 font-medium">Current</th><th className="pb-2 font-medium">Required</th><th className="pb-2 font-medium">Gap</th><th className="pb-2 font-medium">Priority</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.skill} data-testid={`gap-row-${r.skill.replace(/\s+/g, "-")}`} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 font-medium">{r.skill}</td>
                  <td className="py-3 text-[#6B7280]">{r.current}</td>
                  <td className="py-3 text-[#6B7280]">{r.required}</td>
                  <td className="py-3">{r.gap}</td>
                  <td className="py-3"><PriorityBadge priority={r.priority} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Radar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold font-heading text-lg mb-2">Skill map</h3>
          <p className="text-xs text-[#6B7280] mb-2">Current vs required levels</p>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radar} outerRadius="70%">
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: "#6B7280" }} />
              <Radar name="Required" dataKey="required" stroke="#6B7280" fill="#6B7280" fillOpacity={0.12} />
              <Radar name="Current" dataKey="current" stroke="#FF6B00" fill="#FF6B00" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#FF6B00]" /> Current</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#6B7280]" /> Required</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ title, color, icon: Icon, items, note }) {
  const map = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center border ${map[color]}`}><Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} /></div>
        <div><h3 className="font-semibold font-heading">{title}</h3><p className="text-[11px] text-[#9CA3AF]">{note}</p></div>
        <span className="ml-auto text-lg font-bold font-heading">{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.skill} className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC]">
            <span className="text-sm font-medium">{it.skill}</span>
            <span className="text-xs text-[#6B7280]">{it.current} → {it.required}</span>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-[#9CA3AF]">None in this category.</p>}
      </div>
    </div>
  );
}
