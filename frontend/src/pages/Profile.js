import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { User, Github, Link2, Pencil, X, ShieldCheck, CheckCircle2, FileText, GraduationCap, Trophy, Award, Briefcase } from "lucide-react";
import { api } from "@/lib/apiClient";
import PageHeader from "@/components/PageHeader";

const LEVEL_PCT = { beginner: 33, intermediate: 67, advanced: 100 };

export default function Profile() {
  const qc = useQueryClient();
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => api.get("/auth/me").then((r) => r.data) });
  const { data: proof } = useQuery({ queryKey: ["proof"], queryFn: () => api.get("/proof-of-skills").then((r) => r.data) });
  const [tab, setTab] = useState("overview");
  const [edit, setEdit] = useState(false);
  const [portfolio, setPortfolio] = useState(false);

  if (!me) return <div className="text-[#6B7280]">Loading profile…</div>;
  const p = me.profile || {};
  const initials = (p.name || me.name || "S").split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div data-testid="profile-page">
      <PageHeader title="Profile" icon={User} subtitle="Your credible, proof-backed student profile."
        action={<button data-testid="generate-portfolio-btn" onClick={() => setPortfolio(true)} className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#FF6B00] text-white font-semibold hover:bg-[#e85f00] transition-colors"><FileText className="h-4 w-4" /> Generate Career Portfolio</button>} />

      {/* header card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-5">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="h-20 w-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold font-heading shrink-0" style={{ background: "linear-gradient(135deg,#FF6B00,#FF8A3D)" }}>{initials}</div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold font-heading">{p.name || me.name}</h2>
                <p className="text-[#6B7280] text-sm">{[p.degree, p.college].filter(Boolean).join(" · ") || "Add your education"}</p>
                {me.targetCareerId && <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-[#FF6B00]">🎯 {me.goal || "Career goal set"}</span>}
              </div>
              <button data-testid="edit-profile-btn" onClick={() => setEdit(true)} className="h-9 px-3 rounded-lg border border-gray-200 text-sm font-medium text-[#111827] inline-flex items-center gap-1.5 hover:bg-gray-50"><Pencil className="h-3.5 w-3.5" /> Edit</button>
            </div>
            {p.about && <p className="text-sm text-[#6B7280] mt-3">{p.about}</p>}
            <div className="flex flex-wrap gap-3 mt-3">
              {p.github && <a href={p.github} target="_blank" rel="noreferrer" className="text-sm text-[#111827] inline-flex items-center gap-1.5 hover:text-[#FF6B00]"><Github className="h-4 w-4" /> GitHub</a>}
              {p.portfolio && <a href={p.portfolio} target="_blank" rel="noreferrer" className="text-sm text-[#111827] inline-flex items-center gap-1.5 hover:text-[#FF6B00]"><Link2 className="h-4 w-4" /> Portfolio</a>}
            </div>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="inline-flex bg-white border border-gray-200 rounded-xl p-1 mb-5">
        {[["overview", "Overview"], ["proof", "Proof of Skills"]].map(([k, l]) => (
          <button key={k} data-testid={`tab-${k}`} onClick={() => setTab(k)} className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${tab === k ? "bg-[#FF6B00] text-white" : "text-[#6B7280] hover:text-[#FF6B00]"}`}>{l}</button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="grid md:grid-cols-2 gap-5">
          <Card title="Skills"><div className="space-y-3">{(me.skills || []).map((s) => (
            <div key={s.name}><div className="flex justify-between text-sm mb-1"><span className="font-medium">{s.name}</span><span className="text-[#6B7280] capitalize">{s.level}</span></div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden"><motion.div className="h-full bg-[#FF6B00] rounded-full" initial={{ width: 0 }} animate={{ width: `${LEVEL_PCT[s.level] || 33}%` }} transition={{ duration: 0.6 }} /></div>
            </div>
          ))}</div></Card>
          <div className="space-y-5">
            <ListCard icon={GraduationCap} title="Education" items={[[p.degree, p.college], [p.branch, p.year], ["Graduating", p.graduationYear]].filter((x) => x[0] || x[1]).map((x) => x.filter(Boolean).join(" · "))} />
            <ListCard icon={Award} title="Certifications" items={proof?.certifications || []} />
            <ListCard icon={Trophy} title="Hackathons" items={proof?.hackathons || []} />
          </div>
        </div>
      ) : (
        <div className="space-y-5" data-testid="proof-section">
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-[#FF6B00] mt-0.5 shrink-0" />
            <p className="text-sm text-[#111827]">Proof beats claims. Back every skill with projects, certifications and real work — this makes your profile far more credible than simply saying "I know Python".</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {(proof?.skills || []).map((s) => (
              <div key={s.skill} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5" data-testid={`proof-${s.skill.replace(/\s+/g, "-")}`}>
                <div className="flex items-center justify-between mb-3"><span className="font-semibold font-heading">{s.skill}</span><span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-[#FF6B00] capitalize">{s.level}</span></div>
                <div className="space-y-1.5">
                  {s.evidence.length ? s.evidence.map((e, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-[#6B7280]"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> <span className="text-[#6B7280]">{e.type}:</span> <span className="text-[#111827]">{e.label}</span></div>
                  )) : <p className="text-xs text-[#9CA3AF]">No evidence yet — add projects or certifications in your profile.</p>}
                </div>
              </div>
            ))}
          </div>
          <ProofGrid title="Projects" icon={Briefcase} items={proof?.projects} />
          <ProofGrid title="Internships" icon={Briefcase} items={proof?.internships} />
        </div>
      )}

      {edit && <EditModal me={me} onClose={() => setEdit(false)} onSaved={() => { qc.invalidateQueries(); setEdit(false); }} />}
      {portfolio && <PortfolioModal me={me} proof={proof} onClose={() => setPortfolio(false)} />}
    </div>
  );
}

function Card({ title, children }) { return <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"><h3 className="font-semibold font-heading text-lg mb-4">{title}</h3>{children}</div>; }

function ListCard({ icon: Icon, title, items }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-3"><div className="h-8 w-8 rounded-lg bg-orange-50 text-[#FF6B00] flex items-center justify-center"><Icon className="h-4 w-4" /></div><h3 className="font-semibold font-heading">{title}</h3></div>
      {items && items.length ? <ul className="space-y-1.5">{items.map((it, i) => <li key={i} className="text-sm text-[#6B7280]">• {it}</li>)}</ul> : <p className="text-xs text-[#9CA3AF]">Nothing added yet.</p>}
    </div>
  );
}

function ProofGrid({ title, icon: Icon, items }) {
  if (!items || !items.length) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-3"><Icon className="h-4 w-4 text-[#FF6B00]" /><h3 className="font-semibold font-heading">{title}</h3></div>
      <div className="flex flex-wrap gap-2">{items.map((it, i) => <span key={i} className="text-sm px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-gray-200">{typeof it === "string" ? it : it.name}</span>)}</div>
    </div>
  );
}

function EditModal({ me, onClose, onSaved }) {
  const p = me.profile || {};
  const [form, setForm] = useState({ name: p.name || me.name || "", about: p.about || "", college: p.college || "", degree: p.degree || "", branch: p.branch || "", year: p.year || "", graduationYear: p.graduationYear || "", github: p.github || "", portfolio: p.portfolio || "" });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try { await api.put("/profile", { profile: form }); toast.success("Profile updated!"); onSaved(); }
    catch (e) { toast.error("Could not save."); } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="edit-profile-modal">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto sf-scroll p-6">
        <div className="flex items-center justify-between mb-4"><h3 className="font-bold font-heading text-lg">Edit profile</h3><button onClick={onClose}><X className="h-5 w-5 text-[#6B7280]" /></button></div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[["name", "Name"], ["college", "College"], ["degree", "Degree"], ["branch", "Branch"], ["year", "Year"], ["graduationYear", "Graduation Year"], ["github", "GitHub URL"], ["portfolio", "Portfolio URL"]].map(([k, l]) => (
            <label key={k} className="block"><span className="text-xs font-medium text-[#6B7280]">{l}</span>
              <input data-testid={`edit-${k}`} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="mt-1 w-full h-11 px-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
            </label>
          ))}
        </div>
        <label className="block mt-3"><span className="text-xs font-medium text-[#6B7280]">About</span>
          <textarea data-testid="edit-about" value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} rows={3} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
        </label>
        <button data-testid="save-profile-btn" onClick={save} disabled={saving} className="mt-5 w-full h-11 rounded-xl bg-[#FF6B00] text-white font-semibold hover:bg-[#e85f00] transition-colors disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button>
      </motion.div>
    </div>
  );
}

function PortfolioModal({ me, proof, onClose }) {
  const p = me.profile || {};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="portfolio-modal">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto sf-scroll">
        <div className="p-8 text-white" style={{ background: "linear-gradient(135deg,#FF6B00,#FF8A3D)" }}>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white"><X className="h-5 w-5" /></button>
          <p className="text-sm text-white/80">Career Portfolio</p>
          <h2 className="text-3xl font-bold font-heading mt-1">{p.name || me.name}</h2>
          <p className="text-white/85 mt-1">{me.goal} · {[p.degree, p.college].filter(Boolean).join(", ")}</p>
        </div>
        <div className="p-8 space-y-6">
          {p.about && <p className="text-sm text-[#6B7280]">{p.about}</p>}
          <div><h3 className="font-semibold font-heading mb-2">Skills</h3><div className="flex flex-wrap gap-2">{(me.skills || []).map((s) => <span key={s.name} className="text-sm px-3 py-1 rounded-lg bg-orange-50 text-[#FF6B00]">{s.name} · {s.level}</span>)}</div></div>
          {proof?.projects?.length ? <div><h3 className="font-semibold font-heading mb-2">Projects</h3><ul className="space-y-1">{proof.projects.map((x, i) => <li key={i} className="text-sm text-[#6B7280]">• {typeof x === "string" ? x : x.name}</li>)}</ul></div> : null}
          {proof?.certifications?.length ? <div><h3 className="font-semibold font-heading mb-2">Certifications</h3><ul className="space-y-1">{proof.certifications.map((x, i) => <li key={i} className="text-sm text-[#6B7280]">• {x}</li>)}</ul></div> : null}
          <div className="flex gap-3 pt-2">
            {p.github && <a href={p.github} target="_blank" rel="noreferrer" className="text-sm text-[#FF6B00] font-medium inline-flex items-center gap-1.5"><Github className="h-4 w-4" /> {p.github}</a>}
            {p.portfolio && <a href={p.portfolio} target="_blank" rel="noreferrer" className="text-sm text-[#FF6B00] font-medium inline-flex items-center gap-1.5"><Link2 className="h-4 w-4" /> {p.portfolio}</a>}
          </div>
          <button onClick={() => { window.print(); }} data-testid="download-portfolio" className="w-full h-11 rounded-xl border border-gray-200 font-medium text-[#111827] hover:bg-gray-50">Print / Save as PDF</button>
        </div>
      </motion.div>
    </div>
  );
}
