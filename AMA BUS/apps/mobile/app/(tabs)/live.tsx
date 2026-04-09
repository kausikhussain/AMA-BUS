import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { LiveBus } from "@amaride/shared";
import { mobileApi } from "../../lib/api";
import { Panel } from "../../components/panel";

export default function LiveTab() {
  const [buses, setBuses] = useState<LiveBus[]>([]);

  useEffect(() => {
    const load = async () => {
      const live = await mobileApi.liveBuses();
      setBuses(live as LiveBus[]);
    };

    void load();
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Live fleet</Text>
      <Panel title="Active buses" subtitle="Simple mobile monitoring feed for commuters and dispatchers.">
        {buses.map((bus) => (
          <View key={bus.id} style={styles.busCard}>
            <View>
              <Text style={styles.busNumber}>{bus.busNumber}</Text>
              <Text style={styles.busRoute}>{bus.routeName}</Text>
            </View>
            <View>
              <Text style={styles.busEta}>{bus.etaMinutes} min</Text>
              <Text style={styles.busMeta}>occ {bus.occupancy}</Text>
            </View>
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
  busCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    padding: 14
  },
  busNumber: { color: "#0f766e", fontSize: 12, fontWeight: "800" },
  busRoute: { color: "#0f172a", fontSize: 16, fontWeight: "700", marginTop: 4 },
  busEta: { color: "#ea580c", fontSize: 18, fontWeight: "800", textAlign: "right" },
  busMeta: { color: "#64748b", textAlign: "right" }
});
