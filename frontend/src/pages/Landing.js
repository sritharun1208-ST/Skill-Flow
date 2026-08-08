import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Zap, Target, GitCompareArrows, Route, FolderGit2, Briefcase, Trophy,
  Sparkles, TrendingUp, ShieldCheck, CheckCircle2,
} from "lucide-react";
import Logo from "@/components/Logo";

const FLOW = [
  { label: "Your Skills", icon: Zap },
  { label: "Target Career", icon: Target },
  { label: "Skill Gap", icon: GitCompareArrows },
  { label: "Learning Path", icon: Route },
  { label: "Projects", icon: FolderGit2 },
  { label: "Opportunities", icon: Briefcase },
  { label: "Career", icon: Trophy },
];

const FEATURES = [
  { icon: GitCompareArrows, title: "AI Skill Gap Analysis", desc: "See exactly which skills you have, which to improve, and which are missing for your target role." },
  { icon: Route, title: "Personalized Learning Path", desc: "A step-by-step roadmap built from your gaps, goals and current level." },
  { icon: FolderGit2, title: "Project Recommendations", desc: "Build the right projects to prove your skills — not just collect certificates." },
  { icon: Briefcase, title: "Matched Opportunities", desc: "Internships, jobs and hackathons ranked by how well they match your profile." },
  { icon: TrendingUp, title: "Career Readiness Score", desc: "One clear number that grows as you learn, build and apply." },
  { icon: Sparkles, title: "Skill Flow AI Mentor", desc: "Ask anything — what to learn next, which project to build, are you ready to apply." },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827]">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link to="/login" data-testid="nav-login" className="text-sm font-medium text-[#111827] px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">Log in</Link>
            <Link to="/register" data-testid="nav-signup" className="text-sm font-semibold text-white bg-[#FF6B00] px-4 py-2 rounded-lg hover:bg-[#e85f00] transition-colors">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-12 grid lg:grid-cols-2 gap-12 items-center relative">
          <motion.div initial="hidden" animate="show" variants={container}>
            <motion.div variants={item} className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-[#FF6B00] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Sparkles className="h-3.5 w-3.5" /> Your Personal Career GPS
            </motion.div>
            <motion.h1 variants={item} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight leading-[1.05]">
              Turn Your Skills <br /> Into Your <span className="text-[#FF6B00]">Career.</span>
            </motion.h1>
            <motion.p variants={item} className="mt-6 text-base md:text-lg text-[#6B7280] max-w-xl">
              Know where you are. Discover where you want to go. Find the skills you're missing. Build them. Prove them. Get opportunities.
            </motion.p>
            <motion.div variants={item} className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/register" data-testid="hero-cta-primary" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#FF6B00] text-white font-semibold hover:bg-[#e85f00] transition-colors shadow-lg shadow-orange-500/25">
                Start Your Skill Journey <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how" data-testid="hero-cta-secondary" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white border border-gray-200 text-[#111827] font-semibold hover:bg-gray-50 transition-colors">
                Explore How It Works
              </a>
            </motion.div>
            <motion.div variants={item} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#6B7280]">
              {["Free to start", "No LinkedIn clone", "Built for students"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[#16A34A]" /> {t}</span>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero card */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-[#6B7280]">Career Readiness</p>
                  <p className="text-3xl font-bold font-heading">74%</p>
                </div>
                <div className="h-14 w-14 rounded-full flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,#FF6B00,#FF8A3D)" }}>
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              {[["Python", 75], ["SQL", 80], ["DSA", 35], ["Git", 45]].map(([s, v], i) => (
                <div key={s} className="mb-3">
                  <div className="flex justify-between text-xs mb-1"><span className="font-medium">{s}</span><span className="text-[#6B7280]">{v}%</span></div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <motion.div className="h-full rounded-full bg-[#FF6B00]" initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 1, delay: 0.4 + i * 0.15 }} />
                  </div>
                </div>
              ))}
              <div className="mt-4 flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5 text-sm">
                <ShieldCheck className="h-4 w-4 text-[#FF6B00]" /> <span className="text-[#111827]">Skill Gap detected: <b>DSA</b> — Critical</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Flow */}
      <section id="how" className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold font-heading tracking-tight">One intelligent workflow</h2>
          <p className="mt-3 text-[#6B7280]">Skill Flow connects everything from your current skills to your dream career.</p>
        </div>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={container} className="mt-12 flex flex-wrap items-stretch gap-3 md:gap-4">
          {FLOW.map((f, i) => {
            const Icon = f.icon;
            const last = i === FLOW.length - 1;
            return (
              <React.Fragment key={f.label}>
                <motion.div variants={item} className={`flex-1 min-w-[130px] rounded-2xl border p-5 flex flex-col items-start gap-3 ${last ? "bg-[#FF6B00] border-[#FF6B00] text-white" : "bg-white border-gray-200"}`}>
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${last ? "bg-white/20" : "bg-orange-50 text-[#FF6B00]"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-semibold font-heading text-sm">{f.label}</span>
                </motion.div>
                {!last && <div className="hidden md:flex items-center text-gray-300"><ArrowRight className="h-5 w-5" /></div>}
              </React.Fragment>
            );
          })}
        </motion.div>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading tracking-tight">Everything you need to get career-ready</h2>
            <p className="mt-3 text-[#6B7280]">Not another job board. A guided system that tells you exactly what to do next.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }} className="rounded-2xl border border-gray-200 p-6 bg-[#F8FAFC] hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                  <div className="h-11 w-11 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center mb-4"><Icon className="h-5 w-5" /></div>
                  <h3 className="font-semibold font-heading text-lg">{f.title}</h3>
                  <p className="mt-2 text-sm text-[#6B7280]">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg,#FF6B00,#FF8A3D)" }}>
          <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <h2 className="text-3xl md:text-4xl font-bold font-heading tracking-tight relative">Ready to build your future?</h2>
          <p className="mt-3 text-white/85 max-w-xl mx-auto relative">Join Skill Flow and turn your skills into your career — one clear step at a time.</p>
          <Link to="/register" data-testid="cta-bottom" className="mt-8 inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-white text-[#FF6B00] font-semibold hover:bg-orange-50 transition-colors relative">
            Start Your Skill Journey <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-sm text-[#6B7280]">Turn Your Skills Into Your Career. © 2026 Skill Flow.</p>
        </div>
      </footer>
    </div>
  );
}
