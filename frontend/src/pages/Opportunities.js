import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Briefcase, MapPin, CalendarClock, Check, AlertTriangle, X, Bookmark } from "lucide-react";
import { api } from "@/lib/apiClient";
import PageHeader from "@/components/PageHeader";

const TYPES = ["All", "Internship", "Full Time", "Hackathon", "Scholarship"];
const MODES = ["All", "Remote", "Hybrid", "On-site"];

function matchColor(m) {
  if (m >= 75) return "text-emerald-600";
  if (m >= 50) return "text-[#FF6B00]";
  return "text-red-500";
}

export default function Opportunities() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["opportunities"], queryFn: () => api.get("/opportunities").then((r) => r.data) });
  const [type, setType] = useState("All");
  const [mode, setMode] = useState("All");

  const save = async (o) => {
    try {
      await api.post("/applications", { company: o.company, role: o.role, status: "saved", deadline: o.deadline, opportunityId: o.id });
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Saved "${o.role}" to your tracker.`);
    } catch (e) { toast.error("Could not save."); }
  };

  if (isLoading || !data) return <div className="text-[#6B7280]">Matching you with opportunities…</div>;
  const filtered = data.filter((o) => (type === "All" || o.type === type) && (mode === "All" || o.mode === mode));

  return (
    <div data-testid="opportunities-page">
      <PageHeader title="Opportunities" icon={Briefcase} subtitle="Internships, jobs, hackathons and more — ranked by how well they match your skills." />

      <div className="flex flex-wrap gap-2 mb-5">
        <FilterGroup value={type} setValue={setType} options={TYPES} testId="filter-type" />
        <FilterGroup value={mode} setValue={setMode} options={MODES} testId="filter-mode" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {filtered.map((o, i) => (
          <motion.div key={o.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5" data-testid={`opportunity-${o.id}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-[#FF6B00] font-semibold">{o.type}</span>
                  <span className="text-xs text-[#6B7280]">{o.stipend}</span>
                </div>
                <h3 className="font-semibold font-heading text-lg mt-1.5">{o.role}</h3>
                <p className="text-sm text-[#6B7280]">{o.company}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-2xl font-bold font-heading ${matchColor(o.match)}`}>{o.match}%</p>
                <p className="text-[11px] text-[#9CA3AF]">match</p>
              </div>
            </div>

            <p className="text-sm text-[#6B7280] mt-3">{o.description}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              {o.matchedSkills.map((s) => <Chip key={s} icon={Check} color="emerald">{s}</Chip>)}
              {o.partialSkills.map((s) => <Chip key={s} icon={AlertTriangle} color="amber">{s}</Chip>)}
              {o.missingSkills.map((s) => <Chip key={s} icon={X} color="red">{s}</Chip>)}
            </div>

            {o.missingCount > 0 && <p className="text-xs text-[#6B7280] mt-3 bg-[#F8FAFC] border border-gray-100 rounded-lg p-2.5">You're missing <b className="text-[#111827]">{o.missingCount}</b> required skill{o.missingCount > 1 ? "s" : ""}. Close the gap to boost your match.</p>}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {o.location}</span>
                <span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> {o.deadline}</span>
              </div>
              <button data-testid={`save-opp-${o.id}`} onClick={() => save(o)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#FF6B00] text-white text-sm font-semibold hover:bg-[#e85f00] transition-colors">
                <Bookmark className="h-3.5 w-3.5" /> Apply / Save
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function FilterGroup({ value, setValue, options, testId }) {
  return (
    <div className="inline-flex bg-white border border-gray-200 rounded-xl p-1" data-testid={testId}>
      {options.map((o) => (
        <button key={o} onClick={() => setValue(o)} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${value === o ? "bg-[#FF6B00] text-white" : "text-[#6B7280] hover:text-[#FF6B00]"}`}>{o}</button>
      ))}
    </div>
  );
}

function Chip({ icon: Icon, color, children }) {
  const map = { emerald: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", red: "bg-red-50 text-red-500" };
  return <span className={`text-xs px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${map[color]}`}><Icon className="h-3 w-3" /> {children}</span>;
}
