import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useSecurityStore } from "@/store/security.store";
import { COLORS, fonts, fontSizes } from "@/utils/styles";
import { SafeAreaView } from "react-native-safe-area-context";

interface PasswordFieldProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  visible: boolean;
  onToggleVisibility: () => void;
  disabled?: boolean;
  hasError?: boolean;
}

function PasswordField({
  icon,
  label,
  placeholder,
  value,
  onChangeText,
  visible,
  onToggleVisibility,
  disabled = false,
  hasError = false,
}: PasswordFieldProps) {
  const hasValue = value.length > 0;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.inputContainer,
          hasError && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
        ]}
      >
        <View
          style={[
            styles.inputIcon,
            hasValue && !hasError && styles.inputIconActive,
            hasError && styles.inputIconError,
          ]}
        >
          <Ionicons
            name={icon}
            size={19}
            color={
              hasError ? COLORS.error : hasValue ? COLORS.primary : COLORS.Gray
            }
          />
        </View>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.Gray}
          style={styles.input}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
          maxLength={12}
          textContentType="password"
          selectionColor={COLORS.primary}
        />

        <Pressable
          onPress={onToggleVisibility}
          disabled={disabled}
          hitSlop={8}
          style={({ pressed }) => [
            styles.visibilityButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={visible ? "eye-off-outline" : "eye-outline"}
            size={21}
            color={disabled ? COLORS.lightGray : COLORS.Gray}
          />
        </Pressable>
      </View>
    </View>
  );
}

export default function SecurityScreen() {
  const { isChangingPassword, error, changePassword, clearError, reset } =
    useSecurityStore();

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isBusy = isChangingPassword;

  useFocusEffect(
    useCallback(() => {
      clearError();

      return () => {
        reset();
      };
    }, [clearError, reset]),
  );

  const isNewPasswordValid =
    newPassword.length >= 6 && newPassword.length <= 12;

  const isPasswordDifferent =
    newPassword.length > 0 && newPassword !== currentPassword;

  const passwordsMatch =
    confirmPassword.length > 0 && confirmPassword === newPassword;

  const isFormValid =
    currentPassword.length > 0 &&
    isNewPasswordValid &&
    isPasswordDifferent &&
    passwordsMatch;

  const handleChangePassword = async () => {
    clearError();

    if (!currentPassword) {
      Alert.alert(
        "Ancien mot de passe",
        "Veuillez saisir votre ancien mot de passe.",
      );
      return;
    }

    if (newPassword.length < 6 || newPassword.length > 12) {
      Alert.alert(
        "Nouveau mot de passe",
        "Le nouveau mot de passe doit contenir entre 6 et 12 caractères.",
      );
      return;
    }

    if (newPassword === currentPassword) {
      Alert.alert(
        "Mot de passe identique",
        "Le nouveau mot de passe doit être différent de l'ancien.",
      );
      return;
    }

    if (confirmPassword !== newPassword) {
      Alert.alert(
        "Confirmation incorrecte",
        "Les nouveaux mots de passe ne correspondent pas.",
      );
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      Alert.alert(
        "Mot de passe modifié",
        "Votre mot de passe a été modifié avec succès.",
      );
    } catch (error) {
      console.error("Erreur modification mot de passe :", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Sécurité</Text>

              <Text style={styles.subtitle}>
                Protégez votre compte en gardant votre mot de passe à jour.
              </Text>
            </View>
          </View>

          {/* Security Hero */}
          <View style={styles.securityCard}>
            <View style={styles.securityIllustration}>
              <View style={styles.securityGlow}>
                <Ionicons
                  name="shield-checkmark"
                  size={42}
                  color={COLORS.primary}
                />
              </View>
            </View>

            <View style={styles.securityContent}>
              <View style={styles.securityTitleRow}>
                <Text style={styles.securityTitle}>Compte sécurisé</Text>

                <Ionicons
                  name="checkmark-circle"
                  size={19}
                  color={COLORS.success}
                />
              </View>

              <Text style={styles.securityDescription}>
                Utilisez un mot de passe personnel et évitez de le partager avec
                d'autres personnes.
              </Text>
            </View>
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorBanner}>
              <View style={styles.errorIcon}>
                <Ionicons name="alert-circle" size={19} color={COLORS.error} />
              </View>

              <Text style={styles.errorText}>{error}</Text>

              <Pressable
                onPress={clearError}
                hitSlop={8}
                style={styles.errorClose}
              >
                <Ionicons name="close" size={18} color={COLORS.Gray} />
              </Pressable>
            </View>
          )}

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Modifier le mot de passe
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Saisissez vos informations de sécurité
                </Text>
              </View>

              <View style={styles.lockBadge}>
                <Ionicons
                  name="lock-closed-outline"
                  size={15}
                  color={COLORS.primary}
                />
              </View>
            </View>

            <View style={styles.formCard}>
              {/* Current password */}
              <PasswordField
                icon="key-outline"
                label="Ancien mot de passe"
                placeholder="Votre ancien mot de passe"
                value={currentPassword}
                onChangeText={(value) => {
                  clearError();
                  setCurrentPassword(value);
                }}
                visible={showCurrentPassword}
                onToggleVisibility={() =>
                  setShowCurrentPassword((value) => !value)
                }
                disabled={isBusy}
              />

              <View style={styles.separator} />

              {/* New password */}
              <PasswordField
                icon="lock-closed-outline"
                label="Nouveau mot de passe"
                placeholder="Votre nouveau mot de passe"
                value={newPassword}
                onChangeText={(value) => {
                  clearError();
                  setNewPassword(value);
                }}
                visible={showNewPassword}
                onToggleVisibility={() => setShowNewPassword((value) => !value)}
                disabled={isBusy}
                hasError={newPassword.length > 0 && !isNewPasswordValid}
              />

              {/* Rules */}
              <View style={styles.rules}>
                <View style={styles.rule}>
                  <Ionicons
                    name={
                      isNewPasswordValid
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={17}
                    color={isNewPasswordValid ? COLORS.success : COLORS.Gray}
                  />

                  <Text
                    style={[
                      styles.ruleText,
                      isNewPasswordValid && styles.ruleTextSuccess,
                    ]}
                  >
                    Entre 6 et 12 caractères
                  </Text>
                </View>

                <View style={styles.rule}>
                  <Ionicons
                    name={
                      isPasswordDifferent
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={17}
                    color={isPasswordDifferent ? COLORS.success : COLORS.Gray}
                  />

                  <Text
                    style={[
                      styles.ruleText,
                      isPasswordDifferent && styles.ruleTextSuccess,
                    ]}
                  >
                    Différent de l'ancien mot de passe
                  </Text>
                </View>
              </View>

              <View style={styles.separator} />

              {/* Confirmation */}
              <PasswordField
                icon="checkmark-circle-outline"
                label="Confirmer le mot de passe"
                placeholder="Saisissez-le à nouveau"
                value={confirmPassword}
                onChangeText={(value) => {
                  clearError();
                  setConfirmPassword(value);
                }}
                visible={showConfirmPassword}
                onToggleVisibility={() =>
                  setShowConfirmPassword((value) => !value)
                }
                disabled={isBusy}
                hasError={confirmPassword.length > 0 && !passwordsMatch}
              />

              {confirmPassword.length > 0 && (
                <View
                  style={[
                    styles.matchMessage,
                    passwordsMatch
                      ? styles.matchMessageSuccess
                      : styles.matchMessageError,
                  ]}
                >
                  <Ionicons
                    name={passwordsMatch ? "checkmark-circle" : "alert-circle"}
                    size={17}
                    color={passwordsMatch ? COLORS.success : COLORS.error}
                  />

                  <Text
                    style={[
                      styles.matchText,
                      passwordsMatch
                        ? styles.matchTextSuccess
                        : styles.matchTextError,
                    ]}
                  >
                    {passwordsMatch
                      ? "Les mots de passe correspondent"
                      : "Les mots de passe ne correspondent pas"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Submit */}
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              !isFormValid && styles.submitButtonDisabled,
              pressed && isFormValid && !isBusy && styles.submitButtonPressed,
            ]}
            onPress={handleChangePassword}
            disabled={!isFormValid || isBusy}
          >
            <View
              style={[
                styles.submitIcon,
                !isFormValid && styles.submitIconDisabled,
              ]}
            >
              <Ionicons
                name={
                  isChangingPassword
                    ? "sync-outline"
                    : "shield-checkmark-outline"
                }
                size={20}
                color={isFormValid ? COLORS.white : COLORS.Gray}
              />
            </View>

            <Text
              style={[
                styles.submitText,
                !isFormValid && styles.submitTextDisabled,
              ]}
            >
              {isChangingPassword
                ? "Modification en cours..."
                : "Enregistrer le nouveau mot de passe"}
            </Text>

            {!isChangingPassword && isFormValid && (
              <Ionicons name="arrow-forward" size={19} color={COLORS.white} />
            )}
          </Pressable>

          {/* Security information */}
          <View style={styles.footerInfo}>
            <View style={styles.footerIcon}>
              <Ionicons
                name="shield-outline"
                size={17}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.footerContent}>
              <Text style={styles.footerTitle}>
                Gardez votre compte sécurisé
              </Text>

              <Text style={styles.footerText}>
                Ne partagez jamais votre mot de passe et évitez d'utiliser le
                même mot de passe sur plusieurs comptes.
              </Text>
            </View>
          </View>

          {/* Space for bottom tab navigation */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  /* Header */

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 28,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  headerTextContainer: {
    flex: 1,
    paddingTop: 1,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxlarge,
    lineHeight: 34,
    color: COLORS.text,
  },

  subtitle: {
    maxWidth: 340,
    marginTop: 7,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    lineHeight: 18,
    color: COLORS.Gray,
  },

  /* Hero */

  securityCard: {
    minHeight: 142,
    padding: 20,
    borderRadius: 26,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
  },

  securityIllustration: {
    width: 94,
    height: 94,
    borderRadius: 30,
    backgroundColor: "#E8F2E5",
    alignItems: "center",
    justifyContent: "center",
  },

  securityGlow: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  securityContent: {
    flex: 1,
    marginLeft: 18,
  },

  securityTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  securityTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.large,
    color: COLORS.text,
  },

  securityDescription: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    lineHeight: 18,
    color: COLORS.Gray,
  },

  /* Error */

  errorBanner: {
    marginTop: 18,
    padding: 14,
    borderRadius: 17,
    backgroundColor: "#FDECEC",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  errorIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  errorText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSizes.small,
    lineHeight: 18,
    color: COLORS.error,
  },

  errorClose: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Form */

  formSection: {
    marginTop: 34,
  },

  sectionHeader: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.medium,
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: COLORS.Gray,
  },

  lockBadge: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  formCard: {
    padding: 20,
    borderRadius: 26,
    backgroundColor: COLORS.white,
  },

  field: {
    gap: 10,
  },

  label: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.small,
    color: COLORS.darkGray,
  },

  inputContainer: {
    minHeight: 60,
    paddingLeft: 9,
    paddingRight: 12,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.neutral,
    flexDirection: "row",
    alignItems: "center",
  },

  inputContainerError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.neutral,
  },

  inputContainerDisabled: {
    opacity: 0.55,
  },

  inputIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },

  inputIconActive: {
    backgroundColor: "#E8F2E5",
  },

  inputIconError: {
    backgroundColor: "#FDECEC",
  },

  input: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
    paddingVertical: 0,
    fontFamily: fonts.regular,
    fontSize: fontSizes.medium,
    color: COLORS.text,
  },

  visibilityButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  separator: {
    height: 1,
    marginVertical: 24,
    backgroundColor: COLORS.lightGray,
  },

  /* Rules */

  rules: {
    marginTop: 14,
    paddingHorizontal: 3,
    gap: 10,
  },

  rule: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  ruleText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.Gray,
  },

  ruleTextSuccess: {
    fontFamily: fonts.medium,
    color: COLORS.success,
  },

  /* Confirmation */

  matchMessage: {
    marginTop: 13,
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  matchMessageSuccess: {
    backgroundColor: "#EAF6EC",
  },

  matchMessageError: {
    backgroundColor: "#FDECEC",
  },

  matchText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 16,
  },

  matchTextSuccess: {
    color: COLORS.success,
  },

  matchTextError: {
    color: COLORS.error,
  },

  /* Submit */

  submitButton: {
    minHeight: 62,
    marginTop: 24,
    paddingHorizontal: 15,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 11,
  },

  submitButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },

  submitButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },

  submitIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  submitIconDisabled: {
    backgroundColor: "rgba(255,255,255,0.35)",
  },

  submitText: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.small,
    lineHeight: 17,
    color: COLORS.white,
  },

  submitTextDisabled: {
    color: COLORS.Gray,
    textAlign: "center",
  },

  /* Footer */

  footerInfo: {
    marginTop: 22,
    padding: 16,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
  },

  footerIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },

  footerContent: {
    flex: 1,
  },

  footerTitle: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: COLORS.text,
  },

  footerText: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    color: COLORS.Gray,
  },

  /* Bottom tab spacing */

  bottomSpacer: {
    height: 160,
  },

  pressed: {
    opacity: 0.65,
  },
});
