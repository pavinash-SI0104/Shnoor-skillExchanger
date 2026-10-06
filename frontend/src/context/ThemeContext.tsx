import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

interface ThemeContextType {
  theme: "dark";
}

const ThemeContext = createContext<
  ThemeContextType | undefined
>(undefined);

document.documentElement.setAttribute(
  "data-theme",
  "dark"
);

localStorage.removeItem("theme");

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ThemeContext.Provider
      value={{
        theme: "dark",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}
