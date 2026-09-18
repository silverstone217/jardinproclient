import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { LossCategory } from "@/types/loss";

import { COLORS, fonts } from "@/utils/styles";

interface LossCategorySelectorProps {
  value: LossCategory | null;
  onChange: (category: LossCategory) => void;
  disabled?: boolean;
}

interface CategoryOption {
  value: LossCategory;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
}

const OPTIONS: CategoryOption[] = [
  {
    value: "RAW_INGREDIENT",
    label: "Matière première",
    description: "Fruits, ingrédients...",
    icon: "leaf-outline",
    color: COLORS.primary,
    backgroundColor: "#E8F2E5",
  },
  {
    value: "PACKAGING",
    label: "Emballage",
    description: "Bouteilles, contenants...",
    icon: "cube-outline",
    color: COLORS.secondary,
    backgroundColor: "#FFF3DF",
  },
  {
    value: "FINISHED_PRODUCT",
    label: "Produit fini",
    description: "Jus prêts à vendre",
    icon: "flask-outline",
    color: "#7952A8",
    backgroundColor: "#F3EAF8",
  },
];

export function LossCategorySelector({
  value,
  onChange,
  disabled = false,
}: LossCategorySelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Type de perte</Text>

        <Text style={styles.subtitle}>Que souhaitez-vous déclarer ?</Text>
      </View>

      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <Pressable
              key={option.value}
              style={({ pressed }) => [
                styles.option,
                isSelected && {
                  borderColor: option.color,
                  backgroundColor: option.backgroundColor,
                },
                disabled && styles.optionDisabled,
                pressed && !disabled && styles.pressed,
              ]}
              onPress={() => onChange(option.value)}
              disabled={disabled}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: isSelected
                      ? COLORS.white
                      : option.backgroundColor,
                  },
                ]}
              >
                <Ionicons name={option.icon} size={19} color={option.color} />
              </View>

              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionLabel,
                    isSelected && {
                      color: option.color,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {option.label}
                </Text>

                <Text style={styles.optionDescription} numberOfLines={1}>
                  {option.description}
                </Text>
              </View>

              <View
                style={[
                  styles.radio,
                  isSelected && {
                    borderColor: option.color,
                  },
                ]}
              >
                {isSelected && (
                  <View
                    style={[
                      styles.radioSelected,
                      {
                        backgroundColor: option.color,
                      },
                    ]}
                  />
                )}
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
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  header: {
    marginBottom: 13,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  options: {
    gap: 9,
  },

  option: {
    minHeight: 62,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ECECE8",
    backgroundColor: "#FAFAF8",
    flexDirection: "row",
    alignItems: "center",
  },

  optionDisabled: {
    opacity: 0.5,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  optionContent: {
    flex: 1,
    marginLeft: 10,
    paddingRight: 8,
  },

  optionLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  optionDescription: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D7D7D3",
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  pressed: {
    opacity: 0.65,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },
});
