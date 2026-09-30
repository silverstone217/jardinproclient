// src/components/report/StockReport.tsx

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, View } from "react-native";

import type {
  FinishedStockReport,
  RawMaterialStockReport,
} from "@/types/report";

import { COLORS, fonts } from "@/utils/styles";

import { ReportCard } from "./ReportCard";
import { ReportSummary, type ReportSummaryItem } from "./ReportSummary";

// ============================================================
// TYPES
// ============================================================

type StockReportData = RawMaterialStockReport | FinishedStockReport;

interface StockReportProps {
  report: StockReportData;
}

// ============================================================
// HELPERS
// ============================================================

function formatNumber(value: number): string {
  return value.toLocaleString("fr-FR");
}

function formatAmount(value: number): string {
  return `${value.toLocaleString("fr-FR")} CDF`;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function StockReport({ report }: StockReportProps) {
  if (report.type === "RAW_MATERIAL_STOCK") {
    return <RawMaterialStockReportView report={report} />;
  }

  return <FinishedStockReportView report={report} />;
}

// ============================================================
// RAW MATERIAL STOCK
// ============================================================

function RawMaterialStockReportView({
  report,
}: {
  report: RawMaterialStockReport;
}) {
  const summaryItems: ReportSummaryItem[] = [
    {
      label: "Ingrédients",
      value: formatNumber(report.summary.totalIngredients),
      icon: "fruit-cherries",
      color: COLORS.primary,
    },
    {
      label: "Emballages",
      value: formatNumber(report.summary.totalPackagings),
      icon: "package-variant-closed",
      color: COLORS.info,
    },
  ];

  return (
    <View style={styles.container}>
      <ReportSummary items={summaryItems} />

      {/* ================================================== */}
      {/* INGREDIENTS */}
      {/* ================================================== */}

      <ReportCard
        title="Matières premières"
        description="Mouvements et solde des ingrédients sur la période."
        icon="food-apple-outline"
      >
        {report.ingredients.length === 0 ? (
          <EmptyState text="Aucun ingrédient enregistré." />
        ) : (
          report.ingredients.map((ingredient, index) => (
            <View
              key={ingredient.id}
              style={[
                styles.stockItem,
                index < report.ingredients.length - 1 && styles.itemBorder,
              ]}
            >
              <StockItemHeader
                name={ingredient.name}
                unit={ingredient.unit}
                icon="food-apple-outline"
              />

              <StockMovementRow
                label="Stock initial"
                value={formatNumber(ingredient.openingQuantity)}
              />

              <StockMovementRow
                label="Achats"
                value={`+${formatNumber(ingredient.purchasedQuantity)}`}
                valueColor={COLORS.success}
              />

              <StockMovementRow
                label="Production"
                value={`-${formatNumber(ingredient.productionQuantity)}`}
                valueColor={COLORS.info}
              />

              <StockMovementRow
                label="Pertes"
                value={`-${formatNumber(ingredient.lossQuantity)}`}
                valueColor={COLORS.error}
              />

              <StockMovementRow
                label="Ajustements"
                value={formatNumber(ingredient.adjustmentQuantity)}
              />

              <StockMovementRow
                label="Stock final"
                value={formatNumber(ingredient.closingQuantity)}
                strong
              />
            </View>
          ))
        )}
      </ReportCard>

      {/* ================================================== */}
      {/* PACKAGINGS */}
      {/* ================================================== */}

      <ReportCard
        title="Emballages"
        description="Mouvements et solde des emballages sur la période."
        icon="package-variant-closed"
      >
        {report.packagings.length === 0 ? (
          <EmptyState text="Aucun emballage enregistré." />
        ) : (
          report.packagings.map((packaging, index) => (
            <View
              key={packaging.id}
              style={[
                styles.stockItem,
                index < report.packagings.length - 1 && styles.itemBorder,
              ]}
            >
              <StockItemHeader
                name={packaging.name}
                unit={`${packaging.size} · ${packaging.capacityMl} ml`}
                icon="package-variant-closed"
              />

              <StockMovementRow
                label="Stock initial"
                value={formatNumber(packaging.openingQuantity)}
              />

              <StockMovementRow
                label="Achats"
                value={`+${formatNumber(packaging.purchasedQuantity)}`}
                valueColor={COLORS.success}
              />

              <StockMovementRow
                label="Production"
                value={`-${formatNumber(packaging.productionQuantity)}`}
                valueColor={COLORS.info}
              />

              <StockMovementRow
                label="Pertes"
                value={`-${formatNumber(packaging.lossQuantity)}`}
                valueColor={COLORS.error}
              />

              <StockMovementRow
                label="Ajustements"
                value={formatNumber(packaging.adjustmentQuantity)}
              />

              <StockMovementRow
                label="Stock final"
                value={formatNumber(packaging.closingQuantity)}
                strong
              />
            </View>
          ))
        )}
      </ReportCard>
    </View>
  );
}

// ============================================================
// FINISHED STOCK
// ============================================================

function FinishedStockReportView({ report }: { report: FinishedStockReport }) {
  const summaryItems: ReportSummaryItem[] = [
    {
      label: "Variantes",
      value: formatNumber(report.summary.totalVariants),
      icon: "bottle-soda-outline",
      color: COLORS.primary,
    },
    {
      label: "Quantité",
      value: formatNumber(report.summary.totalQuantity),
      icon: "package-variant-closed",
      color: COLORS.info,
    },
    {
      label: "Valeur du stock",
      value: formatAmount(report.summary.totalStockValue),
      icon: "cash-multiple",
      color: COLORS.success,
    },
  ];

  return (
    <View style={styles.container}>
      <ReportSummary items={summaryItems} />

      <ReportCard
        title="Stock de produits finis"
        description="Répartition des produits disponibles par emplacement."
        icon="package-variant-closed"
      >
        {report.rows.length === 0 ? (
          <EmptyState text="Aucun produit en stock." />
        ) : (
          report.rows.map((row, index) => (
            <View
              key={`${row.variantId}-${row.pointOfSaleId ?? "reste"}-${index}`}
              style={[
                styles.finishedItem,
                index < report.rows.length - 1 && styles.itemBorder,
              ]}
            >
              {/* ============================================ */}
              {/* PRODUCT HEADER */}
              {/* ============================================ */}

              <View style={styles.finishedHeader}>
                <View style={styles.productIcon}>
                  <MaterialCommunityIcons
                    name="bottle-soda-outline"
                    size={19}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {row.productName}
                  </Text>

                  <Text style={styles.productMeta}>
                    {row.size} · {row.sku}
                  </Text>
                </View>
              </View>

              {/* ============================================ */}
              {/* STOCK DETAILS */}
              {/* ============================================ */}

              <View style={styles.finishedDetails}>
                <View style={styles.locationContainer}>
                  <Text style={styles.detailLabel}>Emplacement</Text>

                  <Text style={styles.location} numberOfLines={1}>
                    {row.pointOfSaleName}
                  </Text>
                </View>

                <View style={styles.quantityContainer}>
                  <Text style={styles.detailLabel}>Quantité</Text>

                  <Text style={styles.quantity}>
                    {formatNumber(row.quantity)}
                  </Text>
                </View>

                <View style={styles.valueContainer}>
                  <Text style={styles.detailLabel}>Valeur</Text>

                  <Text style={styles.stockValue}>
                    {formatAmount(row.stockValue)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ReportCard>
    </View>
  );
}

// ============================================================
// STOCK ITEM HEADER
// ============================================================

function StockItemHeader({
  name,
  unit,
  icon,
}: {
  name: string;
  unit: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
  return (
    <View style={styles.itemHeader}>
      <View style={styles.smallIcon}>
        <MaterialCommunityIcons name={icon} size={18} color={COLORS.primary} />
      </View>

      <View style={styles.itemHeaderContent}>
        <Text style={styles.itemName} numberOfLines={1}>
          {name}
        </Text>

        <Text style={styles.itemUnit} numberOfLines={1}>
          {unit}
        </Text>
      </View>
    </View>
  );
}

// ============================================================
// STOCK MOVEMENT ROW
// ============================================================

function StockMovementRow({
  label,
  value,
  valueColor,
  strong = false,
}: {
  label: string;
  value: string;
  valueColor?: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.movementRow}>
      <Text style={styles.movementLabel}>{label}</Text>

      <Text
        style={[
          styles.movementValue,
          strong && styles.movementValueStrong,
          valueColor ? { color: valueColor } : undefined,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name="package-variant-remove"
        size={28}
        color={COLORS.Gray}
      />

      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },

  // ==========================================================
  // RAW STOCK
  // ==========================================================

  stockItem: {
    paddingVertical: 4,
  },

  itemBorder: {
    paddingBottom: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },

  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  smallIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.neutral,
    marginRight: 10,
  },

  itemHeaderContent: {
    flex: 1,
    minWidth: 0,
  },

  itemName: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  itemUnit: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.Gray,
  },

  movementRow: {
    minHeight: 29,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 48,
  },

  movementLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: COLORS.Gray,
  },

  movementValue: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: COLORS.text,
  },

  movementValueStrong: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: COLORS.primary,
  },

  // ==========================================================
  // FINISHED STOCK
  // ==========================================================

  finishedItem: {
    paddingVertical: 5,
  },

  finishedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.neutral,
    marginRight: 10,
  },

  productInfo: {
    flex: 1,
    minWidth: 0,
  },

  productName: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  productMeta: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.Gray,
  },

  finishedDetails: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingLeft: 50,
  },

  locationContainer: {
    flex: 1,
    minWidth: 0,
  },

  detailLabel: {
    marginBottom: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  location: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.text,
  },

  quantityContainer: {
    minWidth: 55,
    marginLeft: 12,
  },

  quantity: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: COLORS.info,
  },

  valueContainer: {
    alignItems: "flex-end",
    marginLeft: 12,
  },

  stockValue: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.success,
  },

  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 22,
  },

  emptyText: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: COLORS.Gray,
    textAlign: "center",
  },
});
