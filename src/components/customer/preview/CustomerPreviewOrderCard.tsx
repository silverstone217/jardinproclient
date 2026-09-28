import { Ionicons } from "@expo/vector-icons";
import { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, fonts, fontSizes, SETTINGS_COLORS } from "@/utils/styles";

import type { CustomerPreviewHistoryItem } from "./CustomerPreviewHistory";

interface CustomerPreviewOrderCardProps {
  invoice: CustomerPreviewHistoryItem;
  onPress?: () => void;
}

const CustomerPreviewOrderCard = memo(
  ({ invoice, onPress }: CustomerPreviewOrderCardProps) => {
    const formattedDate = useMemo(() => {
      const date =
        invoice.createdAt instanceof Date
          ? invoice.createdAt
          : new Date(invoice.createdAt);

      if (Number.isNaN(date.getTime())) {
        return "Date inconnue";
      }

      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }, [invoice.createdAt]);

    const formattedTotal = useMemo(() => {
      const amount = Number(invoice.totalAmount);

      if (!Number.isFinite(amount)) {
        return "0";
      }

      return new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: 0,
      }).format(amount);
    }, [invoice.totalAmount]);

    const itemsSummary = useMemo(() => {
      if (!invoice.items.length) {
        return "Aucun article";
      }

      const firstItems = invoice.items.slice(0, 2).map((item) => {
        const quantity = Math.max(0, Number(item.quantity) || 0);

        return `${item.productName} × ${quantity}`;
      });

      const remaining = invoice.items.length - firstItems.length;

      if (remaining > 0) {
        return `${firstItems.join(", ")} +${remaining}`;
      }

      return firstItems.join(", ");
    }, [invoice.items]);

    const content = (
      <>
        <View style={styles.topRow}>
          <View style={styles.invoiceInfo}>
            <View style={styles.invoiceIcon}>
              <Ionicons
                name="receipt-outline"
                size={18}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.invoiceDetails}>
              <Text style={styles.invoiceNumber} numberOfLines={1}>
                {invoice.invoiceNumber}
              </Text>

              <Text style={styles.date} numberOfLines={1}>
                {formattedDate}
              </Text>
            </View>
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.total} numberOfLines={1} adjustsFontSizeToFit>
              {formattedTotal}
            </Text>

            <Text style={styles.currency}>{invoice.currency}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.middleRow}>
          <View style={styles.detailRow}>
            <Ionicons name="bag-outline" size={15} color={COLORS.Gray} />

            <Text style={styles.detailText} numberOfLines={1}>
              {itemsSummary}
            </Text>
          </View>

          {invoice.pointOfSaleName && (
            <View style={styles.posBadge}>
              <Ionicons
                name="storefront-outline"
                size={13}
                color={SETTINGS_COLORS.customers.icon}
              />

              <Text style={styles.posText} numberOfLines={1}>
                {invoice.pointOfSaleName}
              </Text>
            </View>
          )}
        </View>
      </>
    );

    if (!onPress) {
      return <View style={styles.card}>{content}</View>;
    }

    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        accessibilityRole="button"
        accessibilityLabel={`Facture ${invoice.invoiceNumber}`}
      >
        {content}

        <View style={styles.chevron}>
          <Ionicons name="chevron-forward" size={17} color={COLORS.Gray} />
        </View>
      </Pressable>
    );
  },
);

CustomerPreviewOrderCard.displayName = "CustomerPreviewOrderCard";

export default CustomerPreviewOrderCard;

const styles = StyleSheet.create({
  card: {
    position: "relative",
    padding: 14,
    paddingRight: 42,
    borderRadius: 14,
    backgroundColor: COLORS.neutral,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },

  cardPressed: {
    opacity: 0.7,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  invoiceInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  invoiceIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SETTINGS_COLORS.customers.background,
    marginRight: 10,
  },

  invoiceDetails: {
    flex: 1,
    minWidth: 0,
  },

  invoiceNumber: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.medium,
    lineHeight: fontSizes.medium * 1.25,
    color: COLORS.text,
  },

  date: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: COLORS.Gray,
    marginTop: 2,
  },

  totalContainer: {
    alignItems: "flex-end",
    marginLeft: 10,
  },

  total: {
    maxWidth: 105,
    fontFamily: fonts.bold,
    fontSize: fontSizes.medium,
    lineHeight: fontSizes.medium * 1.25,
    color: COLORS.primary,
  },

  currency: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: COLORS.Gray,
    marginTop: 1,
  },

  separator: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 12,
  },

  middleRow: {
    gap: 8,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  detailText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: COLORS.darkGray,
    marginLeft: 7,
  },

  posBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: SETTINGS_COLORS.customers.background,
  },

  posText: {
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: SETTINGS_COLORS.customers.icon,
    marginLeft: 5,
  },

  chevron: {
    position: "absolute",
    right: 13,
    top: "50%",
    marginTop: -9,
  },
});
