import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { PendingLossItem } from "@/types/loss";
import { COLORS, fonts } from "@/utils/styles";

interface LossPendingSectionProps {
  items: PendingLossItem[];
  isLoading: boolean;
  isProcessingExpired: boolean;
  onProcessAll: () => void;
  onSelect: (item: PendingLossItem) => void;
}

export function LossPendingSection({
  items,
  isLoading,
  isProcessingExpired,
  onProcessAll,
  onSelect,
}: LossPendingSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="time-outline" size={17} color={COLORS.warning} />
            </View>

            <Text style={styles.title}>À traiter</Text>

            {!isLoading && items.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{items.length}</Text>
              </View>
            )}
          </View>

          <Text style={styles.subtitle}>
            Produits arrivés à expiration et encore présents en stock.
          </Text>
        </View>

        {!isLoading && items.length > 0 && (
          <Pressable
            style={({ pressed }) => [
              styles.processAllButton,
              pressed && styles.pressed,
            ]}
            onPress={onProcessAll}
            disabled={isProcessingExpired}
            hitSlop={6}
          >
            {isProcessingExpired ? (
              <ActivityIndicator size="small" color={COLORS.error} />
            ) : (
              <Ionicons
                name="checkmark-done-outline"
                size={16}
                color={COLORS.error}
              />
            )}

            <Text style={styles.processAllText}>
              {isProcessingExpired ? "Traitement..." : "Tout traiter"}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />

            <Text style={styles.loadingText}>
              Vérification des produits expirés...
            </Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color={COLORS.success}
              />
            </View>

            <View style={styles.emptyContent}>
              <Text style={styles.emptyTitle}>Rien à traiter</Text>

              <Text style={styles.emptyText}>
                Aucun produit expiré ne nécessite actuellement une intervention.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.list}>
            {items.map((item) => (
              <View key={item.id} style={styles.cardWrapper}>
                <PendingLossCard item={item} onPress={() => onSelect(item)} />
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

interface PendingLossCardProps {
  item: PendingLossItem;
  onPress: () => void;
}

/**
 * Import local différé pour éviter de créer une logique
 * supplémentaire dans la section.
 */
function PendingLossCard({ item, onPress }: PendingLossCardProps) {
  const { LossPendingCard } =
    require("./LossPendingCard") as typeof import("./LossPendingCard");

  return <LossPendingCard item={item} onPress={onPress} />;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    padding: 16,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0ED",
  },

  headerContent: {
    flex: 1,
    paddingRight: 10,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF4D9",
  },

  title: {
    marginLeft: 9,
    fontFamily: fonts.bold,
    fontSize: 14,
    color: COLORS.text,
  },

  countBadge: {
    minWidth: 23,
    height: 23,
    marginLeft: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDECEC",
  },

  countText: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    color: COLORS.error,
  },

  subtitle: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.Gray,
  },

  processAllButton: {
    minHeight: 34,
    paddingHorizontal: 9,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#FDECEC",
  },

  processAllText: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: COLORS.error,
  },

  content: {
    paddingTop: 14,
  },

  loadingContainer: {
    minHeight: 70,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  emptyContainer: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 72,
    padding: 11,
    borderRadius: 15,
    backgroundColor: "#F6FAF4",
    borderWidth: 1,
    borderColor: "#E3EEDF",
  },

  emptyIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  emptyContent: {
    flex: 1,
    marginLeft: 10,
  },

  emptyTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.text,
  },

  emptyText: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  list: {
    gap: 10,
  },

  cardWrapper: {
    width: "100%",
  },

  pressed: {
    opacity: 0.6,
  },
});
