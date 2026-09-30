// src/components/reports/PointOfSaleSelector.tsx

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ReportService } from "@/services/ReportService";
import type { ReportPointOfSale } from "@/types/report";
import { COLORS, fontSizes, fonts } from "@/utils/styles";

// ============================================================
// TYPES
// ============================================================

interface PointOfSaleSelectorProps {
  value?: string;

  onChange: (
    pointOfSaleId: string | undefined,
    pointOfSaleName?: string,
  ) => void;

  disabled?: boolean;
}

// ============================================================
// COMPONENT
// ============================================================

export function PointOfSaleSelector({
  value,
  onChange,
  disabled = false,
}: PointOfSaleSelectorProps) {
  const [pointOfSales, setPointOfSales] = useState<ReportPointOfSale[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // ============================================================
  // LOAD POS
  // ============================================================

  const loadPointOfSales = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await ReportService.getPointOfSales();

      setPointOfSales(data);
    } catch (error) {
      console.error("Erreur récupération points de vente :", error);

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de récupérer les points de vente.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPointOfSales();
  }, [loadPointOfSales]);

  // ============================================================
  // SELECTED POS
  // ============================================================

  const selectedPointOfSale = pointOfSales.find(
    (pointOfSale) => pointOfSale.id === value,
  );

  const selectedName = selectedPointOfSale?.name ?? "Tous les POS";

  // ============================================================
  // SELECT
  // ============================================================

  const handleSelect = (pointOfSale: ReportPointOfSale | undefined) => {
    setIsOpen(false);

    if (!pointOfSale) {
      onChange(undefined, undefined);
      return;
    }

    onChange(pointOfSale.id, pointOfSale.name);
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.labelRow}>
          <MaterialCommunityIcons
            name="store-outline"
            size={20}
            color={COLORS.primary}
          />

          <Text style={styles.label}>Point de vente</Text>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />

          <Text style={styles.loadingText}>
            Chargement des points de vente...
          </Text>
        </View>
      </View>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.labelRow}>
          <MaterialCommunityIcons
            name="store-alert-outline"
            size={20}
            color={COLORS.error}
          />

          <Text style={styles.label}>Point de vente</Text>
        </View>

        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable
            onPress={loadPointOfSales}
            disabled={disabled}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Réessayer</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ============================================================
  // CONTENT
  // ============================================================

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <MaterialCommunityIcons
          name="store-outline"
          size={20}
          color={COLORS.primary}
        />

        <Text style={styles.label}>Point de vente</Text>
      </View>

      <Pressable
        onPress={() => setIsOpen((current) => !current)}
        disabled={disabled}
        style={[styles.selector, disabled && styles.selectorDisabled]}
      >
        <Text style={styles.selectedText}>{selectedName}</Text>

        <MaterialCommunityIcons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={22}
          color={COLORS.darkGray}
        />
      </Pressable>

      {isOpen && (
        <View style={styles.options}>
          {/* ================================================== */}
          {/* ALL POS */}
          {/* ================================================== */}

          <Pressable
            onPress={() => handleSelect(undefined)}
            style={[
              styles.option,
              value === undefined && styles.optionSelected,
            ]}
          >
            <View style={styles.optionContent}>
              <MaterialCommunityIcons
                name="store-search-outline"
                size={20}
                color={value === undefined ? COLORS.primary : COLORS.darkGray}
              />

              <Text
                style={[
                  styles.optionText,
                  value === undefined && styles.optionTextSelected,
                ]}
              >
                Tous les POS
              </Text>
            </View>
          </Pressable>

          {/* ================================================== */}
          {/* POS */}
          {/* ================================================== */}

          {pointOfSales.map((pointOfSale) => {
            const isSelected = pointOfSale.id === value;

            return (
              <Pressable
                key={pointOfSale.id}
                onPress={() => handleSelect(pointOfSale)}
                style={[styles.option, isSelected && styles.optionSelected]}
              >
                <View style={styles.optionContent}>
                  <MaterialCommunityIcons
                    name="store-outline"
                    size={20}
                    color={isSelected ? COLORS.primary : COLORS.darkGray}
                  />

                  <View style={styles.optionInfo}>
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {pointOfSale.name}
                    </Text>

                    <Text style={styles.optionCode}>{pointOfSale.code}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  label: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.medium,
    color: COLORS.text,
  },

  selector: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectorDisabled: {
    opacity: 0.5,
  },

  selectedText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSizes.medium,
    color: COLORS.text,
  },

  options: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },

  option: {
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
  },

  optionSelected: {
    backgroundColor: COLORS.neutral,
  },

  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  optionInfo: {
    flex: 1,
  },

  optionText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.medium,
    color: COLORS.text,
  },

  optionTextSelected: {
    fontFamily: fonts.semibold,
    color: COLORS.primary,
  },

  optionCode: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    color: COLORS.Gray,
  },

  loadingContainer: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  loadingText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    color: COLORS.darkGray,
  },

  errorContainer: {
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    gap: 10,
  },

  errorText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    color: COLORS.error,
  },

  retryButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },

  retryText: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.small,
    color: COLORS.white,
  },
});
