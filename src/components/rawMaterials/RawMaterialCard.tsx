import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { RawIngredient } from "@/types/raw-ingredient";
import { COLORS, fonts } from "@/utils/styles";

interface RawMaterialCardProps {
  ingredient: RawIngredient;
  onPress: () => void;
  onEdit: () => void;
}

const UNIT_LABELS: Record<RawIngredient["unit"], string> = {
  PIECE: "pièce",
  GRAM: "g",
  KILOGRAM: "kg",
  MILLILITER: "ml",
  LITER: "L",
};

const formatQuantity = (quantity: number) => {
  if (Number.isInteger(quantity)) {
    return quantity.toString();
  }

  return quantity.toFixed(3).replace(/\.?0+$/, "");
};

export function RawMaterialCard({
  ingredient,
  onPress,
  onEdit,
}: RawMaterialCardProps) {
  const isLowStock = ingredient.stockQty <= ingredient.minAlert;

  const unit = UNIT_LABELS[ingredient.unit];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconContainer,
            isLowStock && styles.iconContainerWarning,
            !ingredient.isActive && styles.iconContainerInactive,
          ]}
        >
          <Ionicons
            name={ingredient.unit === "PIECE" ? "cube-outline" : "leaf-outline"}
            size={21}
            color={
              !ingredient.isActive
                ? COLORS.Gray
                : isLowStock
                  ? "#D88A00"
                  : COLORS.primary
            }
          />
        </View>

        <View style={styles.mainInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {ingredient.name}
            </Text>

            {!ingredient.isActive && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>Inactive</Text>
              </View>
            )}
          </View>

          <Text style={styles.unitText}>Unité : {unit}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.editButton,
            pressed && styles.editButtonPressed,
          ]}
          onPress={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          hitSlop={6}
        >
          <Ionicons name="create-outline" size={18} color={COLORS.primary} />
        </Pressable>
      </View>

      <View style={styles.stockSection}>
        <View>
          <Text style={styles.stockLabel}>Stock actuel</Text>

          <View style={styles.quantityRow}>
            <Text
              style={[
                styles.quantity,
                isLowStock && styles.quantityWarning,
                !ingredient.isActive && styles.quantityInactive,
              ]}
            >
              {formatQuantity(ingredient.stockQty)}
            </Text>

            <Text style={styles.quantityUnit}>{unit}</Text>
          </View>
        </View>

        <View
          style={[
            styles.statusContainer,
            isLowStock && styles.statusContainerWarning,
            !ingredient.isActive && styles.statusContainerInactive,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: !ingredient.isActive
                  ? COLORS.Gray
                  : isLowStock
                    ? "#D88A00"
                    : COLORS.success,
              },
            ]}
          />

          <Text
            style={[
              styles.statusText,
              isLowStock && styles.statusTextWarning,
              !ingredient.isActive && styles.statusTextInactive,
            ]}
          >
            {!ingredient.isActive
              ? "Inactive"
              : isLowStock
                ? "Stock faible"
                : "Stock normal"}
          </Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.alertText}>
          Seuil d'alerte : {formatQuantity(ingredient.minAlert)} {unit}
        </Text>

        <Ionicons name="chevron-forward" size={17} color={COLORS.Gray} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E9E9E6",
  },

  cardPressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.995,
      },
    ],
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  iconContainerWarning: {
    backgroundColor: "#FFF4D9",
  },

  iconContainerInactive: {
    backgroundColor: "#F0F0EF",
  },

  mainInfo: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    flexShrink: 1,
    fontFamily: fonts.semibold,
    fontSize: 13.5,
    color: COLORS.text,
  },

  inactiveBadge: {
    marginLeft: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: "#F0F0EF",
  },

  inactiveBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 8,
    color: COLORS.Gray,
  },

  unitText: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  editButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F6EF",
  },

  editButtonPressed: {
    opacity: 0.55,
  },

  stockSection: {
    marginTop: 15,
    paddingTop: 13,
    paddingBottom: 13,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F0F0ED",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  stockLabel: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  quantityRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 2,
  },

  quantity: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: COLORS.primary,
  },

  quantityWarning: {
    color: "#D88A00",
  },

  quantityInactive: {
    color: COLORS.Gray,
  },

  quantityUnit: {
    marginLeft: 5,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: COLORS.darkGray,
  },

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#EDF7EC",
  },

  statusContainerWarning: {
    backgroundColor: "#FFF5DE",
  },

  statusContainerInactive: {
    backgroundColor: "#F1F1F0",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  statusText: {
    marginLeft: 5,
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: COLORS.success,
  },

  statusTextWarning: {
    color: "#B87900",
  },

  statusTextInactive: {
    color: COLORS.Gray,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 11,
  },

  alertText: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },
});
