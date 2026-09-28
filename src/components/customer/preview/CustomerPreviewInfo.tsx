import { Ionicons } from "@expo/vector-icons";
import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts, fontSizes } from "@/utils/styles";

interface CustomerPreviewInfoProps {
  id: string;
  name?: string | null;
  phone: string;
  createdAt?: string | Date | null;
}

const CustomerPreviewInfo = memo(
  ({ id, name, phone, createdAt }: CustomerPreviewInfoProps) => {
    const displayName = name?.trim() || "Client";

    const formattedCreatedAt = useMemo(() => {
      if (!createdAt) {
        return "Non disponible";
      }

      const date = createdAt instanceof Date ? createdAt : new Date(createdAt);

      if (Number.isNaN(date.getTime())) {
        return "Non disponible";
      }

      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    }, [createdAt]);

    return (
      <View style={styles.container}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Informations</Text>

            <Text style={styles.subtitle}>
              Informations générales du client
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons name="person-outline" size={19} color={COLORS.primary} />
          </View>
        </View>

        {/* Informations */}
        <View style={styles.card}>
          {/* Nom */}
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="person-outline"
                size={17}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.label}>Nom</Text>

              <Text style={styles.value} numberOfLines={1}>
                {displayName}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          {/* Téléphone */}
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="call-outline" size={17} color={COLORS.primary} />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.label}>Téléphone</Text>

              <Text style={styles.value} numberOfLines={1}>
                {phone}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          {/* Date d'inscription */}
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="calendar-outline"
                size={17}
                color={COLORS.secondary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.label}>Client depuis</Text>

              <Text style={styles.value} numberOfLines={1}>
                {formattedCreatedAt}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          {/* Identifiant */}
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="finger-print-outline"
                size={17}
                color={COLORS.tertiary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.label}>Identifiant client</Text>

              <Text
                style={styles.idValue}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {id}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  },
);

CustomerPreviewInfo.displayName = "CustomerPreviewInfo";

export default CustomerPreviewInfo;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  titleContainer: {
    flex: 1,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.large,
    lineHeight: fontSizes.large * 1.25,
    color: COLORS.text,
  },

  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: COLORS.Gray,
    marginTop: 3,
  },

  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F1FB",
  },

  card: {
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: COLORS.neutral,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 62,
  },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
    minWidth: 0,
  },

  label: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: COLORS.Gray,
    marginBottom: 2,
  },

  value: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.medium,
    lineHeight: fontSizes.medium * 1.25,
    color: COLORS.text,
  },

  idValue: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.25,
    color: COLORS.darkGray,
  },

  separator: {
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
});
