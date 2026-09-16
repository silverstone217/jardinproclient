import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

import type { Packaging } from "@/types/packaging";
import type { ProductVariant } from "@/types/product";

interface VariantFormItem {
  variantId: string;
  quantityProduced: string;
}

interface ProductionVariantsSectionProps {
  variants: ProductVariant[];
  formVariants: VariantFormItem[];
  packagings: Packaging[];
  disabled?: boolean;
  onVariantChange: (variantId: string, quantity: string) => void;
}

export function ProductionVariantsSection({
  variants,
  formVariants,
  packagings,
  disabled = false,
  onVariantChange,
}: ProductionVariantsSectionProps) {
  const handleQuantityChange = (
    variantId: string,
    value: string,
    maxStock: number,
  ) => {
    // Uniquement des chiffres entiers.
    const sanitized = value.replace(/[^0-9]/g, "");

    if (sanitized === "") {
      onVariantChange(variantId, "");
      return;
    }

    const parsed = Number(sanitized);

    if (!Number.isFinite(parsed)) {
      return;
    }

    // Minimum : 0
    // Maximum : stock disponible
    const quantity = Math.min(Math.max(0, parsed), maxStock);

    onVariantChange(variantId, String(quantity));
  };

  return (
    <View style={styles.card}>
      {/* ================================================== */}
      {/* HEADER                                             */}
      {/* ================================================== */}

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons
            name="bottle-soda-outline"
            size={19}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Formats à produire</Text>

          <Text style={styles.description}>
            Indiquez combien de bouteilles seront réellement produites pour
            chaque format.
          </Text>
        </View>
      </View>

      {/* ================================================== */}
      {/* VARIANTS                                           */}
      {/* ================================================== */}

      {variants.length === 0 ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons
            name="bottle-soda-outline"
            size={25}
            color={COLORS.Gray}
          />

          <Text style={styles.emptyText}>
            Aucun format actif pour ce produit.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {variants.map((variant) => {
            const formItem = formVariants.find(
              (item) => item.variantId === variant.id,
            );

            const packaging = packagings.find(
              (item) => item.id === variant.packagingId,
            );

            /*
             * Si le packaging n'existe pas dans le store,
             * on considère qu'il n'y a pas de stock utilisable.
             */
            const stockQty = packaging
              ? Math.max(0, Math.floor(Number(packaging.stockQty) || 0))
              : 0;

            const isExhausted = stockQty <= 0;

            const currentQuantity = formItem?.quantityProduced ?? "";

            return (
              <View
                key={variant.id}
                style={[styles.row, isExhausted && styles.rowExhausted]}
              >
                {/* ================================================== */}
                {/* ICON                                               */}
                {/* ================================================== */}

                <View
                  style={[
                    styles.formatIcon,
                    isExhausted && styles.formatIconExhausted,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="bottle-soda"
                    size={18}
                    color={isExhausted ? COLORS.Gray : COLORS.primary}
                  />
                </View>

                {/* ================================================== */}
                {/* INFORMATIONS                                        */}
                {/* ================================================== */}

                <View style={styles.info}>
                  <Text
                    style={[
                      styles.format,
                      isExhausted && styles.formatExhausted,
                    ]}
                    numberOfLines={1}
                  >
                    {packaging?.name ?? "Emballage"}
                  </Text>

                  <Text
                    style={[
                      styles.capacity,
                      isExhausted && styles.capacityExhausted,
                    ]}
                  >
                    {packaging
                      ? formatCapacity(packaging.capacityMl)
                      : "Capacité inconnue"}
                    {" · "}
                    {variant.sku}
                  </Text>

                  {/* ================================================== */}
                  {/* STOCK DISPONIBLE                                   */}
                  {/* ================================================== */}

                  <Text
                    style={[styles.stock, isExhausted && styles.stockExhausted]}
                  >
                    Stock disponible : {stockQty} bouteille
                    {stockQty > 1 ? "s" : ""}
                  </Text>
                </View>

                {/* ================================================== */}
                {/* QUANTITE / EPUISE                                   */}
                {/* ================================================== */}

                {isExhausted ? (
                  <View style={styles.exhaustedBadge}>
                    <MaterialCommunityIcons
                      name="package-variant-closed-remove"
                      size={14}
                      color={COLORS.error}
                    />

                    <Text style={styles.exhaustedText}>Épuisé</Text>
                  </View>
                ) : (
                  <View style={styles.quantityContainer}>
                    <TextInput
                      value={currentQuantity}
                      onChangeText={(value) =>
                        handleQuantityChange(variant.id, value, stockQty)
                      }
                      keyboardType="number-pad"
                      editable={!disabled}
                      placeholder="0"
                      placeholderTextColor={COLORS.Gray}
                      style={styles.quantityInput}
                      maxLength={String(stockQty).length}
                    />

                    <Text style={styles.quantitySuffix}>bt</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* ================================================== */}
      {/* INFO                                               */}
      {/* ================================================== */}

      <View style={styles.infoBox}>
        <MaterialCommunityIcons
          name="information-outline"
          size={16}
          color={COLORS.info}
        />

        <Text style={styles.infoText}>
          La quantité produite ne peut pas dépasser le nombre de bouteilles
          disponibles en stock.
        </Text>
      </View>
    </View>
  );
}

function formatCapacity(capacityMl: number): string {
  if (capacityMl >= 1000) {
    const liters = capacityMl / 1000;

    return `${Number(liters.toFixed(2))} L`;
  }

  return `${capacityMl} ml`;
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
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

  description: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  // ==========================================================
  // LIST
  // ==========================================================

  list: {
    gap: 7,
  },

  row: {
    minHeight: 78,
    padding: 9,
    borderRadius: 13,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#EEEEEA",
    flexDirection: "row",
    alignItems: "center",
  },

  rowExhausted: {
    backgroundColor: "#FCF9F9",
    borderColor: "#F0E1E1",
  },

  // ==========================================================
  // ICON
  // ==========================================================

  formatIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  formatIconExhausted: {
    backgroundColor: "#F0F0F0",
  },

  // ==========================================================
  // INFO
  // ==========================================================

  info: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
    marginRight: 8,
  },

  format: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.text,
  },

  formatExhausted: {
    color: COLORS.Gray,
  },

  capacity: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  capacityExhausted: {
    color: "#B5B5B5",
  },

  stock: {
    marginTop: 4,
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: COLORS.primary,
  },

  stockExhausted: {
    color: COLORS.error,
  },

  // ==========================================================
  // QUANTITY
  // ==========================================================

  quantityContainer: {
    width: 86,
    height: 40,
    marginLeft: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E1E5DF",
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
  },

  quantityInput: {
    flex: 1,
    height: 38,
    paddingHorizontal: 7,
    fontFamily: fonts.medium,
    fontSize: 11,
    color: COLORS.text,
    textAlign: "right",
  },

  quantitySuffix: {
    paddingRight: 7,
    paddingLeft: 2,
    fontFamily: fonts.semibold,
    fontSize: 8.5,
    color: COLORS.primary,
  },

  // ==========================================================
  // EXHAUSTED
  // ==========================================================

  exhaustedBadge: {
    minHeight: 34,
    paddingHorizontal: 9,
    borderRadius: 10,
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F4D4D4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  exhaustedText: {
    fontFamily: fonts.semibold,
    fontSize: 8.5,
    color: COLORS.error,
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyBox: {
    minHeight: 100,
    borderRadius: 13,
    backgroundColor: "#FAFAF8",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    marginTop: 7,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  // ==========================================================
  // INFO
  // ==========================================================

  infoBox: {
    marginTop: 11,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#EFF7FC",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
  },

  infoText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 14,
    color: "#4E6C7C",
  },
});
