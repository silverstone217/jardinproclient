import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { Invoice } from "@/types/invoice";
import { COLORS, fonts } from "@/utils/styles";

interface InvoiceLoyaltyProps {
  invoice: Invoice;
}

export function InvoiceLoyalty({ invoice }: InvoiceLoyaltyProps) {
  const pointsEarned = Math.max(0, invoice.loyalty.pointsEarned);

  const pointsUsed = Math.max(0, invoice.loyalty.pointsUsed);

  const hasLoyaltyActivity = pointsEarned > 0 || pointsUsed > 0;

  return (
    <View style={styles.container}>
      {/* ================================================== */}
      {/* HEADER                                             */}
      {/* ================================================== */}

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="star-outline" size={17} color={COLORS.secondary} />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Fidélité</Text>

          <Text style={styles.subtitle}>Activité liée à cette facture</Text>
        </View>
      </View>

      {/* ================================================== */}
      {/* ACTIVITY                                           */}
      {/* ================================================== */}

      {hasLoyaltyActivity ? (
        <View style={styles.activities}>
          {/* Points gagnés */}
          {pointsEarned > 0 && (
            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, styles.earnedIcon]}>
                <Ionicons name="add" size={16} color={COLORS.primary} />
              </View>

              <View style={styles.activityContent}>
                <Text style={styles.activityLabel}>Points gagnés</Text>

                <Text style={[styles.activityValue, styles.earnedValue]}>
                  +{pointsEarned}
                </Text>
              </View>
            </View>
          )}

          {/* Points utilisés */}
          {pointsUsed > 0 && (
            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, styles.usedIcon]}>
                <Ionicons name="remove" size={16} color={COLORS.secondary} />
              </View>

              <View style={styles.activityContent}>
                <Text style={styles.activityLabel}>Points utilisés</Text>

                <Text style={[styles.activityValue, styles.usedValue]}>
                  -{pointsUsed}
                </Text>
              </View>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="star-outline" size={17} color={COLORS.Gray} />

          <Text style={styles.emptyText}>
            Aucun mouvement de fidélité sur cette facture.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 14,
    borderRadius: 17,
    backgroundColor: "#FFFBF3",
    borderWidth: 1,
    borderColor: "#F2E7CC",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1D6",
  },

  headerContent: {
    flex: 1,
    marginLeft: 9,
  },

  title: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  activities: {
    marginTop: 12,
    gap: 8,
  },

  activityCard: {
    minHeight: 45,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#EEEDE8",
  },

  activityIcon: {
    width: 29,
    height: 29,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  earnedIcon: {
    backgroundColor: "#EAF2E7",
  },

  usedIcon: {
    backgroundColor: "#FFF0D5",
  },

  activityContent: {
    flex: 1,
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  activityLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: COLORS.darkGray,
  },

  activityValue: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },

  earnedValue: {
    color: COLORS.primary,
  },

  usedValue: {
    color: COLORS.secondary,
  },

  empty: {
    minHeight: 43,
    marginTop: 11,
    paddingHorizontal: 9,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },

  emptyText: {
    flex: 1,
    marginLeft: 7,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
  },
});
