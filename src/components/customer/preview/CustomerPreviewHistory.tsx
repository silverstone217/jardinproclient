import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { CustomerInvoice } from "@/types/customer";
import { COLORS, fonts, fontSizes, SETTINGS_COLORS } from "@/utils/styles";

import CustomerPreviewOrderCard from "./CustomerPreviewOrderCard";

interface CustomerPreviewHistoryProps {
  invoices: CustomerInvoice[];
  onInvoicePress?: (invoice: CustomerInvoice) => void;
  onSeeMore?: () => void;
  hasMore?: boolean;
}

const CustomerPreviewHistory = memo(
  ({
    invoices,
    onInvoicePress,
    onSeeMore,
    hasMore = false,
  }: CustomerPreviewHistoryProps) => {
    return (
      <View style={styles.container}>
        {/* ============================================================
            HEADER
        ============================================================ */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="receipt-outline"
              size={18}
              color={SETTINGS_COLORS.customers.icon}
            />
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.title}>Historique des achats</Text>

            <Text style={styles.subtitle}>
              Les dernières commandes du client
            </Text>
          </View>

          {invoices.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{invoices.length}</Text>
            </View>
          )}
        </View>

        {/* ============================================================
            ÉTAT VIDE
        ============================================================ */}
        {invoices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="receipt-outline"
                size={22}
                color={SETTINGS_COLORS.customers.icon}
              />
            </View>

            <View style={styles.emptyContent}>
              <Text style={styles.emptyTitle}>Aucun achat</Text>

              <Text style={styles.emptyText}>
                Aucun achat enregistré pour ce client dans le contexte
                sélectionné.
              </Text>
            </View>
          </View>
        ) : (
          <>
            {/* ========================================================
                LISTE DES FACTURES
            ======================================================== */}
            <View style={styles.historyList}>
              {invoices.map((invoice) => (
                <CustomerPreviewOrderCard
                  key={invoice.id}
                  invoice={invoice}
                  onPress={
                    onInvoicePress ? () => onInvoicePress(invoice) : undefined
                  }
                />
              ))}
            </View>

            {/* ========================================================
                VOIR PLUS
            ======================================================== */}
            {hasMore && onSeeMore && (
              <Pressable
                onPress={onSeeMore}
                style={({ pressed }) => [
                  styles.seeMoreButton,
                  pressed && styles.seeMoreButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Voir plus d'achats"
              >
                <Text style={styles.seeMoreText}>Voir plus d'achats</Text>

                <View style={styles.seeMoreIcon}>
                  <Ionicons
                    name="chevron-down"
                    size={15}
                    color={SETTINGS_COLORS.customers.icon}
                  />
                </View>
              </Pressable>
            )}
          </>
        )}
      </View>
    );
  },
);

CustomerPreviewHistory.displayName = "CustomerPreviewHistory";

export default CustomerPreviewHistory;

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
    backgroundColor: SETTINGS_COLORS.customers.background,
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

  countBadge: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 7,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SETTINGS_COLORS.customers.background,
  },

  countText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: SETTINGS_COLORS.customers.icon,
  },

  // ============================================================
  // HISTORY LIST
  // ============================================================

  historyList: {
    gap: 9,
    marginTop: 14,
  },

  // ============================================================
  // EMPTY
  // ============================================================

  emptyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    padding: 13,
    minHeight: 76,
    borderRadius: 15,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#EEEEEB",
  },

  emptyIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SETTINGS_COLORS.customers.background,
  },

  emptyContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  emptyTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: COLORS.text,
  },

  emptyText: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.35,
    color: COLORS.Gray,
  },

  // ============================================================
  // SEE MORE
  // ============================================================

  seeMoreButton: {
    minHeight: 42,
    marginTop: 10,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SETTINGS_COLORS.customers.background,
  },

  seeMoreButtonPressed: {
    opacity: 0.7,
  },

  seeMoreText: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: SETTINGS_COLORS.customers.icon,
  },

  seeMoreIcon: {
    width: 24,
    height: 24,
    marginLeft: 6,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
});
