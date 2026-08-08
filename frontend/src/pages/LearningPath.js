import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Route, CheckCircle2, Circle, Clock, BookOpen, Wrench, ChevronDown } from "lucide-react";
import { api } from "@/lib/apiClient";
import PageHeader from "@/components/PageHeader";

const DIFF = { Beginner: "bg-emerald-50 text-emerald-600", Intermediate: "bg-amber-50 text-amber-600", Advanced: "bg-red-50 text-red-600" };

export default function LearningPath() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["learning-path"], queryFn: () => api.get("/learning-path").then((r) => r.data) });
  const [open, setOpen] = React.useState(null);

  const toggle = async (id) => {
    try {
      await api.post(`/learning-path/${id}/toggle`);
      qc.invalidateQueries({ queryKey: ["learning-path"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["progress"] });
    } catch (e) { toast.error("Could not update."); }
  };

  if (isLoading || !data) return <div className="text-[#6B7280]">Building your learning path…</div>;
  const done = data.steps.filter((s) => s.completed).length;

  return (
    <div data-testid="learning-path-page">
      <PageHeader title="My Learning Path" icon={Route} subtitle={`A personalized roadmap toward ${data.careerName}. ${done} of ${data.steps.length} steps completed.`} />

      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden mb-8 max-w-md">
        <motion.div className="h-full rounded-full bg-[#FF6B00]" initial={{ width: 0 }} animate={{ width: `${(done / data.steps.length) * 100}%` }} transition={{ duration: 0.8 }} />
      </div>

      <div className="relative pl-4">
        <div className="absolute left-[26px] top-2 bottom-2 w-0.5 bg-gray-200" />
        <div className="space-y-4">
          {data.steps.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="relative">
              <button data-testid={`step-toggle-${i}`} onClick={() => toggle(s.id)} className={`absolute -left-0 top-5 h-8 w-8 rounded-full flex items-center justify-center border-2 z-10 bg-white transition-colors ${s.completed ? "border-[#FF6B00] text-[#FF6B00]" : "border-gray-300 text-gray-300 hover:border-[#FF6B00]"}`}>
                {s.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-4 w-4" />}
              </button>
              <div className={`ml-12 bg-white rounded-2xl border shadow-sm overflow-hidden ${s.completed ? "border-orange-200" : "border-gray-200"}`}>
                <button onClick={() => setOpen(open === s.id ? null : s.id)} className="w-full text-left p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-[#FF6B00] font-heading">STEP {String(s.step).padStart(2, "0")}</span>
                      <h3 className="font-semibold font-heading text-lg mt-0.5">{s.title}</h3>
                      <p className="text-sm text-[#6B7280] mt-1">{s.why}</p>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-gray-400 shrink-0 transition-transform ${open === s.id ? "rotate-180" : ""}`} />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${DIFF[s.difficulty]}`}>{s.difficulty}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-[#6B7280] inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {s.time}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-50 text-[#FF6B00] font-medium">{s.skill}</span>
                  </div>
                </button>

                {open === s.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-5 pb-5 border-t border-gray-100 pt-4">
                    <Section label="What to learn" items={s.learn} />
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs font-semibold text-[#111827] flex items-center gap-1.5 mb-2"><Wrench className="h-3.5 w-3.5 text-[#FF6B00]" /> Practice tasks</p>
                        <ul className="space-y-1">{s.tasks.map((t) => <li key={t} className="text-sm text-[#6B7280]">• {t}</li>)}</ul>
                        <p className="text-xs font-semibold text-[#111827] mt-3">Related project</p>
                        <p className="text-sm text-[#6B7280]">{s.project}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#111827] flex items-center gap-1.5 mb-2"><BookOpen className="h-3.5 w-3.5 text-[#FF6B00]" /> Suggested resources</p>
                        <div className="space-y-2">
                          {s.resources.map((r) => (
                            <a key={r.name} href={r.url} target="_blank" rel="noreferrer" className="block p-2.5 rounded-lg bg-[#F8FAFC] border border-gray-100 hover:border-orange-200 transition-colors">
                              <div className="flex items-center justify-between"><span className="text-sm font-medium">{r.name}</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[#6B7280]">{r.type}</span></div>
                              <p className="text-xs text-[#9CA3AF] mt-0.5">{r.difficulty} · {r.duration}</p>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button data-testid={`mark-complete-${i}`} onClick={() => toggle(s.id)} className={`mt-4 h-10 px-4 rounded-xl font-medium text-sm transition-colors ${s.completed ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-[#FF6B00] text-white"}`}>
                      {s.completed ? "✓ Completed" : "Mark as completed"}
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Section({ label, items }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#111827] mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((x) => <span key={x} className="text-sm px-3 py-1 rounded-lg bg-white border border-gray-200 text-[#111827]">{x}</span>)}
      </div>
    </div>
  );
}
