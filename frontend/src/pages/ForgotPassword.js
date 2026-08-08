import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";
import AuthShell from "@/pages/AuthShell";
import { Field } from "@/pages/Login";
import { api, formatApiError } from "@/lib/apiClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setResetToken(data.token || null);
      setSent(true);
      toast.success("If that email exists, a reset link has been sent.");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={<Link to="/login" className="inline-flex items-center gap-1.5 text-[#FF6B00] font-semibold" data-testid="back-to-login"><ArrowLeft className="h-4 w-4" /> Back to login</Link>}
    >
      {sent ? (
        <div data-testid="forgot-success" className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 text-emerald-800 text-sm space-y-3">
          <p>Check your inbox! If an account exists for <b>{email}</b>, a password reset link is on its way.</p>
          {resetToken && (
            <p className="text-emerald-900">
              Demo mode: <Link to={`/reset-password?token=${resetToken}`} data-testid="demo-reset-link" className="underline font-semibold">open your reset page →</Link>
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" data-testid="forgot-form">
          <Field icon={Mail} type="email" placeholder="Email" value={email} onChange={setEmail} testId="forgot-email" />
          <button data-testid="forgot-submit" disabled={loading} className="w-full h-12 rounded-xl bg-[#FF6B00] text-white font-semibold hover:bg-[#e85f00] transition-colors disabled:opacity-60">
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
