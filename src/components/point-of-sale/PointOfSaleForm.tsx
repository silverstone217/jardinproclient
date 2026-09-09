import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { PointOfSale, PointOfSaleFormData } from "@/types/point-of-sale";

import { COLORS, fontSizes, fonts } from "@/utils/styles";

interface PointOfSaleFormProps {
  visible: boolean;
  pointOfSale?: PointOfSale | null;
  isSaving?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (data: PointOfSaleFormData) => Promise<void> | void;
}

const DEFAULT_FORM: PointOfSaleFormData = {
  name: "",
  code: "",
  telephone: "",
  address: "",
  isMainStore: false,
  isActive: true,
};

export default function PointOfSaleForm({
  visible,
  pointOfSale,
  isSaving = false,
  error,
  onClose,
  onSubmit,
}: PointOfSaleFormProps) {
  const isEditing = !!pointOfSale;

  const [form, setForm] = useState<PointOfSaleFormData>(DEFAULT_FORM);

  const [errors, setErrors] = useState<
    Partial<Record<keyof PointOfSaleFormData, string>>
  >({});

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (pointOfSale) {
      setForm({
        name: pointOfSale.name,
        code: pointOfSale.code,
        telephone: pointOfSale.telephone ?? "",
        address: pointOfSale.address ?? "",
        isMainStore: pointOfSale.isMainStore,
        isActive: pointOfSale.isActive,
      });
    } else {
      setForm(DEFAULT_FORM);
    }

    setErrors({});
  }, [visible, pointOfSale]);

  const updateField = <K extends keyof PointOfSaleFormData>(
    field: K,
    value: PointOfSaleFormData[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof PointOfSaleFormData, string>> = {};

    const name = form.name.trim();
    const code = form.code.trim();
    const telephone = form.telephone.trim();
    const address = form.address.trim();

    // ========================================================
    // NOM
    // ========================================================

    if (name.length < 2) {
      nextErrors.name = "Le nom doit contenir au moins 2 caractères.";
    } else if (name.length > 50) {
      nextErrors.name = "Le nom ne peut pas dépasser 50 caractères.";
    }

    // ========================================================
    // CODE
    // ========================================================

    if (code.length < 2) {
      nextErrors.code = "Le code doit contenir au moins 2 caractères.";
    } else if (code.length > 20) {
      nextErrors.code = "Le code ne peut pas dépasser 20 caractères.";
    } else if (!/^[A-Za-z0-9_-]+$/.test(code)) {
      nextErrors.code =
        "Utilisez uniquement des lettres, chiffres, tirets ou underscores.";
    }

    // ========================================================
    // TÉLÉPHONE
    // ========================================================

    if (telephone.length > 0 && !/^0\d{9}$/.test(telephone)) {
      nextErrors.telephone =
        "Le numéro doit contenir 10 chiffres et commencer par 0.";
    }

    // ========================================================
    // ADRESSE
    // ========================================================

    if (address.length > 255) {
      nextErrors.address = "L'adresse ne peut pas dépasser 255 caractères.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isSaving) {
      return;
    }

    if (!validate()) {
      return;
    }

    await onSubmit({
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      telephone: form.telephone.trim(),
      address: form.address.trim(),
      isMainStore: form.isMainStore,
      isActive: form.isActive,
    });
  };

  const handleClose = () => {
    if (isSaving) {
      return;
    }

    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {/* ================================================== */}
            {/* HEADER */}
            {/* ================================================== */}

            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}>
                  <Ionicons
                    name={isEditing ? "create-outline" : "storefront-outline"}
                    size={22}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.headerText}>
                  <Text style={styles.title}>
                    {isEditing
                      ? "Modifier le point de vente"
                      : "Nouveau point de vente"}
                  </Text>

                  <Text style={styles.subtitle}>
                    {isEditing
                      ? "Mettez à jour ses informations"
                      : "Ajoutez un nouvel espace de vente"}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={handleClose}
                disabled={isSaving}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && !isSaving && styles.closeButtonPressed,
                ]}
              >
                <Ionicons name="close" size={21} color={COLORS.darkGray} />
              </Pressable>
            </View>

            {/* ================================================== */}
            {/* CONTENU */}
            {/* ================================================== */}

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* ================================================== */}
              {/* IDENTITÉ */}
              {/* ================================================== */}

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Informations générales
                  </Text>

                  <Text style={styles.requiredText}>* Obligatoire</Text>
                </View>

                <Field
                  label="Nom du point de vente"
                  icon="storefront-outline"
                  value={form.name}
                  placeholder="Ex. Point de vente Gombe"
                  error={errors.name}
                  editable={!isSaving}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onChangeText={(value) => updateField("name", value)}
                />

                <Field
                  label="Code"
                  icon="barcode-outline"
                  value={form.code}
                  placeholder="Ex. GOMBE01"
                  error={errors.code}
                  editable={!isSaving}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={20}
                  returnKeyType="next"
                  onChangeText={(value) =>
                    updateField("code", value.toUpperCase())
                  }
                />

                <Text style={styles.helperText}>
                  Le code identifie de manière unique ce point de vente.
                </Text>
              </View>

              {/* ================================================== */}
              {/* CONTACT */}
              {/* ================================================== */}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Coordonnées</Text>

                <Field
                  label="Téléphone"
                  icon="call-outline"
                  value={form.telephone}
                  placeholder="Ex. 0812345678"
                  error={errors.telephone}
                  editable={!isSaving}
                  keyboardType="phone-pad"
                  maxLength={10}
                  returnKeyType="next"
                  onChangeText={(value) =>
                    updateField("telephone", value.replace(/\D/g, ""))
                  }
                />

                <Field
                  label="Adresse"
                  icon="location-outline"
                  value={form.address}
                  placeholder="Ex. Avenue de la Justice..."
                  error={errors.address}
                  editable={!isSaving}
                  autoCapitalize="sentences"
                  multiline
                  numberOfLines={3}
                  maxLength={255}
                  textAlignVertical="top"
                  onChangeText={(value) => updateField("address", value)}
                />

                <View style={styles.characterCount}>
                  <Text style={styles.characterCountText}>
                    {form.address.length}/255
                  </Text>
                </View>
              </View>

              {/* ================================================== */}
              {/* OPTIONS */}
              {/* ================================================== */}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Configuration</Text>

                <View style={styles.optionCard}>
                  <View style={styles.optionIcon}>
                    <Ionicons
                      name="star-outline"
                      size={19}
                      color={COLORS.secondary}
                    />
                  </View>

                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>
                      Point de vente principal
                    </Text>

                    <Text style={styles.optionDescription}>
                      Définit cet emplacement comme boutique principale.
                    </Text>
                  </View>

                  <Switch
                    value={form.isMainStore}
                    onValueChange={(value) => updateField("isMainStore", value)}
                    disabled={isSaving}
                    trackColor={{
                      false: "#D9D9D5",
                      true: "#A9C6A4",
                    }}
                    thumbColor={form.isMainStore ? COLORS.primary : "#FFFFFF"}
                  />
                </View>

                <View style={[styles.optionCard, styles.optionCardSpacing]}>
                  <View style={styles.optionIcon}>
                    <Ionicons
                      name={
                        form.isActive
                          ? "checkmark-circle-outline"
                          : "pause-circle-outline"
                      }
                      size={19}
                      color={form.isActive ? COLORS.success : COLORS.Gray}
                    />
                  </View>

                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Point de vente actif</Text>

                    <Text style={styles.optionDescription}>
                      Un point inactif reste enregistré mais n'est plus
                      opérationnel.
                    </Text>
                  </View>

                  <Switch
                    value={form.isActive}
                    onValueChange={(value) => updateField("isActive", value)}
                    disabled={
                      isSaving || (isEditing && !!pointOfSale?.isMainStore)
                    }
                    trackColor={{
                      false: "#D9D9D5",
                      true: "#A9C6A4",
                    }}
                    thumbColor={form.isActive ? COLORS.primary : "#FFFFFF"}
                  />
                </View>
              </View>

              {/* ================================================== */}
              {/* ERREUR SERVEUR */}
              {/* ================================================== */}

              {error && (
                <View style={styles.errorBox}>
                  <View style={styles.errorIcon}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={19}
                      color={COLORS.error}
                    />
                  </View>

                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* ================================================== */}
              {/* ESPACE BAS */}
              {/* ================================================== */}

              <View style={styles.bottomSpace} />
            </ScrollView>

            {/* ================================================== */}
            {/* ACTIONS */}
            {/* ================================================== */}

            <View style={styles.footer}>
              <Pressable
                onPress={handleClose}
                disabled={isSaving}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && !isSaving && styles.buttonPressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={handleSubmit}
                disabled={isSaving}
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && !isSaving && styles.buttonPressed,
                  isSaving && styles.submitButtonDisabled,
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons
                      name={isEditing ? "checkmark" : "add"}
                      size={18}
                      color={COLORS.white}
                    />

                    <Text style={styles.submitButtonText}>
                      {isEditing ? "Enregistrer" : "Créer le point de vente"}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============================================================
// FIELD
// ============================================================

interface FieldProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  placeholder?: string;
  error?: string;
  editable?: boolean;
  keyboardType?: "default" | "phone-pad" | "email-address";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  textAlignVertical?: "auto" | "top" | "bottom" | "center";
  returnKeyType?: "done" | "next";
  onChangeText: (value: string) => void;
}

function Field({
  label,
  icon,
  value,
  placeholder,
  error,
  editable = true,
  keyboardType = "default",
  autoCapitalize = "sentences",
  autoCorrect = false,
  maxLength,
  multiline = false,
  numberOfLines,
  textAlignVertical = "center",
  returnKeyType = "done",
  onChangeText,
}: FieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View
        style={[
          styles.inputContainer,
          multiline && styles.multilineInputContainer,
          error && styles.inputContainerError,
          !editable && styles.inputContainerDisabled,
        ]}
      >
        <View style={[styles.inputIcon, multiline && styles.multilineIcon]}>
          <Ionicons
            name={icon}
            size={18}
            color={error ? COLORS.error : COLORS.Gray}
          />
        </View>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A8A8A3"
          editable={editable}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={textAlignVertical}
          returnKeyType={returnKeyType}
          style={[styles.input, multiline && styles.multilineInput]}
        />
      </View>

      {error && (
        <View style={styles.fieldErrorRow}>
          <Ionicons
            name="alert-circle-outline"
            size={13}
            color={COLORS.error}
          />

          <Text style={styles.fieldError}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.42)",
    justifyContent: "flex-end",
  },

  modal: {
    width: "100%",
    maxHeight: "94%",
    backgroundColor: COLORS.neutral,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    minHeight: 78,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ECECE8",
  },

  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#E8F2E5",
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
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
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F3F3EF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  closeButtonPressed: {
    opacity: 0.65,
  },

  // ==========================================================
  // SCROLL
  // ==========================================================

  scrollView: {
    flexGrow: 0,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  // ==========================================================
  // SECTIONS
  // ==========================================================

  section: {
    marginBottom: 22,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 13,
  },

  requiredText: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
    marginBottom: 13,
  },

  // ==========================================================
  // FIELDS
  // ==========================================================

  fieldContainer: {
    marginBottom: 14,
  },

  fieldLabel: {
    marginBottom: 7,
    fontFamily: fonts.medium,
    fontSize: 11,
    color: COLORS.darkGray,
  },

  inputContainer: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E6E6E1",
    flexDirection: "row",
    alignItems: "center",
  },

  multilineInputContainer: {
    minHeight: 88,
    alignItems: "flex-start",
  },

  inputContainerError: {
    borderColor: "#E9B8B5",
    backgroundColor: "#FFF9F8",
  },

  inputContainerDisabled: {
    opacity: 0.6,
  },

  inputIcon: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  multilineIcon: {
    paddingTop: 14,
  },

  input: {
    flex: 1,
    minHeight: 46,
    paddingRight: 14,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: COLORS.text,
  },

  multilineInput: {
    minHeight: 84,
    paddingTop: 13,
  },

  helperText: {
    marginTop: -5,
    marginBottom: 2,
    paddingLeft: 2,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 13,
    color: COLORS.Gray,
  },

  fieldErrorRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 5,
    paddingHorizontal: 2,
  },

  fieldError: {
    flex: 1,
    marginLeft: 4,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 13,
    color: COLORS.error,
  },

  characterCount: {
    alignItems: "flex-end",
    marginTop: -7,
  },

  characterCountText: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  // ==========================================================
  // OPTIONS
  // ==========================================================

  optionCard: {
    minHeight: 70,
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E6E6E1",
    flexDirection: "row",
    alignItems: "center",
  },

  optionCardSpacing: {
    marginTop: 9,
  },

  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F4F5F0",
    alignItems: "center",
    justifyContent: "center",
  },

  optionContent: {
    flex: 1,
    marginHorizontal: 10,
  },

  optionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.text,
  },

  optionDescription: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 13,
    color: COLORS.Gray,
  },

  // ==========================================================
  // ERROR
  // ==========================================================

  errorBox: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FFF2F1",
    borderWidth: 1,
    borderColor: "#F3D4D1",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },

  errorIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#FFE4E1",
    alignItems: "center",
    justifyContent: "center",
  },

  errorText: {
    flex: 1,
    marginLeft: 8,
    paddingTop: 2,
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.error,
  },

  bottomSpace: {
    height: 10,
  },

  // ==========================================================
  // FOOTER
  // ==========================================================

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: "#ECECE8",
    flexDirection: "row",
    gap: 10,
  },

  cancelButton: {
    width: "30%",
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F3F3EF",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.darkGray,
  },

  submitButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 12,
  },

  submitButtonDisabled: {
    opacity: 0.7,
  },

  submitButtonText: {
    marginLeft: 7,
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.white,
  },

  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
