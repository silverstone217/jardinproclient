import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface StockSummaryProps {
  summary: StockTypes.Summary | null;
  location: StockTypes.StockLocationInfo | null;
}

interface SummaryCardProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  color: string;
  backgroundColor: string;
  alertCount?: number;
}

function SummaryCard({
  icon,
  label,
  value,
  color,
  backgroundColor,
  alertCount = 0,
}: SummaryCardProps) {
  return (
    <View style={styles.card}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor,
          },
        ]}
      >
        <MaterialCommunityIcons name={icon} size={19} color={color} />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.valueRow}>
          <Text style={styles.value}>{value}</Text>

          {alertCount > 0 && (
            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>{alertCount}</Text>
            </View>
          )}
        </View>

        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>

        {alertCount > 0 && (
          <Text style={styles.alertText}>
            {alertCount === 1 ? "stock faible" : "stocks faibles"}
          </Text>
        )}
      </View>
    </View>
  );
}

export function StockSummary({ summary, location }: StockSummaryProps) {
  // ============================================================
  // ÉTAT VIDE
  // ============================================================

  if (!summary || !location) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons
              name="chart-box-outline"
              size={17}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.title}>Vue d’ensemble</Text>

            <Text style={styles.subtitle}>
              Les indicateurs du stock apparaîtront ici.
            </Text>
          </View>
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun stock disponible.</Text>
        </View>
      </View>
    );
  }

  // ============================================================
  // VALEURS
  // ============================================================

  const rawIngredientsCount = Math.max(
    0,
    Math.trunc(Number(summary.rawIngredientsCount) || 0),
  );

  const packagingCount = Math.max(
    0,
    Math.trunc(Number(summary.packagingCount) || 0),
  );

  const finishedProductsCount = Math.max(
    0,
    Math.trunc(Number(summary.finishedProductsCount) || 0),
  );

  const lowStockRawIngredientsCount = Math.max(
    0,
    Math.trunc(Number(summary.lowStockRawIngredientsCount) || 0),
  );

  const lowStockPackagingCount = Math.max(
    0,
    Math.trunc(Number(summary.lowStockPackagingCount) || 0),
  );

  const totalFinishedQuantity = Math.max(
    0,
    Number(summary.totalFinishedQuantity) || 0,
  );

  const formattedFinishedQuantity = Number.isInteger(totalFinishedQuantity)
    ? totalFinishedQuantity.toLocaleString("fr-FR")
    : totalFinishedQuantity.toLocaleString("fr-FR", {
        maximumFractionDigits: 2,
      });

  // ============================================================
  // RENDU
  // ============================================================

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons
            name="chart-box-outline"
            size={17}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Vue d’ensemble</Text>

          <Text style={styles.subtitle}>État actuel du stock</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <SummaryCard
          icon="fruit-cherries"
          label="Matières premières"
          value={String(rawIngredientsCount)}
          color={COLORS.primary}
          backgroundColor="#E8F2E5"
          alertCount={lowStockRawIngredientsCount}
        />

        <SummaryCard
          icon="bottle-soda-outline"
          label="Emballages"
          value={String(packagingCount)}
          color="#D88A00"
          backgroundColor="#FFF4D9"
          alertCount={lowStockPackagingCount}
        />

        <SummaryCard
          icon="bottle-soda-classic-outline"
          label="Produits finis"
          value={String(finishedProductsCount)}
          color="#3478C5"
          backgroundColor="#E8F1FB"
        />

        <SummaryCard
          icon="package-variant-closed"
          label="Quantité disponible"
          value={formattedFinishedQuantity}
          color="#7952A8"
          backgroundColor="#F3EAF8"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  // ==========================================================
  // HEADER
  // ==========================================================

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
    backgroundColor: "#EDF4EB",
  },

  headerContent: {
    flex: 1,
    marginLeft: 10,
  },

  title: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  // ==========================================================
  // GRID
  // ==========================================================

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },

  card: {
    width: "48%",
    minHeight: 88,
    padding: 11,
    borderRadius: 15,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#EEEEEB",
    flexDirection: "row",
    alignItems: "center",
  },

  // ==========================================================
  // ICON
  // ==========================================================

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  // ==========================================================
  // CONTENT
  // ==========================================================

  cardContent: {
    flex: 1,
    marginLeft: 9,
    minWidth: 0,
  },

  valueRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  value: {
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 22,
    color: COLORS.text,
  },

  label: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: COLORS.darkGray,
  },

  // ==========================================================
  // LOW STOCK
  // ==========================================================

  alertBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    marginLeft: 5,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0D2",
  },

  alertBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 8.5,
    color: "#C57A00",
  },

  alertText: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 8,
    color: "#C57A00",
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyContainer: {
    marginTop: 14,
    minHeight: 55,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#EEEEEB",
  },

  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },
});
