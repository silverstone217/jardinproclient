import { StyleSheet, Text, View } from "react-native";

import type { ProfileUser } from "@/types/profile";

import { COLORS, fonts, fontSizes } from "@/utils/styles";

interface ProfileHeaderProps {
  profile: ProfileUser;
}

const getRoleLabel = (role: ProfileUser["role"]) => {
  switch (role) {
    case "ADMIN":
      return "Administrateur";

    case "MANAGER":
      return "Manager";

    case "EMPLOYEE":
      return "Employé";

    default:
      return role;
  }
};

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.name} numberOfLines={1}>
        {profile.name}
      </Text>

      <View style={styles.roleBadge}>
        <Text style={styles.roleText}>{getRoleLabel(profile.role)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 14,
  },

  name: {
    maxWidth: "90%",
    fontFamily: fonts.bold,
    fontSize: fontSizes.xlarge,
    color: COLORS.text,
    textAlign: "center",
  },

  roleBadge: {
    marginTop: 7,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#E8F2E5",
  },

  roleText: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.small,
    color: COLORS.primary,
  },
});
