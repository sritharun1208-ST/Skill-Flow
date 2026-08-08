import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FolderGit2, Clock, Github, Sparkles, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/apiClient";
import PageHeader from "@/components/PageHeader";

const LEVEL = { Beginner: "bg-emerald-50 text-emerald-600", Intermediate: "bg-amber-50 text-amber-600", Advanced: "bg-red-50 text-red-600" };
const STATUS = [["not_started", "Not started"], ["in_progress", "In progress"], ["completed", "Completed"]];

export default function Projects() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["projects"], queryFn: () => api.get("/projects").then((r) => r.data) });

  const setStatus = async (id, status) => {
    try {
      await api.post(`/projects/${id}/status`, { status });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Project updated!");
    } catch (e) { toast.error("Could not update."); }
  };

  if (isLoading || !data) return <div className="text-[#6B7280]">Finding the best projects for you…</div>;

  return (
    <div data-testid="projects-page">
      <PageHeader title="Build Projects" icon={FolderGit2} subtitle="Prove your skills with real projects — ranked by relevance to your target career and skill gaps." />
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {data.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col hover:-translate-y-1 hover:shadow-md transition-all duration-200" data-testid={`project-${p.id}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold font-heading text-lg">{p.title}</h3>
              {p.relevance >= 2 && <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-[#FF6B00] font-semibold inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> Recommended</span>}
            </div>
            <p className="text-sm text-[#6B7280]">{p.description}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${LEVEL[p.level]}`}>{p.level}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-[#6B7280] inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {p.time}</span>
            </div>
            <div className="mt-3">
              <p className="text-xs font-semibold text-[#111827] mb-1.5">Skills gained</p>
              <div className="flex flex-wrap gap-1.5">{p.skills_gained.map((s) => <span key={s} className="text-xs px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-gray-200 text-[#111827]">{s}</span>)}</div>
            </div>
            <div className="mt-3">
              <p className="text-xs font-semibold text-[#111827] mb-1.5">Suggested features</p>
              <ul className="text-sm text-[#6B7280] space-y-0.5">{p.features.slice(0, 4).map((f) => <li key={f}>• {f}</li>)}</ul>
            </div>
            <div className="mt-auto pt-4 flex items-center gap-2">
              <select data-testid={`project-status-${p.id}`} value={p.status} onChange={(e) => setStatus(p.id, e.target.value)} className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]">
                {STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <a href="https://github.com/new" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-xl border border-gray-200 flex items-center justify-center text-[#111827] hover:bg-gray-50"><Github className="h-4 w-4" /></a>
            </div>
            {p.status === "completed" && <div className="mt-2 text-xs text-emerald-600 inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Completed — great proof of skill!</div>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
