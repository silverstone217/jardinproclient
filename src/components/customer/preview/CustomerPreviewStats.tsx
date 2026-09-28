import { Ionicons } from "@expo/vector-icons";
import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts, fontSizes, SETTINGS_COLORS } from "@/utils/styles";

interface CustomerPreviewStatsProps {
  totalOrders: number;
  totalSpent: number | string;
  averageOrderAmount: number | string;
  lastOrderAt?: string | Date | null;
  currency?: string;
}

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  color: string;
  backgroundColor: string;
  currency?: string;
  compact?: boolean;
}

function StatCard({
  icon,
  value,
  label,
  color,
  backgroundColor,
  currency,
  compact = false,
}: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor,
          },
        ]}
      >
        <Ionicons name={icon} size={18} color={color} />
      </View>

      <View style={styles.statContent}>
        <View style={styles.valueRow}>
          <Text
            style={[styles.value, compact && styles.valueCompact]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {value}
          </Text>

          {currency && <Text style={styles.currency}>{currency}</Text>}
        </View>

        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const CustomerPreviewStats = memo(
  ({
    totalOrders,
    totalSpent,
    averageOrderAmount,
    lastOrderAt,
    currency = "CDF",
  }: CustomerPreviewStatsProps) => {
    const formatAmount = useMemo(
      () => (value: number | string) => {
        const amount = Number(value);

        if (!Number.isFinite(amount)) {
          return "0";
        }

        return new Intl.NumberFormat("fr-FR", {
          maximumFractionDigits: 0,
        }).format(amount);
      },
      [],
    );

    const formattedLastOrder = useMemo(() => {
      if (!lastOrderAt) {
        return "Aucun";
      }

      const date =
        lastOrderAt instanceof Date ? lastOrderAt : new Date(lastOrderAt);

      if (Number.isNaN(date.getTime())) {
        return "Aucun";
      }

      const now = new Date();

      const isToday =
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate();

      if (isToday) {
        return "Aujourd'hui";
      }

      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "short",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      }).format(date);
    }, [lastOrderAt]);

    const formattedOrders = Math.max(
      0,
      Math.trunc(Number(totalOrders) || 0),
    ).toLocaleString("fr-FR");

    return (
      <View style={styles.container}>
        {/* ============================================================
            HEADER
        ============================================================ */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="stats-chart-outline"
              size={17}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.title}>Activité</Text>

            <Text style={styles.subtitle}>Résumé des achats du client</Text>
          </View>
        </View>

        {/* ============================================================
            STATISTIQUES
        ============================================================ */}
        <View style={styles.grid}>
          <StatCard
            icon="receipt-outline"
            value={formattedOrders}
            label={totalOrders > 1 ? "Achats" : "Achat"}
            color={COLORS.primary}
            backgroundColor={SETTINGS_COLORS.business.background}
          />

          <StatCard
            icon="wallet-outline"
            value={formatAmount(totalSpent)}
            label="Total dépensé"
            color={SETTINGS_COLORS.account.icon}
            backgroundColor={SETTINGS_COLORS.account.background}
            currency={currency}
          />

          <StatCard
            icon="calculator-outline"
            value={formatAmount(averageOrderAmount)}
            label="Panier moyen"
            color={SETTINGS_COLORS.inventory.icon}
            backgroundColor={SETTINGS_COLORS.inventory.background}
            currency={currency}
          />

          <StatCard
            icon="time-outline"
            value={formattedLastOrder}
            label="Dernier achat"
            color={SETTINGS_COLORS.customers.icon}
            backgroundColor={SETTINGS_COLORS.customers.background}
            compact
          />
        </View>
      </View>
    );
  },
);

CustomerPreviewStats.displayName = "CustomerPreviewStats";

export default CustomerPreviewStats;

const styles = StyleSheet.create({
  // ============================================================
  // CONTAINER
  // ============================================================

  container: {
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  // ============================================================
  // HEADER
  // ============================================================

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
    backgroundColor: SETTINGS_COLORS.business.background,
  },

  headerContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  title: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.medium,
    lineHeight: fontSizes.medium * 1.25,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: COLORS.Gray,
  },

  // ============================================================
  // GRID
  // ============================================================

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },

  // ============================================================
  // CARD
  // ============================================================

  statCard: {
    width: "48%",
    minHeight: 82,
    padding: 11,
    borderRadius: 15,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#EEEEEB",
    flexDirection: "row",
    alignItems: "center",
  },

  // ============================================================
  // ICON
  // ============================================================

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  // ============================================================
  // CONTENT
  // ============================================================

  statContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
  },

  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    minWidth: 0,
  },

  value: {
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: fontSizes.large,
    lineHeight: fontSizes.large * 1.2,
    color: COLORS.text,
  },

  valueCompact: {
    fontSize: fontSizes.medium,
    lineHeight: fontSizes.medium * 1.25,
  },

  currency: {
    marginLeft: 4,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: COLORS.Gray,
  },

  label: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: COLORS.darkGray,
  },
});
