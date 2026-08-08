import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FileSearch, Upload, Loader2, Check, X, Sparkles, Lightbulb, CheckCircle2, Tag } from "lucide-react";
import { api, uploadFile } from "@/lib/apiClient";
import PageHeader from "@/components/PageHeader";
import CircularProgress from "@/components/CircularProgress";

function scoreColor(v) { return v >= 70 ? "#16A34A" : v >= 45 ? "#FF6B00" : "#DC2626"; }

export default function ResumeScore() {
  const { data: careers } = useQuery({ queryKey: ["careers"], queryFn: () => api.get("/careers").then((r) => r.data) });
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => api.get("/auth/me").then((r) => r.data) });
  const [careerId, setCareerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState("");

  const effectiveCareer = careerId || me?.targetCareer || "";

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setResult(null);
    try {
      const path = `/resume/score${effectiveCareer ? `?careerId=${encodeURIComponent(effectiveCareer)}` : ""}`;
      const { data } = await uploadFile(path, file);
      setResult(data);
      toast.success("Resume scored!");
    } catch (err) {
      toast.error("Couldn't score that resume. Try a PDF, DOCX or TXT file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="resume-score-page">
      <PageHeader title="Resume Score" icon={FileSearch} subtitle="Upload your resume and get an AI score against your target role — plus concrete fixes to improve it." />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <label className="flex-1">
            <span className="text-xs font-medium text-[#6B7280]">Target role</span>
            <select data-testid="score-career" value={effectiveCareer} onChange={(e) => setCareerId(e.target.value)} className="mt-1 w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]">
              <option value="">My target career</option>
              {(careers || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="flex-1 flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 cursor-pointer hover:border-[#FF6B00] transition-colors" data-testid="score-upload-card">
            <div className="h-10 w-10 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shrink-0">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-[#111827] truncate">{loading ? "Scoring your resume…" : (fileName || "Upload resume")}</p>
              <p className="text-xs text-[#6B7280]">PDF, DOCX or TXT</p>
            </div>
            <span className="text-sm font-semibold text-[#FF6B00] shrink-0">Choose file</span>
            <input type="file" accept=".pdf,.docx,.txt" onChange={onFile} disabled={loading} className="hidden" data-testid="score-input" />
          </label>
        </div>
      </div>

      {!result && !loading && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
          <FileSearch className="h-12 w-12 mx-auto text-orange-200 mb-3" />
          <p className="text-[#6B7280] text-sm max-w-md mx-auto">Upload your resume to see how well it matches your target role, with an ATS-style score and specific improvements.</p>
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center justify-center text-center">
              <CircularProgress value={result.overall} label={`fit for ${result.role}`} testId="resume-overall" />
              <p className="text-sm text-[#111827] mt-4">{result.verdict}</p>
            </div>
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold font-heading text-lg mb-4">Score breakdown</h3>
              <div className="space-y-3">
                {result.breakdown.map((b, i) => (
                  <div key={b.category}>
                    <div className="flex justify-between text-sm mb-1"><span className="font-medium">{b.category}</span><span className="text-[#6B7280]">{b.score}%</span></div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: scoreColor(b.score) }} initial={{ width: 0 }} animate={{ width: `${b.score}%` }} transition={{ duration: 0.7, delay: i * 0.06 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold font-heading text-lg mb-3 inline-flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Strengths</h3>
              <ul className="space-y-2">{result.strengths.map((s, i) => <li key={i} className="text-sm text-[#6B7280] flex gap-2"><Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> {s}</li>)}</ul>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold font-heading text-lg mb-3 inline-flex items-center gap-2"><Sparkles className="h-5 w-5 text-[#FF6B00]" /> Skills</h3>
              <p className="text-xs font-semibold text-[#111827] mb-1.5">Matched</p>
              <div className="flex flex-wrap gap-1.5 mb-3">{result.matchedSkills.length ? result.matchedSkills.map((s) => <span key={s} className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 inline-flex items-center gap-1"><Check className="h-3 w-3" />{s}</span>) : <span className="text-xs text-[#9CA3AF]">None detected</span>}</div>
              <p className="text-xs font-semibold text-[#111827] mb-1.5">Missing</p>
              <div className="flex flex-wrap gap-1.5">{result.missingSkills.length ? result.missingSkills.map((s) => <span key={s} className="text-xs px-2 py-0.5 rounded-md bg-red-50 text-red-500 inline-flex items-center gap-1"><X className="h-3 w-3" />{s}</span>) : <span className="text-xs text-[#9CA3AF]">Great coverage!</span>}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6" data-testid="resume-improvements">
            <h3 className="font-semibold font-heading text-lg mb-4 inline-flex items-center gap-2"><Lightbulb className="h-5 w-5 text-[#FF6B00]" /> Concrete fixes</h3>
            <div className="space-y-3">
              {result.improvements.map((imp, i) => (
                <div key={i} className="flex gap-3 p-3.5 rounded-xl bg-[#F8FAFC] border border-gray-100">
                  <div className="h-7 w-7 rounded-full bg-[#FF6B00] text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                  <div>
                    <p className="font-semibold text-sm text-[#111827]">{imp.title}</p>
                    <p className="text-sm text-[#6B7280] mt-0.5">{imp.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {result.missingKeywords?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold font-heading text-lg mb-3 inline-flex items-center gap-2"><Tag className="h-5 w-5 text-[#FF6B00]" /> Keywords to add (ATS)</h3>
              <div className="flex flex-wrap gap-2">{result.missingKeywords.map((k) => <span key={k} className="text-sm px-3 py-1 rounded-lg bg-orange-50 text-[#FF6B00]">{k}</span>)}</div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
