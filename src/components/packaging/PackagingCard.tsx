import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Packaging } from "@/types/packaging";
import { COLORS, fonts } from "@/utils/styles";

interface PackagingCardProps {
  packaging: Packaging;
  onEdit: () => void;
  onAdjustStock: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  isUpdating?: boolean;
  isAdjustingStock?: boolean;
  isDeleting?: boolean;
}

export function PackagingCard({
  packaging,
  onEdit,
  onAdjustStock,
  onToggleActive,
  onDelete,
  isUpdating = false,
  isAdjustingStock = false,
  isDeleting = false,
}: PackagingCardProps) {
  const isLowStock = packaging.stockQty <= packaging.minAlert;

  const isOutOfStock = packaging.stockQty === 0;

  const isBusy = isUpdating || isAdjustingStock || isDeleting;

  const sizeLabel = packaging.size === "ML_200" ? "200 ml" : "500 ml";

  return (
    <View style={[styles.card, !packaging.isActive && styles.cardInactive]}>
      <View style={styles.topRow}>
        <View style={styles.iconWrapper}>
          <MaterialCommunityIcons
            name="bottle-soda-outline"
            size={23}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.mainInfo}>
          <View style={styles.nameRow}>
            <Text
              style={[styles.name, !packaging.isActive && styles.textInactive]}
              numberOfLines={1}
            >
              {packaging.name}
            </Text>

            <View
              style={[
                styles.sizeBadge,
                packaging.size === "ML_500" && styles.sizeBadge500,
              ]}
            >
              <Text
                style={[
                  styles.sizeText,
                  packaging.size === "ML_500" && styles.sizeText500,
                ]}
              >
                {sizeLabel}
              </Text>
            </View>
          </View>

          <Text style={styles.capacity}>
            Capacité : {packaging.capacityMl} ml
          </Text>
        </View>

        <View
          style={[
            styles.statusDot,
            packaging.isActive ? styles.statusActive : styles.statusInactive,
          ]}
        />
      </View>

      <View style={styles.stockSection}>
        <View style={styles.stockHeader}>
          <View style={styles.stockLabelRow}>
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={16}
              color={
                isOutOfStock
                  ? COLORS.error
                  : isLowStock
                    ? COLORS.warning
                    : COLORS.primary
              }
            />

            <Text style={styles.stockLabel}>Stock disponible</Text>
          </View>

          <Text
            style={[
              styles.stockValue,
              isOutOfStock && styles.stockValueDanger,
              isLowStock && !isOutOfStock && styles.stockValueWarning,
            ]}
          >
            {packaging.stockQty}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(
                  packaging.minAlert > 0
                    ? (packaging.stockQty /
                        Math.max(packaging.minAlert * 2, packaging.stockQty)) *
                        100
                    : packaging.stockQty > 0
                      ? 100
                      : 0,
                  100,
                )}%`,
              },
              isOutOfStock && styles.progressDanger,
              isLowStock && !isOutOfStock && styles.progressWarning,
            ]}
          />
        </View>

        <View style={styles.stockFooter}>
          <Text style={styles.alertText}>
            Seuil d'alerte : {packaging.minAlert}
          </Text>

          {isOutOfStock ? (
            <View style={[styles.stockBadge, styles.stockBadgeDanger]}>
              <Text
                style={[styles.stockBadgeText, styles.stockBadgeTextDanger]}
              >
                Rupture
              </Text>
            </View>
          ) : isLowStock ? (
            <View style={[styles.stockBadge, styles.stockBadgeWarning]}>
              <Text
                style={[styles.stockBadgeText, styles.stockBadgeTextWarning]}
              >
                Stock faible
              </Text>
            </View>
          ) : (
            <View style={[styles.stockBadge, styles.stockBadgeGood]}>
              <Text style={[styles.stockBadgeText, styles.stockBadgeTextGood]}>
                Stock OK
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionPressed,
          ]}
          onPress={onAdjustStock}
          disabled={isBusy}
        >
          <MaterialCommunityIcons
            name="swap-vertical"
            size={17}
            color={COLORS.primary}
          />

          <Text style={styles.actionText}>Stock</Text>
        </Pressable>

        <View style={styles.actionDivider} />

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionPressed,
          ]}
          onPress={onEdit}
          disabled={isBusy}
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={17}
            color={COLORS.primary}
          />

          <Text style={styles.actionText}>Modifier</Text>
        </Pressable>

        <View style={styles.actionDivider} />

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionPressed,
          ]}
          onPress={onToggleActive}
          disabled={isBusy}
        >
          <MaterialCommunityIcons
            name={packaging.isActive ? "eye-off-outline" : "eye-outline"}
            size={17}
            color={COLORS.darkGray}
          />

          <Text style={[styles.actionText, styles.actionTextNeutral]}>
            {packaging.isActive ? "Désactiver" : "Activer"}
          </Text>
        </Pressable>

        <View style={styles.actionDivider} />

        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.actionPressed,
          ]}
          onPress={onDelete}
          disabled={isBusy}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={17}
            color={COLORS.error}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    marginBottom: 12,
  },

  cardInactive: {
    opacity: 0.62,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  mainInfo: {
    flex: 1,
    marginLeft: 12,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  name: {
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 13.5,
    color: COLORS.text,
  },

  textInactive: {
    color: COLORS.Gray,
  },

  capacity: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  sizeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: "#FFF1E2",
  },

  sizeBadge500: {
    backgroundColor: "#E8F1FB",
  },

  sizeText: {
    fontFamily: fonts.semibold,
    fontSize: 8.5,
    color: "#D97817",
  },

  sizeText500: {
    color: "#3478C5",
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginLeft: 8,
  },

  statusActive: {
    backgroundColor: COLORS.success,
  },

  statusInactive: {
    backgroundColor: COLORS.Gray,
  },

  stockSection: {
    marginTop: 16,
    padding: 13,
    borderRadius: 15,
    backgroundColor: "#FAFAF8",
  },

  stockHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  stockLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  stockLabel: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: COLORS.darkGray,
  },

  stockValue: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: COLORS.primary,
  },

  stockValueWarning: {
    color: COLORS.warning,
  },

  stockValueDanger: {
    color: COLORS.error,
  },

  progressTrack: {
    height: 5,
    marginTop: 9,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: "#E7E7E3",
  },

  progressBar: {
    height: "100%",
    minWidth: 0,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },

  progressWarning: {
    backgroundColor: COLORS.warning,
  },

  progressDanger: {
    backgroundColor: COLORS.error,
  },

  stockFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },

  alertText: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  stockBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
  },

  stockBadgeGood: {
    backgroundColor: "#E8F4E8",
  },

  stockBadgeWarning: {
    backgroundColor: "#FFF4D9",
  },

  stockBadgeDanger: {
    backgroundColor: "#FDECEC",
  },

  stockBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 8,
  },

  stockBadgeTextGood: {
    color: COLORS.success,
  },

  stockBadgeTextWarning: {
    color: "#B17B00",
  },

  stockBadgeTextDanger: {
    color: COLORS.error,
  },

  divider: {
    height: 1,
    marginTop: 14,
    backgroundColor: "#F0F0ED",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  actionButton: {
    minHeight: 34,
    paddingHorizontal: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: 9,
  },

  actionText: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: COLORS.primary,
  },

  actionTextNeutral: {
    color: COLORS.darkGray,
  },

  actionDivider: {
    width: 1,
    height: 17,
    marginHorizontal: 2,
    backgroundColor: "#E9E9E5",
  },

  deleteButton: {
    width: 32,
    height: 32,
    marginLeft: "auto",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDECEC",
  },

  actionPressed: {
    opacity: 0.55,
  },
});
