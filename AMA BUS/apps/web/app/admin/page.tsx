"use client";

import { useEffect, useMemo, useState } from "react";
import type { AuthSession, BusRoute, BusStop, DashboardStats, LiveBus } from "@amaride/shared";
import { api } from "../../lib/api";
import { getSession, saveSession } from "../../lib/session";
import { AppShell } from "../../components/layout/app-shell";
import { TransportMap } from "../../components/maps/transport-map";
import { SectionCard } from "../../components/ui/section-card";
import { StatCard } from "../../components/ui/stat-card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminPage() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [stops, setStops] = useState<BusStop[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [liveBuses, setLiveBuses] = useState<LiveBus[]>([]);
  const [driverForm, setDriverForm] = useState({
    name: "",
    email: "",
    password: "Password@123",
    phone: ""
  });
  const [stopForm, setStopForm] = useState({
    name: "",
    latitude: "20.3100",
    longitude: "85.8200"
  });
  const [routeForm, setRouteForm] = useState({
    routeName: "Tech Corridor",
    busNumber: "AR-88",
    color: "#0f766e",
    baseFare: "20",
    distanceKm: "14"
  });
  const [selectedStopIds, setSelectedStopIds] = useState<string[]>([]);

  const routePath = useMemo(
    () =>
      selectedStopIds
        .map((stopId) => stops.find((stop) => stop.id === stopId))
        .filter(Boolean)
        .map((stop) => [stop!.longitude, stop!.latitude] as [number, number]),
    [selectedStopIds, stops]
  );

  const refresh = async (activeSession: AuthSession) => {
    const [statsResponse, routesResponse, stopsResponse, driversResponse, logsResponse, busesResponse] =
      await Promise.all([
        api.adminStats(activeSession),
        api.adminRoutes(activeSession),
        api.adminStops(activeSession),
        api.adminDrivers(activeSession),
        api.adminLogs(activeSession),
        api.liveBuses()
      ]);

    setStats(statsResponse);
    setRoutes(routesResponse);
    setStops(stopsResponse);
    setDrivers(driversResponse as any[]);
    setLogs(logsResponse as any[]);
    setLiveBuses(busesResponse);
  };

  useEffect(() => {
    const existingSession = getSession();
    setSession(existingSession);

    if (existingSession?.user.role === "ADMIN") {
      void refresh(existingSession);
    }
  }, []);

  const quickAdminLogin = async () => {
    const adminSession = await api.login({
      email: "admin@amaride.in",
      password: "Password@123"
    });
    saveSession(adminSession);
    setSession(adminSession);
    await refresh(adminSession);
  };

  const createDriver = async () => {
    if (!session) return;
    try {
      await api.createDriver(driverForm, session);
      toast.success("Driver created successfully.");
      await refresh(session);
    } catch {
      toast.error("Failed to create driver.");
    }
  };

  const createStop = async () => {
    if (!session) return;
    try {
      await api.createStop({ name: stopForm.name, latitude: Number(stopForm.latitude), longitude: Number(stopForm.longitude) }, session);
      toast.success("Stop created successfully.");
      await refresh(session);
    } catch {
      toast.error("Failed to create stop.");
    }
  };

  const createRoute = async () => {
    if (!session || selectedStopIds.length < 2) {
      toast.error("Pick at least two stops for a route.");
      return;
    }
    try {
      await api.createRoute({
        routeName: routeForm.routeName,
        busNumber: routeForm.busNumber,
        color: routeForm.color,
        baseFare: Number(routeForm.baseFare),
        distanceKm: Number(routeForm.distanceKm),
        stopIds: selectedStopIds,
        path: routePath
      }, session);
      toast.success("Route created successfully.");
      await refresh(session);
    } catch {
      toast.error("Failed to create route.");
    }
  };

  const deleteRoute = async (routeId: string) => {
    if (!session) return;
    try {
      await api.deleteRoute(routeId, session);
      toast.success("Route removed.");
      await refresh(session);
    } catch {
      toast.error("Failed to remove route.");
    }
  };
  
  const mockChartData = [
    { time: '06:00', passengers: 120, revenue: 2400 },
    { time: '09:00', passengers: 450, revenue: 9000 },
    { time: '12:00', passengers: 310, revenue: 6200 },
    { time: '15:00', passengers: 380, revenue: 7600 },
    { time: '18:00', passengers: 520, revenue: 10400 },
    { time: '21:00', passengers: 150, revenue: 3000 },
  ];

  return (
    <AppShell
      eyebrow="Admin Control Center"
      title="AmaRide Admin Dashboard"
      description="Operate routes, monitor the active fleet, onboard drivers, and inspect system revenue and logs."
      navItems={[
        { href: "/", label: "Home" },
        { href: "/live", label: "Live Map" },
        { href: "/driver", label: "Driver" },
        { href: "/admin", label: "Admin" }
      ]}
    >
      {!session || session.user.role !== "ADMIN" ? (
        <SectionCard title="Authenticate admin" description="Use the seeded admin account to unlock management tooling.">
          <button
            type="button"
            onClick={quickAdminLogin}
            className="rounded-full bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Quick Login Admin Demo
          </button>
        </SectionCard>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {stats ? (
            <>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Active Buses" value={String(stats.activeBuses)} hint="Currently broadcasting on the network." />
                <StatCard label="Revenue Today" value={`INR ${stats.revenueToday}`} hint="Ticket sales accumulated since midnight." />
                <StatCard label="Tickets Today" value={String(stats.ticketsToday)} hint="Useful for commuter throughput estimation." />
                <StatCard label="Avg Occupancy" value={`${stats.occupancyAverage}%`} hint="Live capacity utilization snapshot." />
              </section>
              
              <SectionCard title="Ridership Trends" description="Hourly volume and revenue visualization.">
                <div className="h-72 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)/0.3)" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: '1px solid hsl(var(--muted))', backgroundColor: 'hsla(var(--card), 0.9)', backdropFilter: 'blur(8px)' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Area type="monotone" dataKey="passengers" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorPv)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            </>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-[1fr,1fr]">
            <SectionCard title="Live operations" description="Realtime active fleet overview for dispatch supervision.">
              <TransportMap routes={routes} stops={stops} liveBuses={liveBuses} />
            </SectionCard>

            <SectionCard title="Route management" description="Create a new corridor and remove stale ones.">
              <div className="space-y-3">
                <input
                  value={routeForm.routeName}
                  onChange={(event) => setRouteForm((current) => ({ ...current, routeName: event.target.value }))}
                  placeholder="Route name"
                  className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={routeForm.busNumber}
                    onChange={(event) => setRouteForm((current) => ({ ...current, busNumber: event.target.value }))}
                    placeholder="Bus number"
                    className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80"
                  />
                  <input
                    value={routeForm.color}
                    onChange={(event) => setRouteForm((current) => ({ ...current, color: event.target.value }))}
                    placeholder="#0f766e"
                    className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80"
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={routeForm.baseFare}
                    onChange={(event) => setRouteForm((current) => ({ ...current, baseFare: event.target.value }))}
                    placeholder="Base fare"
                    className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80"
                  />
                  <input
                    value={routeForm.distanceKm}
                    onChange={(event) => setRouteForm((current) => ({ ...current, distanceKm: event.target.value }))}
                    placeholder="Distance"
                    className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80"
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {stops.map((stop) => (
                    <label key={stop.id} className="flex items-center gap-2 rounded-2xl border border-slate-200/80 px-3 py-2 text-sm dark:border-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedStopIds.includes(stop.id)}
                        onChange={(event) =>
                          setSelectedStopIds((current) =>
                            event.target.checked ? [...current, stop.id] : current.filter((value) => value !== stop.id)
                          )
                        }
                      />
                      {stop.name}
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={createRoute}
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-teal-500 dark:text-slate-950"
                >
                  Create Route
                </button>
                <div className="space-y-3">
                  {routes.map((route) => (
                    <div key={route.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 p-3 dark:border-slate-700">
                      <div>
                        <p className="font-semibold">{route.busNumber}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{route.routeName}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteRoute(route.id)}
                        className="rounded-full bg-orange-500 px-3 py-2 text-xs font-semibold text-slate-950"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.95fr,1.05fr]">
            <SectionCard title="Stop management" description="Add stops that can then be assigned to new routes.">
              <div className="space-y-3">
                <input
                  value={stopForm.name}
                  onChange={(event) => setStopForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Stop name"
                  className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={stopForm.latitude}
                    onChange={(event) => setStopForm((current) => ({ ...current, latitude: event.target.value }))}
                    placeholder="Latitude"
                    className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80"
                  />
                  <input
                    value={stopForm.longitude}
                    onChange={(event) => setStopForm((current) => ({ ...current, longitude: event.target.value }))}
                    placeholder="Longitude"
                    className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80"
                  />
                </div>
                <button
                  type="button"
                  onClick={createStop}
                  className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-slate-950"
                >
                  Add Stop
                </button>
              </div>
            </SectionCard>

            <SectionCard title="Driver management" description="Create new drivers and inspect assigned inventory.">
              <div className="space-y-3">
                <input
                  value={driverForm.name}
                  onChange={(event) => setDriverForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Driver name"
                  className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80"
                />
                <input
                  value={driverForm.email}
                  onChange={(event) => setDriverForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="Driver email"
                  className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80"
                />
                <button
                  type="button"
                  onClick={createDriver}
                  className="rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white"
                >
                  Create Driver
                </button>
                <div className="space-y-3">
                  {drivers.map((driver) => (
                    <div key={driver.id} className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-700">
                      <p className="font-semibold">{driver.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{driver.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          </div>

          <SectionCard title="System logs" description="Recent audit trail from core backend actions.">
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-700">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{log.action}</p>
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      {log.level}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{log.message}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </motion.div>
      )}
    </AppShell>
  );
}
