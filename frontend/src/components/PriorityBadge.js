import React from "react";

const MAP = {
  Critical: "bg-red-50 text-red-600 border-red-200",
  High: "bg-orange-50 text-[#FF6B00] border-orange-200",
  Medium: "bg-amber-50 text-amber-600 border-amber-200",
  Low: "bg-emerald-50 text-emerald-600 border-emerald-200",
  None: "bg-emerald-50 text-emerald-600 border-emerald-200",
};

export default function PriorityBadge({ priority, testId }) {
  const cls = MAP[priority] || "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span data-testid={testId} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {priority}
    </span>
  );
}
