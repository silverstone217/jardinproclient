import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { PendingLossItem } from "@/types/loss";

import { COLORS, fonts } from "@/utils/styles";

interface LossPendingCardProps {
  item: PendingLossItem;
  onPress: () => void;
}

export function LossPendingCard({ item, onPress }: LossPendingCardProps) {
  const productName = item.variant.product.name;

  const packagingName = item.variant.packaging.name;

  const locationName = item.pointOfSale?.name ?? "Boutique principale";

  const formattedExpiration = item.expiresAt
    ? new Date(item.expiresAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Date inconnue";

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.productIcon}>
          <Ionicons name="flask-outline" size={19} color={COLORS.primary} />
        </View>

        <View style={styles.productContent}>
          <Text style={styles.productName} numberOfLines={1}>
            {productName}
          </Text>

          <Text style={styles.packaging} numberOfLines={1}>
            {packagingName} · {item.variant.sku}
          </Text>
        </View>

        <View style={styles.expiredBadge}>
          <Ionicons
            name="alert-circle-outline"
            size={12}
            color={COLORS.error}
          />

          <Text style={styles.expiredText}>Expiré</Text>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="location-outline"
              size={14}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Emplacement</Text>

            <Text style={styles.infoValue} numberOfLines={1}>
              {locationName}
            </Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <View style={[styles.infoIcon, styles.quantityIcon]}>
            <Ionicons name="cube-outline" size={14} color={COLORS.secondary} />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Quantité restante</Text>

            <Text style={styles.quantityValue}>
              {item.remainingQuantity} unité
              {item.remainingQuantity > 1 ? "s" : ""}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.expirationRow}>
        <Ionicons name="calendar-outline" size={14} color={COLORS.error} />

        <Text style={styles.expirationLabel}>Expiration :</Text>

        <Text style={styles.expirationValue}>{formattedExpiration}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.actionButton,
          pressed && styles.pressed,
        ]}
        onPress={onPress}
        hitSlop={4}
      >
        <Ionicons name="trash-outline" size={16} color={COLORS.white} />

        <Text style={styles.actionText}>Marquer comme perte</Text>

        <Ionicons name="chevron-forward" size={15} color={COLORS.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 13,
    borderRadius: 17,
    backgroundColor: "#FFFBFB",
    borderWidth: 1,
    borderColor: "#F1DCDC",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  productContent: {
    flex: 1,
    marginLeft: 10,
    paddingRight: 8,
  },

  productName: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
  },

  packaging: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  expiredBadge: {
    height: 25,
    paddingHorizontal: 7,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#FDECEC",
  },

  expiredText: {
    fontFamily: fonts.semibold,
    fontSize: 8.5,
    color: COLORS.error,
  },

  infoGrid: {
    flexDirection: "row",
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F2E8E8",
  },

  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF5EC",
  },

  quantityIcon: {
    backgroundColor: "#FFF3DF",
  },

  infoContent: {
    flex: 1,
    marginLeft: 7,
  },

  infoLabel: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  infoValue: {
    marginTop: 2,
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: COLORS.text,
  },

  quantityValue: {
    marginTop: 2,
    fontFamily: fonts.bold,
    fontSize: 10,
    color: COLORS.secondary,
  },

  expirationRow: {
    minHeight: 32,
    marginTop: 10,
    paddingHorizontal: 9,
    borderRadius: 9,
    backgroundColor: "#FFF1F1",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  expirationLabel: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  expirationValue: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: COLORS.error,
  },

  actionButton: {
    minHeight: 40,
    marginTop: 10,
    paddingHorizontal: 12,
    borderRadius: 11,
    backgroundColor: COLORS.error,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  actionText: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.white,
  },

  pressed: {
    opacity: 0.7,
  },
});
