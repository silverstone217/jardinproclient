// src/components/report/ProductionReport.tsx

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, View } from "react-native";

import type { ProductionReport } from "@/types/report";

import { COLORS, fonts } from "@/utils/styles";

import { ReportCard } from "./ReportCard";
import { ReportSummary, type ReportSummaryItem } from "./ReportSummary";

interface ProductionReportProps {
  report: ProductionReport;
}

function formatNumber(value: number): string {
  return value.toLocaleString("fr-FR");
}

function formatVolume(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toLocaleString("fr-FR", {
      maximumFractionDigits: 2,
    })} L`;
  }

  return `${formatNumber(value)} ml`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ProductionReport({ report }: ProductionReportProps) {
  const summaryItems: ReportSummaryItem[] = [
    {
      label: "Productions",
      value: formatNumber(report.summary.totalProductions),
      icon: "factory",
      color: COLORS.primary,
    },
    {
      label: "Volume produit",
      value: formatVolume(report.summary.totalVolumeMl),
      icon: "cup-outline",
      color: COLORS.info,
    },
    {
      label: "Quantité produite",
      value: formatNumber(report.summary.totalQuantityProduced),
      icon: "package-variant-closed",
      color: COLORS.success,
    },
  ];

  return (
    <View style={styles.container}>
      <ReportSummary items={summaryItems} />

      <ReportCard
        title="Productions"
        description="Détail des productions réalisées pendant la période."
        icon="factory"
      >
        {report.rows.length === 0 ? (
          <EmptyState text="Aucune production enregistrée." />
        ) : (
          report.rows.map((production, index) => (
            <View
              key={production.id}
              style={[
                styles.production,
                index < report.rows.length - 1 && styles.productionBorder,
              ]}
            >
              <View style={styles.productionHeader}>
                <View style={styles.productionIcon}>
                  <MaterialCommunityIcons
                    name="calendar-outline"
                    size={18}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.productionInfo}>
                  <Text style={styles.productionDate}>
                    {formatDate(production.producedAt)}
                  </Text>

                  <Text style={styles.productionVolume}>
                    {formatVolume(production.totalVolumeMl)}
                  </Text>
                </View>
              </View>

              <ProductionIngredients ingredients={production.ingredients} />

              <ProductionPackagings packagings={production.packagings} />

              <ProductionItems items={production.items} />
            </View>
          ))
        )}
      </ReportCard>
    </View>
  );
}

function ProductionIngredients({
  ingredients,
}: {
  ingredients: ProductionReport["rows"][number]["ingredients"];
}) {
  if (ingredients.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Matières utilisées</Text>

      {ingredients.map((ingredient) => (
        <View key={ingredient.ingredientId} style={styles.detailRow}>
          <Text style={styles.detailName} numberOfLines={1}>
            {ingredient.name}
          </Text>

          <Text style={styles.detailValue}>
            {formatNumber(ingredient.quantityUsed)} {ingredient.unit}
          </Text>
        </View>
      ))}
    </View>
  );
}

function ProductionPackagings({
  packagings,
}: {
  packagings: ProductionReport["rows"][number]["packagings"];
}) {
  if (packagings.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Emballages utilisés</Text>

      {packagings.map((packaging) => (
        <View key={packaging.packagingId} style={styles.detailRow}>
          <Text style={styles.detailName} numberOfLines={1}>
            {packaging.name}
          </Text>

          <Text style={styles.detailValue}>
            {formatNumber(packaging.quantityUsed)} ×{" "}
            {formatNumber(packaging.capacityMl)} ml
          </Text>
        </View>
      ))}
    </View>
  );
}

function ProductionItems({
  items,
}: {
  items: ProductionReport["rows"][number]["items"];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Produits fabriqués</Text>

      {items.map((item) => (
        <View key={item.id} style={styles.productRow}>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>
              {item.productName}
            </Text>

            <Text style={styles.productMeta}>
              {item.size} · {item.sku}
            </Text>
          </View>

          <View style={styles.productRight}>
            <Text style={styles.productQuantity}>
              ×{formatNumber(item.quantityProduced)}
            </Text>

            <Text style={styles.expiry}>
              Expire le {formatDate(item.expiresAt)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name="file-document-outline"
        size={28}
        color={COLORS.Gray}
      />

      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },

  production: {
    paddingVertical: 4,
  },

  productionBorder: {
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },

  productionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  productionIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.neutral,
    marginRight: 10,
  },

  productionInfo: {
    flex: 1,
    minWidth: 0,
  },

  productionDate: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  productionVolume: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.Gray,
  },

  section: {
    marginTop: 10,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },

  sectionTitle: {
    marginBottom: 7,
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.text,
  },

  detailRow: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  detailName: {
    flex: 1,
    paddingRight: 10,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: COLORS.Gray,
  },

  detailValue: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: COLORS.text,
  },

  productRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },

  productInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },

  productName: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
  },

  productMeta: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  productRight: {
    alignItems: "flex-end",
  },

  productQuantity: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: COLORS.success,
  },

  expiry: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

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
