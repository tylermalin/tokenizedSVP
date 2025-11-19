import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (
    email: string,
    password: string,
    role: string,
    invitationToken?: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token
    const token = localStorage.getItem("token");
    if (token) {
      // Verify token and get user
      // TODO: Implement token verification
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // TODO: Implement login API call
    const response = await api.post("/auth/login", { email, password });
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const register = async (
    email: string,
    password: string,
    role: string,
    invitationToken?: string
  ) => {
    const response = await api.post("/auth/register", {
      email,
      password,
      role,
      ...(invitationToken && { invitationToken }),
    });
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
