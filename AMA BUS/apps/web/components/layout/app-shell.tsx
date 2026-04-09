"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { classNames } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function AppShell({
  title,
  eyebrow,
  description,
  navItems,
  children
}: {
  title: string;
  eyebrow: string;
  description: string;
  navItems: Array<{ href: string; label: string }>;
  children: ReactNode;
}) {
  return (
    <div className="transport-grid min-h-screen bg-city-grid px-4 py-5 sm:px-6 lg:px-10 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none -z-10" />
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex max-w-7xl flex-col gap-6"
      >
        <header className="glass-panel rounded-[2rem] px-5 py-4 shadow-glass transition-all hover:shadow-panel">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="badge bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-200">
                <span className="pulse-dot" />
                {eyebrow}
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
                <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">{description}</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
          <nav className="mt-5 flex flex-wrap gap-2">
            {navItems.map((item, i) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
              >
                <Link
                  href={item.href}
                  className={classNames(
                    "inline-block rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300",
                    "border-slate-300/60 bg-white/70 text-slate-700 hover:border-primary hover:text-primary hover:shadow-glow hover:-translate-y-0.5",
                    "dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-primary dark:hover:text-primary"
                  )}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </nav>
        </header>
        <AnimatePresence mode="wait">
          <motion.main
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
