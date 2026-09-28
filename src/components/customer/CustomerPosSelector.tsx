
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { COLORS, fonts } from "@/utils/styles";
import type { CustomerPointOfSale } from "@/types/customer";

interface CustomerPosSelectorProps {
  pointOfSales: CustomerPointOfSale[];
  selectedPointOfSale: CustomerPointOfSale | null;
  onSelect: (pointOfSale: CustomerPointOfSale | null) => void;
  disabled?: boolean;
}

export function CustomerPosSelector({
  pointOfSales,
  selectedPointOfSale,
  onSelect,
  disabled = false,
}: CustomerPosSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const hasPointOfSales = pointOfSales.length > 0;

  /**
   * null = Tous les points de vente
   */
  const isAllPointOfSales = selectedPointOfSale === null;

  const handleSelect = (
    pointOfSale: CustomerPointOfSale | null,
  ) => {
    onSelect(pointOfSale);
    setIsOpen(false);
  };

  return (
    <>
      <View style={styles.container}>
        {/* Label */}
        <View style={styles.labelRow}>
          <View style={styles.labelIcon}>
            <Ionicons
              name="location-outline"
              size={15}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.label}>Point de vente</Text>
        </View>

        {/* Selector */}
        <Pressable
          style={({ pressed }) => [
            styles.selector,
            disabled && styles.selectorDisabled,
            pressed && !disabled && styles.pressed,
          ]}
          onPress={() => setIsOpen(true)}
          disabled={disabled || !hasPointOfSales}
        >
          <View style={styles.selectorContent}>
            <View
              style={[
                styles.selectedIcon,
                isAllPointOfSales && styles.selectedIconAll,
              ]}
            >
              <Ionicons
                name={
                  isAllPointOfSales
                    ? "apps-outline"
                    : "storefront-outline"
                }
                size={18}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.selectedContent}>
              <Text
                style={styles.selectedName}
                numberOfLines={1}
              >
                {selectedPointOfSale?.name ??
                  "Tous les points de vente"}
              </Text>

              {selectedPointOfSale ? (
                <Text style={styles.selectedCode}>
                  {selectedPointOfSale.code}
                </Text>
              ) : (
                <Text style={styles.selectedCode}>
                  Vue globale
                </Text>
              )}
            </View>
          </View>

          <Ionicons
            name="chevron-down"
            size={18}
            color={COLORS.Gray}
          />
        </Pressable>
      </View>

      {/* Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsOpen(false)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={(event) => event.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <Text style={styles.modalTitle}>
                  Choisir un point de vente
                </Text>

                <Text style={styles.modalSubtitle}>
                  Sélectionnez un point de vente ou consultez
                  tous les clients.
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={() => setIsOpen(false)}
                hitSlop={8}
              >
                <Ionicons
                  name="close"
                  size={19}
                  color={COLORS.text}
                />
              </Pressable>
            </View>

            {/* Liste */}
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {/* ==========================================
                  TOUS LES POINTS DE VENTE
              ========================================== */}
              <Pressable
                style={({ pressed }) => [
                  styles.option,
                  isAllPointOfSales &&
                    styles.optionSelected,
                  pressed && styles.optionPressed,
                ]}
                onPress={() => handleSelect(null)}
              >
                <View
                  style={[
                    styles.optionIcon,
                    isAllPointOfSales &&
                      styles.optionIconSelected,
                  ]}
                >
                  <Ionicons
                    name="apps-outline"
                    size={18}
                    color={
                      isAllPointOfSales
                        ? COLORS.white
                        : COLORS.primary
                    }
                  />
                </View>

                <View style={styles.optionContent}>
                  <View style={styles.optionNameRow}>
                    <Text
                      style={[
                        styles.optionName,
                        isAllPointOfSales &&
                          styles.optionNameSelected,
                      ]}
                      numberOfLines={1}
                    >
                      Tous les points de vente
                    </Text>

                    <View style={styles.allBadge}>
                      <Text style={styles.allBadgeText}>
                        Global
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.optionCode,
                      isAllPointOfSales &&
                        styles.optionCodeSelected,
                    ]}
                  >
                    Tous les clients
                  </Text>
                </View>

                <View style={styles.checkContainer}>
                  {isAllPointOfSales && (
                    <Ionicons
                      name="checkmark-circle"
                      size={21}
                      color={COLORS.primary}
                    />
                  )}
                </View>
              </Pressable>

              {/* ==========================================
                  POINTS DE VENTE
              ========================================== */}
              {pointOfSales.map((pointOfSale) => {
                const isSelected =
                  selectedPointOfSale?.id === pointOfSale.id;

                return (
                  <Pressable
                    key={pointOfSale.id}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected &&
                        styles.optionSelected,
                      pressed && styles.optionPressed,
                    ]}
                    onPress={() =>
                      handleSelect(pointOfSale)
                    }
                  >
                    <View
                      style={[
                        styles.optionIcon,
                        isSelected &&
                          styles.optionIconSelected,
                      ]}
                    >
                      <Ionicons
                        name="storefront-outline"
                        size={18}
                        color={
                          isSelected
                            ? COLORS.white
                            : COLORS.primary
                        }
                      />
                    </View>

                    <View style={styles.optionContent}>
                      <View style={styles.optionNameRow}>
                        <Text
                          style={[
                            styles.optionName,
                            isSelected &&
                              styles.optionNameSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {pointOfSale.name}
                        </Text>

                        {pointOfSale.isMainStore && (
                          <View style={styles.mainBadge}>
                            <Text style={styles.mainBadgeText}>
                              Principal
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text
                        style={[
                          styles.optionCode,
                          isSelected &&
                            styles.optionCodeSelected,
                        ]}
                      >
                        {pointOfSale.code}
                      </Text>
                    </View>

                    <View style={styles.checkContainer}>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={21}
                          color={COLORS.primary}
                        />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  labelIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  label: {
    marginLeft: 8,
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.darkGray,
  },

  selector: {
    minHeight: 58,
    paddingHorizontal: 12,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E5E5E1",
  },

  selectorDisabled: {
    opacity: 0.55,
  },

  selectorContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  selectedIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  selectedIconAll: {
    backgroundColor: "#FFF4D9",
  },

  selectedContent: {
    flex: 1,
    marginLeft: 10,
  },

  selectedName: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
  },

  selectedCode: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  modalOverlay: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },

  modalCard: {
    maxHeight: "75%",
    borderRadius: 24,
    padding: 18,
    backgroundColor: COLORS.white,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0ED",
  },

  modalHeaderContent: {
    flex: 1,
    paddingRight: 12,
  },

  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: COLORS.text,
  },

  modalSubtitle: {
    maxWidth: 280,
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F3",
  },

  list: {
    marginTop: 10,
  },

  listContent: {
    paddingBottom: 4,
  },

  option: {
    minHeight: 66,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECECE8",
    backgroundColor: COLORS.white,
  },

  optionSelected: {
    backgroundColor: "#F5F9F3",
    borderColor: "#DDE9D9",
  },

  optionPressed: {
    opacity: 0.65,
  },

  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  optionIconSelected: {
    backgroundColor: COLORS.primary,
  },

  optionContent: {
    flex: 1,
    marginLeft: 10,
  },

  optionNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  optionName: {
    flexShrink: 1,
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  optionNameSelected: {
    color: COLORS.primary,
  },

  optionCode: {
    marginTop: 3,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  optionCodeSelected: {
    color: COLORS.primary,
  },

  mainBadge: {
    marginLeft: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#FFF4D9",
  },

  mainBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 8,
    color: "#9A6900",
  },

  allBadge: {
    marginLeft: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#E8F2E5",
  },

  allBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 8,
    color: COLORS.primary,
  },

  checkContainer: {
    width: 24,
    alignItems: "flex-end",
  },

  pressed: {
    opacity: 0.55,
  },
});
