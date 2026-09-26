import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function Auth({ children }) {
  const [u, setU] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fb_user") || "null");
    } catch {
      return null;
    }
  });

  const login = (data) => {
    localStorage.setItem("fb_token", data.token);
    localStorage.setItem("fb_user", JSON.stringify(data.user));
    setU(data.user);
  };

  const updateUser = (user) => {
    localStorage.setItem("fb_user", JSON.stringify(user));
    setU(user);
  };

  const logout = () => {
    localStorage.removeItem("fb_token");
    localStorage.removeItem("fb_user");
    setU(null);
  };

  return (
    <AuthContext.Provider value={{ u, login, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);