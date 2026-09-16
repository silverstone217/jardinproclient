import { Ionicons } from "@expo/vector-icons";

import { useMemo, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useProductionStore } from "@/store/production.store";

import type { Production } from "@/types/production";

import { COLORS, fonts } from "@/utils/styles";

interface ProductionHistoryProps {
  onProductionPress?: (production: Production) => void;
}

// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date inconnue";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

// ============================================================
// FORMAT HEURE
// ============================================================

const formatTime = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// ============================================================
// FORMAT VOLUME
// ============================================================

const formatVolume = (volumeMl: number): string => {
  if (volumeMl >= 1000) {
    const liters = volumeMl / 1000;

    return Number.isInteger(liters) ? `${liters} L` : `${liters.toFixed(1)} L`;
  }

  return `${volumeMl} ml`;
};

// ============================================================
// NOMBRE DE PRODUITS FINIS
// ============================================================

const getProductionBottleCount = (production: Production): number => {
  return production.items.reduce(
    (total, item) => total + item.quantityProduced,
    0,
  );
};

// ============================================================
// STATUT PRODUCTION
// ============================================================

const getProductionStatus = (production: Production) => {
  const now = Date.now();

  const hasExpiredItem = production.items.some((item) => {
    const expiresAt = new Date(item.expiresAt).getTime();

    return !Number.isNaN(expiresAt) && expiresAt < now;
  });

  if (hasExpiredItem) {
    return {
      label: "Expiration proche",
      icon: "time-outline" as const,
      color: COLORS.warning,
      background: "#FFF7E5",
    };
  }

  return {
    label: "Terminée",
    icon: "checkmark-circle-outline" as const,
    color: COLORS.success,
    background: "#EAF6EC",
  };
};

// ============================================================
// COMPONENT
// ============================================================

export function ProductionHistory({
  onProductionPress,
}: ProductionHistoryProps) {
  const { productions, isLoading, error } = useProductionStore();

  const [search, setSearch] = useState("");

  // ============================================================
  // FILTRE RECHERCHE
  // ============================================================

  const filteredProductions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return productions;
    }

    return productions.filter((production) => {
      const productNames = production.items
        .map((item) => item.variant.product.name)
        .join(" ")
        .toLowerCase();

      const managerName = production.manager.name.toLowerCase();

      const notes = production.notes?.toLowerCase() ?? "";

      return (
        productNames.includes(normalizedSearch) ||
        managerName.includes(normalizedSearch) ||
        notes.includes(normalizedSearch)
      );
    });
  }, [productions, search]);

  // ============================================================
  // RENDER PRODUCTION
  // ============================================================

  const renderProduction = ({ item }: { item: Production }) => {
    const status = getProductionStatus(item);

    const bottleCount = getProductionBottleCount(item);

    const firstProduct = item.items[0]?.variant.product.name ?? "Production";

    const productCount = new Set(
      item.items.map((productionItem) => productionItem.variant.productId),
    ).size;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.productionCard,
          pressed && styles.productionCardPressed,
        ]}
        onPress={() => onProductionPress?.(item)}
        disabled={!onProductionPress}
      >
        {/* ================================================== */}
        {/* HEADER                                             */}
        {/* ================================================== */}

        <View style={styles.productionCardTop}>
          <View style={styles.productionIcon}>
            <Ionicons name="flask-outline" size={19} color={COLORS.primary} />
          </View>

          <View style={styles.productionMain}>
            <Text style={styles.productionTitle} numberOfLines={1}>
              {firstProduct}

              {productCount > 1 ? ` + ${productCount - 1}` : ""}
            </Text>

            <Text style={styles.productionDate}>
              {formatDate(item.producedAt)} · {formatTime(item.producedAt)}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: status.background,
              },
            ]}
          >
            <Ionicons name={status.icon} size={13} color={status.color} />

            <Text
              style={[
                styles.statusText,
                {
                  color: status.color,
                },
              ]}
            >
              {status.label}
            </Text>
          </View>
        </View>

        {/* ================================================== */}
        {/* DIVIDER                                            */}
        {/* ================================================== */}

        <View style={styles.divider} />

        {/* ================================================== */}
        {/* STATS                                              */}
        {/* ================================================== */}

        <View style={styles.productionStats}>
          {/* VOLUME */}

          <View style={styles.stat}>
            <Ionicons name="water-outline" size={15} color={COLORS.info} />

            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Volume</Text>

              <Text style={styles.statValue}>
                {formatVolume(item.totalVolumeMl)}
              </Text>
            </View>
          </View>

          {/* JUS PRODUITS */}

          <View style={styles.stat}>
            <Ionicons name="wine-outline" size={15} color={COLORS.secondary} />

            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Jus produits</Text>

              <Text style={styles.statValue}>{bottleCount}</Text>
            </View>
          </View>

          {/* EMPLACEMENT */}

          <View style={styles.stat}>
            <Ionicons
              name="business-outline"
              size={15}
              color={COLORS.primary}
            />

            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Emplacement</Text>

              <Text style={styles.statValue} numberOfLines={1}>
                Boutique principale
              </Text>
            </View>
          </View>
        </View>

        {/* ================================================== */}
        {/* NOTES                                              */}
        {/* ================================================== */}

        {item.notes ? (
          <View style={styles.notes}>
            <Ionicons
              name="document-text-outline"
              size={14}
              color={COLORS.Gray}
            />

            <Text style={styles.notesText} numberOfLines={2}>
              {item.notes}
            </Text>
          </View>
        ) : null}

        {/* ================================================== */}
        {/* FOOTER                                             */}
        {/* ================================================== */}

        {onProductionPress ? (
          <View style={styles.detailsFooter}>
            <Text style={styles.detailsText}>Voir les détails</Text>

            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
          </View>
        ) : null}
      </Pressable>
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading && productions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <View style={styles.titleRow}>
              <View style={styles.headerIcon}>
                <Ionicons
                  name="time-outline"
                  size={17}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.title}>Historique</Text>
            </View>

            <Text style={styles.subtitle}>Vos productions récentes</Text>
          </View>
        </View>

        <View style={styles.loading}>
          <ActivityIndicator size="small" color={COLORS.primary} />

          <Text style={styles.loadingText}>Chargement des productions...</Text>
        </View>
      </View>
    );
  }

  // ============================================================
  // VIEW
  // ============================================================

  return (
    <View style={styles.container}>
      {/* ================================================== */}
      {/* HEADER                                             */}
      {/* ================================================== */}

      <View style={styles.header}>
        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <View style={styles.headerIcon}>
              <Ionicons name="time-outline" size={17} color={COLORS.primary} />
            </View>

            <Text style={styles.title}>Historique</Text>
          </View>

          <Text style={styles.subtitle}>
            Consultez les productions enregistrées
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{productions.length}</Text>
        </View>
      </View>

      {/* ================================================== */}
      {/* SEARCH                                             */}
      {/* ================================================== */}

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={COLORS.Gray} />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher une production..."
          placeholderTextColor={COLORS.Gray}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />

        {search.length > 0 ? (
          <Pressable onPress={() => setSearch("")} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={COLORS.Gray} />
          </Pressable>
        ) : null}
      </View>

      {/* ================================================== */}
      {/* ERROR                                             */}
      {/* ================================================== */}

      {error && productions.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={28}
              color={COLORS.error}
            />
          </View>

          <Text style={styles.emptyTitle}>Impossible de charger</Text>

          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : filteredProductions.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name={search.trim() ? "search-outline" : "flask-outline"}
              size={28}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>
            {search.trim() ? "Aucun résultat" : "Aucune production"}
          </Text>

          <Text style={styles.emptyText}>
            {search.trim()
              ? "Aucune production ne correspond à votre recherche."
              : "Les productions enregistrées apparaîtront ici."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProductions}
          keyExtractor={(item) => item.id}
          renderItem={renderProduction}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        />
      )}
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  headerText: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
    marginRight: 9,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.Gray,
  },

  countBadge: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  countText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: COLORS.primary,
  },

  // ==========================================================
  // SEARCH
  // ==========================================================

  searchContainer: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E7E7E3",
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 8,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: COLORS.text,
  },

  // ==========================================================
  // LIST
  // ==========================================================

  listContent: {
    paddingTop: 12,
  },

  listSeparator: {
    height: 10,
  },

  productionCard: {
    padding: 15,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  productionCardPressed: {
    opacity: 0.72,
  },

  productionCardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  productionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  productionMain: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },

  productionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: COLORS.text,
  },

  productionDate: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  statusBadge: {
    minHeight: 27,
    paddingHorizontal: 8,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  statusText: {
    fontFamily: fonts.semibold,
    fontSize: 8.5,
  },

  divider: {
    height: 1,
    marginVertical: 13,
    backgroundColor: "#F0F0ED",
  },

  // ==========================================================
  // STATS
  // ==========================================================

  productionStats: {
    flexDirection: "row",
    alignItems: "center",
  },

  stat: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  statContent: {
    flex: 1,
    marginLeft: 6,
  },

  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  statValue: {
    marginTop: 2,
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: COLORS.text,
  },

  // ==========================================================
  // NOTES
  // ==========================================================

  notes: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0ED",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  notesText: {
    flex: 1,
    marginLeft: 6,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.darkGray,
  },

  // ==========================================================
  // FOOTER
  // ==========================================================

  detailsFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0ED",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  detailsText: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: COLORS.primary,
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loading: {
    minHeight: 130,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  loadingText: {
    marginTop: 9,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyState: {
    marginTop: 12,
    minHeight: 190,
    paddingHorizontal: 25,
    paddingVertical: 25,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  emptyTitle: {
    marginTop: 12,
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: COLORS.text,
    textAlign: "center",
  },

  emptyText: {
    maxWidth: 280,
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.Gray,
    textAlign: "center",
  },
});
