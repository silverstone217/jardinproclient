import { Ionicons } from "@expo/vector-icons";
import { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, fonts, fontSizes, SETTINGS_COLORS } from "@/utils/styles";

interface CustomerPreviewHeaderProps {
  name?: string | null;
  phone: string;
  createdAt?: string | Date | null;
  pointOfSaleLabel?: string | null;
  isAllPointOfSales?: boolean;
  onBack: () => void;
}

const CustomerPreviewHeader = memo(
  ({
    name,
    phone,
    createdAt,
    pointOfSaleLabel,
    isAllPointOfSales = false,
    onBack,
  }: CustomerPreviewHeaderProps) => {
    const displayName = name?.trim() || "Client";

    const initials = useMemo(() => {
      if (!name?.trim()) {
        return "CL";
      }

      const parts = name.trim().split(/\s+/).filter(Boolean);

      if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
      }

      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }, [name]);

    const formattedCreatedAt = useMemo(() => {
      if (!createdAt) {
        return null;
      }

      const date = createdAt instanceof Date ? createdAt : new Date(createdAt);

      if (Number.isNaN(date.getTime())) {
        return null;
      }

      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    }, [createdAt]);

    const posLabel = isAllPointOfSales
      ? "Tous les points de vente"
      : pointOfSaleLabel || null;

    return (
      <View style={styles.container}>
        {/* Retour */}
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </Pressable>

        {/* Identité du client */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>

            <View style={styles.phoneRow}>
              <Ionicons name="call-outline" size={14} color={COLORS.darkGray} />

              <Text style={styles.phone} numberOfLines={1}>
                {phone}
              </Text>
            </View>

            {formattedCreatedAt && (
              <Text style={styles.createdAt} numberOfLines={1}>
                Client depuis le {formattedCreatedAt}
              </Text>
            )}
          </View>
        </View>

        {/* Contexte POS */}
        {posLabel && (
          <View style={styles.contextContainer}>
            <Ionicons
              name={isAllPointOfSales ? "apps-outline" : "storefront-outline"}
              size={15}
              color={SETTINGS_COLORS.business.icon}
            />

            <Text style={styles.contextText} numberOfLines={1}>
              {posLabel}
            </Text>

            {isAllPointOfSales && (
              <View style={styles.globalBadge}>
                <Text style={styles.globalBadgeText}>Global</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  },
);

CustomerPreviewHeader.displayName = "CustomerPreviewHeader";

export default CustomerPreviewHeader;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    marginBottom: 18,
  },

  backButtonPressed: {
    opacity: 0.65,
  },

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    marginRight: 14,
  },

  avatarText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.large,
    lineHeight: fontSizes.large * 1.25,
    color: COLORS.neutral,
  },

  info: {
    flex: 1,
    minWidth: 0,
  },

  name: {
    fontFamily: fonts.bold,
    fontSize: 21,
    lineHeight: 21 * 1.25,
    color: COLORS.text,
    marginBottom: 5,
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  phone: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: COLORS.darkGray,
  },

  createdAt: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: COLORS.Gray,
    marginTop: 4,
  },

  contextContainer: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%",
    marginTop: 16,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: SETTINGS_COLORS.business.background,
  },

  contextText: {
    flexShrink: 1,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: SETTINGS_COLORS.business.icon,
    marginLeft: 6,
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
    fontSize: 9,
    lineHeight: 11,
    color: COLORS.white,
  },
});
