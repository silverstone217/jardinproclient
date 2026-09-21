import { Ionicons } from "@expo/vector-icons";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface InvoiceErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function InvoiceErrorState({
  message,
  onRetry,
}: InvoiceErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Ionicons name="alert-circle-outline" size={29} color={COLORS.error} />
      </View>

      <Text style={styles.title}>Impossible de charger les factures</Text>

      <Text style={styles.message}>{message}</Text>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={onRetry}
      >
        <Ionicons name="refresh-outline" size={16} color={COLORS.white} />

        <Text style={styles.buttonText}>Réessayer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingBottom: 60,
  },

  icon: {
    width: 64,
    height: 64,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDECEC",
  },

  title: {
    marginTop: 15,
    fontFamily: fonts.bold,
    fontSize: 14,
    color: COLORS.text,
    textAlign: "center",
  },

  message: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    color: COLORS.Gray,
    textAlign: "center",
  },

  button: {
    marginTop: 18,
    minHeight: 42,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  buttonText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.white,
  },

  pressed: {
    opacity: 0.65,
  },
});
