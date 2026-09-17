import type { ReactElement } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { StockProductCard } from "@/components/stock/StockProductCard";

import { COLORS, fonts } from "@/utils/styles";

type StockItem =
  | StockTypes.RawIngredient
  | StockTypes.Packaging
  | StockTypes.FinishedProduct;

interface StockProductListProps {
  items: StockItem[];

  category: StockTypes.Category | null;

  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;

  hasNextPage: boolean;

  error: string | null;

  onRefresh: () => Promise<void> | void;

  onLoadMore: () => Promise<void> | void;

  onItemPress?: (item: StockItem) => void;

  listHeaderComponent?: ReactElement | null;
}

export function StockProductList({
  items,
  category,
  isLoading,
  isRefreshing,
  isLoadingMore,
  hasNextPage,
  error,
  onRefresh,
  onLoadMore,
  onItemPress,
  listHeaderComponent,
}: StockProductListProps) {
  // ============================================================
  // KEY
  // ============================================================

  const getItemKey = (item: StockItem): string => {
    if ("variantId" in item) {
      return `finished-${item.variantId}`;
    }

    if ("capacityMl" in item && "size" in item) {
      return `packaging-${item.id}`;
    }

    return `ingredient-${item.id}`;
  };

  // ============================================================
  // ITEM
  // ============================================================

  const renderItem = ({ item }: ListRenderItemInfo<StockItem>) => {
    return (
      <StockProductCard
        item={item}
        onPress={onItemPress ? () => onItemPress(item) : undefined}
      />
    );
  };

  // ============================================================
  // EMPTY
  // ============================================================

  const getEmptyState = () => {
    switch (category) {
      case "RAW_INGREDIENT":
        return {
          title: "Aucune matière première",
          description:
            "Aucune matière première ne correspond aux critères actuels.",
          icon: "leaf",
        };

      case "PACKAGING":
        return {
          title: "Aucun emballage",
          description: "Aucun emballage ne correspond aux critères actuels.",
          icon: "cube",
        };

      case "FINISHED_PRODUCT":
        return {
          title: "Aucun produit fini",
          description: "Aucun produit fini ne correspond aux critères actuels.",
          icon: "bottle",
        };

      default:
        return {
          title: "Aucun stock",
          description: "Aucun élément ne correspond aux critères actuels.",
          icon: "stock",
        };
    }
  };

  const renderEmpty = () => {
    if (isLoading || error || items.length > 0) {
      return null;
    }

    const emptyState = getEmptyState();

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>
            {emptyState.icon === "leaf"
              ? "🍃"
              : emptyState.icon === "cube"
                ? "□"
                : emptyState.icon === "bottle"
                  ? "◫"
                  : "—"}
          </Text>
        </View>

        <Text style={styles.emptyTitle}>{emptyState.title}</Text>

        <Text style={styles.emptyDescription}>{emptyState.description}</Text>
      </View>
    );
  };

  // ============================================================
  // ERROR
  // ============================================================

  const renderError = () => {
    if (!error || items.length > 0) {
      return null;
    }

    return (
      <View style={styles.stateContainer}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>!</Text>
        </View>

        <Text style={styles.stateTitle}>Impossible de charger le stock</Text>

        <Text style={styles.stateDescription}>{error}</Text>
      </View>
    );
  };

  // ============================================================
  // FOOTER
  // ============================================================

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color={COLORS.primary} />

          <Text style={styles.loadingMoreText}>Chargement de la suite...</Text>
        </View>
      );
    }

    // Toujours conserver un espace
    // pour le Bottom Bar.
    return <View style={styles.bottomSpacer} />;
  };

  // ============================================================
  // LOADING INITIAL
  // ============================================================

  if (isLoading && items.length === 0) {
    return (
      <View style={styles.container}>
        {listHeaderComponent}

        <View style={styles.initialLoading}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>

          <Text style={styles.initialLoadingTitle}>Chargement du stock</Text>

          <Text style={styles.initialLoadingDescription}>
            Récupération des quantités disponibles...
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </View>
    );
  }

  // ============================================================
  // ERROR INITIAL
  // ============================================================

  if (error && items.length === 0) {
    return (
      <View style={styles.container}>
        {listHeaderComponent}

        {renderError()}

        <View style={styles.bottomSpacer} />
      </View>
    );
  }

  // ============================================================
  // LISTE
  // ============================================================

  return (
    <View style={styles.container}>
      <FlatList<StockItem>
        data={items}
        keyExtractor={getItemKey}
        renderItem={renderItem}
        ListHeaderComponent={
          listHeaderComponent ? () => listHeaderComponent : undefined
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.contentContainer,
          items.length === 0 && styles.emptyContentContainer,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        onEndReached={() => {
          if (!hasNextPage || isLoadingMore || isLoading) {
            return;
          }

          onLoadMore();
        }}
        onEndReachedThreshold={0.35}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ==========================================================
  // LIST
  // ==========================================================

  contentContainer: {
    paddingBottom: 0,
  },

  emptyContentContainer: {
    flexGrow: 1,
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyContainer: {
    minHeight: 190,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0ED",
  },

  emptyIconText: {
    fontSize: 22,
  },

  emptyTitle: {
    marginTop: 13,
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
    textAlign: "center",
  },

  emptyDescription: {
    marginTop: 5,
    maxWidth: 300,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
    textAlign: "center",
  },

  // ==========================================================
  // ERROR
  // ==========================================================

  stateContainer: {
    minHeight: 190,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  errorIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDECEC",
  },

  errorIconText: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: COLORS.error,
  },

  stateTitle: {
    marginTop: 13,
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
    textAlign: "center",
  },

  stateDescription: {
    marginTop: 5,
    maxWidth: 300,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
    textAlign: "center",
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  initialLoading: {
    minHeight: 190,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  initialLoadingTitle: {
    marginTop: 13,
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
  },

  initialLoadingDescription: {
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
    textAlign: "center",
  },

  // ==========================================================
  // FOOTER
  // ==========================================================

  loadingMore: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  loadingMoreText: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  bottomSpacer: {
    height: 110,
  },
});
