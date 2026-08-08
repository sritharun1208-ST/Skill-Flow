import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Lock, ArrowLeft } from "lucide-react";
import AuthShell from "@/pages/AuthShell";
import { Field } from "@/pages/Login";
import { api, formatApiError } from "@/lib/apiClient";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (password !== confirm) return toast.error("Passwords don't match.");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
      toast.success("Password updated! You can log in now.");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password for your Skill Flow account."
      footer={<Link to="/login" className="inline-flex items-center gap-1.5 text-[#FF6B00] font-semibold" data-testid="reset-back-login"><ArrowLeft className="h-4 w-4" /> Back to login</Link>}
    >
      {!token ? (
        <div className="rounded-xl bg-red-50 border border-red-200 p-5 text-red-700 text-sm" data-testid="reset-no-token">
          This reset link is missing its token. Please request a new link from the <Link to="/forgot-password" className="underline font-semibold">Forgot password</Link> page.
        </div>
      ) : done ? (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 text-emerald-800 text-sm" data-testid="reset-success">
          Your password has been reset. Redirecting you to login…
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" data-testid="reset-form">
          <Field icon={Lock} type="password" placeholder="New password" value={password} onChange={setPassword} testId="reset-password" />
          <Field icon={Lock} type="password" placeholder="Confirm new password" value={confirm} onChange={setConfirm} testId="reset-confirm" />
          <button data-testid="reset-submit" disabled={loading} className="w-full h-12 rounded-xl bg-[#FF6B00] text-white font-semibold hover:bg-[#e85f00] transition-colors disabled:opacity-60">
            {loading ? "Updating…" : "Reset password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
