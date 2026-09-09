import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type { RawIngredient } from "@/types/raw-ingredient";

import { COLORS, fonts } from "@/utils/styles";

interface RawMaterialDetailsModalProps {
  visible: boolean;
  ingredient: RawIngredient | null;

  isAdjustingStock?: boolean;
  isDeleting?: boolean;
  isUpdating?: boolean;

  onClose: () => void;
  onEdit: () => void;

  onAdjustStock: (quantity: number, note?: string) => Promise<void>;

  onToggleActive: (isActive: boolean) => Promise<void>;

  onDelete: () => Promise<void>;
}

const UNIT_LABELS: Record<RawIngredient["unit"], string> = {
  PIECE: "Pièce",
  GRAM: "Gramme",
  KILOGRAM: "Kilogramme",
  MILLILITER: "Millilitre",
  LITER: "Litre",
};

const formatQuantity = (quantity: number) => {
  if (Number.isInteger(quantity)) {
    return quantity.toString();
  }

  return quantity.toFixed(3).replace(/\.?0+$/, "");
};

export function RawMaterialDetailsModal({
  visible,
  ingredient,
  isAdjustingStock = false,
  isDeleting = false,
  isUpdating = false,
  onClose,
  onEdit,
  onAdjustStock,
  onToggleActive,
  onDelete,
}: RawMaterialDetailsModalProps) {
  const [adjustment, setAdjustment] = React.useState("");

  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (!visible) {
      setAdjustment("");
      setNote("");
    }
  }, [visible]);

  if (!ingredient) {
    return null;
  }

  const isLowStock = ingredient.stockQty <= ingredient.minAlert;

  const unit = UNIT_LABELS[ingredient.unit];

  const parsedAdjustment = Number(adjustment.replace(",", "."));

  const canAdjust =
    adjustment.trim() !== "" &&
    Number.isFinite(parsedAdjustment) &&
    parsedAdjustment !== 0;

  const handleAdjustment = async () => {
    if (!canAdjust) {
      return;
    }

    const newStock = ingredient.stockQty + parsedAdjustment;

    if (newStock < 0) {
      Alert.alert(
        "Stock insuffisant",
        `Le stock actuel est de ${formatQuantity(
          ingredient.stockQty,
        )} ${unit.toLowerCase()}.`,
      );

      return;
    }

    try {
      await onAdjustStock(parsedAdjustment, note.trim() || undefined);

      setAdjustment("");
      setNote("");
    } catch {
      // Le parent gère l'erreur.
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Supprimer la matière",
      `Voulez-vous vraiment supprimer « ${ingredient.name} » ?`,
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await onDelete();
            } catch {
              // Le parent gère l'erreur.
            }
          },
        },
      ],
    );
  };

  const handleToggle = () => {
    const nextStatus = !ingredient.isActive;

    Alert.alert(
      nextStatus ? "Activer la matière" : "Désactiver la matière",
      nextStatus
        ? `« ${ingredient.name} » sera à nouveau disponible dans la gestion.`
        : `« ${ingredient.name} » sera désactivée. Son historique et son stock seront conservés.`,
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: nextStatus ? "Activer" : "Désactiver",
          onPress: async () => {
            try {
              await onToggleActive(nextStatus);
            } catch {
              // Le parent gère l'erreur.
            }
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modal}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View
              style={[
                styles.headerIcon,
                isLowStock && styles.headerIconWarning,
                !ingredient.isActive && styles.headerIconInactive,
              ]}
            >
              <Ionicons
                name="leaf-outline"
                size={22}
                color={
                  !ingredient.isActive
                    ? COLORS.Gray
                    : isLowStock
                      ? "#D88A00"
                      : COLORS.primary
                }
              />
            </View>

            <View style={styles.headerContent}>
              <Text style={styles.title} numberOfLines={1}>
                {ingredient.name}
              </Text>

              <Text style={styles.subtitle}>
                Détails de la matière première
              </Text>
            </View>

            <Pressable style={styles.closeButton} onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={20} color={COLORS.darkGray} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <View style={styles.stockCard}>
              <View>
                <Text style={styles.stockLabel}>Stock actuel</Text>

                <View style={styles.stockQuantityRow}>
                  <Text
                    style={[
                      styles.stockQuantity,
                      isLowStock && styles.stockQuantityWarning,
                    ]}
                  >
                    {formatQuantity(ingredient.stockQty)}
                  </Text>

                  <Text style={styles.stockUnit}>{unit.toLowerCase()}</Text>
                </View>
              </View>

              <View
                style={[
                  styles.stockStatus,
                  isLowStock && styles.stockStatusWarning,
                ]}
              >
                <Ionicons
                  name={
                    isLowStock ? "warning-outline" : "checkmark-circle-outline"
                  }
                  size={16}
                  color={isLowStock ? "#D88A00" : COLORS.success}
                />

                <Text
                  style={[
                    styles.stockStatusText,
                    isLowStock && styles.stockStatusTextWarning,
                  ]}
                >
                  {isLowStock ? "Stock faible" : "Stock normal"}
                </Text>
              </View>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons
                    name="scale-outline"
                    size={17}
                    color={COLORS.primary}
                  />
                </View>

                <View>
                  <Text style={styles.infoLabel}>Unité</Text>

                  <Text style={styles.infoValue}>{unit}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, styles.infoIconWarning]}>
                  <Ionicons
                    name="notifications-outline"
                    size={17}
                    color="#D88A00"
                  />
                </View>

                <View>
                  <Text style={styles.infoLabel}>Seuil d'alerte</Text>

                  <Text style={styles.infoValue}>
                    {formatQuantity(ingredient.minAlert)} {unit.toLowerCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View
                  style={[
                    styles.infoIcon,
                    ingredient.isActive
                      ? styles.infoIconSuccess
                      : styles.infoIconInactive,
                  ]}
                >
                  <Ionicons
                    name={
                      ingredient.isActive
                        ? "checkmark-circle-outline"
                        : "pause-circle-outline"
                    }
                    size={17}
                    color={ingredient.isActive ? COLORS.success : COLORS.Gray}
                  />
                </View>

                <View>
                  <Text style={styles.infoLabel}>Statut</Text>

                  <Text style={styles.infoValue}>
                    {ingredient.isActive ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Ionicons
                    name="swap-vertical-outline"
                    size={17}
                    color={COLORS.primary}
                  />
                </View>

                <View>
                  <Text style={styles.sectionTitle}>Ajuster le stock</Text>

                  <Text style={styles.sectionSubtitle}>
                    Ajoutez ou retirez une quantité.
                  </Text>
                </View>
              </View>

              <View style={styles.adjustmentRow}>
                <View style={styles.adjustmentInput}>
                  <Text style={styles.adjustmentSign}>±</Text>

                  <TextInput
                    value={adjustment}
                    onChangeText={setAdjustment}
                    placeholder="0"
                    placeholderTextColor={COLORS.Gray}
                    keyboardType="decimal-pad"
                    style={styles.adjustmentTextInput}
                    editable={!isAdjustingStock}
                  />

                  <Text style={styles.adjustmentUnit}>
                    {unit.toLowerCase()}
                  </Text>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.adjustButton,
                    (!canAdjust || isAdjustingStock) &&
                      styles.adjustButtonDisabled,
                    pressed &&
                      canAdjust &&
                      !isAdjustingStock &&
                      styles.adjustButtonPressed,
                  ]}
                  onPress={handleAdjustment}
                  disabled={!canAdjust || isAdjustingStock}
                >
                  {isAdjustingStock ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Ionicons name="checkmark" size={19} color={COLORS.white} />
                  )}
                </Pressable>
              </View>

              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Motif de l'ajustement (optionnel)"
                placeholderTextColor={COLORS.Gray}
                style={styles.noteInput}
                multiline
                numberOfLines={2}
                maxLength={255}
                editable={!isAdjustingStock}
              />
            </View>

            <View style={styles.actionsSection}>
              <Pressable
                style={({ pressed }) => [
                  styles.editButton,
                  pressed && styles.actionPressed,
                ]}
                onPress={onEdit}
                disabled={isUpdating || isDeleting}
              >
                <Ionicons
                  name="create-outline"
                  size={18}
                  color={COLORS.primary}
                />

                <Text style={styles.editButtonText}>Modifier</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.statusButton,
                  pressed && styles.actionPressed,
                ]}
                onPress={handleToggle}
                disabled={isUpdating || isDeleting}
              >
                <Ionicons
                  name={ingredient.isActive ? "pause-outline" : "play-outline"}
                  size={18}
                  color={COLORS.darkGray}
                />

                <Text style={styles.statusButtonText}>
                  {ingredient.isActive ? "Désactiver" : "Activer"}
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.deleteButton,
                  pressed && styles.actionPressed,
                ]}
                onPress={handleDelete}
                disabled={isDeleting || isUpdating}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={COLORS.error} />
                ) : (
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={COLORS.error}
                  />
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

import React from "react";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.42)",
  },

  modal: {
    maxHeight: "92%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
  },

  handle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DADAD7",
    marginBottom: 17,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 17,
  },

  headerIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  headerIconWarning: {
    backgroundColor: "#FFF4D9",
  },

  headerIconInactive: {
    backgroundColor: "#F0F0EF",
  },

  headerContent: {
    flex: 1,
    marginLeft: 11,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F3F1",
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },

  stockCard: {
    padding: 16,
    borderRadius: 19,
    backgroundColor: "#F3F7F1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  stockLabel: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  stockQuantityRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 2,
  },

  stockQuantity: {
    fontFamily: fonts.bold,
    fontSize: 29,
    color: COLORS.primary,
  },

  stockQuantityWarning: {
    color: "#D88A00",
  },

  stockUnit: {
    marginLeft: 5,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: COLORS.darkGray,
  },

  stockStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#E5F1E2",
  },

  stockStatusWarning: {
    backgroundColor: "#FFF1D2",
  },

  stockStatusText: {
    marginLeft: 5,
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: COLORS.success,
  },

  stockStatusTextWarning: {
    color: "#B87900",
  },

  infoGrid: {
    marginTop: 13,
    gap: 8,
  },

  infoItem: {
    minHeight: 55,
    padding: 10,
    borderRadius: 14,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#ECECEA",
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  infoIconWarning: {
    backgroundColor: "#FFF4D9",
  },

  infoIconSuccess: {
    backgroundColor: "#E6F3E4",
  },

  infoIconInactive: {
    backgroundColor: "#EEEEEC",
  },

  infoLabel: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  infoValue: {
    marginTop: 2,
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.text,
  },

  section: {
    marginTop: 17,
    padding: 15,
    borderRadius: 19,
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
    width: 37,
    height: 37,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  sectionTitle: {
    marginLeft: 9,
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginLeft: 9,
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  adjustmentRow: {
    flexDirection: "row",
    gap: 8,
  },

  adjustmentInput: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E5E5E2",
    backgroundColor: "#FAFAF8",
    flexDirection: "row",
    alignItems: "center",
  },

  adjustmentSign: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: COLORS.primary,
  },

  adjustmentTextInput: {
    flex: 1,
    marginLeft: 7,
    paddingVertical: 8,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: COLORS.text,
  },

  adjustmentUnit: {
    fontFamily: fonts.medium,
    fontSize: 9,
    color: COLORS.Gray,
  },

  adjustButton: {
    width: 48,
    height: 48,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },

  adjustButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },

  adjustButtonPressed: {
    opacity: 0.75,
  },

  noteInput: {
    minHeight: 58,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E5E5E2",
    backgroundColor: "#FAFAF8",
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: COLORS.text,
    textAlignVertical: "top",
  },

  actionsSection: {
    marginTop: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  editButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 13,
    backgroundColor: "#EAF2E7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  editButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.primary,
  },

  statusButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 13,
    backgroundColor: "#F1F1EF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  statusButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: COLORS.darkGray,
  },

  deleteButton: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDECEC",
  },

  actionPressed: {
    opacity: 0.6,
  },
});
