"use client";

import { useEffect, useState } from "react";
import type { AuthSession, BusRoute, TicketRecord } from "@amaride/shared";
import { api } from "../../../lib/api";
import { getSession, saveSession } from "../../../lib/session";
import { QrTicketCard } from "../../../components/tickets/qr-ticket-card";
import { SectionCard } from "../../../components/ui/section-card";
import { currency } from "../../../lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function TicketsPage() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [passengerCount, setPassengerCount] = useState(1);
  const [quote, setQuote] = useState<{ amount: number; mode: string } | null>(null);
  const [tickets, setTickets] = useState<TicketRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      const loadedRoutes = await api.routes();
      setRoutes(loadedRoutes);
      setSelectedRouteId(loadedRoutes[0]?.id ?? "");

      const existingSession = getSession();
      setSession(existingSession);

      if (existingSession) {
        const history = await api.ticketHistory(existingSession);
        setTickets(history);
      }
    };

    void load();
  }, []);

  useEffect(() => {
    const loadQuote = async () => {
      if (!session || !selectedRouteId) {
        return;
      }

      const response = (await api.fareQuote(selectedRouteId, passengerCount, session)) as {
        amount: number;
        mode: string;
      };
      setQuote(response);
    };

    void loadQuote();
  }, [passengerCount, selectedRouteId, session]);

  const quickPassengerLogin = async () => {
    const passengerSession = await api.login({
      email: "passenger@amaride.in",
      password: "Password@123"
    });
    saveSession(passengerSession);
    setSession(passengerSession);
    const history = await api.ticketHistory(passengerSession);
    setTickets(history);
  };

  const buyTicket = async () => {
    if (!session) {
      toast.error("Sign in as a passenger before purchasing.");
      return;
    }
    
    try {
      const ticket = await api.buyTicket(selectedRouteId, passengerCount, session);
      setTickets((current) => [ticket, ...current]);
      toast.success("Ticket purchased successfully!");
    } catch (e) {
      toast.error("Failed to purchase ticket.");
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[0.85fr,1.15fr]">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
        <SectionCard title="Buy ticket" description="Simulated purchase with QR ticket generation.">
          {!session ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Use the seeded passenger account or sign in from the profile page.
              </p>
              <button
                type="button"
                onClick={quickPassengerLogin}
                className="rounded-full bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                Quick Login Passenger Demo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="space-y-2 text-sm font-medium">
                Route
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
              <label className="space-y-2 text-sm font-medium">
                Passengers
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={passengerCount}
                  onChange={(event) => setPassengerCount(Number(event.target.value))}
                  className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80"
                />
              </label>
              <div className="rounded-[1.5rem] border border-slate-200/80 p-4 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Payment mode
                </p>
                <p className="mt-2 font-display text-2xl font-semibold">{quote?.mode ?? "simulation"}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Estimated fare {currency(quote?.amount ?? 0)}
                </p>
              </div>
              <button
                type="button"
                onClick={buyTicket}
                className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-orange-500 dark:text-slate-950 dark:hover:bg-orange-400"
              >
                Confirm and Generate QR
              </button>
            </div>
          )}
        </SectionCard>
      </motion.div>
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
        {tickets[0] ? <QrTicketCard ticket={tickets[0]} /> : null}
        <SectionCard title="Ticket history" description="Previously purchased tickets remain visible in the passenger wallet.">
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-[1.5rem] border border-slate-200/80 p-4 dark:border-slate-700">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      {ticket.busNumber}
                    </p>
                    <p className="mt-1 font-semibold">{ticket.routeName}</p>
                  </div>
                  <p className="font-semibold">{currency(ticket.fare)}</p>
                </div>
              </div>
            ))}
            {!tickets.length ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">No tickets yet. Buy one to populate the wallet.</p>
            ) : null}
          </div>
        </SectionCard>
      </motion.div>
    </div>
  );
}
