import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
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

import type { Employee, EmployeeFormData } from "@/types/employee";
import { COLORS, fonts } from "@/utils/styles";

interface EmployeeEditModalProps {
  visible: boolean;
  employee: Employee | null;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (data: EmployeeFormData) => Promise<void>;
}

const getAssignment = (employee: Employee) => {
  return employee.assignments.find((assignment) => assignment.isActive);
};

interface FormFieldProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "phone-pad" | "email-address";
  autoCapitalize?: "none" | "sentences";
}

const FormField = ({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
}: FormFieldProps) => (
  <View style={styles.formSection}>
    <Text style={styles.formLabel}>{label}</Text>

    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={18} color={COLORS.Gray} />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.Gray}
        style={styles.input}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  </View>
);

export default function EmployeeEditModal({
  visible,
  employee,
  isSaving,
  error,
  onClose,
  onSave,
}: EmployeeEditModalProps) {
  const [form, setForm] = useState<EmployeeFormData>({
    name: "",
    telephone: "",
    email: "",
    pointOfSaleId: "",
    isActive: true,
  });

  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!employee || !visible) {
      return;
    }

    const assignment = getAssignment(employee);

    setForm({
      name: employee.name,
      telephone: employee.telephone,
      email: employee.email ?? "",
      pointOfSaleId: assignment?.pointOfSale.id ?? "",
      isActive: employee.isActive,
    });

    setLocalError(null);
  }, [employee, visible]);

  if (!employee) {
    return null;
  }

  const assignment = getAssignment(employee);

  const pointOfSale = assignment?.pointOfSale;

  const updateField = <K extends keyof EmployeeFormData>(
    field: K,
    value: EmployeeFormData[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setLocalError(null);
  };

  const validate = () => {
    const name = form.name.trim();
    const telephone = form.telephone.trim();
    const email = form.email.trim();

    if (name.length < 2) {
      return "Le nom doit contenir au moins 2 caractères.";
    }

    if (name.length > 40) {
      return "Le nom ne peut pas dépasser 40 caractères.";
    }

    if (!/^0\d{9}$/.test(telephone)) {
      return "Le numéro doit contenir exactement 10 chiffres et commencer par 0.";
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "L'adresse email n'est pas valide.";
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();

    if (validationError) {
      setLocalError(validationError);
      return;
    }

    try {
      await onSave({
        name: form.name.trim(),
        telephone: form.telephone.trim(),
        email: form.email.trim(),
        pointOfSaleId: form.pointOfSaleId.trim(),
        isActive: form.isActive,
      });
    } catch {
      // Le store gère l'erreur.
    }
  };

  const displayError = localError || error;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={isSaving ? undefined : onClose}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboard}
        >
          <View style={styles.modal}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Modifier l'employé</Text>

                <Text style={styles.subtitle}>
                  Mettez à jour ses informations
                </Text>
              </View>

              <Pressable
                onPress={onClose}
                disabled={isSaving}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={20} color={COLORS.darkGray} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.content}
            >
              {displayError && (
                <View style={styles.errorBox}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color={COLORS.error}
                  />

                  <Text style={styles.errorText}>{displayError}</Text>
                </View>
              )}

              <FormField
                label="Nom complet"
                icon="person-outline"
                value={form.name}
                onChangeText={(value) => updateField("name", value)}
                placeholder="Nom de l'employé"
              />

              <FormField
                label="Téléphone"
                icon="call-outline"
                value={form.telephone}
                onChangeText={(value) => updateField("telephone", value)}
                placeholder="0812345678"
                keyboardType="phone-pad"
              />

              <FormField
                label="Email"
                icon="mail-outline"
                value={form.email}
                onChangeText={(value) => updateField("email", value)}
                placeholder="email@exemple.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Point de vente</Text>

                <View style={styles.assignmentField}>
                  <View style={styles.assignmentIcon}>
                    <Ionicons
                      name="storefront-outline"
                      size={18}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.assignmentInfo}>
                    <Text style={styles.assignmentName} numberOfLines={1}>
                      {pointOfSale?.name ?? "Aucun point de vente"}
                    </Text>

                    {pointOfSale?.code && (
                      <Text style={styles.assignmentCode}>
                        {pointOfSale.code}
                      </Text>
                    )}
                  </View>

                  <Ionicons
                    name="lock-closed-outline"
                    size={15}
                    color={COLORS.Gray}
                  />
                </View>

                <Text style={styles.helperText}>
                  L'affectation sera gérée avec le sélecteur de points de vente.
                </Text>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Statut du compte</Text>

                <Pressable
                  onPress={() => updateField("isActive", !form.isActive)}
                  style={[
                    styles.statusSelector,
                    form.isActive && styles.statusSelectorActive,
                  ]}
                >
                  <View
                    style={[
                      styles.statusIcon,
                      form.isActive && styles.statusIconActive,
                    ]}
                  >
                    <Ionicons
                      name={form.isActive ? "checkmark" : "pause"}
                      size={17}
                      color={form.isActive ? COLORS.success : COLORS.Gray}
                    />
                  </View>

                  <View style={styles.statusInfo}>
                    <Text style={styles.statusTitle}>
                      {form.isActive ? "Compte actif" : "Compte désactivé"}
                    </Text>

                    <Text style={styles.statusDescription}>
                      {form.isActive
                        ? "L'employé peut utiliser son compte."
                        : "L'accès de l'employé est désactivé."}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.toggle,
                      form.isActive && styles.toggleActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        form.isActive && styles.toggleThumbActive,
                      ]}
                    />
                  </View>
                </Pressable>
              </View>
            </ScrollView>

            <View style={styles.actions}>
              <Pressable
                onPress={onClose}
                disabled={isSaving}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={handleSubmit}
                disabled={isSaving}
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.pressed,
                  isSaving && styles.disabled,
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Ionicons name="checkmark" size={19} color={COLORS.white} />
                )}

                <Text style={styles.saveText}>
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.42)",
    justifyContent: "flex-end",
  },

  keyboard: {
    width: "100%",
  },

  modal: {
    maxHeight: "91%",
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    overflow: "hidden",
  },

  handle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D5D5D5",
    marginTop: 9,
    marginBottom: 5,
  },

  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: COLORS.text,
  },

  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.Gray,
    marginTop: 3,
  },

  closeButton: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: "#F4F4F4",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    padding: 18,
    paddingBottom: 25,
  },

  errorBox: {
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FFD6D6",
    borderRadius: 12,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  errorText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    lineHeight: 15,
    color: COLORS.error,
    marginLeft: 8,
  },

  formSection: {
    marginBottom: 16,
  },

  formLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.darkGray,
    marginBottom: 7,
    marginLeft: 2,
  },

  inputContainer: {
    height: 48,
    backgroundColor: COLORS.white,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    marginLeft: 9,
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: COLORS.text,
    paddingVertical: 0,
  },

  assignmentField: {
    minHeight: 55,
    backgroundColor: "#F7F7F7",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  assignmentIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#E8F2E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  assignmentInfo: {
    flex: 1,
  },

  assignmentName: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: COLORS.darkGray,
  },

  assignmentCode: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: COLORS.Gray,
    marginTop: 2,
  },

  helperText: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
    marginTop: 5,
    lineHeight: 13,
  },

  statusSelector: {
    minHeight: 66,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  statusSelectorActive: {
    borderColor: "#D7E9D3",
    backgroundColor: "#FBFDFB",
  },

  statusIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  statusIconActive: {
    backgroundColor: "#E8F5E9",
  },

  statusInfo: {
    flex: 1,
  },

  statusTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  statusDescription: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
    marginTop: 3,
  },

  toggle: {
    width: 38,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#D6D6D6",
    padding: 2,
    justifyContent: "center",
  },

  toggleActive: {
    backgroundColor: COLORS.primary,
  },

  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.white,
  },

  toggleThumbActive: {
    alignSelf: "flex-end",
  },

  actions: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 17,
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },

  cancelButton: {
    flex: 0.75,
    height: 48,
    borderRadius: 13,
    backgroundColor: "#F3F3F3",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.darkGray,
  },

  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  saveText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.white,
    marginLeft: 7,
  },

  pressed: {
    opacity: 0.72,
  },

  disabled: {
    opacity: 0.55,
  },
});
