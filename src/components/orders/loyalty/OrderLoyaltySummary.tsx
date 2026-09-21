import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { GetOrderLoyaltyResponse } from "@/types/order";

import { COLORS, fonts } from "@/utils/styles";

interface OrderLoyaltySummaryProps {
  loyalty: GetOrderLoyaltyResponse;
}

export function OrderLoyaltySummary({ loyalty }: OrderLoyaltySummaryProps) {
  const { customer, earning, balance } = loyalty;

  const hasEarnedPoints = earning.pointsEarned > 0;

  return (
    <View style={styles.card}>
      {/* ================================================== */}
      {/* HEADER                                             */}
      {/* ================================================== */}

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="sparkles-outline" size={18} color={COLORS.tertiary} />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Vos points fidélité</Text>

          <Text style={styles.subtitle}>
            Les points sont calculés selon le montant de votre commande.
          </Text>
        </View>
      </View>

      {/* ================================================== */}
      {/* CURRENT POINTS                                     */}
      {/* ================================================== */}

      <View style={styles.currentPoints}>
        <View>
          <Text style={styles.currentLabel}>SOLDE ACTUEL</Text>

          <View style={styles.pointsRow}>
            <Text style={styles.currentValue}>{customer.currentPoints}</Text>

            <Text style={styles.pointsLabel}>points</Text>
          </View>
        </View>

        <View style={styles.pointsIcon}>
          <Ionicons name="gift-outline" size={23} color={COLORS.primary} />
        </View>
      </View>

      {/* ================================================== */}
      {/* SEPARATOR                                          */}
      {/* ================================================== */}

      <View style={styles.separator} />

      {/* ================================================== */}
      {/* EARNING                                            */}
      {/* ================================================== */}

      <View style={styles.earningRow}>
        <View style={styles.earningIcon}>
          <Ionicons
            name={
              hasEarnedPoints ? "add-circle-outline" : "remove-circle-outline"
            }
            size={18}
            color={hasEarnedPoints ? COLORS.success : COLORS.Gray}
          />
        </View>

        <View style={styles.earningContent}>
          <Text style={styles.earningTitle}>Cette commande</Text>

          <Text style={styles.earningDescription}>
            {hasEarnedPoints
              ? `Vous gagnez ${earning.pointsEarned} point${
                  earning.pointsEarned > 1 ? "s" : ""
                }.`
              : "Cette commande ne génère pas encore de points."}
          </Text>
        </View>

        <Text
          style={[
            styles.earningValue,
            !hasEarnedPoints && styles.earningValueMuted,
          ]}
        >
          {hasEarnedPoints ? `+${earning.pointsEarned}` : "0"}
        </Text>
      </View>

      {/* ================================================== */}
      {/* NEW BALANCE                                        */}
      {/* ================================================== */}

      <View style={styles.balanceCard}>
        <View style={styles.balanceContent}>
          <Text style={styles.balanceLabel}>APRÈS CETTE COMMANDE</Text>

          <Text style={styles.balanceTitle}>Nouveau solde</Text>
        </View>

        <View style={styles.balanceValueContainer}>
          <Text style={styles.balanceValue}>{balance.pointsAfterPurchase}</Text>

          <Text style={styles.balancePoints}>points</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 17,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF6D9",
  },

  headerContent: {
    flex: 1,
    marginLeft: 10,
  },

  title: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  currentPoints: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#F6F8F4",
    borderWidth: 1,
    borderColor: "#E8EEE5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  currentLabel: {
    marginBottom: 3,
    fontFamily: fonts.bold,
    fontSize: 8,
    letterSpacing: 1,
    color: COLORS.Gray,
  },

  pointsRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  currentValue: {
    fontFamily: fonts.bold,
    fontSize: 25,
    color: COLORS.primary,
  },

  pointsLabel: {
    marginLeft: 5,
    fontFamily: fonts.medium,
    fontSize: 10,
    color: COLORS.darkGray,
  },

  pointsIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  separator: {
    height: 1,
    marginVertical: 15,
    backgroundColor: "#F0F0ED",
  },

  earningRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  earningIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF7EC",
  },

  earningContent: {
    flex: 1,
    marginLeft: 9,
  },

  earningTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  earningDescription: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  earningValue: {
    marginLeft: 10,
    fontFamily: fonts.bold,
    fontSize: 16,
    color: COLORS.success,
  },

  earningValueMuted: {
    color: COLORS.Gray,
  },

  balanceCard: {
    marginTop: 15,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: "#EDF4EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  balanceContent: {
    flex: 1,
  },

  balanceLabel: {
    marginBottom: 3,
    fontFamily: fonts.bold,
    fontSize: 7.5,
    letterSpacing: 0.9,
    color: COLORS.primary,
  },

  balanceTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.text,
  },

  balanceValueContainer: {
    marginLeft: 10,
    alignItems: "flex-end",
  },

  balanceValue: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 23,
    color: COLORS.primary,
  },

  balancePoints: {
    marginTop: 1,
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: COLORS.darkGray,
  },
});
