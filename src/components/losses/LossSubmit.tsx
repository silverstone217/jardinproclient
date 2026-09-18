import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface LossSubmitProps {
  onSubmit: () => void;
  disabled?: boolean;
  isSubmitting?: boolean;
  label?: string;
}

export function LossSubmit({
  onSubmit,
  disabled = false,
  isSubmitting = false,
  label = "Enregistrer la perte",
}: LossSubmitProps) {
  const isDisabled = disabled || isSubmitting;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.pressed,
      ]}
      onPress={onSubmit}
      disabled={isDisabled}
    >
      {isSubmitting ? (
        <ActivityIndicator size="small" color={COLORS.white} />
      ) : (
        <Ionicons
          name="checkmark-circle-outline"
          size={20}
          color={isDisabled ? COLORS.Gray : COLORS.white}
        />
      )}

      <Text style={[styles.text, isDisabled && styles.textDisabled]}>
        {isSubmitting ? "Enregistrement..." : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    marginTop: 4,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.error,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  buttonDisabled: {
    backgroundColor: COLORS.lightGray,
  },

  text: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.white,
  },

  textDisabled: {
    color: COLORS.Gray,
  },

  pressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },
});
