import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts, fontSizes, SETTINGS_COLORS } from "@/utils/styles";

interface CustomerPreviewPosBadgeProps {
  pointOfSaleName?: string | null;
  isAllPointOfSales?: boolean;
  compact?: boolean;
}

const CustomerPreviewPosBadge = memo(
  ({
    pointOfSaleName,
    isAllPointOfSales = false,
    compact = false,
  }: CustomerPreviewPosBadgeProps) => {
    const label = isAllPointOfSales
      ? "Tous les points de vente"
      : pointOfSaleName || "Point de vente";

    const iconName = isAllPointOfSales ? "apps-outline" : "storefront-outline";

    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <View
          style={[styles.iconContainer, compact && styles.iconContainerCompact]}
        >
          <Ionicons
            name={iconName}
            size={compact ? 13 : 15}
            color={SETTINGS_COLORS.business.icon}
          />
        </View>

        <Text
          style={[styles.label, compact && styles.labelCompact]}
          numberOfLines={1}
        >
          {label}
        </Text>

        {isAllPointOfSales && !compact && (
          <View style={styles.globalBadge}>
            <Text style={styles.globalBadgeText}>Global</Text>
          </View>
        )}
      </View>
    );
  },
);

CustomerPreviewPosBadge.displayName = "CustomerPreviewPosBadge";

export default CustomerPreviewPosBadge;

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: SETTINGS_COLORS.business.background,
  },

  containerCompact: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  iconContainer: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  iconContainerCompact: {
    width: 16,
    height: 16,
  },

  label: {
    flexShrink: 1,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: SETTINGS_COLORS.business.icon,
    marginLeft: 5,
  },

  labelCompact: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
  },

  globalBadge: {
    marginLeft: 7,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  globalBadgeText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: COLORS.white,
  },
});
