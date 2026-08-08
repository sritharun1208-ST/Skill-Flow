import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Mail, Lock, User } from "lucide-react";
import AuthShell from "@/pages/AuthShell";
import { Field, Divider } from "@/pages/Login";
import GoogleButton from "@/components/GoogleButton";
import { useAuth, formatApiError } from "@/context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Account created! Let's set up your profile.");
      navigate("/onboarding");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Start your skill journey"
      subtitle="Create your free account and build your Career GPS."
      footer={<>Already have an account? <Link to="/login" className="text-[#FF6B00] font-semibold" data-testid="go-login-link">Log in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4" data-testid="register-form">
        <Field icon={User} placeholder="Full name" value={name} onChange={setName} testId="register-name" />
        <Field icon={Mail} type="email" placeholder="Email" value={email} onChange={setEmail} testId="register-email" />
        <Field icon={Lock} type="password" placeholder="Password (min 6 chars)" value={password} onChange={setPassword} testId="register-password" />
        <button data-testid="register-submit" disabled={loading} className="w-full h-12 rounded-xl bg-[#FF6B00] text-white font-semibold hover:bg-[#e85f00] transition-colors disabled:opacity-60">
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
      <Divider />
      <GoogleButton label="Sign up with Google" />
    </AuthShell>
  );
}
