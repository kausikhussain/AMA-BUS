"use client";

import { useEffect, useRef, useState } from "react";
import type { AuthSession, BusRoute, DriverTripSnapshot } from "@amaride/shared";
import { api } from "../../lib/api";
import { getSession, saveSession } from "../../lib/session";
import { AppShell } from "../../components/layout/app-shell";
import { SectionCard } from "../../components/ui/section-card";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Play, Square, Pause, CirclePlay } from "lucide-react";

export default function DriverPage() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [currentTrip, setCurrentTrip] = useState<DriverTripSnapshot | null>(null);
  const [tracking, setTracking] = useState(false);
  const [lastPing, setLastPing] = useState<Record<string, unknown> | null>(null);
  const pointRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      const loadedRoutes = await api.routes();
      setRoutes(loadedRoutes);
      setSelectedRouteId(loadedRoutes[0]?.id ?? "");
      setSession(getSession());
    };

    void load();
  }, []);

  useEffect(() => {
    const syncTrip = async () => {
      if (!session) {
        return;
      }

      const trip = (await api.currentDriverTrip(session)) as DriverTripSnapshot | null;
      setCurrentTrip(trip);
    };

    void syncTrip();
  }, [session]);

  useEffect(() => {
    if (!tracking || !session || !currentTrip) {
      return;
    }

    const route = routes.find((item) => item.id === currentTrip.routeId);

    if (!route) {
      return;
    }

    const interval = window.setInterval(async () => {
      const point = route.path[pointRef.current % route.path.length];
      pointRef.current += 1;

      const response = await api.updateDriverLocation(
        {
          tripId: currentTrip.tripId,
          latitude: point[1],
          longitude: point[0],
          occupancy: 18 + (pointRef.current % 14)
        },
        session
      );

      setLastPing(response as unknown as Record<string, unknown>);
    }, 3000);

    return () => {
      window.clearInterval(interval);
    };
  }, [currentTrip, routes, session, tracking]);

  const quickDriverLogin = async () => {
    const driverSession = await api.login({
      email: "driver1@amaride.in",
      password: "Password@123"
    });
    saveSession(driverSession);
    setSession(driverSession);
  };

  const startTrip = async () => {
    if (!session) return;
    try {
      const trip = (await api.startTrip(selectedRouteId, session)) as DriverTripSnapshot;
      setCurrentTrip(trip);
      setTracking(true);
      toast.success("Trip Started! Location broadcasting is active.");
    } catch {
      toast.error("Could not start trip.");
    }
  };

  const updateStatus = async (status: "PAUSED" | "COMPLETED" | "ACTIVE") => {
    if (!session || !currentTrip) return;
    try {
      await api.updateTripStatus({ tripId: currentTrip.tripId, status }, session);
      setTracking(status === "ACTIVE");

      if (status === "COMPLETED") {
        setCurrentTrip(null);
        pointRef.current = 0;
        toast.info("Trip ended successfully.");
      } else if (status === "PAUSED") {
        toast.warning("Trip paused.");
      } else {
        toast.success("Trip resumed.");
      }
    } catch {
      toast.error("Status update failed.");
    }
  };

  return (
    <AppShell
      eyebrow="Driver Operations"
      title="AmaRide Driver Desk"
      description="Authenticate as a driver, launch a route, and broadcast location updates on a 3-second interval."
      navItems={[
        { href: "/", label: "Home" },
        { href: "/driver", label: "Driver" },
        { href: "/live", label: "Fleet Map" },
        { href: "/admin", label: "Admin" }
      ]}
    >
      <div className="grid gap-4 xl:grid-cols-[0.8fr,1.2fr]">
        <SectionCard title="Driver controls" description="Use the seeded driver credentials or your own admin-created driver account.">
          {!session ? (
            <button
              type="button"
              onClick={quickDriverLogin}
              className="rounded-full bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Quick Login Driver Demo
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <label className="space-y-2 text-sm font-medium">
                Route assignment
                <select
                  value={selectedRouteId}
                  onChange={(event) => setSelectedRouteId(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80"
                >
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.busNumber} • {route.routeName}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {!currentTrip ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={startTrip}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-6 text-sm font-semibold text-primary-foreground shadow-glow h-32 sm:col-span-3 transition-colors hover:bg-primary/90"
                  >
                    <CirclePlay size={36} strokeWidth={1.5} />
                    Start Trip Broadcast
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => updateStatus(tracking ? "PAUSED" : "ACTIVE")}
                      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border px-4 py-4 text-sm font-semibold transition-colors h-24 sm:col-span-2 ${tracking ? 'border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'border-primary/50 bg-primary/10 text-primary dark:text-primary'}`}
                    >
                      {tracking ? <Pause size={24} /> : <Play size={24} />}
                      {tracking ? "Pause Broadcast" : "Resume Broadcast"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => updateStatus("COMPLETED")}
                      className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-4 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors h-24 sm:col-span-1"
                    >
                      <Square size={24} />
                      End Trip
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </SectionCard>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          <SectionCard title="Current trip" description="Active driver trip state mirrored from the backend.">
            <AnimatePresence mode="popLayout">
              {currentTrip ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="grid gap-3 md:grid-cols-2"
                >
                  <div className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-700 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      Route
                    </p>
                    <p className="mt-2 font-display text-2xl font-semibold">{currentTrip.routeName}</p>
                    <p className="text-sm text-primary font-medium">{currentTrip.busNumber}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-700 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
                    {tracking && <div className="absolute top-4 right-4"><span className="pulse-dot block" /></div>}
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      Fleet
                    </p>
                    <p className="mt-2 font-display text-2xl font-semibold">{currentTrip.fleetCode}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Occupancy {currentTrip.occupancy}</p>
                  </div>
                </motion.div>
              ) : (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-slate-600 dark:text-slate-300">
                  No active trip yet. Select a route and start the broadcast.
                </motion.p>
              )}
            </AnimatePresence>
          </SectionCard>

          <SectionCard title="Latest location payload" description="Each interval simulates GPS transmission into the backend and socket layer.">
            <pre className="overflow-x-auto rounded-[1.5rem] bg-slate-950/90 p-4 text-xs text-slate-100 min-h-[140px] flex items-center shadow-inner">
              {lastPing ? JSON.stringify(lastPing, null, 2) : <span className="opacity-50 italic">Awaiting first broadcast tick...</span>}
            </pre>
          </SectionCard>
        </motion.div>
      </div>
    </AppShell>
  );
}
