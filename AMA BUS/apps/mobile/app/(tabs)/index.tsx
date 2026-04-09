import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import type { BusRoute } from "@amaride/shared";
import { mobileApi } from "../../lib/api";
import { Panel } from "../../components/panel";

export default function MobileHome() {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [nearbyStops, setNearbyStops] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const loadedRoutes = await mobileApi.routes();
      setRoutes(loadedRoutes as BusRoute[]);

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        const stops = await mobileApi.nearbyStops(location.coords.latitude, location.coords.longitude);
        setNearbyStops(stops as any[]);
      }
    };

    void load();
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>AmaRide Mobile</Text>
      <Text style={styles.title}>Passenger quick access</Text>
      <Panel title="Nearby stops" subtitle="Using device GPS to locate boarding points.">
        {nearbyStops.map((stop) => (
          <View key={stop.id} style={styles.row}>
            <Text style={styles.rowTitle}>{stop.name}</Text>
            <Text style={styles.rowMeta}>{Math.round((stop.distanceKm ?? 0) * 1000)} m</Text>
          </View>
        ))}
      </Panel>
      <Panel title="Available routes" subtitle="Synced from the same backend used by the web dashboard.">
        {routes.map((route) => (
          <View key={route.id} style={styles.routeCard}>
            <Text style={styles.routeNumber}>{route.busNumber}</Text>
            <Text style={styles.routeName}>{route.routeName}</Text>
            <Text style={styles.routeMeta}>
              {route.startStop} to {route.endStop}
            </Text>
          </View>
        ))}
      </Panel>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 18, gap: 16 },
  eyebrow: { marginTop: 42, color: "#5eead4", textTransform: "uppercase", letterSpacing: 2 },
  title: { fontSize: 34, fontWeight: "800", color: "#f8fafc" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowTitle: { fontSize: 15, fontWeight: "600", color: "#0f172a" },
  rowMeta: { fontSize: 13, color: "#475569" },
  routeCard: { borderRadius: 18, backgroundColor: "#f8fafc", padding: 14, gap: 4 },
  routeNumber: { color: "#0f766e", fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  routeName: { fontSize: 17, fontWeight: "700", color: "#0f172a" },
  routeMeta: { color: "#475569" }
});
