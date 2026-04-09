import type { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";

export function Panel({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 18,
    gap: 10
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a"
  },
  subtitle: {
    fontSize: 14,
    color: "#475569"
  },
  body: {
    gap: 10
  }
});
