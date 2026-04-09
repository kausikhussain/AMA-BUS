"use client";

import Link from "next/link";
import { demoLiveBuses, demoRoutes } from "@amaride/shared";
import { AppShell } from "../../components/layout/app-shell";
import { SectionCard } from "../../components/ui/section-card";
import { StatCard } from "../../components/ui/stat-card";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <AppShell
      eyebrow="Odisha Mobility Clone"
      title="AmaRide"
      description="A production-style public transport platform for route discovery, real-time bus visibility, QR tickets, driver operations, and admin control."
      navItems={[
        { href: "/search", label: "Search Route" },
        { href: "/live", label: "Live Map" },
        { href: "/tickets", label: "Buy Ticket" },
        { href: "/driver", label: "Driver Desk" },
        { href: "/admin", label: "Admin Panel" }
      ]}
    >
      <section className="grid gap-4 lg:grid-cols-[1.4fr,0.9fr]">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel rounded-[2rem] p-8 shadow-glass hover:shadow-panel transition-all relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
          <p className="max-w-xl text-sm uppercase tracking-[0.25em] text-primary dark:text-primary">
            Real-time public transport experience
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Build the full commuter loop from nearby stop to validated QR ticket.
          </h2>
          <p className="mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-300">
            AmaRide mirrors the essential experience of a modern city bus system with passenger discovery,
            live fleet telemetry, digital fare purchase, driver trip control, and administrator analytics.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 z-10 relative">
            <Link
              href="/search"
              className="rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:bg-primary/90 hover:scale-105 active:scale-95"
            >
              Start Planning
            </Link>
            <Link
              href="/profile"
              className="rounded-full border border-slate-300/70 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-signal hover:text-signal dark:border-slate-700 dark:text-slate-100 dark:hover:border-signal dark:hover:text-signal hover:scale-105 active:scale-95 bg-white/5 dark:bg-black/10 backdrop-blur-sm"
            >
              Sign In Passenger
            </Link>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="grid gap-4"
        >
          <StatCard label="Routes Seeded" value={String(demoRoutes.length)} hint="Sample Odisha corridors are ready for local demos." />
          <StatCard label="Live Buses" value={String(demoLiveBuses.length)} hint="Realtime sockets keep both passenger and admin views fresh." />
          <StatCard label="Roles Supported" value="3" hint="Passenger, driver, and admin flows ship in one shared codebase." />
        </motion.div>
      </section>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid gap-4 lg:grid-cols-3 mt-4"
      >
        <SectionCard title="Passenger Flow" description="Route planner, nearby stops, live buses, ETA, payments, and QR wallet.">
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> GPS-assisted nearby stop lookup within 500m</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Journey planner with direct and transfer-aware routing</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Digital ticket purchase with Stripe-test-compatible simulation</li>
          </ul>
        </SectionCard>
        <SectionCard title="Driver Flow" description="Trip control with recurring location broadcast every three seconds.">
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Driver login and route-specific trip startup</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Live occupancy and status updates over HTTP and sockets</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Pause and end controls for active operations</li>
          </ul>
        </SectionCard>
        <SectionCard title="Admin Flow" description="Route, stop, and driver management with analytics and logs.">
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Revenue metrics, active buses, and occupancy snapshots</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> CRUD-ready backend for routes and stops</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Live fleet supervision and audit trails</li>
          </ul>
        </SectionCard>
      </motion.section>
    </AppShell>
  );
}
