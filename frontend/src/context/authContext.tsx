import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import client from "../api/client";

interface AuthContextType {
  token: string | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const login = async (email: string, password: string) => {
    const res = await client.post("/api/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
  };

  const register = async (email: string, password: string) => {
    const res = await client.post("/api/auth/register", { email, password });
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, isLoggedIn: !!token, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};