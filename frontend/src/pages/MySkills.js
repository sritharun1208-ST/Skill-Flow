import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Zap, Plus, X, Save } from "lucide-react";
import { api } from "@/lib/apiClient";
import PageHeader from "@/components/PageHeader";

const LEVELS = ["beginner", "intermediate", "advanced"];
const LEVEL_PCT = { beginner: 33, intermediate: 67, advanced: 100 };

export default function MySkills() {
  const qc = useQueryClient();
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => api.get("/auth/me").then((r) => r.data) });
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("beginner");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (me?.skills) setSkills(me.skills); }, [me]);

  const add = () => {
    if (!name.trim()) return;
    setSkills((s) => [...s, { name: name.trim(), level }]);
    setName("");
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/skills", skills);
      qc.invalidateQueries();
      toast.success("Skills updated!");
    } catch (e) { toast.error("Could not save skills."); }
    finally { setSaving(false); }
  };

  return (
    <div data-testid="skills-page">
      <PageHeader title="My Skills" icon={Zap} subtitle="Keep your skills up to date. This powers your gap analysis, matches and readiness score."
        action={<button data-testid="save-skills-btn" onClick={save} disabled={saving} className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#FF6B00] text-white font-semibold hover:bg-[#e85f00] transition-colors disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}</button>} />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-5">
        <div className="flex flex-col sm:flex-row gap-2">
          <input data-testid="skill-input" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Add a skill, e.g. React" className="flex-1 h-11 px-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
          <select data-testid="skill-level" value={level} onChange={(e) => setLevel(e.target.value)} className="h-11 px-3 rounded-xl border border-gray-200 bg-white capitalize focus:outline-none focus:ring-2 focus:ring-[#FF6B00]">
            {LEVELS.map((l) => <option key={l} value={l} className="capitalize">{l}</option>)}
          </select>
          <button data-testid="add-skill" onClick={add} className="h-11 px-4 rounded-xl bg-[#FF6B00] text-white font-medium inline-flex items-center gap-1"><Plus className="h-4 w-4" /> Add</button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {skills.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold font-heading">{s.name}</span>
              <button data-testid={`remove-skill-${i}`} onClick={() => setSkills(skills.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-3">
              <motion.div className="h-full rounded-full bg-[#FF6B00]" initial={{ width: 0 }} animate={{ width: `${LEVEL_PCT[s.level] || 33}%` }} transition={{ duration: 0.6 }} />
            </div>
            <div className="flex gap-2">
              {LEVELS.map((l) => (
                <button key={l} onClick={() => setSkills(skills.map((x, j) => j === i ? { ...x, level: l } : x))} className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium transition-colors ${s.level === l ? "bg-[#FF6B00] text-white" : "bg-gray-100 text-[#6B7280] hover:bg-orange-50"}`}>{l}</button>
              ))}
            </div>
          </motion.div>
        ))}
        {skills.length === 0 && <p className="text-sm text-[#9CA3AF]">No skills yet. Add your first skill above.</p>}
      </div>
    </div>
  );
}
