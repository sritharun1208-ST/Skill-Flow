import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";

const IMG = "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#F8FAFC]">
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-10">
        <div className="w-full max-w-md mx-auto">
          <Link to="/" data-testid="auth-logo-link"><Logo /></Link>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-10">
            <h1 className="text-3xl font-bold font-heading tracking-tight text-[#111827]">{title}</h1>
            <p className="text-[#6B7280] mt-2 text-sm">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-6 text-sm text-[#6B7280]">{footer}</div>}
          </motion.div>
        </div>
      </div>
      <div className="hidden lg:block relative overflow-hidden">
        <img src={IMG} alt="Student learning" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(255,107,0,0.85),rgba(17,24,39,0.75))" }} />
        <div className="relative h-full flex flex-col justify-end p-12 text-white">
          <h2 className="text-4xl font-bold font-heading tracking-tight leading-tight">Turn Your Skills Into Your Career.</h2>
          <p className="mt-4 text-white/85 max-w-md">Know where you are. Discover where you want to go. Find the skills you're missing. Build them. Prove them. Get opportunities.</p>
        </div>
      </div>
    </div>
  );
}
