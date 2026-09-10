import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface PackagingHeaderProps {
  total: number;
  active: number;
  lowStock: number;
}

export function PackagingHeader({
  total,
  active,
  lowStock,
}: PackagingHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <View style={[styles.icon, styles.iconGreen]}>
          <MaterialCommunityIcons
            name="bottle-soda-outline"
            size={17}
            color={COLORS.primary}
          />
        </View>

        <View>
          <Text style={styles.value}>{total}</Text>

          <Text style={styles.label}>Total</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.stat}>
        <View style={[styles.icon, styles.iconBlue]}>
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={17}
            color="#3478C5"
          />
        </View>

        <View>
          <Text style={styles.value}>{active}</Text>

          <Text style={styles.label}>Actifs</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.stat}>
        <View style={[styles.icon, styles.iconOrange]}>
          <MaterialCommunityIcons
            name="alert-outline"
            size={17}
            color="#D88A00"
          />
        </View>

        <View>
          <Text style={styles.value}>{lowStock}</Text>

          <Text style={styles.label}>Stock faible</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  stat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  icon: {
    width: 33,
    height: 33,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  iconGreen: {
    backgroundColor: "#EAF2E7",
  },

  iconBlue: {
    backgroundColor: "#E8F1FB",
  },

  iconOrange: {
    backgroundColor: "#FFF4D9",
  },

  value: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: COLORS.text,
  },

  label: {
    marginTop: 1,
    fontFamily: fonts.regular,
    fontSize: 8,
    color: COLORS.Gray,
  },

  divider: {
    width: 1,
    height: 32,
    backgroundColor: "#EEEEEA",
  },
});
