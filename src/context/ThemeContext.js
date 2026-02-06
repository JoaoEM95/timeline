import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({ theme: "default", setTheme: () => {} });

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem("theme") || "default";
    }
    return "default";
  });

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
