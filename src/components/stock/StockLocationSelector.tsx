import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { usePointOfSaleStore } from "@/store/pointOfSale.store";

import { COLORS, fonts } from "@/utils/styles";

interface StockLocationSelectorProps {
  role: "MANAGER" | "EMPLOYEE";
  userId: string;
  location: StockTypes.StockLocationInfo | null;
  onLocationChange: (
    location: StockTypes.StockLocationInfo,
  ) => Promise<void> | void;
}

export function StockLocationSelector({
  role,
  userId,
  location,
  onLocationChange,
}: StockLocationSelectorProps) {
  const { pointOfSales, isLoading } = usePointOfSaleStore();

  // ============================================================
  // EMPLOYÉS
  // ============================================================

  const assignedPointOfSales = pointOfSales.filter(
    (pointOfSale) =>
      pointOfSale.isActive &&
      pointOfSale.staffAssignments.some(
        (assignment) => assignment.isActive && assignment.user.id === userId,
      ),
  );

  // ============================================================
  // EMPLACEMENTS DISPONIBLES
  // ============================================================

  const availableLocations: StockTypes.StockLocationInfo[] =
    role === "MANAGER"
      ? [
          {
            type: "MAIN",
            pointOfSaleId: null,
            name: "Boutique principale",
            code: "MAIN",
          },

          ...pointOfSales
            .filter(
              (pointOfSale) => pointOfSale.isActive && !pointOfSale.isMainStore,
            )
            .map((pointOfSale) => ({
              type: "POS" as const,
              pointOfSaleId: pointOfSale.id,
              name: pointOfSale.name,
              code: pointOfSale.code,
            })),
        ]
      : assignedPointOfSales.map((pointOfSale) => ({
          type: "POS" as const,
          pointOfSaleId: pointOfSale.id,
          name: pointOfSale.name,
          code: pointOfSale.code,
        }));

  // ============================================================
  // SÉLECTION
  // ============================================================

  const handleSelectLocation = async (
    selectedLocation: StockTypes.StockLocationInfo,
  ) => {
    if (
      location?.type === selectedLocation.type &&
      location?.pointOfSaleId === selectedLocation.pointOfSaleId
    ) {
      return;
    }

    await onLocationChange(selectedLocation);
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading && pointOfSales.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="location-outline"
              size={17}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.title}>Emplacement</Text>

            <Text style={styles.subtitle}>Chargement des emplacements...</Text>
          </View>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />

          <Text style={styles.loadingText}>Chargement</Text>
        </View>
      </View>
    );
  }

  // ============================================================
  // EMPLOYÉ NON AFFECTÉ
  // ============================================================

  if (role === "EMPLOYEE" && availableLocations.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.headerIcon, styles.headerIconWarning]}>
            <Ionicons
              name="location-outline"
              size={17}
              color={COLORS.warning}
            />
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.title}>Emplacement</Text>

            <Text style={styles.subtitle}>
              Aucun point de vente ne vous est actuellement affecté.
            </Text>
          </View>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="storefront-outline" size={22} color={COLORS.Gray} />
          </View>

          <Text style={styles.emptyTitle}>Pas de point de vente</Text>

          <Text style={styles.emptyText}>
            Votre stock sera disponible ici dès que vous serez affecté à un
            point de vente.
          </Text>
        </View>
      </View>
    );
  }

  // ============================================================
  // LISTE DES EMPLACEMENTS
  // ============================================================

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="location-outline" size={17} color={COLORS.primary} />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Emplacement</Text>

          <Text style={styles.subtitle}>
            {role === "MANAGER"
              ? "Sélectionnez le stock à consulter."
              : "Stock de votre point de vente."}
          </Text>
        </View>
      </View>

      <View style={styles.locations}>
        {availableLocations.map((item) => {
          const isSelected =
            location?.type === item.type &&
            location?.pointOfSaleId === item.pointOfSaleId;

          const isMain = item.type === "MAIN";

          return (
            <Pressable
              key={item.type === "MAIN" ? "MAIN" : item.pointOfSaleId}
              style={({ pressed }) => [
                styles.locationCard,
                isSelected && styles.locationCardSelected,
                pressed && styles.locationCardPressed,
              ]}
              onPress={() => handleSelectLocation(item)}
              disabled={isSelected}
            >
              <View
                style={[
                  styles.locationIcon,
                  isSelected && styles.locationIconSelected,
                ]}
              >
                <Ionicons
                  name={isMain ? "home-outline" : "storefront-outline"}
                  size={18}
                  color={isSelected ? COLORS.white : COLORS.primary}
                />
              </View>

              <View style={styles.locationContent}>
                <Text
                  style={[
                    styles.locationName,
                    isSelected && styles.locationNameSelected,
                  ]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>

                <Text
                  style={[
                    styles.locationCode,
                    isSelected && styles.locationCodeSelected,
                  ]}
                >
                  {isMain
                    ? "Stock principal"
                    : item.code
                      ? `PDV · ${item.code}`
                      : "Point de vente"}
                </Text>
              </View>

              <View style={[styles.check, isSelected && styles.checkSelected]}>
                <Ionicons
                  name={isSelected ? "checkmark" : "chevron-forward"}
                  size={isSelected ? 16 : 17}
                  color={isSelected ? COLORS.white : COLORS.Gray}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  // ==========================================================
  // HEADER
  // ==========================================================

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
    backgroundColor: "#EDF4EB",
  },

  headerIconWarning: {
    backgroundColor: "#FFF5D9",
  },

  headerContent: {
    flex: 1,
    marginLeft: 10,
  },

  title: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  // ==========================================================
  // LOCATIONS
  // ==========================================================

  locations: {
    marginTop: 14,
    gap: 8,
  },

  locationCard: {
    minHeight: 64,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    backgroundColor: "#FAFAF8",
    flexDirection: "row",
    alignItems: "center",
  },

  locationCardSelected: {
    backgroundColor: "#EDF4EB",
    borderColor: "#CFE0CA",
  },

  locationCardPressed: {
    opacity: 0.65,
  },

  locationIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  locationIconSelected: {
    backgroundColor: COLORS.primary,
  },

  locationContent: {
    flex: 1,
    marginLeft: 10,
    paddingRight: 8,
  },

  locationName: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  locationNameSelected: {
    color: COLORS.primary,
  },

  locationCode: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  locationCodeSelected: {
    color: "#62805C",
  },

  check: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  checkSelected: {
    backgroundColor: COLORS.primary,
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loadingContainer: {
    marginTop: 14,
    minHeight: 64,
    borderRadius: 15,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#E8E8E5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  loadingText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: COLORS.Gray,
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyContainer: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 18,
    borderRadius: 15,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#E8E8E5",
    alignItems: "center",
  },

  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0ED",
  },

  emptyTitle: {
    marginTop: 9,
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.text,
    textAlign: "center",
  },

  emptyText: {
    marginTop: 4,
    maxWidth: 280,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
    textAlign: "center",
  },
});
