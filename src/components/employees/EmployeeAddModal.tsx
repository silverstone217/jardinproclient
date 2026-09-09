import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
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

import type { EmployeeFormData } from "@/types/employee";
import type { PointOfSale } from "@/types/point-of-sale";
import { COLORS, fonts } from "@/utils/styles";

interface EmployeeAddModalProps {
  visible: boolean;
  pointOfSales: PointOfSale[];
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (data: EmployeeFormData) => Promise<void>;
}

const EMPTY_FORM: EmployeeFormData = {
  name: "",
  telephone: "",
  email: "",
  pointOfSaleId: "",
  isActive: true,
};

export default function EmployeeAddModal({
  visible,
  pointOfSales,
  isSaving,
  error,
  onClose,
  onSave,
}: EmployeeAddModalProps) {
  const [form, setForm] = useState<EmployeeFormData>(EMPTY_FORM);

  const [localError, setLocalError] = useState<string | null>(null);

  const [showPointOfSales, setShowPointOfSales] = useState(false);

  useEffect(() => {
    if (visible) {
      setForm(EMPTY_FORM);
      setLocalError(null);
      setShowPointOfSales(false);
    }
  }, [visible]);

  const activePointOfSales = useMemo(
    () => pointOfSales.filter((pointOfSale) => pointOfSale.isActive),
    [pointOfSales],
  );

  const selectedPointOfSale = useMemo(
    () =>
      activePointOfSales.find(
        (pointOfSale) => pointOfSale.id === form.pointOfSaleId,
      ),
    [activePointOfSales, form.pointOfSaleId],
  );

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

    if (name.length < 2 || name.length > 40) {
      return "Le nom doit contenir entre 2 et 40 caractères.";
    }

    if (!/^0\d{9}$/.test(telephone)) {
      return "Le numéro doit contenir exactement 10 chiffres et commencer par 0.";
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "L'adresse email n'est pas valide.";
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validate();

    if (validationError) {
      setLocalError(validationError);
      return;
    }

    await onSave({
      ...form,
      name: form.name.trim(),
      telephone: form.telephone.trim(),
      email: form.email.trim(),
    });
  };

  const displayedError = localError || error;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.modal}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons
                name="person-add-outline"
                size={22}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.headerText}>
              <Text style={styles.title}>Ajouter un employé</Text>

              <Text style={styles.subtitle}>
                Créez un nouveau membre du personnel
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              disabled={isSaving}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="close" size={22} color={COLORS.darkGray} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            {/* Informations */}
            <Text style={styles.sectionTitle}>Informations personnelles</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Nom complet</Text>

              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={19} color={COLORS.Gray} />

                <TextInput
                  value={form.name}
                  onChangeText={(value) => updateField("name", value)}
                  placeholder="Ex. Jean Kabeya"
                  placeholderTextColor={COLORS.Gray}
                  style={styles.input}
                  maxLength={40}
                  editable={!isSaving}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Numéro de téléphone</Text>

              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={19} color={COLORS.Gray} />

                <TextInput
                  value={form.telephone}
                  onChangeText={(value) =>
                    updateField(
                      "telephone",
                      value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                  placeholder="0812345678"
                  placeholderTextColor={COLORS.Gray}
                  style={styles.input}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!isSaving}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Adresse email
                <Text style={styles.optional}> (facultatif)</Text>
              </Text>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={19} color={COLORS.Gray} />

                <TextInput
                  value={form.email}
                  onChangeText={(value) => updateField("email", value)}
                  placeholder="jean@email.com"
                  placeholderTextColor={COLORS.Gray}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSaving}
                />
              </View>
            </View>

            {/* Affectation */}
            <Text style={[styles.sectionTitle, styles.assignmentSection]}>
              Affectation
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>
                Point de vente
                <Text style={styles.optional}> (facultatif)</Text>
              </Text>

              <Pressable
                onPress={() => setShowPointOfSales((current) => !current)}
                disabled={isSaving}
                style={({ pressed }) => [
                  styles.selectButton,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.selectLeft}>
                  <View style={styles.selectIcon}>
                    <MaterialCommunityIcons
                      name="storefront-outline"
                      size={19}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.selectText}>
                    <Text
                      style={[
                        styles.selectValue,
                        !selectedPointOfSale && styles.placeholder,
                      ]}
                      numberOfLines={1}
                    >
                      {selectedPointOfSale
                        ? selectedPointOfSale.name
                        : "Aucun point de vente"}
                    </Text>

                    {selectedPointOfSale && (
                      <Text style={styles.selectCode}>
                        {selectedPointOfSale.code}
                      </Text>
                    )}
                  </View>
                </View>

                <Ionicons
                  name={showPointOfSales ? "chevron-up" : "chevron-down"}
                  size={19}
                  color={COLORS.Gray}
                />
              </Pressable>

              {showPointOfSales && (
                <View style={styles.options}>
                  <Pressable
                    onPress={() => {
                      updateField("pointOfSaleId", "");
                      setShowPointOfSales(false);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      !form.pointOfSaleId && styles.selectedOption,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.optionIcon}>
                      <Ionicons
                        name="remove-circle-outline"
                        size={19}
                        color={COLORS.Gray}
                      />
                    </View>

                    <Text style={styles.optionText}>Aucun point de vente</Text>

                    {!form.pointOfSaleId && (
                      <Ionicons
                        name="checkmark"
                        size={19}
                        color={COLORS.primary}
                      />
                    )}
                  </Pressable>

                  {activePointOfSales.map((pointOfSale) => {
                    const selected = form.pointOfSaleId === pointOfSale.id;

                    return (
                      <Pressable
                        key={pointOfSale.id}
                        onPress={() => {
                          updateField("pointOfSaleId", pointOfSale.id);
                          setShowPointOfSales(false);
                        }}
                        style={({ pressed }) => [
                          styles.option,
                          selected && styles.selectedOption,
                          pressed && styles.pressed,
                        ]}
                      >
                        <View style={styles.optionIcon}>
                          <MaterialCommunityIcons
                            name="storefront-outline"
                            size={19}
                            color={selected ? COLORS.primary : COLORS.Gray}
                          />
                        </View>

                        <View style={styles.optionTextContainer}>
                          <Text
                            style={[
                              styles.optionText,
                              selected && styles.selectedOptionText,
                            ]}
                            numberOfLines={1}
                          >
                            {pointOfSale.name}
                          </Text>

                          <Text style={styles.optionCode}>
                            {pointOfSale.code}
                          </Text>
                        </View>

                        {selected && (
                          <Ionicons
                            name="checkmark"
                            size={19}
                            color={COLORS.primary}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}

              <Text style={styles.helper}>
                Vous pourrez modifier cette affectation ultérieurement.
              </Text>
            </View>

            {/* Statut */}
            <View style={styles.statusRow}>
              <View style={styles.statusLeft}>
                <View style={styles.statusIcon}>
                  <Ionicons
                    name="power-outline"
                    size={18}
                    color={form.isActive ? COLORS.success : COLORS.Gray}
                  />
                </View>

                <View>
                  <Text style={styles.statusTitle}>Compte actif</Text>

                  <Text style={styles.statusDescription}>
                    L'employé pourra se connecter à l'application
                  </Text>
                </View>
              </View>

              <Switch
                value={form.isActive}
                onValueChange={(value) => updateField("isActive", value)}
                disabled={isSaving}
                trackColor={{
                  false: COLORS.lightGray,
                  true: "#A9C8A3",
                }}
                thumbColor={form.isActive ? COLORS.primary : COLORS.white}
              />
            </View>

            {/* Mot de passe automatique */}
            <View style={styles.passwordInfo}>
              <View style={styles.passwordIcon}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={COLORS.secondary}
                />
              </View>

              <View style={styles.passwordText}>
                <Text style={styles.passwordTitle}>Mot de passe initial</Text>

                <Text style={styles.passwordDescription}>
                  Un mot de passe temporaire sera automatiquement attribué à
                  l'employé. Il pourra le modifier depuis Sécurité.
                </Text>
              </View>
            </View>

            {displayedError && (
              <View style={styles.errorBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={19}
                  color={COLORS.error}
                />

                <Text style={styles.errorText}>{displayedError}</Text>
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              disabled={isSaving}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.cancelText}>Annuler</Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              disabled={isSaving}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.savePressed,
                isSaving && styles.disabledButton,
              ]}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="person-add-outline"
                    size={19}
                    color={COLORS.white}
                  />

                  <Text style={styles.saveText}>Ajouter</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: "94%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },

  handle: {
    width: 42,
    height: 4,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    alignSelf: "center",
    marginTop: 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: COLORS.Gray,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },

  content: {
    padding: 20,
    paddingBottom: 24,
  },

  sectionTitle: {
    marginBottom: 12,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.darkGray,
  },

  assignmentSection: {
    marginTop: 8,
  },

  field: {
    marginBottom: 16,
  },

  label: {
    marginBottom: 7,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: COLORS.text,
  },

  optional: {
    fontFamily: fonts.regular,
    color: COLORS.Gray,
  },

  inputContainer: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    borderRadius: 14,
    backgroundColor: "#FAFAFA",
  },

  input: {
    flex: 1,
    height: "100%",
    fontFamily: fonts.regular,
    fontSize: 14,
    color: COLORS.text,
  },

  selectButton: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    borderRadius: 14,
    backgroundColor: "#FAFAFA",
  },

  selectLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  selectIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  selectText: {
    flex: 1,
    marginLeft: 10,
  },

  selectValue: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: COLORS.text,
  },

  placeholder: {
    color: COLORS.Gray,
  },

  selectCode: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: COLORS.Gray,
  },

  options: {
    marginTop: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E7E7E7",
    borderRadius: 14,
    backgroundColor: COLORS.white,
  },

  option: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },

  selectedOption: {
    backgroundColor: "#F4F9F2",
  },

  optionIcon: {
    width: 34,
    alignItems: "center",
  },

  optionTextContainer: {
    flex: 1,
    marginLeft: 5,
  },

  optionText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: COLORS.text,
  },

  selectedOptionText: {
    color: COLORS.primary,
  },

  optionCode: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  helper: {
    marginTop: 7,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.Gray,
  },

  statusRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 13,
    marginTop: 3,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    borderRadius: 15,
    backgroundColor: "#FAFAFA",
  },

  statusLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  statusIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF5E8",
    marginRight: 10,
  },

  statusTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  statusDescription: {
    maxWidth: 240,
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  passwordInfo: {
    flexDirection: "row",
    padding: 13,
    marginTop: 12,
    borderRadius: 15,
    backgroundColor: "#FFF8ED",
  },

  passwordIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE9C7",
  },

  passwordText: {
    flex: 1,
    marginLeft: 10,
  },

  passwordTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
  },

  passwordDescription: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.darkGray,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    marginTop: 14,
    borderRadius: 13,
    backgroundColor: "#FFF0F0",
  },

  errorText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.error,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    backgroundColor: COLORS.white,
  },

  cancelButton: {
    flex: 0.8,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F4F4",
  },

  cancelText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.darkGray,
  },

  saveButton: {
    flex: 1.2,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
  },

  saveText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.white,
  },

  disabledButton: {
    opacity: 0.65,
  },

  pressed: {
    opacity: 0.7,
  },

  savePressed: {
    opacity: 0.85,
  },
});
