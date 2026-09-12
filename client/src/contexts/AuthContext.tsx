import { type ReactNode, createContext, useContext, useState } from "react";

import type { UserType } from "../types/userType";

type Auth = {
  user: UserType;
  token: string;
};

type AuthContextType = {
  auth: Auth | null;
  setAuth: (auth: Auth | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [auth, setAuth] = useState<Auth | null>(() => {
    const savedAuth = localStorage.getItem("auth");

    return savedAuth ? JSON.parse(savedAuth) : null;
  });

  const logout = () => {
    /* =====================================================
       DÉCONNEXION VOLONTAIRE

       Permet aux guards de distinguer :
       - une vraie absence de session
       - une déconnexion volontaire
    ====================================================== */

    sessionStorage.setItem("manualLogout", "true");

    /* =====================================================
       NETTOYAGE AUTHENTIFICATION
    ====================================================== */

    localStorage.removeItem("token");
    localStorage.removeItem("auth");

    setAuth(null);

    /* =====================================================
       NETTOYAGE DU FLAG DE DÉCONNEXION VOLONTAIRE

       On laisse le temps aux pages protégées de détecter
       qu'il s'agit d'une déconnexion volontaire.
    ====================================================== */

    window.setTimeout(() => {
      sessionStorage.removeItem("manualLogout");
    }, 1000);
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        logout,
      }}
    >
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
