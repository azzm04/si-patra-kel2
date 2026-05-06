"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8 opacity-0"></div>;
  }

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 dark:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
      title="Toggle theme"
    >
      {theme === "light" ? (
        <Sun className="w-4 h-4" />
      ) : theme === "dark" ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Monitor className="w-4 h-4" />
      )}
    </button>
  );
}
