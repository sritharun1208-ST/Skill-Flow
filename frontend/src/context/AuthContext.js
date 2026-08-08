import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, formatApiError, setToken, clearToken } from "@/lib/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = logged out, object = user
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
      return data;
    } catch (e) {
      setUser(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash && window.location.hash.includes("session_id=")) {
      // Returning from Google OAuth — let AuthCallback exchange the session first.
      setLoading(false);
      return;
    }
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.token) setToken(data.token);
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    if (data.token) setToken(data.token);
    setUser(data);
    return data;
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch (e) {}
    clearToken();
    setUser(false);
  };

  const loginWithGoogle = async (session_id) => {
    const { data } = await api.post("/auth/google", { session_id });
    if (data.token) setToken(data.token);
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, loginWithGoogle, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export { formatApiError };
