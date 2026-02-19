import { type ReactNode, createContext, useContext, useState } from "react";

type User = {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
};

type Auth = {
  user: User;
  token: string;
};

type AuthContextType = {
  auth: Auth | null;
  setAuth: (auth: Auth | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<Auth | null>(() => {
    const savedAuth = localStorage.getItem("auth");
    return savedAuth ? JSON.parse(savedAuth) : null;
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth");
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
