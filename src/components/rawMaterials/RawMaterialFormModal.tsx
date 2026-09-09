import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type { RawIngredient, RawIngredientUnit } from "@/types/raw-ingredient";

import { COLORS, fonts } from "@/utils/styles";

interface RawMaterialFormModalProps {
  visible: boolean;
  mode: "create" | "edit";
  ingredient?: RawIngredient | null;
  isSubmitting?: boolean;

  onClose: () => void;

  onSubmit: (data: {
    name: string;
    unit: RawIngredientUnit;
    stockQty?: number;
    minAlert: number;
    isActive?: boolean;
  }) => Promise<void>;
}

const UNITS: {
  value: RawIngredientUnit;
  label: string;
  description: string;
}[] = [
  {
    value: "PIECE",
    label: "Pièce",
    description: "unités",
  },
  {
    value: "GRAM",
    label: "Grammes",
    description: "g",
  },
  {
    value: "KILOGRAM",
    label: "Kilogrammes",
    description: "kg",
  },
  {
    value: "MILLILITER",
    label: "Millilitres",
    description: "ml",
  },
  {
    value: "LITER",
    label: "Litres",
    description: "L",
  },
];

export function RawMaterialFormModal({
  visible,
  mode,
  ingredient,
  isSubmitting = false,
  onClose,
  onSubmit,
}: RawMaterialFormModalProps) {
  const isEdit = mode === "edit";

  const [name, setName] = React.useState(ingredient?.name ?? "");

  const [unit, setUnit] = React.useState<RawIngredientUnit>(
    ingredient?.unit ?? "KILOGRAM",
  );

  const [stockQty, setStockQty] = React.useState(
    ingredient?.stockQty?.toString() ?? "",
  );

  const [minAlert, setMinAlert] = React.useState(
    ingredient?.minAlert?.toString() ?? "5",
  );

  const [isActive, setIsActive] = React.useState(ingredient?.isActive ?? true);

  React.useEffect(() => {
    if (!visible) {
      return;
    }

    setName(ingredient?.name ?? "");

    setUnit(ingredient?.unit ?? "KILOGRAM");

    setStockQty(
      ingredient?.stockQty !== undefined ? ingredient.stockQty.toString() : "",
    );

    setMinAlert(
      ingredient?.minAlert !== undefined ? ingredient.minAlert.toString() : "5",
    );

    setIsActive(ingredient?.isActive ?? true);
  }, [visible, ingredient]);

  const handleSubmit = async () => {
    const cleanName = name.trim();

    if (cleanName.length < 2) {
      return;
    }

    const parsedMinAlert = Number(minAlert.replace(",", "."));

    if (!Number.isFinite(parsedMinAlert) || parsedMinAlert < 0) {
      return;
    }

    let parsedStock: number | undefined;

    if (!isEdit) {
      parsedStock =
        stockQty.trim() === "" ? 0 : Number(stockQty.replace(",", "."));

      if (!Number.isFinite(parsedStock) || parsedStock < 0) {
        return;
      }
    }

    await onSubmit({
      name: cleanName,
      unit,
      ...(parsedStock !== undefined && {
        stockQty: parsedStock,
      }),
      minAlert: parsedMinAlert,
      ...(isEdit && {
        isActive,
      }),
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={isSubmitting ? undefined : onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          style={styles.backdrop}
          onPress={isSubmitting ? undefined : onClose}
        />

        <View style={styles.modal}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons
                name={isEdit ? "create-outline" : "add-outline"}
                size={21}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.headerContent}>
              <Text style={styles.title}>
                {isEdit ? "Modifier la matière" : "Nouvelle matière première"}
              </Text>

              <Text style={styles.subtitle}>
                {isEdit
                  ? "Modifiez les informations de cette matière."
                  : "Ajoutez une matière première à votre stock."}
              </Text>
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={onClose}
              disabled={isSubmitting}
              hitSlop={8}
            >
              <Ionicons name="close" size={20} color={COLORS.darkGray} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            <View style={styles.field}>
              <Text style={styles.label}>Nom de la matière</Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="leaf-outline"
                  size={18}
                  color={COLORS.primary}
                />

                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex. Ananas"
                  placeholderTextColor={COLORS.Gray}
                  style={styles.input}
                  autoCapitalize="sentences"
                  editable={!isSubmitting}
                  maxLength={100}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Unité de gestion</Text>

              <View style={styles.unitsGrid}>
                {UNITS.map((item) => {
                  const selected = unit === item.value;

                  return (
                    <Pressable
                      key={item.value}
                      style={[
                        styles.unitOption,
                        selected && styles.unitOptionSelected,
                      ]}
                      onPress={() => setUnit(item.value)}
                      disabled={isSubmitting}
                    >
                      <View
                        style={[
                          styles.unitRadio,
                          selected && styles.unitRadioSelected,
                        ]}
                      >
                        {selected && <View style={styles.unitRadioDot} />}
                      </View>

                      <View style={styles.unitContent}>
                        <Text
                          style={[
                            styles.unitLabel,
                            selected && styles.unitLabelSelected,
                          ]}
                        >
                          {item.label}
                        </Text>

                        <Text style={styles.unitDescription}>
                          {item.description}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {!isEdit && (
              <View style={styles.field}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Stock initial</Text>

                  <Text style={styles.optionalText}>Optionnel</Text>
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="cube-outline"
                    size={18}
                    color={COLORS.primary}
                  />

                  <TextInput
                    value={stockQty}
                    onChangeText={setStockQty}
                    placeholder="0"
                    placeholderTextColor={COLORS.Gray}
                    style={styles.input}
                    keyboardType="decimal-pad"
                    editable={!isSubmitting}
                  />
                </View>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Seuil d'alerte</Text>

              <View style={styles.inputContainer}>
                <Ionicons name="warning-outline" size={18} color={"#D88A00"} />

                <TextInput
                  value={minAlert}
                  onChangeText={setMinAlert}
                  placeholder="5"
                  placeholderTextColor={COLORS.Gray}
                  style={styles.input}
                  keyboardType="decimal-pad"
                  editable={!isSubmitting}
                />
              </View>

              <Text style={styles.helperText}>
                Une alerte sera affichée lorsque le stock sera inférieur ou égal
                à cette quantité.
              </Text>
            </View>

            {isEdit && (
              <Pressable
                style={styles.activeRow}
                onPress={() => setIsActive((value) => !value)}
                disabled={isSubmitting}
              >
                <View
                  style={[
                    styles.activeIcon,
                    isActive && styles.activeIconEnabled,
                  ]}
                >
                  <Ionicons
                    name={isActive ? "checkmark" : "close"}
                    size={16}
                    color={isActive ? COLORS.success : COLORS.Gray}
                  />
                </View>

                <View style={styles.activeContent}>
                  <Text style={styles.activeTitle}>Matière active</Text>

                  <Text style={styles.activeDescription}>
                    {isActive
                      ? "Cette matière est disponible dans votre gestion."
                      : "Cette matière est masquée des opérations courantes."}
                  </Text>
                </View>

                <View style={[styles.switch, isActive && styles.switchActive]}>
                  <View
                    style={[
                      styles.switchThumb,
                      isActive && styles.switchThumbActive,
                    ]}
                  />
                </View>
              </Pressable>
            )}

            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={onClose}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelText}>Annuler</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.submitPressed,
                  isSubmitting && styles.submitDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Ionicons
                    name={isEdit ? "checkmark-outline" : "add-outline"}
                    size={19}
                    color={COLORS.white}
                  />
                )}

                <Text style={styles.submitText}>
                  {isSubmitting
                    ? "Enregistrement..."
                    : isEdit
                      ? "Enregistrer"
                      : "Ajouter"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: "91%",
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
    fontSize: 16,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
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
    paddingBottom: 28,
  },

  field: {
    marginBottom: 18,
  },

  label: {
    marginBottom: 8,
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.darkGray,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionalText: {
    marginBottom: 8,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  inputContainer: {
    minHeight: 48,
    paddingHorizontal: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E5E5E2",
    backgroundColor: "#FAFAF8",
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    marginLeft: 9,
    paddingVertical: 10,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: COLORS.text,
  },

  unitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  unitOption: {
    width: "31.8%",
    minHeight: 54,
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E5E5E2",
    backgroundColor: "#FAFAF8",
    flexDirection: "row",
    alignItems: "center",
  },

  unitOptionSelected: {
    backgroundColor: "#EDF5EA",
    borderColor: "#BFD3BA",
  },

  unitRadio: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#C9C9C6",
    alignItems: "center",
    justifyContent: "center",
  },

  unitRadioSelected: {
    borderColor: COLORS.primary,
  },

  unitRadioDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  unitContent: {
    marginLeft: 6,
    flex: 1,
  },

  unitLabel: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: COLORS.darkGray,
  },

  unitLabelSelected: {
    color: COLORS.primary,
  },

  unitDescription: {
    marginTop: 1,
    fontFamily: fonts.regular,
    fontSize: 8,
    color: COLORS.Gray,
  },

  helperText: {
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 13,
    color: COLORS.Gray,
  },

  activeRow: {
    minHeight: 62,
    padding: 11,
    borderRadius: 15,
    backgroundColor: "#F8F8F6",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  activeIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEEEEC",
  },

  activeIconEnabled: {
    backgroundColor: "#E4F1E1",
  },

  activeContent: {
    flex: 1,
    marginLeft: 9,
  },

  activeTitle: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.text,
  },

  activeDescription: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: COLORS.Gray,
  },

  switch: {
    width: 38,
    height: 22,
    borderRadius: 11,
    padding: 2,
    backgroundColor: "#D7D7D4",
    justifyContent: "center",
  },

  switchActive: {
    backgroundColor: "#AFCBA9",
  },

  switchThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.white,
  },

  switchThumbActive: {
    alignSelf: "flex-end",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    minHeight: 49,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F1EF",
  },

  cancelText: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.darkGray,
  },

  submitButton: {
    flex: 1.35,
    minHeight: 49,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: COLORS.primary,
  },

  submitPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  submitDisabled: {
    opacity: 0.65,
  },

  submitText: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.white,
  },

  buttonPressed: {
    opacity: 0.65,
  },
});
