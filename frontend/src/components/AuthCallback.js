import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { useAuth, formatApiError } from "@/context/AuthContext";

export default function AuthCallback() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const processed = useRef(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const hash = window.location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    const sessionId = match ? decodeURIComponent(match[1]) : null;
    // clear the fragment so it isn't reused
    window.history.replaceState(null, "", window.location.pathname);
    if (!sessionId) {
      navigate("/login", { replace: true });
      return;
    }
    (async () => {
      try {
        const user = await loginWithGoogle(sessionId);
        toast.success("Signed in with Google!");
        navigate(user.onboarded ? "/app/dashboard" : "/onboarding", { replace: true });
      } catch (e) {
        setError(formatApiError(e.response?.data?.detail) || "Google sign-in failed");
        setTimeout(() => navigate("/login", { replace: true }), 2500);
      }
    })();
  }, [loginWithGoogle, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] gap-6">
      <Logo size={40} />
      {error ? (
        <p className="text-red-600 text-sm">{error} — redirecting…</p>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-orange-200 border-t-[#FF6B00] animate-spin" />
          <p className="text-[#6B7280] text-sm">Signing you in…</p>
        </div>
      )}
    </div>
  );
}
