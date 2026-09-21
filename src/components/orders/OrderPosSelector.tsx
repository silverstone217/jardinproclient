import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { OrderPointOfSale } from "@/types/order";

import { COLORS, fonts } from "@/utils/styles";
interface OrderPosSelectorProps {
  pointOfSales: OrderPointOfSale[];
  selectedPointOfSaleId?: string | null;

  onSelect: (pointOfSaleId: string) => void;

  onAssign: (pointOfSaleId: string) => Promise<void>;

  isAssigning?: boolean;
}

export function OrderPosSelector({
  pointOfSales,
  selectedPointOfSaleId = null,
  onSelect,
  onAssign,
  isAssigning = false,
}: OrderPosSelectorProps) {
  // ============================================================
  // POS DÉJÀ ASSIGNÉ
  // ============================================================

  const assignedPointOfSale =
    pointOfSales.find((pointOfSale) => pointOfSale.isAssigned) ?? null;

  // ============================================================
  // POS DISPONIBLES
  // ============================================================

  const selectablePointOfSales = assignedPointOfSale
    ? []
    : pointOfSales.filter((pointOfSale) => pointOfSale.canSelect);

  // ============================================================
  // POS SÉLECTIONNÉ TEMPORAIREMENT
  // ============================================================

  const selectedPointOfSale =
    selectablePointOfSales.find(
      (pointOfSale) => pointOfSale.id === selectedPointOfSaleId,
    ) ?? null;

  // ============================================================
  // SÉLECTION D'UN POS
  // ============================================================

  const handleSelect = (pointOfSaleId: string) => {
    if (assignedPointOfSale) {
      return;
    }

    if (isAssigning) {
      return;
    }

    const pointOfSale = selectablePointOfSales.find(
      (item) => item.id === pointOfSaleId,
    );

    if (!pointOfSale) {
      return;
    }

    onSelect(pointOfSaleId);
  };

  // ============================================================
  // CONFIRMER L'ASSIGNATION
  // ============================================================

  const handleAssign = async () => {
    if (!selectedPointOfSale || isAssigning) {
      return;
    }

    try {
      await onAssign(selectedPointOfSale.id);
    } catch (error) {
      console.error("Erreur assignation POS :", error);
    }
  };

  // ============================================================
  // DÉTAILS POS
  // ============================================================

  const renderPointOfSaleDetails = (
    pointOfSale: OrderPointOfSale,
    compact = false,
  ) => (
    <View style={styles.pointOfSaleContent}>
      <Text style={styles.pointOfSaleName} numberOfLines={1}>
        {pointOfSale.name}
      </Text>

      {!compact && <Text style={styles.code}>{pointOfSale.code}</Text>}

      {pointOfSale.address && (
        <View style={styles.detailRow}>
          <Ionicons name="navigate-outline" size={12} color={COLORS.Gray} />

          <Text style={styles.detailText} numberOfLines={1}>
            {pointOfSale.address}
          </Text>
        </View>
      )}

      {!compact && pointOfSale.telephone && (
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={12} color={COLORS.Gray} />

          <Text style={styles.detailText} numberOfLines={1}>
            {pointOfSale.telephone}
          </Text>
        </View>
      )}

      {!compact && pointOfSale.isMainStore && (
        <View style={styles.mainStoreBadge}>
          <Ionicons name="star-outline" size={10} color="#8A6714" />

          <Text style={styles.mainStoreText}>Boutique principale</Text>
        </View>
      )}
    </View>
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <View style={styles.container}>
      {/* ====================================================== */}
      {/* HEADER                                                  */}
      {/* ====================================================== */}

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons
            name="storefront-outline"
            size={19}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Point de vente</Text>

          <Text style={styles.subtitle}>
            {assignedPointOfSale
              ? "Votre point de vente actuel pour les commandes."
              : "Choisissez le point de vente où vous souhaitez travailler."}
          </Text>
        </View>
      </View>

      {/* ====================================================== */}
      {/* UTILISATEUR DÉJÀ ASSIGNÉ                                */}
      {/* ====================================================== */}

      {assignedPointOfSale && (
        <View style={styles.assignedCard}>
          <View style={styles.assignedIcon}>
            <Ionicons
              name={
                assignedPointOfSale.isMainStore
                  ? "home-outline"
                  : "location-outline"
              }
              size={20}
              color={COLORS.white}
            />
          </View>

          <View style={styles.assignedContent}>
            <Text style={styles.assignedName} numberOfLines={1}>
              {assignedPointOfSale.name}
            </Text>

            {assignedPointOfSale.address && (
              <View style={styles.detailRow}>
                <Ionicons
                  name="navigate-outline"
                  size={12}
                  color={COLORS.Gray}
                />

                <Text style={styles.detailText} numberOfLines={1}>
                  {assignedPointOfSale.address}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.assignedStatus}>
            <Ionicons
              name="checkmark-circle"
              size={19}
              color={COLORS.primary}
            />
          </View>
        </View>
      )}

      {/* ====================================================== */}
      {/* UTILISATEUR NON ASSIGNÉ                                 */}
      {/* ====================================================== */}

      {!assignedPointOfSale && selectablePointOfSales.length > 0 && (
        <>
          <View style={styles.list}>
            {selectablePointOfSales.map((pointOfSale) => {
              const isSelected = selectedPointOfSaleId === pointOfSale.id;

              return (
                <Pressable
                  key={pointOfSale.id}
                  style={({ pressed }) => [
                    styles.card,
                    isSelected && styles.cardSelected,
                    pressed && styles.cardPressed,
                  ]}
                  onPress={() => handleSelect(pointOfSale.id)}
                  disabled={isAssigning}
                >
                  {/* ICON */}
                  <View
                    style={[
                      styles.locationIcon,
                      isSelected && styles.locationIconSelected,
                    ]}
                  >
                    <Ionicons
                      name={
                        pointOfSale.isMainStore
                          ? "home-outline"
                          : "location-outline"
                      }
                      size={18}
                      color={isSelected ? COLORS.white : COLORS.primary}
                    />
                  </View>

                  {/* INFORMATIONS */}
                  {renderPointOfSaleDetails(pointOfSale)}

                  {/* RADIO */}
                  <View style={styles.selectionIndicator}>
                    <View
                      style={[styles.radio, isSelected && styles.radioSelected]}
                    >
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* ================================================== */}
          {/* BOUTON D'ASSIGNATION                               */}
          {/* ================================================== */}

          <Pressable
            style={({ pressed }) => [
              styles.assignButton,
              !selectedPointOfSale && styles.assignButtonDisabled,
              pressed &&
                selectedPointOfSale &&
                !isAssigning &&
                styles.assignButtonPressed,
            ]}
            onPress={handleAssign}
            disabled={!selectedPointOfSale || isAssigning}
          >
            {isAssigning ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons
                name="checkmark-circle-outline"
                size={19}
                color={selectedPointOfSale ? COLORS.white : COLORS.Gray}
              />
            )}

            <Text
              style={[
                styles.assignButtonText,
                (!selectedPointOfSale || isAssigning) &&
                  styles.assignButtonTextDisabled,
              ]}
            >
              {isAssigning
                ? "Assignation..."
                : "S'assigner à ce point de vente"}
            </Text>
          </Pressable>
        </>
      )}

      {/* ====================================================== */}
      {/* AUCUN POS                                               */}
      {/* ====================================================== */}

      {!assignedPointOfSale && selectablePointOfSales.length === 0 && (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="storefront-outline" size={23} color={COLORS.Gray} />
          </View>

          <Text style={styles.emptyTitle}>Aucun point de vente disponible</Text>

          <Text style={styles.emptyText}>
            Aucun point de vente actif ne peut être sélectionné pour le moment.
          </Text>
        </View>
      )}

      {/* ====================================================== */}
      {/* INFORMATION                                             */}
      {/* ====================================================== */}

      {!assignedPointOfSale && selectablePointOfSales.length > 0 && (
        <View style={styles.info}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={COLORS.primary}
          />

          <Text style={styles.infoText}>
            Sélectionnez un point de vente, puis confirmez votre assignation.
            Cette assignation sera enregistrée sur votre compte.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // ==========================================================
  // CONTAINER
  // ==========================================================

  container: {
    width: "100%",
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
    borderWidth: 1,
    borderColor: "#DFEBDD",
  },

  headerContent: {
    flex: 1,
    marginLeft: 11,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: COLORS.Gray,
  },

  // ==========================================================
  // POS ASSIGNÉ
  // ==========================================================

  assignedCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#CFE0CA",
    backgroundColor: "#F5F9F3",
  },

  assignedIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },

  assignedContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
    marginRight: 8,
  },

  assignedName: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: COLORS.text,
  },

  assignedStatus: {
    width: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  // ==========================================================
  // LISTE
  // ==========================================================

  list: {
    gap: 9,
  },

  // ==========================================================
  // CARD POS
  // ==========================================================

  card: {
    minHeight: 84,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E7E7E3",
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
  },

  cardSelected: {
    borderColor: "#BFD4B9",
    backgroundColor: "#F7FAF5",
  },

  cardPressed: {
    opacity: 0.65,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  // ==========================================================
  // ICON
  // ==========================================================

  locationIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  locationIconSelected: {
    backgroundColor: COLORS.primary,
  },

  // ==========================================================
  // CONTENT
  // ==========================================================

  pointOfSaleContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
    marginRight: 8,
  },

  pointOfSaleName: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: COLORS.text,
  },

  code: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 9,
    color: COLORS.Gray,
    letterSpacing: 0.4,
  },

  // ==========================================================
  // DETAILS
  // ==========================================================

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },

  detailText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  // ==========================================================
  // BOUTIQUE PRINCIPALE
  // ==========================================================

  mainStoreBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: "#FFF6D9",
  },

  mainStoreText: {
    fontFamily: fonts.semibold,
    fontSize: 7.5,
    color: "#8A6714",
  },

  // ==========================================================
  // SELECTION
  // ==========================================================

  selectionIndicator: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#C9C9C5",
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    borderColor: COLORS.primary,
  },

  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },

  // ==========================================================
  // BOUTON ASSIGNATION
  // ==========================================================

  assignButton: {
    minHeight: 48,
    marginTop: 13,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  assignButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },

  assignButtonPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  assignButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.white,
  },

  assignButtonTextDisabled: {
    color: COLORS.Gray,
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  empty: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    backgroundColor: COLORS.white,
  },

  emptyIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F1EF",
  },

  emptyTitle: {
    marginTop: 11,
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
    textAlign: "center",
  },

  emptyText: {
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.Gray,
    textAlign: "center",
  },

  // ==========================================================
  // INFO
  // ==========================================================

  info: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 11,
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F4F7F2",
  },

  infoText: {
    flex: 1,
    marginLeft: 7,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.darkGray,
  },
});
