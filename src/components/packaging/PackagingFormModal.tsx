import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type { Packaging, PackagingSize } from "@/types/packaging";

import { COLORS, fonts } from "@/utils/styles";

interface PackagingFormModalProps {
  visible: boolean;
  packaging?: Packaging | null;
  isSaving?: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    size: PackagingSize;
    capacityMl: number;
    minAlert: number;
  }) => Promise<void>;
}

export function PackagingFormModal({
  visible,
  packaging,
  isSaving = false,
  onClose,
  onSubmit,
}: PackagingFormModalProps) {
  const [name, setName] = useState("");
  const [size, setSize] = useState<PackagingSize>("ML_200");
  const [minAlert, setMinAlert] = useState("50");
  const [error, setError] = useState("");

  const isEditing = !!packaging;

  useEffect(() => {
    if (!visible) {
      return;
    }

    setName(packaging?.name ?? "");

    setSize(packaging?.size ?? "ML_200");

    setMinAlert(String(packaging?.minAlert ?? 50));

    setError("");
  }, [visible, packaging]);

  const capacityMl = size === "ML_200" ? 200 : 500;

  const handleSubmit = async () => {
    const cleanName = name.trim();

    const parsedMinAlert = Number(minAlert.replace(",", "."));

    if (cleanName.length < 2) {
      setError("Le nom doit contenir au moins 2 caractères.");
      return;
    }

    if (!Number.isInteger(parsedMinAlert) || parsedMinAlert < 0) {
      setError("Le seuil d'alerte doit être un nombre entier positif ou zéro.");
      return;
    }

    setError("");

    await onSubmit({
      name: cleanName,
      size,
      capacityMl,
      minAlert: parsedMinAlert,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={isSaving ? undefined : onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons
                name={isEditing ? "pencil-outline" : "bottle-soda-outline"}
                size={20}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.headerContent}>
              <Text style={styles.title}>
                {isEditing ? "Modifier l'emballage" : "Nouvel emballage"}
              </Text>

              <Text style={styles.subtitle}>
                {isEditing
                  ? "Modifiez les informations de cet emballage."
                  : "Ajoutez un emballage à votre stock."}
              </Text>
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={onClose}
              disabled={isSaving}
              hitSlop={8}
            >
              <MaterialCommunityIcons
                name="close"
                size={20}
                color={COLORS.darkGray}
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.field}>
              <Text style={styles.label}>Nom de l'emballage</Text>

              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="label-outline"
                  size={18}
                  color={COLORS.primary}
                />

                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex. Bouteille PET"
                  placeholderTextColor={COLORS.Gray}
                  style={styles.input}
                  autoCapitalize="sentences"
                  maxLength={100}
                  editable={!isSaving}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Format</Text>

              <View style={styles.sizeOptions}>
                <Pressable
                  style={[
                    styles.sizeOption,
                    size === "ML_200" && styles.sizeOptionSelected,
                  ]}
                  onPress={() => setSize("ML_200")}
                  disabled={isSaving}
                >
                  <MaterialCommunityIcons
                    name="bottle-soda-outline"
                    size={21}
                    color={size === "ML_200" ? COLORS.primary : COLORS.Gray}
                  />

                  <View>
                    <Text
                      style={[
                        styles.sizeOptionTitle,
                        size === "ML_200" && styles.sizeOptionTitleSelected,
                      ]}
                    >
                      200 ml
                    </Text>

                    <Text style={styles.sizeOptionDescription}>
                      Petit format
                    </Text>
                  </View>

                  {size === "ML_200" && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={18}
                      color={COLORS.primary}
                      style={styles.checkIcon}
                    />
                  )}
                </Pressable>

                <Pressable
                  style={[
                    styles.sizeOption,
                    size === "ML_500" && styles.sizeOptionSelected,
                  ]}
                  onPress={() => setSize("ML_500")}
                  disabled={isSaving}
                >
                  <MaterialCommunityIcons
                    name="bottle-soda-outline"
                    size={25}
                    color={size === "ML_500" ? "#3478C5" : COLORS.Gray}
                  />

                  <View>
                    <Text
                      style={[
                        styles.sizeOptionTitle,
                        size === "ML_500" && styles.sizeOptionTitleSelected500,
                      ]}
                    >
                      500 ml
                    </Text>

                    <Text style={styles.sizeOptionDescription}>
                      Grand format
                    </Text>
                  </View>

                  {size === "ML_500" && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={18}
                      color="#3478C5"
                      style={styles.checkIcon}
                    />
                  )}
                </Pressable>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Capacité</Text>

              <View style={[styles.readonlyBox]}>
                <MaterialCommunityIcons
                  name="cup-water"
                  size={18}
                  color={COLORS.primary}
                />

                <Text style={styles.readonlyText}>{capacityMl} ml</Text>

                <Text style={styles.readonlyHint}>Défini automatiquement</Text>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Seuil d'alerte</Text>

              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="bell-alert-outline"
                  size={18}
                  color={COLORS.warning}
                />

                <TextInput
                  value={minAlert}
                  onChangeText={setMinAlert}
                  placeholder="50"
                  placeholderTextColor={COLORS.Gray}
                  style={styles.input}
                  keyboardType="number-pad"
                  editable={!isSaving}
                />

                <Text style={styles.inputSuffix}>unités</Text>
              </View>

              <Text style={styles.helperText}>
                Une alerte sera affichée lorsque le stock atteindra ou passera
                sous ce seuil.
              </Text>
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
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.pressed,
              ]}
              onPress={onClose}
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
                  name={isEditing ? "check" : "plus"}
                  size={19}
                  color={COLORS.white}
                />
              )}

              <Text style={styles.submitText}>
                {isSaving
                  ? "Enregistrement..."
                  : isEditing
                    ? "Enregistrer"
                    : "Créer l'emballage"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.38)",
  },

  modal: {
    maxHeight: "92%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0ED",
  },

  headerIcon: {
    width: 43,
    height: 43,
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
    fontSize: 10,
    color: COLORS.Gray,
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F4F1",
  },

  scrollView: {
    flexGrow: 0,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },

  field: {
    marginTop: 14,
  },

  label: {
    marginBottom: 7,
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.darkGray,
  },

  inputWrapper: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E5E5E2",
    backgroundColor: "#FAFAF8",
    gap: 9,
  },

  input: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 9,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: COLORS.text,
  },

  inputSuffix: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  sizeOptions: {
    flexDirection: "row",
    gap: 9,
  },

  sizeOption: {
    flex: 1,
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E5E2",
    backgroundColor: "#FAFAF8",
  },

  sizeOptionSelected: {
    borderColor: "#BFD2B9",
    backgroundColor: "#F0F6EE",
  },

  sizeOptionTitle: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: COLORS.darkGray,
  },

  sizeOptionTitleSelected: {
    color: COLORS.primary,
  },

  sizeOptionTitleSelected500: {
    color: "#3478C5",
  },

  sizeOptionDescription: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  checkIcon: {
    marginLeft: "auto",
  },

  readonlyBox: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 13,
    backgroundColor: "#F1F4EF",
    gap: 9,
  },

  readonlyText: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
    color: COLORS.primary,
  },

  readonlyHint: {
    marginLeft: "auto",
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  helperText: {
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: COLORS.Gray,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    padding: 11,
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
    paddingHorizontal: 20,
    paddingTop: 13,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0ED",
    backgroundColor: COLORS.white,
  },

  cancelButton: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F2EF",
  },

  cancelText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.darkGray,
  },

  submitButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 14,
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
    fontSize: 11,
    color: COLORS.white,
  },

  pressed: {
    opacity: 0.6,
  },
});
