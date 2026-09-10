import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type { Packaging } from "@/types/packaging";
import { COLORS, fonts } from "@/utils/styles";

interface PackagingStockModalProps {
  visible: boolean;
  packaging: Packaging | null;
  isSaving?: boolean;
  onClose: () => void;
  onSubmit: (data: { quantity: number; note?: string }) => Promise<void>;
}

export function PackagingStockModal({
  visible,
  packaging,
  isSaving = false,
  onClose,
  onSubmit,
}: PackagingStockModalProps) {
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      setQuantity("");
      setNote("");
      setError("");
    }
  }, [visible]);

  if (!packaging) {
    return null;
  }

  const parsedQuantity = Number(quantity.replace(",", "."));

  const isValidQuantity =
    Number.isInteger(parsedQuantity) && parsedQuantity !== 0;

  const newStock = isValidQuantity
    ? packaging.stockQty + parsedQuantity
    : packaging.stockQty;

  const wouldBeNegative = isValidQuantity && newStock < 0;

  const handleSubmit = async () => {
    if (!isValidQuantity) {
      setError("Saisissez une quantité entière différente de zéro.");
      return;
    }

    if (wouldBeNegative) {
      setError("Le stock ne peut pas devenir négatif.");
      return;
    }

    setError("");

    // Ferme immédiatement le clavier
    Keyboard.dismiss();

    // Petit délai pour laisser le clavier disparaître
    // avant de lancer la sauvegarde.
    await new Promise((resolve) => setTimeout(resolve, 120));

    await onSubmit({
      quantity: parsedQuantity,
      note: note.trim() || undefined,
    });
  };

  const handleClose = () => {
    if (isSaving) {
      return;
    }

    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isSaving ? undefined : handleClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={styles.overlay} onPress={Keyboard.dismiss}>
          <Pressable
            style={styles.modal}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.header}>
              <View style={styles.icon}>
                <MaterialCommunityIcons
                  name="package-variant-closed-plus"
                  size={21}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.headerContent}>
                <Text style={styles.title}>Ajuster le stock</Text>

                <Text style={styles.subtitle} numberOfLines={1}>
                  {packaging.name} · {packaging.capacityMl} ml
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={handleClose}
                disabled={isSaving}
                hitSlop={8}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={19}
                  color={COLORS.darkGray}
                />
              </Pressable>
            </View>

            <View style={styles.currentStock}>
              <View>
                <Text style={styles.currentLabel}>STOCK ACTUEL</Text>

                <Text style={styles.currentValue}>
                  {packaging.stockQty}
                  <Text style={styles.currentUnit}> unités</Text>
                </Text>
              </View>

              <MaterialCommunityIcons
                name="package-variant"
                size={31}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Quantité à ajuster</Text>

              <View
                style={[
                  styles.quantityWrapper,
                  parsedQuantity > 0 && styles.quantityPositive,
                  parsedQuantity < 0 && styles.quantityNegative,
                ]}
              >
                <Text
                  style={[
                    styles.signHint,
                    parsedQuantity > 0 && styles.signPositive,
                    parsedQuantity < 0 && styles.signNegative,
                  ]}
                >
                  {parsedQuantity > 0 ? "+" : parsedQuantity < 0 ? "−" : "±"}
                </Text>

                <TextInput
                  value={quantity}
                  onChangeText={(value) => {
                    setQuantity(value);
                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="Ex. +100 ou -20"
                  placeholderTextColor={COLORS.Gray}
                  style={styles.quantityInput}
                  keyboardType="numbers-and-punctuation"
                  editable={!isSaving}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />

                <Text style={styles.unitText}>unités</Text>
              </View>
            </View>

            <View style={styles.preview}>
              <View>
                <Text style={styles.previewLabel}>Nouveau stock</Text>

                <Text
                  style={[
                    styles.previewValue,
                    wouldBeNegative && styles.previewDanger,
                  ]}
                >
                  {newStock}
                  <Text style={styles.previewUnit}> unités</Text>
                </Text>
              </View>

              <MaterialCommunityIcons
                name={
                  parsedQuantity > 0
                    ? "arrow-up-right"
                    : parsedQuantity < 0
                      ? "arrow-down-right"
                      : "arrow-right"
                }
                size={22}
                color={
                  wouldBeNegative
                    ? COLORS.error
                    : parsedQuantity > 0
                      ? COLORS.success
                      : parsedQuantity < 0
                        ? COLORS.warning
                        : COLORS.Gray
                }
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Note <Text style={styles.optional}>(facultatif)</Text>
              </Text>

              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Ex. Réception de bouteilles"
                placeholderTextColor={COLORS.Gray}
                style={styles.noteInput}
                multiline
                maxLength={255}
                editable={!isSaving}
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            {error && (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={18}
                  color={COLORS.error}
                />

                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.footer}>
              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.pressed,
                ]}
                onPress={handleClose}
                disabled={isSaving}
              >
                <Text style={styles.cancelText}>Annuler</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.submitPressed,
                  isSaving && styles.submitDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <MaterialCommunityIcons
                    name="check"
                    size={18}
                    color={COLORS.white}
                  />
                )}

                <Text style={styles.submitText}>
                  {isSaving ? "Enregistrement..." : "Valider l'ajustement"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.42)",
  },

  modal: {
    width: "100%",
    maxWidth: 500,
    borderRadius: 24,
    padding: 20,
    backgroundColor: COLORS.white,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  headerContent: {
    flex: 1,
    marginLeft: 11,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 15.5,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F3F0",
  },

  currentStock: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    padding: 14,
    borderRadius: 15,
    backgroundColor: "#F1F5EF",
  },

  currentLabel: {
    fontFamily: fonts.bold,
    fontSize: 8,
    letterSpacing: 0.7,
    color: COLORS.Gray,
  },

  currentValue: {
    marginTop: 3,
    fontFamily: fonts.bold,
    fontSize: 20,
    color: COLORS.primary,
  },

  currentUnit: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: COLORS.Gray,
  },

  field: {
    marginTop: 16,
  },

  label: {
    marginBottom: 7,
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.darkGray,
  },

  optional: {
    fontFamily: fonts.regular,
    color: COLORS.Gray,
  },

  quantityWrapper: {
    minHeight: 51,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E5E2",
    backgroundColor: "#FAFAF8",
  },

  quantityPositive: {
    borderColor: "#BFD9BF",
    backgroundColor: "#F5FAF3",
  },

  quantityNegative: {
    borderColor: "#E9C7C7",
    backgroundColor: "#FFF8F8",
  },

  signHint: {
    width: 25,
    fontFamily: fonts.bold,
    fontSize: 17,
    textAlign: "center",
    color: COLORS.Gray,
  },

  signPositive: {
    color: COLORS.success,
  },

  signNegative: {
    color: COLORS.error,
  },

  quantityInput: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 8,
    fontFamily: fonts.bold,
    fontSize: 15,
    color: COLORS.text,
  },

  unitText: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  preview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 13,
    backgroundColor: "#F7F7F4",
  },

  previewLabel: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  previewValue: {
    marginTop: 2,
    fontFamily: fonts.bold,
    fontSize: 14,
    color: COLORS.primary,
  },

  previewDanger: {
    color: COLORS.error,
  },

  previewUnit: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  noteInput: {
    minHeight: 70,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E5E5E2",
    backgroundColor: "#FAFAF8",
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.text,
    textAlignVertical: "top",
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#FDECEC",
    gap: 8,
  },

  errorText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.error,
  },

  footer: {
    flexDirection: "row",
    gap: 9,
    marginTop: 18,
  },

  cancelButton: {
    minHeight: 46,
    paddingHorizontal: 17,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F2EF",
  },

  cancelText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.darkGray,
  },

  submitButton: {
    flex: 1,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
  },

  submitPressed: {
    opacity: 0.82,
  },

  submitDisabled: {
    opacity: 0.65,
  },

  submitText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.white,
  },

  pressed: {
    opacity: 0.6,
  },
});
