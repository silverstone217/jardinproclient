import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useDistributionStore } from "@/store/distribution.store";
import { usePointOfSaleStore } from "@/store/pointOfSale.store";

import { COLORS, fonts } from "@/utils/styles";

type SelectorType = "from" | "to" | null;

export function DistributionRouteSelector() {
  const {
    fromPosId,
    toPosId,
    fromSelected,
    toSelected,
    setFromPosId,
    setToPosId,
    isLoadingProducts,
  } = useDistributionStore();

  const { pointOfSales } = usePointOfSaleStore();

  const [activeSelector, setActiveSelector] = useState<SelectorType>(null);

  // ============================================================
  // POS ACTIFS UNIQUEMENT
  // ============================================================

  const activePointOfSales = pointOfSales.filter(
    (pointOfSale) => pointOfSale.isActive,
  );

  // ============================================================
  // LABELS
  // ============================================================

  const fromName = !fromSelected
    ? "Sélectionner un point de départ"
    : fromPosId === null
      ? "Boutique principale"
      : (activePointOfSales.find((pos) => pos.id === fromPosId)?.name ??
        "Point de vente");

  const toName = !toSelected
    ? "Sélectionner une destination"
    : toPosId === null
      ? "Boutique principale"
      : (activePointOfSales.find((pos) => pos.id === toPosId)?.name ??
        "Point de vente");

  // ============================================================
  // SÉLECTION D'UN DÉPART
  // ============================================================

  const handleFromSelect = async (pointOfSaleId: string | null) => {
    setActiveSelector(null);

    await setFromPosId(pointOfSaleId);
  };

  // ============================================================
  // SÉLECTION D'UNE ARRIVÉE
  // ============================================================

  const handleToSelect = (pointOfSaleId: string | null) => {
    setActiveSelector(null);

    setToPosId(pointOfSaleId);
  };

  // ============================================================
  // OPTIONS DÉPART
  // ============================================================

  const renderFromOptions = () => {
    return (
      <>
        <SelectorOption
          icon="business-outline"
          title="Boutique principale"
          subtitle="Stock central"
          selected={fromSelected && fromPosId === null}
          onPress={() => handleFromSelect(null)}
        />

        {activePointOfSales.map((pointOfSale) => (
          <SelectorOption
            key={pointOfSale.id}
            icon="location-outline"
            title={pointOfSale.name}
            subtitle={pointOfSale.code}
            selected={fromSelected && fromPosId === pointOfSale.id}
            onPress={() => handleFromSelect(pointOfSale.id)}
          />
        ))}
      </>
    );
  };

  // ============================================================
  // OPTIONS ARRIVÉE
  // ============================================================

  const renderToOptions = () => {
    return (
      <>
        <SelectorOption
          icon="business-outline"
          title="Boutique principale"
          subtitle="Stock central"
          selected={toSelected && toPosId === null}
          disabled={!fromSelected || fromPosId === null}
          onPress={() => handleToSelect(null)}
        />

        {activePointOfSales.map((pointOfSale) => {
          const isSameSource = fromSelected && fromPosId === pointOfSale.id;

          return (
            <SelectorOption
              key={pointOfSale.id}
              icon="location-outline"
              title={pointOfSale.name}
              subtitle={pointOfSale.code}
              selected={toSelected && toPosId === pointOfSale.id}
              disabled={!fromSelected || isSameSource}
              onPress={() => handleToSelect(pointOfSale.id)}
            />
          );
        })}
      </>
    );
  };

  // ============================================================
  // RENDU
  // ============================================================

  return (
    <>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="swap-horizontal-outline"
              size={18}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.title}>Itinéraire</Text>

            <Text style={styles.subtitle}>
              Choisissez où prendre et déposer les produits.
            </Text>
          </View>
        </View>

        <View style={styles.route}>
          {/* ================================================== */}
          {/* DÉPART                                             */}
          {/* ================================================== */}

          <View style={styles.selectorBlock}>
            <Text style={styles.label}>DÉPART</Text>

            <Pressable
              style={({ pressed }) => [
                styles.selector,
                pressed && styles.pressed,
                isLoadingProducts && styles.selectorDisabled,
              ]}
              onPress={() => setActiveSelector("from")}
              disabled={isLoadingProducts}
            >
              <View style={styles.selectorIcon}>
                <Ionicons
                  name={
                    fromSelected && fromPosId !== null
                      ? "location-outline"
                      : "business-outline"
                  }
                  size={18}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.selectorContent}>
                <Text
                  style={[
                    styles.selectorText,
                    !fromSelected && styles.selectorTextEmpty,
                  ]}
                  numberOfLines={1}
                >
                  {fromName}
                </Text>

                <Text style={styles.selectorHint}>
                  {!fromSelected
                    ? "Choisissez le stock à utiliser"
                    : fromPosId === null
                      ? "Stock central"
                      : "Point de vente"}
                </Text>
              </View>

              <Ionicons name="chevron-down" size={18} color={COLORS.Gray} />
            </Pressable>
          </View>

          {/* ================================================== */}
          {/* FLÈCHE                                             */}
          {/* ================================================== */}

          <View style={styles.arrowContainer}>
            <View style={styles.arrowLine} />

            <View style={styles.arrowIcon}>
              <Ionicons name="arrow-down" size={16} color={COLORS.primary} />
            </View>

            <View style={styles.arrowLine} />
          </View>

          {/* ================================================== */}
          {/* ARRIVÉE                                            */}
          {/* ================================================== */}

          <View style={styles.selectorBlock}>
            <Text style={styles.label}>ARRIVÉE</Text>

            <Pressable
              style={({ pressed }) => [
                styles.selector,
                pressed && styles.pressed,
                isLoadingProducts && styles.selectorDisabled,
              ]}
              onPress={() => setActiveSelector("to")}
              disabled={isLoadingProducts}
            >
              <View
                style={[
                  styles.selectorIcon,
                  (!toSelected || toPosId === null) && styles.selectorIconEmpty,
                ]}
              >
                <Ionicons
                  name={
                    toSelected && toPosId !== null
                      ? "location-outline"
                      : "navigate-outline"
                  }
                  size={18}
                  color={
                    toSelected && toPosId !== null
                      ? COLORS.primary
                      : COLORS.Gray
                  }
                />
              </View>

              <View style={styles.selectorContent}>
                <Text
                  style={[
                    styles.selectorText,
                    !toSelected && styles.selectorTextEmpty,
                  ]}
                  numberOfLines={1}
                >
                  {toName}
                </Text>

                <Text style={styles.selectorHint}>
                  {!toSelected
                    ? "Choisissez une destination"
                    : toPosId === null
                      ? "Stock central"
                      : "Point de vente"}
                </Text>
              </View>

              <Ionicons name="chevron-down" size={18} color={COLORS.Gray} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* ====================================================== */}
      {/* MODAL                                                  */}
      {/* ====================================================== */}

      <Modal
        visible={activeSelector !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveSelector(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setActiveSelector(null)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <Text style={styles.modalTitle}>
                  {activeSelector === "from"
                    ? "Point de départ"
                    : "Point d'arrivée"}
                </Text>

                <Text style={styles.modalSubtitle}>
                  {activeSelector === "from"
                    ? "Choisissez le stock à utiliser."
                    : "Choisissez où envoyer les produits."}
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={() => setActiveSelector(null)}
                hitSlop={8}
              >
                <Ionicons name="close" size={20} color={COLORS.darkGray} />
              </Pressable>
            </View>

            <View style={styles.options}>
              {activeSelector === "from"
                ? renderFromOptions()
                : renderToOptions()}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// ============================================================
// OPTION
// ============================================================

interface SelectorOptionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}

function SelectorOption({
  icon,
  title,
  subtitle,
  selected,
  disabled = false,
  onPress,
}: SelectorOptionProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionSelected,
        disabled && styles.optionDisabled,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View
        style={[
          styles.optionIcon,
          selected && styles.optionIconSelected,
          disabled && styles.optionIconDisabled,
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={
            disabled ? COLORS.Gray : selected ? COLORS.primary : COLORS.darkGray
          }
        />
      </View>

      <View style={styles.optionContent}>
        <Text
          style={[styles.optionTitle, disabled && styles.optionTitleDisabled]}
        >
          {title}
        </Text>

        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>

      {selected && (
        <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
      )}
    </Pressable>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  cardHeader: {
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

  route: {
    paddingTop: 16,
  },

  selectorBlock: {
    width: "100%",
  },

  label: {
    marginBottom: 7,
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 1,
    color: COLORS.Gray,
  },

  selector: {
    minHeight: 62,
    paddingHorizontal: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E7E7E3",
    backgroundColor: "#FAFAF8",
    flexDirection: "row",
    alignItems: "center",
  },

  selectorDisabled: {
    opacity: 0.55,
  },

  selectorIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  selectorIconEmpty: {
    backgroundColor: "#F1F1EF",
  },

  selectorContent: {
    flex: 1,
    marginHorizontal: 10,
  },

  selectorText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
  },

  selectorTextEmpty: {
    color: COLORS.Gray,
  },

  selectorHint: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  arrowContainer: {
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  arrowLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E5E1",
  },

  arrowIcon: {
    width: 28,
    height: 28,
    marginHorizontal: 8,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F5EE",
    borderWidth: 1,
    borderColor: "#DCE8D9",
  },

  // ==========================================================
  // MODAL
  // ==========================================================

  modalBackdrop: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0, 0, 0, 0.38)",
    justifyContent: "center",
  },

  modalCard: {
    maxHeight: "80%",
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0ED",
  },

  modalHeaderContent: {
    flex: 1,
  },

  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: COLORS.text,
  },

  modalSubtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  closeButton: {
    width: 34,
    height: 34,
    marginLeft: 10,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F3F1",
  },

  options: {
    paddingTop: 10,
  },

  option: {
    minHeight: 62,
    paddingHorizontal: 10,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  optionSelected: {
    backgroundColor: "#EDF4EB",
  },

  optionDisabled: {
    opacity: 0.4,
  },

  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F1EF",
  },

  optionIconSelected: {
    backgroundColor: "#DDECD9",
  },

  optionIconDisabled: {
    backgroundColor: "#F2F2F0",
  },

  optionContent: {
    flex: 1,
    marginLeft: 10,
  },

  optionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  optionTitleDisabled: {
    color: COLORS.Gray,
  },

  optionSubtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  pressed: {
    opacity: 0.6,
  },
});
