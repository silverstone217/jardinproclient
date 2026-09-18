import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { LossItem, LossPagination } from "@/types/loss";
import type { ReactNode } from "react";

import { COLORS, fonts } from "@/utils/styles";
import { LossHistoryCard } from "./LossHistoryCard";

interface LossHistoryProps {
  items: LossItem[];
  pagination: LossPagination;

  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;

  onRefresh: () => void;
  onLoadMore: () => void;

  /**
   * Contenu affiché avant l'historique
   * dans la FlatList.
   */
  header?: ReactNode;
}

export function LossHistory({
  items,
  pagination,
  isLoading,
  isRefreshing,
  isLoadingMore,
  onRefresh,
  onLoadMore,
  header,
}: LossHistoryProps) {
  // ============================================================
  // PAGINATION
  // ============================================================

  const handleEndReached = () => {
    if (
      isLoading ||
      isRefreshing ||
      isLoadingMore ||
      !pagination.hasMore ||
      items.length === 0
    ) {
      return;
    }

    onLoadMore();
  };

  // ============================================================
  // ITEM
  // ============================================================

  const renderItem = ({ item }: { item: LossItem }) => {
    return <LossHistoryCard item={item} />;
  };

  // ============================================================
  // HEADER HISTORIQUE
  // ============================================================

  const renderHistoryHeader = () => {
    return (
      <View style={styles.historyHeader}>
        <View style={styles.titleRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="time-outline" size={17} color={COLORS.primary} />
          </View>

          <View style={styles.titleContent}>
            <Text style={styles.title}>Historique</Text>

            <Text style={styles.subtitle}>
              Les pertes enregistrées récemment.
            </Text>
          </View>

          {pagination.total > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{pagination.total}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // ============================================================
  // EMPTY
  // ============================================================

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />

          <Text style={styles.loadingText}>Chargement de l'historique...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="archive-outline" size={24} color={COLORS.Gray} />
        </View>

        <Text style={styles.emptyTitle}>Aucune perte enregistrée</Text>

        <Text style={styles.emptyText}>
          Les pertes que vous enregistrerez apparaîtront ici.
        </Text>
      </View>
    );
  };

  // ============================================================
  // FOOTER
  // ============================================================

  const renderFooter = () => {
    if (!isLoadingMore) {
      return null;
    }

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={COLORS.primary} />

        <Text style={styles.footerText}>Chargement...</Text>
      </View>
    );
  };

  // ============================================================
  // RENDU
  // ============================================================

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.listContent,
          items.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.35}
        ListHeaderComponent={
          <>
            {header}

            {renderHistoryHeader()}
          </>
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 120,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  // ==========================================================
  // HISTORIQUE HEADER
  // ==========================================================

  historyHeader: {
    marginTop: 18,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  titleContent: {
    flex: 1,
    marginLeft: 10,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  countBadge: {
    minWidth: 27,
    height: 25,
    paddingHorizontal: 7,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F6F0",
  },

  countText: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    color: COLORS.primary,
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loadingContainer: {
    minHeight: 150,
    alignItems: "center",
    justifyContent: "center",
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

  emptyContainer: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F1EE",
  },

  emptyTitle: {
    marginTop: 12,
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
    textAlign: "center",
  },

  emptyText: {
    maxWidth: 260,
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
    textAlign: "center",
  },

  // ==========================================================
  // FOOTER
  // ==========================================================

  footer: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  footerText: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },
});
