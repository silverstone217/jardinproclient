import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Customer } from "@/types/customer";
import { COLORS, fonts } from "@/utils/styles";

interface CustomerCardProps {
  customer: Customer;
  disabled?: boolean;
  pointOfSaleId: string;
}

const formatAmount = (amount: number): string => {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} FC`;
};

const formatDate = (date: string | null): string => {
  if (!date) {
    return "Aucun achat";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date inconnue";
  }

  return parsedDate.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name: string | null, phone: string): string => {
  const cleanName = name?.trim();

  if (cleanName) {
    const parts = cleanName.split(/\s+/).filter(Boolean).slice(0, 2);

    const initials = parts.map((part) => part.charAt(0).toUpperCase()).join("");

    if (initials) {
      return initials;
    }
  }

  return phone.slice(-2);
};

export function CustomerCard({
  customer,
  pointOfSaleId,
  disabled = false,
}: CustomerCardProps) {
  const initials = getInitials(customer.name, customer.phone);

  const handlePress = () => {
    if (disabled) {
      return;
    }

    if (!pointOfSaleId) {
      console.warn("Impossible d'ouvrir le client : POS manquant.");
      return;
    }

    router.push({
      pathname: "/settings/customer/[clientId]",
      params: {
        clientId: customer.id,
        pointOfSaleId,
      },
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        disabled && styles.cardDisabled,
        pressed && !disabled && styles.cardPressed,
      ]}
      onPress={handlePress}
      disabled={disabled}
    >
      {/* ================================================== */}
      {/* HEADER                                             */}
      {/* ================================================== */}

      <View style={styles.header}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={styles.identityContent}>
            <Text style={styles.name} numberOfLines={1}>
              {customer.name?.trim() || "Client sans nom"}
            </Text>

            <View style={styles.phoneRow}>
              <Ionicons name="call-outline" size={12} color={COLORS.Gray} />

              <Text style={styles.phone} numberOfLines={1}>
                {customer.phone}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.chevron}>
          <Ionicons name="chevron-forward" size={17} color={COLORS.Gray} />
        </View>
      </View>

      {/* ================================================== */}
      {/* SEPARATOR                                          */}
      {/* ================================================== */}

      <View style={styles.separator} />

      {/* ================================================== */}
      {/* STATS                                              */}
      {/* ================================================== */}

      <View style={styles.stats}>
        <View style={styles.stat}>
          <View style={[styles.statIcon, styles.spentIcon]}>
            <Ionicons name="wallet-outline" size={15} color={COLORS.primary} />
          </View>

          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Dépensé</Text>

            <Text style={styles.statValue} numberOfLines={1}>
              {formatAmount(customer.totalSpent)}
            </Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.stat}>
          <View style={[styles.statIcon, styles.purchaseIcon]}>
            <Ionicons name="bag-handle-outline" size={15} color="#3478C5" />
          </View>

          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Achats</Text>

            <Text style={styles.statValue}>{customer.purchaseCount}</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.stat}>
          <View style={[styles.statIcon, styles.pointsIcon]}>
            <Ionicons name="star-outline" size={15} color={COLORS.secondary} />
          </View>

          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Points</Text>

            <Text style={styles.statValue}>{customer.loyaltyPoints}</Text>
          </View>
        </View>
      </View>

      {/* ================================================== */}
      {/* FOOTER                                             */}
      {/* ================================================== */}

      <View style={styles.footer}>
        <View style={styles.lastPurchase}>
          <Ionicons name="time-outline" size={13} color={COLORS.Gray} />

          <Text style={styles.lastPurchaseText}>Dernier achat</Text>

          <Text style={styles.lastPurchaseDate} numberOfLines={1}>
            {formatDate(customer.lastPurchaseAt)}
          </Text>
        </View>

        <View style={styles.posBadge}>
          <Ionicons
            name="storefront-outline"
            size={12}
            color={COLORS.primary}
          />

          <Text style={styles.posBadgeText} numberOfLines={1}>
            {customer.pointOfSale?.code ?? "PDV"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // ==========================================================
  // CARD
  // ==========================================================

  card: {
    marginBottom: 11,
    padding: 15,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  cardDisabled: {
    opacity: 0.55,
  },

  cardPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.995,
      },
    ],
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  identity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
    borderWidth: 1,
    borderColor: "#DCE9D8",
  },

  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: COLORS.primary,
  },

  identityContent: {
    flex: 1,
    marginLeft: 11,
  },

  name: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },

  phone: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.Gray,
  },

  chevron: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F7F5",
  },

  // ==========================================================
  // SEPARATOR
  // ==========================================================

  separator: {
    height: 1,
    marginVertical: 13,
    backgroundColor: "#F0F0ED",
  },

  // ==========================================================
  // STATS
  // ==========================================================

  stats: {
    flexDirection: "row",
    alignItems: "center",
  },

  stat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  statIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  spentIcon: {
    backgroundColor: "#EDF4EB",
  },

  purchaseIcon: {
    backgroundColor: "#EAF2FB",
  },

  pointsIcon: {
    backgroundColor: "#FFF3DE",
  },

  statContent: {
    flex: 1,
    marginLeft: 7,
    minWidth: 0,
  },

  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  statValue: {
    marginTop: 2,
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.text,
  },

  statDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 8,
    backgroundColor: "#EEEEEB",
  },

  // ==========================================================
  // FOOTER
  // ==========================================================

  footer: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  lastPurchase: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
    gap: 4,
  },

  lastPurchaseText: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  lastPurchaseDate: {
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: COLORS.darkGray,
  },

  posBadge: {
    maxWidth: 90,
    minHeight: 24,
    paddingHorizontal: 7,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F1F6EF",
  },

  posBadgeText: {
    flexShrink: 1,
    fontFamily: fonts.semibold,
    fontSize: 8,
    color: COLORS.primary,
  },
});
