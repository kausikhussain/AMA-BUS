import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { AuthSession, BusRoute, TicketRecord } from "@amaride/shared";
import { mobileApi } from "../../lib/api";
import { Panel } from "../../components/panel";
import { getSession, saveSession } from "../../lib/session";

export default function TicketsTab() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [tickets, setTickets] = useState<TicketRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      const existing = await getSession();
      setSession(existing);
      const loadedRoutes = await mobileApi.routes();
      setRoutes(loadedRoutes as BusRoute[]);

      if (existing) {
        const history = await mobileApi.tickets(existing);
        setTickets(history as TicketRecord[]);
      }
    };

    void load();
  }, []);

  const quickPassengerLogin = async () => {
    const nextSession = await mobileApi.login({
      email: "passenger@amaride.in",
      password: "Password@123"
    });
    await saveSession(nextSession);
    setSession(nextSession);
    const history = await mobileApi.tickets(nextSession);
    setTickets(history as TicketRecord[]);
  };

  const buy = async () => {
    if (!session || !routes[0]) {
      return;
    }

    const ticket = await mobileApi.buyTicket(routes[0].id, 1, session);
    setTickets((current) => [ticket as TicketRecord, ...current]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mobile tickets</Text>
      <Panel title="Passenger wallet" subtitle="Authenticate once, then keep ticket history on hand.">
        {!session ? (
          <Pressable onPress={quickPassengerLogin} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Quick Login Passenger</Text>
          </Pressable>
        ) : (
          <Pressable onPress={buy} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Buy first route ticket</Text>
          </Pressable>
        )}
        {tickets.map((ticket) => (
          <View key={ticket.id} style={styles.ticketCard}>
            <Text style={styles.ticketRoute}>{ticket.routeName}</Text>
            <Text style={styles.ticketMeta}>
              {ticket.busNumber} • {ticket.passengerCount} pax
            </Text>
          </View>
        ))}
      </Panel>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 18, gap: 16, paddingTop: 52 },
  title: { fontSize: 30, fontWeight: "800", color: "#f8fafc" },
  primaryButton: { borderRadius: 18, backgroundColor: "#0f766e", padding: 14 },
  primaryButtonText: { color: "#ffffff", textAlign: "center", fontWeight: "700" },
  secondaryButton: { borderRadius: 18, backgroundColor: "#f97316", padding: 14 },
  secondaryButtonText: { color: "#0f172a", textAlign: "center", fontWeight: "700" },
  ticketCard: { borderRadius: 18, backgroundColor: "#f8fafc", padding: 14, gap: 2 },
  ticketRoute: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  ticketMeta: { color: "#475569" }
});
