import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { KanbanSquare, Plus, Trash2, CalendarClock, Building2, X } from "lucide-react";
import { api } from "@/lib/apiClient";
import PageHeader from "@/components/PageHeader";
import CountUp from "@/components/CountUp";

const COLUMNS = [
  { key: "saved", label: "Saved" },
  { key: "applied", label: "Applied" },
  { key: "assessment", label: "Assessment" },
  { key: "interview", label: "Interview" },
  { key: "selected", label: "Selected" },
  { key: "rejected", label: "Rejected" },
];
const HEAD = { saved: "text-[#6B7280]", applied: "text-sky-600", assessment: "text-violet-600", interview: "text-[#FF6B00]", selected: "text-emerald-600", rejected: "text-red-500" };

export default function Applications() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["applications"], queryFn: () => api.get("/applications").then((r) => r.data) });
  const [dragId, setDragId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ company: "", role: "", status: "saved", deadline: "", notes: "" });

  const move = async (id, status) => {
    try { await api.put(`/applications/${id}`, { status }); qc.invalidateQueries({ queryKey: ["applications"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); }
    catch (e) { toast.error("Could not move."); }
  };
  const remove = async (id) => {
    try { await api.delete(`/applications/${id}`); qc.invalidateQueries({ queryKey: ["applications"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); toast.success("Deleted."); }
    catch (e) { toast.error("Could not delete."); }
  };
  const add = async () => {
    if (!form.company.trim() || !form.role.trim()) return toast.error("Company and role are required.");
    try {
      await api.post("/applications", { ...form, appliedDate: form.status !== "saved" ? new Date().toISOString().slice(0, 10) : null });
      qc.invalidateQueries({ queryKey: ["applications"] }); qc.invalidateQueries({ queryKey: ["dashboard"] });
      setShowAdd(false); setForm({ company: "", role: "", status: "saved", deadline: "", notes: "" });
      toast.success("Application added!");
    } catch (e) { toast.error("Could not add."); }
  };

  if (isLoading || !data) return <div className="text-[#6B7280]">Loading your tracker…</div>;
  const apps = data.applications;
  const byCol = (k) => apps.filter((a) => a.status === k);

  return (
    <div data-testid="applications-page">
      <PageHeader title="Application Tracker" icon={KanbanSquare} subtitle="Track every opportunity from saved to selected. Drag cards between stages."
        action={<button data-testid="add-application-btn" onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#FF6B00] text-white font-semibold hover:bg-[#e85f00] transition-colors"><Plus className="h-4 w-4" /> Add application</button>} />

      {/* stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat label="Applications" value={data.stats.total} />
        <Stat label="Interviews" value={data.stats.interviews} />
        <Stat label="Offers" value={data.stats.offers} />
        <Stat label="Response Rate" value={data.stats.responseRate} suffix="%" />
      </div>

      {/* kanban */}
      <div className="flex gap-4 overflow-x-auto sf-scroll pb-4">
        {COLUMNS.map((col) => (
          <div key={col.key} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragId) move(dragId, col.key); setDragId(null); }} className="w-72 shrink-0" data-testid={`column-${col.key}`}>
            <div className="flex items-center justify-between px-1 mb-2">
              <span className={`text-sm font-semibold ${HEAD[col.key]}`}>{col.label}</span>
              <span className="text-xs bg-white border border-gray-200 rounded-full px-2 py-0.5 text-[#6B7280]">{byCol(col.key).length}</span>
            </div>
            <div className="bg-[#F3F4F6] rounded-2xl p-2.5 min-h-[140px] space-y-2.5">
              {byCol(col.key).map((a) => (
                <motion.div key={a.id} layout draggable onDragStart={() => setDragId(a.id)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm cursor-grab active:cursor-grabbing" data-testid={`app-card-${a.id}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm leading-tight">{a.role}</p>
                      <p className="text-xs text-[#6B7280] inline-flex items-center gap-1 mt-0.5"><Building2 className="h-3 w-3" /> {a.company}</p>
                    </div>
                    <button data-testid={`delete-app-${a.id}`} onClick={() => remove(a.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  {a.deadline && <p className="text-[11px] text-[#9CA3AF] inline-flex items-center gap-1 mt-2"><CalendarClock className="h-3 w-3" /> Due {a.deadline}</p>}
                  {a.notes && <p className="text-[11px] text-[#6B7280] mt-1.5 bg-[#F8FAFC] rounded-md px-2 py-1">{a.notes}</p>}
                  <select value={a.status} onChange={(e) => move(a.id, e.target.value)} className="mt-2 w-full h-8 text-xs px-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]" data-testid={`app-status-${a.id}`}>
                    {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </motion.div>
              ))}
              {byCol(col.key).length === 0 && <p className="text-xs text-[#9CA3AF] text-center py-4">Drop here</p>}
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="add-app-modal">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAdd(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold font-heading text-lg">Add application</h3>
              <button onClick={() => setShowAdd(false)}><X className="h-5 w-5 text-[#6B7280]" /></button>
            </div>
            <div className="space-y-3">
              <ModalInput label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} testId="app-company" />
              <ModalInput label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} testId="app-role" />
              <div className="grid grid-cols-2 gap-3">
                <label className="block"><span className="text-xs font-medium text-[#6B7280]">Stage</span>
                  <select data-testid="app-stage" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full h-11 px-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]">
                    {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </label>
                <ModalInput label="Deadline" type="date" value={form.deadline} onChange={(v) => setForm({ ...form, deadline: v })} testId="app-deadline" />
              </div>
              <ModalInput label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} testId="app-notes" />
            </div>
            <button data-testid="save-app-btn" onClick={add} className="mt-5 w-full h-11 rounded-xl bg-[#FF6B00] text-white font-semibold hover:bg-[#e85f00] transition-colors">Add to tracker</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, suffix = "" }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <p className="text-2xl font-bold font-heading"><CountUp value={value} />{suffix}</p>
      <p className="text-sm text-[#6B7280]">{label}</p>
    </div>
  );
}

function ModalInput({ label, value, onChange, type = "text", testId }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-[#6B7280]">{label}</span>
      <input data-testid={testId} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full h-11 px-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
    </label>
  );
}
