import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "../utils/theme";
import { ThemeType } from "../types";

const ThemeContext = createContext({
  toggleTheme: () => {},
  isDarkMode: false,
});

export const useTheme = () => useContext(ThemeContext);

const ThemeProvider: React.FC<{ children: React.ReactNode, theme?: ThemeType }> = ({
  children,
  theme
}) => {
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      return newMode;
    });
  };

  useEffect(() => {
    if(!theme) {
      const handleMediaChange = (event: MediaQueryListEvent) => {
        const theme = event.matches ? "dark" : "light";
        setIsDarkMode(theme == "dark");
      };
  
      if (window) {
        window
          .matchMedia("(prefers-color-scheme: dark)")
          .addEventListener("change", handleMediaChange);
  
        return () => {
          window
            .matchMedia("(prefers-color-scheme: dark)")
            .removeEventListener("change", handleMediaChange);
        };
      }
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ toggleTheme, isDarkMode }}>
      <StyledThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
