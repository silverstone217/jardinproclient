import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { RawIngredient } from "@/types/raw-ingredient";

import { COLORS, fonts } from "@/utils/styles";

interface IngredientFormItem {
  ingredientId: string;
  quantity: string;
  manuallyEdited: boolean;
}

interface ProductionIngredientsSectionProps {
  ingredients: IngredientFormItem[];
  rawIngredients: RawIngredient[];
  hasRecipe: boolean;
  disabled?: boolean;
  onIngredientChange: (ingredientId: string, quantity: string) => void;
  onReset: () => void;
}

// ============================================================
// FORMAT UNITÉ COURTE
// ============================================================

const formatUnit = (unit: string): string => {
  const normalized = unit.trim().toUpperCase();

  const units: Record<string, string> = {
    PIECE: "pièce(s)",
    PIECES: "pièce(s)",
    UNIT: "pièce(s)",
    UNITE: "pièce(s)",
    UNITES: "pièce(s)",

    GRAM: "g",
    GRAMS: "g",
    G: "g",

    KILOGRAM: "kg",
    KILOGRAMS: "kg",
    KG: "kg",

    MILLILITER: "ml",
    MILLILITERS: "ml",
    MILLILITRE: "ml",
    MILLILITRES: "ml",
    ML: "ml",

    LITER: "L",
    LITERS: "L",
    LITRE: "L",
    LITRES: "L",
    L: "L",
  };

  return units[normalized] ?? unit;
};

// ============================================================
// VALEUR NUMÉRIQUE SÛRE
// ============================================================

const parseQuantity = (value: string): number => {
  const normalized = value.replace(",", ".").trim();

  if (!normalized) {
    return 0;
  }

  const number = Number(normalized);

  return Number.isFinite(number) ? number : 0;
};

// ============================================================
// ARRONDIR TOUJOURS AU SUPÉRIEUR
// ============================================================

const roundQuantityUp = (value: string): string => {
  const quantity = parseQuantity(value);

  if (quantity <= 0) {
    return "";
  }

  return Math.ceil(quantity).toString();
};

export function ProductionIngredientsSection({
  ingredients,
  rawIngredients,
  hasRecipe,
  disabled = false,
  onIngredientChange,
  onReset,
}: ProductionIngredientsSectionProps) {
  const handleQuantityChange = (ingredientId: string, value: string) => {
    // Autorise uniquement les chiffres et un séparateur décimal.
    // La virgule française est convertie en point.
    const sanitized = value.replace(",", ".").replace(/[^0-9.]/g, "");

    // Un seul séparateur décimal.
    const parts = sanitized.split(".");

    const normalized =
      parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : sanitized;

    onIngredientChange(ingredientId, normalized);
  };

  const handleQuantityBlur = (ingredientId: string, value: string) => {
    const rounded = roundQuantityUp(value);

    onIngredientChange(ingredientId, rounded);
  };

  return (
    <View style={styles.card}>
      {/* ================================================== */}
      {/* HEADER                                             */}
      {/* ================================================== */}

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Matières premières</Text>

          <Text style={styles.description}>
            Vérifiez et ajustez les quantités réellement utilisées.
          </Text>
        </View>

        {hasRecipe && ingredients.length > 0 && (
          <Pressable
            style={({ pressed }) => [
              styles.resetButton,
              pressed && !disabled && styles.pressed,
            ]}
            onPress={onReset}
            disabled={disabled}
          >
            <MaterialCommunityIcons
              name="refresh"
              size={15}
              color={COLORS.primary}
            />

            <Text style={styles.resetButtonText}>Réinitialiser</Text>
          </Pressable>
        )}
      </View>

      {/* ================================================== */}
      {/* EMPTY — PAS DE RECETTE                             */}
      {/* ================================================== */}

      {!hasRecipe ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons
            name="flask-empty-outline"
            size={24}
            color={COLORS.Gray}
          />

          <Text style={styles.emptyText}>
            Sélectionnez d'abord un produit avec une recette.
          </Text>
        </View>
      ) : ingredients.length === 0 ? (
        /* ================================================== */
        /* EMPTY — RECETTE SANS INGRÉDIENT                    */
        /* ================================================== */

        <View style={styles.emptyBox}>
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={24}
            color={COLORS.Gray}
          />

          <Text style={styles.emptyText}>
            Aucun ingrédient dans cette recette.
          </Text>
        </View>
      ) : (
        /* ================================================== */
        /* INGREDIENTS                                        */
        /* ================================================== */

        <View style={styles.list}>
          {ingredients.map((item) => {
            const ingredient = rawIngredients.find(
              (current) => current.id === item.ingredientId,
            );

            if (!ingredient) {
              return (
                <View key={item.ingredientId} style={styles.missingRow}>
                  <MaterialCommunityIcons
                    name="alert-outline"
                    size={17}
                    color={COLORS.error}
                  />

                  <Text style={styles.missingText}>
                    Matière première introuvable
                  </Text>
                </View>
              );
            }

            const stockQty = Number(ingredient.stockQty ?? 0);

            const requestedQty = parseQuantity(item.quantity);

            const isOutOfStock = stockQty <= 0;

            const isInsufficient = !isOutOfStock && requestedQty > stockQty;

            const isInvalidStock = isOutOfStock || isInsufficient;

            const displayUnit = formatUnit(ingredient.unit);

            return (
              <View
                key={item.ingredientId}
                style={[
                  styles.ingredientRow,
                  isInsufficient && styles.ingredientRowError,
                ]}
              >
                {/* ======================================== */}
                {/* INGREDIENT INFO                           */}
                {/* ======================================== */}

                <View style={styles.ingredientInfo}>
                  <View
                    style={[
                      styles.ingredientIcon,
                      isOutOfStock && styles.ingredientIconDisabled,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="leaf"
                      size={16}
                      color={isOutOfStock ? COLORS.Gray : COLORS.primary}
                    />
                  </View>

                  <View style={styles.ingredientNameContainer}>
                    <Text style={styles.ingredientName} numberOfLines={1}>
                      {ingredient.name}
                    </Text>

                    <Text style={styles.ingredientUnit}>
                      Stock : {stockQty} {displayUnit}
                    </Text>
                  </View>
                </View>

                {/* ======================================== */}
                {/* STOCK ÉPUISÉ                              */}
                {/* ======================================== */}

                {isOutOfStock ? (
                  <View style={styles.outOfStockBadge}>
                    <MaterialCommunityIcons
                      name="alert-circle-outline"
                      size={14}
                      color={COLORS.error}
                    />

                    <Text style={styles.outOfStockText}>Épuisé</Text>
                  </View>
                ) : (
                  /* ====================================== */
                  /* INPUT                                   */
                  /* ====================================== */

                  <View
                    style={[
                      styles.inputContainer,
                      isInsufficient && styles.inputContainerError,
                    ]}
                  >
                    <TextInput
                      value={item.quantity}
                      onChangeText={(value) =>
                        handleQuantityChange(item.ingredientId, value)
                      }
                      onBlur={() =>
                        handleQuantityBlur(item.ingredientId, item.quantity)
                      }
                      keyboardType="decimal-pad"
                      editable={!disabled}
                      placeholder="0"
                      placeholderTextColor={COLORS.Gray}
                      style={[
                        styles.input,
                        isInsufficient && styles.inputError,
                      ]}
                    />

                    <Text
                      style={[
                        styles.inputUnit,
                        isInsufficient && styles.inputUnitError,
                      ]}
                    >
                      {displayUnit}
                    </Text>
                  </View>
                )}
              </View>
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
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  title: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  description: {
    marginTop: 3,
    maxWidth: 245,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  resetButton: {
    minHeight: 31,
    paddingHorizontal: 8,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EDF4EB",
  },

  resetButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: COLORS.primary,
  },

  // ==========================================================
  // LIST
  // ==========================================================

  list: {
    gap: 7,
  },

  ingredientRow: {
    minHeight: 62,
    padding: 9,
    borderRadius: 13,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#EEEEEA",
    flexDirection: "row",
    alignItems: "center",
  },

  ingredientRowError: {
    borderColor: "#F2B8B5",
    backgroundColor: "#FFF9F8",
  },

  ingredientInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  ingredientIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  ingredientIconDisabled: {
    backgroundColor: "#F0F0EE",
  },

  ingredientNameContainer: {
    flex: 1,
    marginLeft: 8,
  },

  ingredientName: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.text,
  },

  ingredientUnit: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  // ==========================================================
  // INPUT
  // ==========================================================

  inputContainer: {
    width: 105,
    height: 40,
    marginLeft: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E1E5DF",
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
  },

  inputContainerError: {
    borderColor: COLORS.error,
    backgroundColor: "#FFF4F3",
  },

  input: {
    flex: 1,
    height: 38,
    paddingHorizontal: 8,
    fontFamily: fonts.medium,
    fontSize: 11,
    color: COLORS.text,
    textAlign: "right",
  },

  inputError: {
    color: COLORS.error,
  },

  inputUnit: {
    paddingRight: 8,
    paddingLeft: 3,
    fontFamily: fonts.semibold,
    fontSize: 8.5,
    color: COLORS.primary,
  },

  inputUnitError: {
    color: COLORS.error,
  },

  // ==========================================================
  // STOCK ÉPUISÉ
  // ==========================================================

  outOfStockBadge: {
    minHeight: 34,
    marginLeft: 8,
    paddingHorizontal: 10,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F5D0CE",
  },

  outOfStockText: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
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
    paddingHorizontal: 20,
  },

  emptyText: {
    marginTop: 7,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
    textAlign: "center",
  },

  // ==========================================================
  // MISSING
  // ==========================================================

  missingRow: {
    minHeight: 50,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#FDECEC",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  missingText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: COLORS.error,
  },

  // ==========================================================
  // PRESS
  // ==========================================================

  pressed: {
    opacity: 0.55,
  },
});
