import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";
import AuthShell from "@/pages/AuthShell";
import GoogleButton from "@/components/GoogleButton";
import { useAuth, formatApiError } from "@/context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("arjun@skillflow.com");
  const [password, setPassword] = useState("skillflow123");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success("Welcome back!");
      navigate(u.onboarded ? "/app/dashboard" : "/onboarding");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue your skill journey."
      footer={<>Don't have an account? <Link to="/register" className="text-[#FF6B00] font-semibold" data-testid="go-register-link">Sign up</Link></>}
    >
      <form onSubmit={submit} className="space-y-4" data-testid="login-form">
        <Field icon={Mail} type="email" placeholder="Email" value={email} onChange={setEmail} testId="login-email" />
        <Field icon={Lock} type="password" placeholder="Password" value={password} onChange={setPassword} testId="login-password" />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-[#FF6B00] font-medium" data-testid="forgot-link">Forgot password?</Link>
        </div>
        <button data-testid="login-submit" disabled={loading} className="w-full h-12 rounded-xl bg-[#FF6B00] text-white font-semibold hover:bg-[#e85f00] transition-colors disabled:opacity-60">
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
      <Divider />
      <GoogleButton label="Continue with Google" />
      <p className="mt-4 text-xs text-[#6B7280] bg-orange-50 border border-orange-100 rounded-lg p-3">
        Demo account is pre-filled — just click <b>Log in</b> to explore Arjun's Skill Flow.
      </p>
    </AuthShell>
  );
}

export function Field({ icon: Icon, testId, onChange, ...props }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[#6B7280]" style={{ width: 18, height: 18 }} />}
      <input
        {...props}
        data-testid={testId}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-12 ${Icon ? "pl-11" : "pl-4"} pr-4 rounded-xl bg-white border border-gray-200 text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent`}
      />
    </div>
  );
}

export function Divider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-[#9CA3AF]">OR</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}
