import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import MySkills from "@/pages/MySkills";
import SkillGap from "@/pages/SkillGap";
import LearningPath from "@/pages/LearningPath";
import Projects from "@/pages/Projects";
import Opportunities from "@/pages/Opportunities";
import Applications from "@/pages/Applications";
import CareerExplorer from "@/pages/CareerExplorer";
import Progress from "@/pages/Progress";
import Profile from "@/pages/Profile";

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="h-10 w-10 rounded-full border-4 border-orange-200 border-t-[#FF6B00] animate-spin" />
    </div>
  );
}

function Protected({ children, requireOnboarded = true }) {
  const { user, loading } = useAuth();
  if (loading || user === null) return <Loader />;
  if (user === false) return <Navigate to="/login" replace />;
  if (requireOnboarded && !user.onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading || user === null) return <Loader />;
  if (user && user.onboarded) return <Navigate to="/app/dashboard" replace />;
  if (user && !user.onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
            <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/onboarding" element={<Protected requireOnboarded={false}><Onboarding /></Protected>} />
            <Route path="/app" element={<Protected><Layout /></Protected>}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="skills" element={<MySkills />} />
              <Route path="skill-gap" element={<SkillGap />} />
              <Route path="learning-path" element={<LearningPath />} />
              <Route path="projects" element={<Projects />} />
              <Route path="opportunities" element={<Opportunities />} />
              <Route path="applications" element={<Applications />} />
              <Route path="careers" element={<CareerExplorer />} />
              <Route path="progress" element={<Progress />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </div>
  );
}

export default App;
