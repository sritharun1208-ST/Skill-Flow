import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import { Compass, X, Check, GitCompare } from "lucide-react";
import { api } from "@/lib/apiClient";
import PageHeader from "@/components/PageHeader";

function matchColor(m) { return m >= 75 ? "text-emerald-600" : m >= 50 ? "text-[#FF6B00]" : "text-red-500"; }

export default function CareerExplorer() {
  const { data: careers, isLoading } = useQuery({ queryKey: ["careers"], queryFn: () => api.get("/careers").then((r) => r.data) });
  const { data: matches } = useQuery({
    queryKey: ["career-matches"],
    enabled: !!careers,
    queryFn: async () => {
      const entries = await Promise.all(careers.map((c) => api.get(`/careers/${c.id}/match`).then((r) => [c.id, r.data.match])));
      return Object.fromEntries(entries);
    },
  });
  const [detail, setDetail] = useState(null);
  const [compare, setCompare] = useState([]);

  const toggleCompare = (id) => setCompare((c) => c.includes(id) ? c.filter((x) => x !== id) : c.length < 3 ? [...c, id] : c);

  if (isLoading || !careers) return <div className="text-[#6B7280]">Loading careers…</div>;

  return (
    <div data-testid="career-explorer-page">
      <PageHeader title="Explore Careers" icon={Compass} subtitle="Browse career paths and see how your current profile matches each one." />

      {compare.length >= 2 && (
        <div className="bg-white rounded-2xl border border-orange-200 shadow-sm p-5 mb-5">
          <h3 className="font-semibold font-heading text-lg mb-3 inline-flex items-center gap-2"><GitCompare className="h-5 w-5 text-[#FF6B00]" /> Career Comparison</h3>
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${compare.length}, minmax(0,1fr))` }}>
            {compare.map((id) => {
              const c = careers.find((x) => x.id === id);
              return (
                <div key={id} className="rounded-xl border border-gray-200 p-4">
                  <p className="font-semibold font-heading">{c.name}</p>
                  <p className={`text-3xl font-bold font-heading mt-2 ${matchColor(matches?.[id] ?? 0)}`}>{matches?.[id] ?? "…"}%</p>
                  <p className="text-xs text-[#6B7280]">your match</p>
                  <div className="mt-3 flex flex-wrap gap-1">{c.required_skills.slice(0, 5).map((s) => <span key={s.name} className="text-[10px] px-1.5 py-0.5 rounded bg-[#F8FAFC] border border-gray-200">{s.name}</span>)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {careers.map((c, i) => {
          const Icon = Icons[c.icon] || Compass;
          const m = matches?.[c.id];
          const selected = compare.includes(c.id);
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col" data-testid={`career-card-${c.id}`}>
              <div className="flex items-start justify-between">
                <div className="h-11 w-11 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center"><Icon className="h-5 w-5" /></div>
                <div className="text-right">
                  <p className={`text-xl font-bold font-heading ${m != null ? matchColor(m) : "text-gray-300"}`}>{m != null ? `${m}%` : "…"}</p>
                  <p className="text-[10px] text-[#9CA3AF]">match</p>
                </div>
              </div>
              <h3 className="font-semibold font-heading text-lg mt-3">{c.name}</h3>
              <p className="text-sm text-[#6B7280] mt-1 line-clamp-2">{c.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">{c.technologies.slice(0, 4).map((t) => <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-gray-200">{t}</span>)}</div>
              <div className="mt-auto pt-4 flex gap-2">
                <button data-testid={`view-career-${c.id}`} onClick={() => setDetail(c.id)} className="flex-1 h-10 rounded-xl bg-[#FF6B00] text-white text-sm font-semibold hover:bg-[#e85f00] transition-colors">Check My Match</button>
                <button data-testid={`compare-${c.id}`} onClick={() => toggleCompare(c.id)} className={`h-10 px-3 rounded-xl text-sm font-medium border transition-colors ${selected ? "bg-orange-50 border-orange-200 text-[#FF6B00]" : "border-gray-200 text-[#6B7280] hover:border-orange-200"}`}>
                  {selected ? <Check className="h-4 w-4" /> : "Compare"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {detail && <CareerDetail id={detail} match={matches?.[detail]} onClose={() => setDetail(null)} />}
      </AnimatePresence>
    </div>
  );
}

function CareerDetail({ id, match, onClose }) {
  const { data: c } = useQuery({ queryKey: ["career", id], queryFn: () => api.get(`/careers/${id}`).then((r) => r.data) });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="career-detail-modal">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="relative bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto sf-scroll">
        {!c ? <div className="p-8 text-[#6B7280]">Loading…</div> : (
          <>
            <div className="p-6 text-white sticky top-0" style={{ background: "linear-gradient(135deg,#FF6B00,#FF8A3D)" }}>
              <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white"><X className="h-5 w-5" /></button>
              <h2 className="text-2xl font-bold font-heading">{c.name}</h2>
              <p className="text-white/85 text-sm mt-1 max-w-lg">{c.description}</p>
              {match != null && <div className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-sm font-semibold">Your match: {match}%</div>}
            </div>
            <div className="p-6 space-y-5">
              <Block title="Required skills">
                <div className="space-y-2">{c.required_skills.map((s) => (
                  <div key={s.name} className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-gray-100">
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className="text-xs text-[#6B7280] capitalize">{s.level}{s.core && <span className="ml-2 text-[#FF6B00]">core</span>}</span>
                  </div>
                ))}</div>
              </Block>
              <Block title="Common technologies"><div className="flex flex-wrap gap-2">{c.technologies.map((t) => <span key={t} className="text-sm px-3 py-1 rounded-lg bg-orange-50 text-[#FF6B00]">{t}</span>)}</div></Block>
              <Block title="Typical projects"><div className="flex flex-wrap gap-2">{c.typical_projects.map((t) => <span key={t} className="text-sm px-3 py-1 rounded-lg bg-[#F8FAFC] border border-gray-200">{t}</span>)}</div></Block>
              <Block title="Recommended learning path">
                <div className="space-y-2">{c.path.map((p, i) => (
                  <div key={i} className="flex gap-3 items-start p-2.5 rounded-lg bg-[#F8FAFC] border border-gray-100">
                    <span className="text-xs font-bold text-[#FF6B00] font-heading mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                    <div><p className="text-sm font-medium">{p.title}</p><p className="text-xs text-[#6B7280]">{p.difficulty} · {p.time}</p></div>
                  </div>
                ))}</div>
              </Block>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

function Block({ title, children }) {
  return <div><h3 className="font-semibold font-heading mb-2">{title}</h3>{children}</div>;
}
