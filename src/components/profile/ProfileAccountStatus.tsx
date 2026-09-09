import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { ProfileUser } from "@/types/profile";

import { COLORS, fonts, fontSizes } from "@/utils/styles";

interface ProfileAccountStatusProps {
  profile: ProfileUser;
}

export function ProfileAccountStatus({ profile }: ProfileAccountStatusProps) {
  const isActive = profile.isActive;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          isActive ? styles.activeIcon : styles.inactiveIcon,
        ]}
      >
        <Ionicons
          name={isActive ? "shield-checkmark-outline" : "shield-outline"}
          size={22}
          color={isActive ? COLORS.success : COLORS.error}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>État du compte</Text>

        <Text style={styles.description}>
          {isActive
            ? "Votre compte est actif et vous pouvez utiliser l'application."
            : "Votre compte est actuellement désactivé."}
        </Text>
      </View>

      <View
        style={[
          styles.statusBadge,
          isActive ? styles.activeBadge : styles.inactiveBadge,
        ]}
      >
        <Text
          style={[
            styles.statusText,
            {
              color: isActive ? COLORS.success : COLORS.error,
            },
          ]}
        >
          {isActive ? "Actif" : "Inactif"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  activeIcon: {
    backgroundColor: "#EAF6EC",
  },

  inactiveIcon: {
    backgroundColor: "#FDECEC",
  },

  content: {
    flex: 1,
  },

  title: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.small,
    color: COLORS.text,
  },

  description: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    lineHeight: 17,
    color: COLORS.Gray,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  activeBadge: {
    backgroundColor: "#EAF6EC",
  },

  inactiveBadge: {
    backgroundColor: "#FDECEC",
  },

  statusText: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.small,
  },
});
