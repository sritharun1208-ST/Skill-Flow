import React from "react";
import { motion } from "framer-motion";
import CountUp from "@/components/CountUp";

export default function CircularProgress({ value = 0, size = 180, stroke = 14, label = "Career Readiness", testId }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} data-testid={testId}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#FF6B00"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-bold font-heading text-[#111827]">
          <CountUp value={value} />%
        </span>
        <span className="text-xs text-[#6B7280] mt-1 max-w-[100px] leading-tight">{label}</span>
      </div>
    </div>
  );
}
