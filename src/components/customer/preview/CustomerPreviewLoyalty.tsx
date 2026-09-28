import { Ionicons } from "@expo/vector-icons";
import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts, fontSizes, SETTINGS_COLORS } from "@/utils/styles";

interface CustomerPreviewLoyaltyProps {
  currentPoints: number;
  totalEarned: number;
  totalUsed: number;
}

const CustomerPreviewLoyalty = memo(
  ({ currentPoints, totalEarned, totalUsed }: CustomerPreviewLoyaltyProps) => {
    const formattedCurrentPoints = useMemo(
      () => new Intl.NumberFormat("fr-FR").format(Math.max(0, currentPoints)),
      [currentPoints],
    );

    const formattedTotalEarned = useMemo(
      () => new Intl.NumberFormat("fr-FR").format(Math.max(0, totalEarned)),
      [totalEarned],
    );

    const formattedTotalUsed = useMemo(
      () => new Intl.NumberFormat("fr-FR").format(Math.max(0, totalUsed)),
      [totalUsed],
    );

    return (
      <View style={styles.container}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Fidélité</Text>

            <Text style={styles.subtitle}>Solde actuel du client</Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="star-outline"
              size={19}
              color={SETTINGS_COLORS.inventory.icon}
            />
          </View>
        </View>

        {/* Solde principal */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceIcon}>
            <Ionicons
              name="trophy-outline"
              size={22}
              color={SETTINGS_COLORS.inventory.icon}
            />
          </View>

          <View style={styles.balanceInfo}>
            <Text style={styles.balanceValue}>{formattedCurrentPoints}</Text>

            <Text style={styles.balanceLabel}>points disponibles</Text>
          </View>
        </View>

        {/* Détails */}
        <View style={styles.detailsContainer}>
          {/* Points gagnés */}
          <View style={styles.detailItem}>
            <View style={[styles.detailIcon, styles.earnedIcon]}>
              <Ionicons
                name="arrow-up-outline"
                size={16}
                color={COLORS.success}
              />
            </View>

            <View style={styles.detailInfo}>
              <Text style={styles.detailValue}>{formattedTotalEarned}</Text>

              <Text style={styles.detailLabel}>Points gagnés</Text>
            </View>
          </View>

          <View style={styles.separator} />

          {/* Points utilisés */}
          <View style={styles.detailItem}>
            <View style={[styles.detailIcon, styles.usedIcon]}>
              <Ionicons
                name="arrow-down-outline"
                size={16}
                color={COLORS.secondary}
              />
            </View>

            <View style={styles.detailInfo}>
              <Text style={styles.detailValue}>{formattedTotalUsed}</Text>

              <Text style={styles.detailLabel}>Points utilisés</Text>
            </View>
          </View>
        </View>
      </View>
    );
  },
);

CustomerPreviewLoyalty.displayName = "CustomerPreviewLoyalty";

export default CustomerPreviewLoyalty;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  titleContainer: {
    flex: 1,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.large,
    lineHeight: fontSizes.large * 1.25,
    color: COLORS.text,
  },

  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: COLORS.Gray,
    marginTop: 3,
  },

  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SETTINGS_COLORS.inventory.background,
  },

  balanceCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    backgroundColor: SETTINGS_COLORS.inventory.background,
  },

  balanceIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    marginRight: 13,
  },

  balanceInfo: {
    flex: 1,
  },

  balanceValue: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xlarge,
    lineHeight: fontSizes.xlarge * 1.25,
    color: COLORS.text,
  },

  balanceLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: COLORS.darkGray,
    marginTop: 2,
  },

  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 13,
    borderRadius: 14,
    backgroundColor: COLORS.neutral,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },

  detailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  earnedIcon: {
    backgroundColor: "#E8F5E9",
  },

  usedIcon: {
    backgroundColor: "#FFF1E2",
  },

  detailInfo: {
    flex: 1,
  },

  detailValue: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.medium,
    lineHeight: fontSizes.medium * 1.25,
    color: COLORS.text,
  },

  detailLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: COLORS.Gray,
    marginTop: 1,
  },

  separator: {
    width: 1,
    height: 34,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 10,
  },
});
