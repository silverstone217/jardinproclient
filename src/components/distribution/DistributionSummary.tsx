import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useDistributionStore } from "@/store/distribution.store";
import { usePointOfSaleStore } from "@/store/pointOfSale.store";

import { COLORS, fonts } from "@/utils/styles";

export function DistributionSummary() {
  const { fromPosId, toPosId, fromSelected, toSelected, selectedProducts } =
    useDistributionStore();

  const { pointOfSales } = usePointOfSaleStore();

  // ============================================================
  // NOMS DES EMPLACEMENTS
  // ============================================================

  const fromName = !fromSelected
    ? "Non sélectionné"
    : fromPosId === null
      ? "Boutique principale"
      : (pointOfSales.find((pos) => pos.id === fromPosId)?.name ??
        "Point de vente");

  const toName = !toSelected
    ? "Non sélectionné"
    : toPosId === null
      ? "Boutique principale"
      : (pointOfSales.find((pos) => pos.id === toPosId)?.name ??
        "Point de vente");

  // ============================================================
  // TOTAL
  // ============================================================

  const totalQuantity = selectedProducts.reduce(
    (total, product) => total + product.quantity,
    0,
  );

  // ============================================================
  // RENDU
  // ============================================================

  return (
    <View style={styles.card}>
      {/* ====================================================== */}
      {/* HEADER                                                 */}
      {/* ====================================================== */}

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons
            name="document-text-outline"
            size={18}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Résumé de la distribution</Text>

          <Text style={styles.subtitle}>
            Vérifiez le trajet et les quantités avant l'envoi.
          </Text>
        </View>
      </View>

      {/* ====================================================== */}
      {/* ROUTE                                                  */}
      {/* ====================================================== */}

      <View style={styles.route}>
        {/* DÉPART */}

        <View style={styles.location}>
          <View style={[styles.locationIcon, styles.sourceIcon]}>
            <Ionicons
              name={
                fromPosId === null ? "business-outline" : "location-outline"
              }
              size={17}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.locationContent}>
            <Text style={styles.locationLabel}>DÉPART</Text>

            <Text style={styles.locationName} numberOfLines={1}>
              {fromName}
            </Text>
          </View>
        </View>

        {/* FLÈCHE */}

        <View style={styles.routeArrow}>
          <View style={styles.routeLine} />

          <View style={styles.routeArrowIcon}>
            <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
          </View>

          <View style={styles.routeLine} />
        </View>

        {/* ARRIVÉE */}

        <View style={styles.location}>
          <View style={[styles.locationIcon, styles.destinationIcon]}>
            <Ionicons
              name={toPosId === null ? "business-outline" : "location-outline"}
              size={17}
              color={COLORS.secondary}
            />
          </View>

          <View style={styles.locationContent}>
            <Text style={styles.locationLabel}>ARRIVÉE</Text>

            <Text style={styles.locationName} numberOfLines={1}>
              {toName}
            </Text>
          </View>
        </View>
      </View>

      {/* ====================================================== */}
      {/* STATS                                                  */}
      {/* ====================================================== */}

      <View style={styles.stats}>
        <View style={styles.stat}>
          <View style={styles.statIcon}>
            <Ionicons name="cube-outline" size={16} color={COLORS.primary} />
          </View>

          <View style={styles.statContent}>
            <Text style={styles.statValue}>{selectedProducts.length}</Text>

            <Text style={styles.statLabel}>
              {selectedProducts.length > 1 ? "Produits" : "Produit"}
            </Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.stat}>
          <View style={styles.statIcon}>
            <Ionicons
              name="layers-outline"
              size={16}
              color={COLORS.secondary}
            />
          </View>

          <View style={styles.statContent}>
            <Text style={styles.statValue}>{totalQuantity}</Text>

            <Text style={styles.statLabel}>
              {totalQuantity > 1 ? "Unités" : "Unité"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 18,
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

  title: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  // ==========================================================
  // ROUTE
  // ==========================================================

  route: {
    paddingTop: 16,
  },

  location: {
    flexDirection: "row",
    alignItems: "center",
  },

  locationIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  sourceIcon: {
    backgroundColor: "#EAF2E7",
  },

  destinationIcon: {
    backgroundColor: "#FFF1E2",
  },

  locationContent: {
    flex: 1,
    marginLeft: 10,
  },

  locationLabel: {
    fontFamily: fonts.bold,
    fontSize: 8.5,
    letterSpacing: 1,
    color: COLORS.Gray,
  },

  locationName: {
    marginTop: 2,
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
  },

  // ==========================================================
  // ARROW
  // ==========================================================

  routeArrow: {
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 48,
  },

  routeLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E5E1",
  },

  routeArrowIcon: {
    width: 26,
    height: 26,
    marginHorizontal: 7,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F5EE",
    borderWidth: 1,
    borderColor: "#DCE8D9",
  },

  // ==========================================================
  // STATS
  // ==========================================================

  stats: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F0F0ED",
    flexDirection: "row",
    alignItems: "center",
  },

  stat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F6F1",
  },

  statContent: {
    marginLeft: 8,
  },

  statValue: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: COLORS.text,
  },

  statLabel: {
    marginTop: 1,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  statDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 12,
    backgroundColor: "#E8E8E5",
  },
});
