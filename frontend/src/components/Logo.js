import React from "react";

export default function Logo({ size = 34, showText = true, textClass = "text-[#111827]" }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className="relative flex items-center justify-center rounded-xl shadow-sm"
        style={{ width: size, height: size, background: "linear-gradient(135deg,#FF6B00,#FF8A3D)" }}
      >
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
          <path d="M4 18 L10 11 L14 15 L20 6" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="20" cy="6" r="2.3" fill="white" />
        </svg>
      </div>
      {showText && (
        <span className={`font-heading font-extrabold tracking-tight text-lg ${textClass}`}>
          Skill<span className="text-[#FF6B00]">Flow</span>
        </span>
      )}
    </div>
  );
}
