import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface EmployeeStatsProps {
  total: number;
  active: number;
  assigned: number;
}

interface StatItemProps {
  value: number;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  backgroundColor: string;
  iconColor: string;
}

const StatItem = ({
  value,
  label,
  icon,
  backgroundColor,
  iconColor,
}: StatItemProps) => (
  <View style={styles.item}>
    <View
      style={[
        styles.icon,
        {
          backgroundColor,
        },
      ]}
    >
      <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
    </View>

    <View style={styles.info}>
      <Text style={styles.value}>{value}</Text>

      <Text style={styles.label}>{label}</Text>
    </View>
  </View>
);

export default function EmployeeStats({
  total,
  active,
  assigned,
}: EmployeeStatsProps) {
  return (
    <View style={styles.card}>
      <StatItem
        value={total}
        label="Total"
        icon="account-group-outline"
        backgroundColor="#E8F2E5"
        iconColor={COLORS.primary}
      />

      <View style={styles.divider} />

      <StatItem
        value={active}
        label="Actifs"
        icon="account-check-outline"
        backgroundColor="#E8F5E9"
        iconColor={COLORS.success}
      />

      <View style={styles.divider} />

      <StatItem
        value={assigned}
        label="Affectés"
        icon="storefront-outline"
        backgroundColor="#FFF4D9"
        iconColor="#D88A00"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    marginBottom: 18,
  },

  item: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  info: {
    flex: 1,
  },

  value: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: COLORS.text,
  },

  label: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
    marginTop: 1,
  },

  divider: {
    width: 1,
    height: 30,
    backgroundColor: "#EEEEEE",
    marginHorizontal: 7,
  },
});
