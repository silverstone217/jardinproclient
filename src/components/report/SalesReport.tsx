// src/components/report/SalesReport.tsx

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, View } from "react-native";

import type { SalesReport } from "@/types/report";

import { COLORS, fonts } from "@/utils/styles";

import { ReportCard } from "./ReportCard";
import { ReportSummary, type ReportSummaryItem } from "./ReportSummary";

interface SalesReportProps {
  report: SalesReport;
}

function formatAmount(value: number): string {
  return `${value.toLocaleString("fr-FR")} CDF`;
}

function formatNumber(value: number): string {
  return value.toLocaleString("fr-FR");
}

export function SalesReport({ report }: SalesReportProps) {
  const summaryItems: ReportSummaryItem[] = [
    {
      label: "Ventes",
      value: formatNumber(report.summary.totalSales),
      icon: "receipt-text-outline",
      color: COLORS.primary,
    },
    {
      label: "Quantité vendue",
      value: formatNumber(report.summary.totalQuantity),
      icon: "package-variant-closed",
      color: COLORS.info,
    },
    {
      label: "Chiffre d'affaires",
      value: formatAmount(report.summary.netAmount),
      icon: "cash-multiple",
      color: COLORS.success,
    },
    {
      label: "Remises",
      value: formatAmount(report.summary.discountAmount),
      icon: "tag-outline",
      color: COLORS.warning,
    },
  ];

  return (
    <View style={styles.container}>
      <ReportSummary items={summaryItems} />

      <ReportCard
        title="Paiements"
        description="Répartition des montants par mode de paiement."
        icon="cash-register"
      >
        {report.paymentTotals.length === 0 ? (
          <EmptyState text="Aucun paiement enregistré." />
        ) : (
          report.paymentTotals.map((payment, index) => (
            <View
              key={`${payment.paymentMethod}-${index}`}
              style={[
                styles.row,
                index < report.paymentTotals.length - 1 && styles.rowBorder,
              ]}
            >
              <Text style={styles.rowLabel}>{payment.paymentMethod}</Text>

              <Text style={styles.rowValue}>
                {formatAmount(payment.amount)}
              </Text>
            </View>
          ))
        )}
      </ReportCard>

      <ReportCard
        title="Ventes par point de vente"
        description="Vue globale des ventes de chaque point de vente."
        icon="storefront-outline"
      >
        {report.byPointOfSale.length === 0 ? (
          <EmptyState text="Aucune vente sur la période." />
        ) : (
          report.byPointOfSale.map((item, index) => (
            <View
              key={`${item.pointOfSaleId ?? "unknown"}-${index}`}
              style={[
                styles.posItem,
                index < report.byPointOfSale.length - 1 && styles.rowBorder,
              ]}
            >
              <View style={styles.posHeader}>
                <View style={styles.posIcon}>
                  <MaterialCommunityIcons
                    name="store-outline"
                    size={18}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.posInfo}>
                  <Text style={styles.posName} numberOfLines={1}>
                    {item.pointOfSaleName}
                  </Text>
                </View>

                <Text style={styles.posAmount}>
                  {formatAmount(item.netAmount)}
                </Text>
              </View>

              <View style={styles.posStats}>
                <Text style={styles.statText}>
                  {formatNumber(item.totalSales)} vente
                  {item.totalSales > 1 ? "s" : ""}
                </Text>

                <Text style={styles.statSeparator}>•</Text>

                <Text style={styles.statText}>
                  {formatNumber(item.totalQuantity)} produit
                  {item.totalQuantity > 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          ))
        )}
      </ReportCard>

      <ReportCard
        title="Détail des ventes"
        description="Produits vendus pendant la période sélectionnée."
        icon="format-list-bulleted"
      >
        {report.rows.length === 0 ? (
          <EmptyState text="Aucune vente enregistrée." />
        ) : (
          report.rows.map((row, index) => (
            <View
              key={`${row.pointOfSaleId ?? "unknown"}-${row.productName}-${row.size}-${index}`}
              style={[
                styles.saleRow,
                index < report.rows.length - 1 && styles.rowBorder,
              ]}
            >
              <View style={styles.saleInfo}>
                <Text style={styles.saleProduct} numberOfLines={1}>
                  {row.productName}
                </Text>

                <Text style={styles.saleMeta}>
                  {row.size} · {row.pointOfSaleName}
                </Text>
              </View>

              <View style={styles.saleRight}>
                <Text style={styles.saleQuantity}>
                  ×{formatNumber(row.quantity)}
                </Text>

                <Text style={styles.saleAmount}>
                  {formatAmount(row.netAmount)}
                </Text>
              </View>
            </View>
          ))
        )}
      </ReportCard>
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

  row: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },

  rowLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: COLORS.text,
    textTransform: "capitalize",
  },

  rowValue: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  posItem: {
    paddingVertical: 13,
  },

  posHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  posIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.neutral,
    marginRight: 10,
  },

  posInfo: {
    flex: 1,
    minWidth: 0,
  },

  posName: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  posAmount: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: COLORS.success,
  },

  posStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    marginLeft: 48,
  },

  statText: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.Gray,
  },

  statSeparator: {
    marginHorizontal: 6,
    fontFamily: fonts.medium,
    fontSize: 10,
    color: COLORS.lightGray,
  },

  saleRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  saleInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },

  saleProduct: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  saleMeta: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.Gray,
  },

  saleRight: {
    alignItems: "flex-end",
  },

  saleQuantity: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: COLORS.Gray,
  },

  saleAmount: {
    marginTop: 3,
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
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
