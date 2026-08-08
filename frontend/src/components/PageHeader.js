import React from "react";

export default function PageHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div className="flex items-start gap-3">
        {Icon && <div className="h-11 w-11 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center shrink-0"><Icon className="h-5 w-5" /></div>}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight">{title}</h1>
          {subtitle && <p className="text-[#6B7280] mt-1 text-sm md:text-base max-w-2xl">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
