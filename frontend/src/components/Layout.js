import React, { useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Target, GitCompareArrows, Route, FolderGit2, Briefcase,
  KanbanSquare, Compass, TrendingUp, User, LogOut, Menu, X, Zap,
} from "lucide-react";
import Logo from "@/components/Logo";
import AIAssistant from "@/components/AIAssistant";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/skills", label: "My Skills", icon: Zap },
  { to: "/app/skill-gap", label: "Skill Gap", icon: GitCompareArrows },
  { to: "/app/learning-path", label: "Learning Path", icon: Route },
  { to: "/app/projects", label: "Projects", icon: FolderGit2 },
  { to: "/app/opportunities", label: "Opportunities", icon: Briefcase },
  { to: "/app/applications", label: "Applications", icon: KanbanSquare },
  { to: "/app/careers", label: "Career Explorer", icon: Compass },
  { to: "/app/progress", label: "My Progress", icon: TrendingUp },
  { to: "/app/profile", label: "Profile", icon: User },
];

const BOTTOM = [NAV[0], NAV[2], NAV[3], NAV[5], NAV[9]];

function NavItem({ item, onClick }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isActive ? "bg-[#FF6B00] text-white shadow-sm shadow-orange-500/20" : "text-[#6B7280] hover:bg-orange-50 hover:text-[#FF6B00]"
        }`
      }
    >
      <Icon className="h-[18px] w-[18px]" />
      {item.label}
    </NavLink>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const name = user?.profile?.name || user?.name || "Student";

  const doLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-gray-200 bg-white z-30">
        <div className="px-5 py-5 border-b border-gray-100">
          <Logo />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto sf-scroll">
          {NAV.map((item) => <NavItem key={item.to} item={item} />)}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button data-testid="logout-btn" onClick={doLogout} className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut className="h-[18px] w-[18px]" /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <Logo size={30} />
        <button data-testid="mobile-menu-btn" onClick={() => setMobileOpen(true)} className="h-9 w-9 rounded-lg flex items-center justify-center text-[#111827]">
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/40" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="absolute inset-y-0 left-0 w-72 bg-white flex flex-col">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <Logo />
                <button onClick={() => setMobileOpen(false)}><X className="h-5 w-5 text-[#6B7280]" /></button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {NAV.map((item) => <NavItem key={item.to} item={item} onClick={() => setMobileOpen(false)} />)}
              </nav>
              <div className="p-3 border-t border-gray-100">
                <button onClick={doLogout} className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600">
                  <LogOut className="h-[18px] w-[18px]" /> Log out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="md:pl-64 pb-24 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-gray-200 flex justify-around py-2">
        {BOTTOM.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium ${isActive ? "text-[#FF6B00]" : "text-[#6B7280]"}`}>
              <Icon className="h-5 w-5" />
              {item.label.split(" ")[0]}
            </NavLink>
          );
        })}
      </nav>

      <AIAssistant />
    </div>
  );
}
