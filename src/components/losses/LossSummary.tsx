import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface LossSummaryProps {
  pendingCount: number;
  historyCount: number;
}

export function LossSummary({ pendingCount, historyCount }: LossSummaryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <View style={[styles.iconContainer, styles.pendingIcon]}>
          <Ionicons name="time-outline" size={18} color={COLORS.warning} />
        </View>

        <View style={styles.content}>
          <Text style={styles.value}>{pendingCount}</Text>

          <Text style={styles.label}>À traiter</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.item}>
        <View style={[styles.iconContainer, styles.historyIcon]}>
          <Ionicons name="archive-outline" size={18} color={COLORS.primary} />
        </View>

        <View style={styles.content}>
          <Text style={styles.value}>{historyCount}</Text>

          <Text style={styles.label}>Pertes enregistrées</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 18,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  item: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  pendingIcon: {
    backgroundColor: "#FFF4D9",
  },

  historyIcon: {
    backgroundColor: "#E8F2E5",
  },

  content: {
    flex: 1,
    marginLeft: 10,
  },

  value: {
    fontFamily: fonts.bold,
    fontSize: 17,
    lineHeight: 21,
    color: COLORS.text,
  },

  label: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  divider: {
    width: 1,
    height: 36,
    marginHorizontal: 12,
    backgroundColor: "#EEEEEA",
  },
});
