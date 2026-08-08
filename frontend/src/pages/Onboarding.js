import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Plus, X, Check, GraduationCap, Target, Zap, Award, Flag } from "lucide-react";
import Logo from "@/components/Logo";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";

const GOALS = ["Get an internship", "Get a job", "Build projects", "Improve technical skills", "Prepare for placements", "Explore career options"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const STEPS = [
  { title: "Your Profile", icon: GraduationCap },
  { title: "Career Goal", icon: Target },
  { title: "Current Skills", icon: Zap },
  { title: "Experience", icon: Award },
  { title: "Main Goal", icon: Flag },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [step, setStep] = useState(0);
  const [careers, setCareers] = useState([]);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({ name: user?.name || "", education: "", college: "", degree: "", branch: "", year: "", graduationYear: "" });
  const [targetCareer, setTargetCareer] = useState("");
  const [customCareer, setCustomCareer] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [experience, setExperience] = useState({ projects: [], internships: [], certifications: [], hackathons: [], work: [] });
  const [goal, setGoal] = useState("");

  useEffect(() => { api.get("/careers").then((r) => setCareers(r.data)).catch(() => {}); }, []);

  const addSkill = () => {
    if (!skillName.trim()) return;
    setSkills((s) => [...s, { name: skillName.trim(), level: skillLevel.toLowerCase() }]);
    setSkillName("");
  };

  const next = () => {
    if (step === 0 && !profile.name.trim()) return toast.error("Please enter your name.");
    if (step === 1 && !targetCareer) return toast.error("Please choose a target career.");
    if (step === 2 && skills.length === 0) return toast.error("Add at least one skill.");
    if (step === 4) return submit();
    setStep((s) => s + 1);
  };

  const submit = async () => {
    setSaving(true);
    try {
      const finalCareer = targetCareer === "__custom__" ? customCareer : targetCareer;
      const { data } = await api.post("/onboarding", { profile, targetCareer: finalCareer, goal: goal || GOALS[0], skills, experience });
      setUser(data);
      toast.success("Your Skill Flow is ready! 🎉");
      navigate("/app/dashboard");
    } catch (e) {
      toast.error("Could not save onboarding. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const StepIcon = STEPS[step].icon;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200"><div className="max-w-3xl mx-auto px-4 py-4"><Logo /></div></header>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1">
              <div className={`h-1.5 rounded-full ${i <= step ? "bg-[#FF6B00]" : "bg-gray-200"}`} />
              <p className={`text-[11px] mt-1.5 font-medium hidden sm:block ${i <= step ? "text-[#FF6B00]" : "text-[#9CA3AF]"}`}>{s.title}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-11 w-11 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center"><StepIcon className="h-5 w-5" /></div>
            <div>
              <p className="text-xs text-[#6B7280]">Step {step + 1} of {STEPS.length}</p>
              <h1 className="text-xl font-bold font-heading">{STEPS[step].title}</h1>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              {step === 0 && (
                <div className="grid sm:grid-cols-2 gap-4" data-testid="onboarding-step-profile">
                  <Input label="Name" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} testId="ob-name" />
                  <Input label="Education (e.g. B.Tech)" value={profile.education} onChange={(v) => setProfile({ ...profile, education: v })} testId="ob-education" />
                  <Input label="College" value={profile.college} onChange={(v) => setProfile({ ...profile, college: v })} testId="ob-college" />
                  <Input label="Degree" value={profile.degree} onChange={(v) => setProfile({ ...profile, degree: v })} testId="ob-degree" />
                  <Input label="Branch" value={profile.branch} onChange={(v) => setProfile({ ...profile, branch: v })} testId="ob-branch" />
                  <Input label="Current Year / Semester" value={profile.year} onChange={(v) => setProfile({ ...profile, year: v })} testId="ob-year" />
                  <Input label="Graduation Year" value={profile.graduationYear} onChange={(v) => setProfile({ ...profile, graduationYear: v })} testId="ob-gradyear" />
                </div>
              )}

              {step === 1 && (
                <div data-testid="onboarding-step-career">
                  <p className="text-sm text-[#6B7280] mb-4">What career are you targeting?</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {careers.map((c) => (
                      <button key={c.id} data-testid={`career-${c.id}`} onClick={() => setTargetCareer(c.id)} className={`text-left p-4 rounded-xl border transition-all ${targetCareer === c.id ? "border-[#FF6B00] bg-orange-50" : "border-gray-200 hover:border-orange-200"}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold font-heading">{c.name}</span>
                          {targetCareer === c.id && <Check className="h-4 w-4 text-[#FF6B00]" />}
                        </div>
                        <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">{c.description}</p>
                      </button>
                    ))}
                    <button data-testid="career-custom" onClick={() => setTargetCareer("__custom__")} className={`text-left p-4 rounded-xl border transition-all ${targetCareer === "__custom__" ? "border-[#FF6B00] bg-orange-50" : "border-gray-200 hover:border-orange-200"}`}>
                      <span className="font-semibold font-heading">Other / Custom</span>
                      <p className="text-xs text-[#6B7280] mt-1">Type your own career goal</p>
                    </button>
                  </div>
                  {targetCareer === "__custom__" && <div className="mt-4"><Input label="Custom career" value={customCareer} onChange={setCustomCareer} testId="ob-custom-career" /></div>}
                </div>
              )}

              {step === 2 && (
                <div data-testid="onboarding-step-skills">
                  <p className="text-sm text-[#6B7280] mb-4">Add the skills you currently have and your level.</p>
                  <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <input data-testid="skill-name-input" value={skillName} onChange={(e) => setSkillName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()} placeholder="e.g. Python" className="flex-1 h-11 px-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
                    <select data-testid="skill-level-select" value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} className="h-11 px-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]">
                      {LEVELS.map((l) => <option key={l}>{l}</option>)}
                    </select>
                    <button data-testid="add-skill-btn" onClick={addSkill} className="h-11 px-4 rounded-xl bg-[#FF6B00] text-white font-medium inline-flex items-center gap-1"><Plus className="h-4 w-4" /> Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-sm">
                        <b className="font-semibold text-[#111827]">{s.name}</b> <span className="text-[#6B7280] capitalize">{s.level}</span>
                        <button onClick={() => setSkills(skills.filter((_, j) => j !== i))}><X className="h-3.5 w-3.5 text-[#6B7280]" /></button>
                      </span>
                    ))}
                    {skills.length === 0 && <p className="text-sm text-[#9CA3AF]">No skills added yet.</p>}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4" data-testid="onboarding-step-experience">
                  <p className="text-sm text-[#6B7280]">Tell us about your experience (comma-separated, optional).</p>
                  {[["projects", "Projects"], ["internships", "Internships"], ["certifications", "Certifications"], ["hackathons", "Hackathons"], ["work", "Work Experience"]].map(([key, label]) => (
                    <Input key={key} label={label} value={(experience[key] || []).join(", ")} onChange={(v) => setExperience({ ...experience, [key]: v.split(",").map((x) => x.trim()).filter(Boolean) })} testId={`ob-exp-${key}`} />
                  ))}
                </div>
              )}

              {step === 4 && (
                <div data-testid="onboarding-step-goal">
                  <p className="text-sm text-[#6B7280] mb-4">What is your main goal?</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {GOALS.map((g) => (
                      <button key={g} data-testid={`goal-${g.replace(/\s+/g, "-").toLowerCase()}`} onClick={() => setGoal(g)} className={`text-left p-4 rounded-xl border font-medium transition-all ${goal === g ? "border-[#FF6B00] bg-orange-50 text-[#FF6B00]" : "border-gray-200 hover:border-orange-200"}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button data-testid="ob-back" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6B7280] disabled:opacity-40">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button data-testid="ob-next" onClick={next} disabled={saving} className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#FF6B00] text-white font-semibold hover:bg-[#e85f00] transition-colors disabled:opacity-60">
              {step === 4 ? (saving ? "Building…" : "Finish & Build My Flow") : "Continue"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, testId }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-[#6B7280]">{label}</span>
      <input data-testid={testId} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full h-11 px-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
    </label>
  );
}
