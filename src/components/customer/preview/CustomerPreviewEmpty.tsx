import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, fonts, fontSizes, SETTINGS_COLORS } from "@/utils/styles";

interface CustomerPreviewEmptyProps {
  title?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
}

const CustomerPreviewEmpty = memo(
  ({
    title = "Aucune donnée",
    message = "Aucune information disponible pour le moment.",
    icon = "document-text-outline",
    actionLabel,
    onAction,
  }: CustomerPreviewEmptyProps) => {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={icon}
            size={28}
            color={SETTINGS_COLORS.customers.icon}
          />
        </View>

        <Text style={styles.title}>{title}</Text>

        <Text style={styles.message}>{message}</Text>

        {actionLabel && onAction && (
          <Pressable
            onPress={onAction}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            <Text style={styles.actionText}>{actionLabel}</Text>

            <Ionicons name="refresh-outline" size={16} color={COLORS.primary} />
          </Pressable>
        )}
      </View>
    );
  },
);

CustomerPreviewEmpty.displayName = "CustomerPreviewEmpty";

export default CustomerPreviewEmpty;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 36,
    borderRadius: 14,
    backgroundColor: COLORS.neutral,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },

  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SETTINGS_COLORS.customers.background,
    marginBottom: 14,
  },

  title: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.medium,
    lineHeight: fontSizes.medium * 1.25,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 5,
  },

  message: {
    maxWidth: 290,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.4,
    color: COLORS.Gray,
    textAlign: "center",
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: SETTINGS_COLORS.customers.background,
  },

  actionButtonPressed: {
    opacity: 0.7,
  },

  actionText: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: COLORS.primary,
    marginRight: 6,
  },
});
