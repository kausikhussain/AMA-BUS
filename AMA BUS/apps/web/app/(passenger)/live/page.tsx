"use client";

import { useEffect, useState } from "react";
import type { BusRoute, BusStop, LiveBus } from "@amaride/shared";
import { api } from "../../../lib/api";
import { getSocket } from "../../../lib/socket";
import { SectionCard } from "../../../components/ui/section-card";
import { TransportMap } from "../../../components/maps/transport-map";

export default function LivePage() {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [stops, setStops] = useState<BusStop[]>([]);
  const [buses, setBuses] = useState<LiveBus[]>([]);

  useEffect(() => {
    const socket = getSocket();

    const load = async () => {
      const [loadedRoutes, loadedStops, loadedBuses] = await Promise.all([
        api.routes(),
        api.stops(),
        api.liveBuses()
      ]);

      setRoutes(loadedRoutes);
      setStops(loadedStops);
      setBuses(loadedBuses);

      socket.connect();

      loadedRoutes.forEach((route) => {
        socket.emit("passenger:subscribe_route", {
          routeId: route.id
        });
      });
    };

    const handleLiveBus = (liveBus: LiveBus) => {
      setBuses((current) => {
        const next = [...current];
        const index = next.findIndex((item) => item.id === liveBus.id);

        if (index === -1) {
          next.push(liveBus);
        } else {
          next[index] = liveBus;
        }

        return next;
      });
    };

    socket.on("server:broadcast_bus_location", handleLiveBus);
    void load();

    return () => {
      socket.off("server:broadcast_bus_location", handleLiveBus);
      socket.disconnect();
    };
  }, []);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
      <div className="space-y-4">
        <SectionCard title="Live fleet map" description="Realtime bus telemetry from driver position updates over Socket.IO.">
          <TransportMap routes={routes} stops={stops} liveBuses={buses} />
        </SectionCard>
      </div>
      <div className="space-y-4">
        <SectionCard title="Active buses" description="Every location update refreshes ETA and occupancy.">
          <div className="space-y-3">
            {buses.map((bus) => (
              <div key={bus.id} className="rounded-[1.5rem] border border-slate-200/80 p-4 dark:border-slate-700">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      {bus.busNumber}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-semibold">{bus.routeName}</h3>
                  </div>
                  <div className="badge bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-200">
                    {bus.status}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">ETA</p>
                    <p className="font-semibold">{bus.etaMinutes} min</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Occupancy</p>
                    <p className="font-semibold">{bus.occupancy}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Driver</p>
                    <p className="font-semibold">{bus.driverName ?? "Assigned"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
