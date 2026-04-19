"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

// Menu ke andar ye button lagayein:
export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-full flex items-center px-4 py-3 text-sm text-text-main hover:bg-border-custom transition-colors"
    >
      {theme === "dark" ? (
        <><Sun className="mr-3 text-text-muted" size={18} /> Light Mode</>
      ) : (
        <><Moon className="mr-3 text-text-muted" size={18} /> Dark Mode</>
      )}
    </button>
  );
};