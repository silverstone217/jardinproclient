import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

import type { Recipe } from "@/types/recipe";

interface ProductionRecipeSectionProps {
  recipe: Recipe | null;
  recipes: Recipe[];
  selectedRecipeId: string | null;
  totalVolumeMl: string;
  referenceVolumeMl: number;
  disabled?: boolean;
  onSelectRecipe: (recipeId: string) => void;
  onVolumeChange: (value: string) => void;
}

export function ProductionRecipeSection({
  recipe,
  recipes,
  selectedRecipeId,
  totalVolumeMl,
  referenceVolumeMl,
  disabled = false,
  onSelectRecipe,
  onVolumeChange,
}: ProductionRecipeSectionProps) {
  const volume = Number(totalVolumeMl) || 0;

  const multiplier = referenceVolumeMl > 0 ? volume / referenceVolumeMl : 1;

  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <MaterialCommunityIcons
            name="book-open-variant"
            size={19}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.sectionHeaderContent}>
          <Text style={styles.sectionTitle}>Recette & volume</Text>

          <Text style={styles.sectionDescription}>
            La recette sert de référence pour calculer les quantités.
          </Text>
        </View>
      </View>

      {recipes.length > 0 ? (
        <View style={styles.recipeList}>
          {recipes.map((currentRecipe) => {
            const selected = currentRecipe.id === selectedRecipeId;

            return (
              <Pressable
                key={currentRecipe.id}
                style={({ pressed }) => [
                  styles.recipeOption,
                  selected && styles.recipeOptionSelected,
                  pressed && !disabled && styles.pressed,
                ]}
                onPress={() => onSelectRecipe(currentRecipe.id)}
                disabled={disabled}
              >
                <View
                  style={[
                    styles.recipeIcon,
                    selected && styles.recipeIconSelected,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="chef-hat"
                    size={17}
                    color={selected ? COLORS.white : COLORS.primary}
                  />
                </View>

                <View style={styles.recipeContent}>
                  <Text style={styles.recipeName}>{currentRecipe.name}</Text>

                  <Text style={styles.recipeMeta}>
                    Référence : {formatLiters(currentRecipe.productionVolumeMl)}
                  </Text>
                </View>

                {selected && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color={COLORS.primary}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyRecipe}>
          <MaterialCommunityIcons
            name="book-off-outline"
            size={23}
            color={COLORS.Gray}
          />

          <Text style={styles.emptyText}>
            Aucune recette disponible pour ce produit.
          </Text>
        </View>
      )}

      {recipe && (
        <>
          <View style={styles.volumeField}>
            <View style={styles.fieldHeader}>
              <Text style={styles.label}>Volume à produire</Text>

              <Text style={styles.helperText}>
                Référence : {formatLiters(referenceVolumeMl)}
              </Text>
            </View>

            <View style={styles.inputWithSuffix}>
              <TextInput
                value={totalVolumeMl}
                onChangeText={onVolumeChange}
                keyboardType="numeric"
                placeholder="Ex. 10000"
                placeholderTextColor={COLORS.Gray}
                editable={!disabled}
                style={styles.numericInput}
              />

              <Text style={styles.inputSuffix}>ml</Text>
            </View>

            {volume > 0 && referenceVolumeMl > 0 && (
              <View style={styles.volumePreview}>
                <MaterialCommunityIcons
                  name="calculator-variant-outline"
                  size={16}
                  color={COLORS.primary}
                />

                <Text style={styles.volumePreviewText}>
                  Multiplicateur :{" "}
                  <Text style={styles.volumePreviewStrong}>
                    {formatMultiplier(multiplier)}
                  </Text>
                </Text>
              </View>
            )}
          </View>

          {recipe.description ? (
            <View style={styles.descriptionBox}>
              <MaterialCommunityIcons
                name="information-outline"
                size={16}
                color={COLORS.primary}
              />

              <Text style={styles.descriptionText}>{recipe.description}</Text>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

function formatLiters(volumeMl: number): string {
  if (volumeMl % 1000 === 0) {
    return `${volumeMl / 1000} L`;
  }

  return `${volumeMl} ml`;
}

function formatMultiplier(value: number): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return `${Number(value.toFixed(2))}×`;
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

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  sectionHeaderContent: {
    flex: 1,
    marginLeft: 10,
  },

  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  sectionDescription: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  recipeList: {
    gap: 6,
  },

  recipeOption: {
    minHeight: 57,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#EEEEEA",
    flexDirection: "row",
    alignItems: "center",
  },

  recipeOptionSelected: {
    borderColor: "#C9DDC5",
    backgroundColor: "#F2F7F0",
  },

  recipeIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  recipeIconSelected: {
    backgroundColor: COLORS.primary,
  },

  recipeContent: {
    flex: 1,
    marginLeft: 10,
  },

  recipeName: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  recipeMeta: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  emptyRecipe: {
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "#FAFAF8",
  },

  emptyText: {
    marginTop: 7,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  volumeField: {
    marginTop: 15,
  },

  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  label: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.darkGray,
  },

  helperText: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  inputWithSuffix: {
    minHeight: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E5E8E3",
    backgroundColor: "#FAFBF9",
    flexDirection: "row",
    alignItems: "center",
  },

  numericInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 13,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: COLORS.text,
  },

  inputSuffix: {
    paddingHorizontal: 14,
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.primary,
  },

  volumePreview: {
    marginTop: 7,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 11,
    backgroundColor: "#F1F6EF",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  volumePreviewText: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.darkGray,
  },

  volumePreviewStrong: {
    fontFamily: fonts.bold,
    color: COLORS.primary,
  },

  descriptionBox: {
    marginTop: 11,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#F7F8F5",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
  },

  descriptionText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.darkGray,
  },

  pressed: {
    opacity: 0.65,
  },
});
