"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("amaride.theme", next ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full border border-slate-300/60 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:scale-[1.02] dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
    >
      {isDark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
