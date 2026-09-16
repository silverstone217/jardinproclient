import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface ProductionFormFooterProps {
  isSubmitting: boolean;
  disabled?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export function ProductionFormFooter({
  isSubmitting,
  disabled = false,
  onCancel,
  onSubmit,
}: ProductionFormFooterProps) {
  return (
    <View style={styles.container}>
      <View style={styles.divider} />

      <View style={styles.content}>
        <Pressable
          style={({ pressed }) => [
            styles.cancelButton,
            pressed && !disabled && styles.pressed,
          ]}
          onPress={onCancel}
          disabled={disabled}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            disabled && styles.submitButtonDisabled,
            pressed && !disabled && styles.submitButtonPressed,
          ]}
          onPress={onSubmit}
          disabled={disabled}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Ionicons
              name="checkmark-circle-outline"
              size={19}
              color={COLORS.white}
            />
          )}

          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingBottom: 10,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  cancelButton: {
    width: 100,
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },

  cancelButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.darkGray,
  },

  submitButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
  },

  submitButtonDisabled: {
    opacity: 0.65,
  },

  submitButtonPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  submitButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.white,
  },

  pressed: {
    opacity: 0.55,
  },
});
