import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import type { AuthSession, BusRoute } from "@amaride/shared";
import { mobileApi } from "../../lib/api";
import { Panel } from "../../components/panel";
import { getSession, saveSession } from "../../lib/session";

export default function DriverTab() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [trip, setTrip] = useState<any>(null);
  const pointRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      const existing = await getSession();
      setSession(existing);
      const loadedRoutes = await mobileApi.routes();
      setRoutes(loadedRoutes as BusRoute[]);
    };

    void load();
  }, []);

  useEffect(() => {
    if (!session || !trip || !routes.length) {
      return;
    }

    const route = routes.find((item) => item.id === trip.routeId);
    if (!route) {
      return;
    }

    const interval = setInterval(async () => {
      const nextPoint = route.path[pointRef.current % route.path.length];
      pointRef.current += 1;
      await mobileApi.updateLocation(
        {
          tripId: trip.tripId,
          latitude: nextPoint[1],
          longitude: nextPoint[0],
          occupancy: 15 + (pointRef.current % 10)
        },
        session
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [routes, session, trip]);

  const quickDriverLogin = async () => {
    const nextSession = await mobileApi.login({
      email: "driver1@amaride.in",
      password: "Password@123"
    });
    await saveSession(nextSession);
    setSession(nextSession);
  };

  const startTrip = async () => {
    if (!session || !routes[0]) {
      return;
    }

    const nextTrip = await mobileApi.startTrip(routes[0].id, session);
    setTrip(nextTrip);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Driver mobile</Text>
      <Panel title="Trip broadcaster" subtitle="Pocket-friendly demo for live trip tracking.">
        {!session ? (
          <Pressable onPress={quickDriverLogin} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Quick Login Driver</Text>
          </Pressable>
        ) : (
          <Pressable onPress={startTrip} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Start first route trip</Text>
          </Pressable>
        )}
        <Text style={styles.meta}>{trip ? JSON.stringify(trip, null, 2) : "No active trip yet."}</Text>
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
  meta: {
    borderRadius: 18,
    backgroundColor: "#e2e8f0",
    color: "#0f172a",
    padding: 12,
    fontFamily: "monospace"
  }
});
