"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import type { BusRoute, BusStop, JourneyPlan } from "@amaride/shared";
import { api } from "../../../lib/api";
import { SectionCard } from "../../../components/ui/section-card";
import { TransportMap } from "../../../components/maps/transport-map";

export default function SearchPage() {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [stops, setStops] = useState<BusStop[]>([]);
  const [nearbyStops, setNearbyStops] = useState<Array<BusStop & { distanceKm?: number }>>([]);
  const [originId, setOriginId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [routeFilter, setRouteFilter] = useState("");
  const [plan, setPlan] = useState<JourneyPlan | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const deferredFilter = useDeferredValue(routeFilter);

  useEffect(() => {
    const load = async () => {
      const [loadedRoutes, loadedStops] = await Promise.all([api.routes(), api.stops()]);
      setRoutes(loadedRoutes);
      setStops(loadedStops);
      setOriginId(loadedStops[0]?.id ?? "");
      setDestinationId(loadedStops[loadedStops.length - 1]?.id ?? "");
    };

    void load();
  }, []);

  const filteredRoutes = useMemo(
    () =>
      routes.filter((route) =>
        `${route.routeName} ${route.busNumber}`.toLowerCase().includes(deferredFilter.toLowerCase())
      ),
    [deferredFilter, routes]
  );

  const detectNearby = async () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });
          const nearby = await api.nearbyStops(coords.latitude, coords.longitude);
          setNearbyStops(nearby);
          setOriginId(nearby[0]?.id ?? originId);
        },
        async () => {
          const fallback = { latitude: 20.2709, longitude: 85.8406 };
          setUserLocation(fallback);
          const nearby = await api.nearbyStops(fallback.latitude, fallback.longitude);
          setNearbyStops(nearby);
          setOriginId(nearby[0]?.id ?? originId);
        }
      );
      return;
    }

    const fallback = { latitude: 20.2709, longitude: 85.8406 };
    setUserLocation(fallback);
    const nearby = await api.nearbyStops(fallback.latitude, fallback.longitude);
    setNearbyStops(nearby);
  };

  const planJourney = async () => {
    const origin = stops.find((stop) => stop.id === originId);
    const destination = stops.find((stop) => stop.id === destinationId);

    if (!origin || !destination) {
      return;
    }

    setError(null);
    setIsPlanning(true);

    try {
      const result = await api.routePlan(
        origin.latitude,
        origin.longitude,
        destination.latitude,
        destination.longitude
      );

      startTransition(() => {
        setPlan(result);
      });
    } catch (planningError) {
      setError(planningError instanceof Error ? planningError.message : "Unable to plan this trip.");
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[0.92fr,1.08fr]">
      <div className="space-y-4">
        <SectionCard
          title="Plan a route"
          description="Choose your boarding point and destination, then let the backend compute the best ride path."
        >
          <div className="space-y-4">
            <button
              type="button"
              onClick={detectNearby}
              className="rounded-full bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Detect Nearby Stops
            </button>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">
                Origin stop
                <select
                  value={originId}
                  onChange={(event) => setOriginId(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80"
                >
                  {stops.map((stop) => (
                    <option key={stop.id} value={stop.id}>
                      {stop.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium">
                Destination stop
                <select
                  value={destinationId}
                  onChange={(event) => setDestinationId(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80"
                >
                  {stops.map((stop) => (
                    <option key={stop.id} value={stop.id}>
                      {stop.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              type="button"
              onClick={planJourney}
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
            >
              {isPlanning ? "Planning route..." : "Compute Best Route"}
            </button>
            {error ? <p className="text-sm text-red-600 dark:text-red-300">{error}</p> : null}
          </div>
        </SectionCard>

        <SectionCard title="Nearby stops" description="Closest stops within roughly 500 metres of the detected user position.">
          <div className="space-y-3">
            {nearbyStops.length ? (
              nearbyStops.map((stop) => (
                <div key={stop.id} className="rounded-2xl border border-slate-200/80 px-4 py-3 dark:border-slate-700">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{stop.name}</p>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {((stop.distanceKm ?? 0) * 1000).toFixed(0)} m
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Run detection to populate nearby boarding points.
              </p>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="space-y-4">
        <SectionCard title="Route explorer" description="Filter seeded corridors and view the active transport geometry.">
          <div className="space-y-4">
            <input
              value={routeFilter}
              onChange={(event) => setRouteFilter(event.target.value)}
              placeholder="Filter by bus number or corridor"
              className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80"
            />
            <div className="grid gap-3 md:grid-cols-2">
              {filteredRoutes.map((route) => (
                <div key={route.id} className="rounded-[1.5rem] border border-slate-200/80 p-4 dark:border-slate-700">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        {route.busNumber}
                      </p>
                      <h3 className="mt-1 font-display text-xl font-semibold">{route.routeName}</h3>
                    </div>
                    <span className="h-4 w-4 rounded-full" style={{ backgroundColor: route.color }} />
                  </div>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    {route.startStop} to {route.endStop}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <TransportMap routes={filteredRoutes.slice(0, 2)} stops={stops} userLocation={userLocation} />

        {plan ? (
          <SectionCard title="Suggested journey" description={plan.summary}>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Trip Type
                </p>
                <p className="mt-2 font-display text-2xl font-semibold">{plan.direct ? "Direct" : "Transfer"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  ETA
                </p>
                <p className="mt-2 font-display text-2xl font-semibold">{plan.totalEtaMinutes} min</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Distance
                </p>
                <p className="mt-2 font-display text-2xl font-semibold">{plan.totalDistanceKm} km</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {plan.steps.map((step, index) => (
                <div key={`${step.label}-${index}`} className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    {step.type}
                  </p>
                  <p className="mt-1 font-semibold">{step.label}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {step.distanceKm.toFixed(1)} km • {step.etaMinutes} minutes
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}
      </div>
    </div>
  );
}
