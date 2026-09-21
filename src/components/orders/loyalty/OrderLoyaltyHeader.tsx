import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface OrderLoyaltyHeaderProps {
  customerName: string | null;
  customerPhone: string;
}

export function OrderLoyaltyHeader({
  customerName,
  customerPhone,
}: OrderLoyaltyHeaderProps) {
  return (
    <View style={styles.container}>
      {/* ================================================== */}
      {/* HEADER                                             */}
      {/* ================================================== */}

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="gift-outline" size={23} color={COLORS.primary} />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.eyebrow}>ÉTAPE 3</Text>

          <Text style={styles.title}>Fidélité</Text>

          <Text style={styles.subtitle}>
            Utilisez vos points ou continuez à les cumuler.
          </Text>
        </View>
      </View>

      {/* ================================================== */}
      {/* CUSTOMER                                           */}
      {/* ================================================== */}

      <View style={styles.customerCard}>
        <View style={styles.customerIcon}>
          <Ionicons name="person-outline" size={20} color={COLORS.primary} />
        </View>

        <View style={styles.customerInfo}>
          <Text style={styles.customerLabel}>CLIENT</Text>

          <Text style={styles.customerName} numberOfLines={1}>
            {customerName?.trim() || "Client"}
          </Text>

          <View style={styles.phoneRow}>
            <Ionicons name="call-outline" size={12} color={COLORS.Gray} />

            <Text style={styles.customerPhone}>{customerPhone}</Text>
          </View>
        </View>

        <View style={styles.checkIcon}>
          <Ionicons name="checkmark-circle" size={21} color={COLORS.primary} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },

  // ========================================================
  // HEADER
  // ========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
    borderWidth: 1,
    borderColor: "#DDE9D9",
  },

  headerContent: {
    flex: 1,
    marginLeft: 12,
  },

  eyebrow: {
    marginBottom: 2,
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 1.2,
    color: COLORS.primary,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 26,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: COLORS.Gray,
  },

  // ========================================================
  // CUSTOMER
  // ========================================================

  customerCard: {
    marginTop: 18,
    minHeight: 76,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  customerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F6EF",
  },

  customerInfo: {
    flex: 1,
    marginLeft: 11,
  },

  customerLabel: {
    fontFamily: fonts.bold,
    fontSize: 8.5,
    letterSpacing: 1,
    color: COLORS.Gray,
  },

  customerName: {
    marginTop: 2,
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: COLORS.text,
  },

  phoneRow: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  customerPhone: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  checkIcon: {
    marginLeft: 8,
  },
});
