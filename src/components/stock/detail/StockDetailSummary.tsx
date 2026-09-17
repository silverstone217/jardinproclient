import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface StockDetailSummaryProps {
  stock: StockTypes.FinishedProduct;
}

interface SummaryItemProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  accent?: "primary" | "secondary" | "warning";
}

function SummaryItem({
  icon,
  label,
  value,
  accent = "primary",
}: SummaryItemProps) {
  const iconColor =
    accent === "secondary"
      ? COLORS.secondary
      : accent === "warning"
        ? COLORS.warning
        : COLORS.primary;

  const iconBackground =
    accent === "secondary"
      ? "#FFF3E3"
      : accent === "warning"
        ? "#FFF8E2"
        : "#EAF2E7";

  return (
    <View style={styles.item}>
      <View style={[styles.iconContainer, { backgroundColor: iconBackground }]}>
        <MaterialCommunityIcons name={icon} size={17} color={iconColor} />
      </View>

      <View style={styles.itemContent}>
        <Text style={styles.label}>{label}</Text>

        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export function StockDetailSummary({ stock }: StockDetailSummaryProps) {
  const price = `${stock.price.toLocaleString("fr-FR")} CDF`;

  const quantityLabel =
    stock.quantity === 1 ? "1 unité" : `${stock.quantity} unités`;

  const capacityLabel = `${stock.capacityMl} ml`;

  const shelfLifeLabel =
    stock.shelfLifeDays === 1 ? "1 jour" : `${stock.shelfLifeDays} jours`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons
            name="chart-box-outline"
            size={18}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>État du stock</Text>

          <Text style={styles.subtitle}>
            Informations actuelles de cette référence
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        <SummaryItem
          icon="package-variant-closed"
          label="Stock disponible"
          value={quantityLabel}
          accent={stock.quantity > 0 ? "primary" : "warning"}
        />

        <SummaryItem
          icon="cash-multiple"
          label="Prix de vente"
          value={price}
          accent="secondary"
        />

        <SummaryItem
          icon="bottle-soda-outline"
          label="Contenance"
          value={capacityLabel}
        />

        <SummaryItem
          icon="clock-outline"
          label="Conservation"
          value={shelfLifeLabel}
          accent="warning"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    padding: 18,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0ED",
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
    marginTop: 6,
    flexDirection: "row",
    flexWrap: "wrap",
  },

  item: {
    width: "50%",
    minHeight: 76,
    paddingTop: 12,
    paddingRight: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  itemContent: {
    flex: 1,
    marginLeft: 9,
  },

  label: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  value: {
    marginTop: 3,
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },
});
