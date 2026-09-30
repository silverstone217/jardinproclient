import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { forgotPassword } from "@/services/auth.service";
import { COLORS, fonts, typography } from "@/utils/styles";
import { isValidTelephone } from "@/utils/validation";

export default function ForgetPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");

  const [emailError, setEmailError] = useState("");
  const [telephoneError, setTelephoneError] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    setEmailError("");
    setTelephoneError("");
    setError("");
    setSuccessMessage("");

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedTelephone = telephone.trim();

    let hasError = false;

    if (!trimmedEmail) {
      setEmailError("L'adresse email est requise.");
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError("Veuillez saisir une adresse email valide.");
      hasError = true;
    }

    if (!trimmedTelephone) {
      setTelephoneError("Le numéro de téléphone est requis.");
      hasError = true;
    } else if (!isValidTelephone(trimmedTelephone)) {
      setTelephoneError("Le numéro de téléphone doit contenir 10 chiffres.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      setIsLoading(true);

      const result = await forgotPassword({
        email: trimmedEmail,
        telephone: trimmedTelephone,
      });

      if (!result.success) {
        throw new Error(
          result.message || "Impossible de réinitialiser le mot de passe.",
        );
      }

      setSuccessMessage(
        result.message ||
          "Un nouveau mot de passe temporaire a été envoyé à votre adresse email.",
      );
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="lock-reset"
                  size={32}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.title}>Mot de passe oublié ?</Text>

              <Text style={styles.subtitle}>
                Entrez votre adresse email et votre numéro de téléphone. Nous
                vous enverrons un mot de passe temporaire par email.
              </Text>
            </View>

            {/* Formulaire */}
            <View style={styles.form}>
              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Adresse email</Text>

                <View
                  style={[
                    styles.inputContainer,
                    emailError && styles.inputError,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={21}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />

                  <TextInput
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      setEmailError("");
                      setError("");
                      setSuccessMessage("");
                    }}
                    placeholder="exemple@email.com"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    style={styles.input}
                  />
                </View>

                {!!emailError && (
                  <Text style={styles.fieldError}>{emailError}</Text>
                )}
              </View>

              {/* Téléphone */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Numéro de téléphone</Text>

                <View
                  style={[
                    styles.inputContainer,
                    telephoneError && styles.inputError,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="phone-outline"
                    size={21}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />

                  <TextInput
                    value={telephone}
                    onChangeText={(value) => {
                      setTelephone(value);
                      setTelephoneError("");
                      setError("");
                      setSuccessMessage("");
                    }}
                    placeholder="0812345678"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    maxLength={10}
                    editable={!isLoading}
                    style={styles.input}
                  />
                </View>

                {!!telephoneError && (
                  <Text style={styles.fieldError}>{telephoneError}</Text>
                )}
              </View>

              {/* Erreur générale */}
              {!!error && (
                <View style={styles.messageContainer}>
                  <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={20}
                    color="#D32F2F"
                  />

                  <Text style={styles.errorMessage}>{error}</Text>
                </View>
              )}

              {/* Succès */}
              {!!successMessage && (
                <View
                  style={[styles.messageContainer, styles.successContainer]}
                >
                  <MaterialCommunityIcons
                    name="check-circle-outline"
                    size={20}
                    color="#2E7D32"
                  />

                  <Text style={styles.successMessage}>{successMessage}</Text>
                </View>
              )}

              {/* Bouton */}
              <Pressable
                onPress={handleResetPassword}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.button,
                  pressed && !isLoading && styles.buttonPressed,
                  isLoading && styles.buttonDisabled,
                ]}
              >
                {isLoading ? (
                  <Text style={styles.buttonText}>Envoi en cours...</Text>
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="email"
                      size={21}
                      color="#FFFFFF"
                    />

                    <Text style={styles.buttonText}>
                      Réinitialiser le mot de passe
                    </Text>
                  </>
                )}
              </Pressable>
            </View>

            {/* Retour connexion */}
            <Pressable
              onPress={() => router.replace("/auth")}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={20}
                color={COLORS.primary}
              />

              <Text style={styles.backButtonText}>Retour à la connexion</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  content: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },

  header: {
    alignItems: "center",
    marginBottom: 32,
  },

  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(45, 90, 39, 0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  title: {
    ...typography.heading,
    fontFamily: fonts.bold,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    ...typography.body,
    fontFamily: fonts.regular,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 390,
  },

  form: {
    gap: 18,
  },

  inputGroup: {
    width: "100%",
  },

  label: {
    ...typography.body,
    fontFamily: fonts.semibold,
    color: COLORS.text,
    marginBottom: 8,
  },

  inputContainer: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 12,
    paddingHorizontal: 15,
  },

  inputError: {
    borderColor: "#D32F2F",
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    height: "100%",
    fontFamily: fonts.regular,
    fontSize: 15,
    color: COLORS.text,
  },

  fieldError: {
    marginTop: 6,
    marginLeft: 2,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "#D32F2F",
  },

  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FDECEC",
  },

  errorMessage: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: "#D32F2F",
  },

  successContainer: {
    backgroundColor: "#EDF7ED",
  },

  successMessage: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: "#2E7D32",
  },

  button: {
    height: 54,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 4,
  },

  buttonPressed: {
    opacity: 0.85,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: "#FFFFFF",
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 26,
    paddingVertical: 10,
  },

  backButtonPressed: {
    opacity: 0.6,
  },

  backButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: COLORS.primary,
  },
});
