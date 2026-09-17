import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { StockDetailLotCard } from "@/components/stock/detail/StockDetailLotCard";

import { COLORS, fonts } from "@/utils/styles";

interface StockDetailLotsProps {
  lots: StockTypes.Lot[];
}

export function StockDetailLots({ lots }: StockDetailLotsProps) {
  const activeLots = lots.filter(
    (lot) => !lot.isExpired && lot.remainingQuantity > 0,
  );

  const expiredLots = lots.filter(
    (lot) => lot.isExpired && lot.remainingQuantity > 0,
  );

  const emptyLots = lots.filter(
    (lot) => !lot.isExpired && lot.remainingQuantity <= 0,
  );

  if (lots.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={18}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.title}>Lots en stock</Text>

            <Text style={styles.subtitle}>
              Aucun lot disponible pour ce produit
            </Text>
          </View>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <MaterialCommunityIcons
              name="package-variant-remove"
              size={25}
              color={COLORS.Gray}
            />
          </View>

          <Text style={styles.emptyTitle}>Aucun lot</Text>

          <Text style={styles.emptyDescription}>
            Aucun lot de ce produit n'est actuellement enregistré dans cet
            emplacement.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ================================================== */}
      {/* HEADER                                             */}
      {/* ================================================== */}

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons
            name="package-variant-closed"
            size={18}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Lots en stock</Text>

            <View style={styles.countBadge}>
              <Text style={styles.countText}>{lots.length}</Text>
            </View>
          </View>

          <Text style={styles.subtitle}>
            Suivi des quantités et des expirations
          </Text>
        </View>
      </View>

      {/* ================================================== */}
      {/* ACTIVE LOTS                                        */}
      {/* ================================================== */}

      {activeLots.length > 0 && (
        <View style={styles.group}>
          <View style={styles.groupHeader}>
            <View style={[styles.groupDot, styles.activeDot]} />

            <Text style={styles.groupTitle}>Lots disponibles</Text>

            <Text style={styles.groupCount}>{activeLots.length}</Text>
          </View>

          {activeLots.map((lot) => (
            <StockDetailLotCard key={lot.id} lot={lot} />
          ))}
        </View>
      )}

      {/* ================================================== */}
      {/* EXPIRED LOTS                                       */}
      {/* ================================================== */}

      {expiredLots.length > 0 && (
        <View
          style={[styles.group, activeLots.length > 0 && styles.groupSeparated]}
        >
          <View style={styles.groupHeader}>
            <View style={[styles.groupDot, styles.expiredDot]} />

            <Text style={styles.groupTitle}>Lots expirés</Text>

            <Text style={[styles.groupCount, styles.expiredCount]}>
              {expiredLots.length}
            </Text>
          </View>

          {expiredLots.map((lot) => (
            <StockDetailLotCard key={lot.id} lot={lot} />
          ))}
        </View>
      )}

      {/* ================================================== */}
      {/* EMPTY LOTS                                         */}
      {/* ================================================== */}

      {emptyLots.length > 0 && (
        <View
          style={[
            styles.group,
            (activeLots.length > 0 || expiredLots.length > 0) &&
              styles.groupSeparated,
          ]}
        >
          <View style={styles.groupHeader}>
            <View style={[styles.groupDot, styles.emptyDot]} />

            <Text style={styles.groupTitle}>Lots épuisés</Text>

            <Text style={styles.groupCount}>{emptyLots.length}</Text>
          </View>

          {emptyLots.map((lot) => (
            <StockDetailLotCard key={lot.id} lot={lot} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    padding: 18,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0ED",
  },

  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  headerContent: {
    flex: 1,
    marginLeft: 10,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: COLORS.text,
  },

  countBadge: {
    minWidth: 22,
    height: 22,
    marginLeft: 7,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  countText: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: COLORS.primary,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  // ==========================================================
  // GROUPS
  // ==========================================================

  group: {
    paddingTop: 15,
  },

  groupSeparated: {
    marginTop: 6,
    paddingTop: 17,
    borderTopWidth: 1,
    borderTopColor: "#F0F0ED",
  },

  groupHeader: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  groupDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 7,
  },

  activeDot: {
    backgroundColor: COLORS.success,
  },

  expiredDot: {
    backgroundColor: COLORS.error,
  },

  emptyDot: {
    backgroundColor: COLORS.Gray,
  },

  groupTitle: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: COLORS.darkGray,
  },

  groupCount: {
    fontFamily: fonts.medium,
    fontSize: 9,
    color: COLORS.Gray,
  },

  expiredCount: {
    color: COLORS.error,
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyContainer: {
    minHeight: 155,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0ED",
  },

  emptyTitle: {
    marginTop: 11,
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  emptyDescription: {
    marginTop: 5,
    maxWidth: 280,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
    textAlign: "center",
  },
});
