import { Image, StyleSheet, Text, View } from "react-native";

import type { Employee } from "@/types/employee";
import { COLORS, fonts } from "@/utils/styles";

interface EmployeeAvatarProps {
  employee: Employee;
  size?: number;
}

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export default function EmployeeAvatar({
  employee,
  size = 48,
}: EmployeeAvatarProps) {
  if (employee.image) {
    return (
      <Image
        source={{ uri: employee.image }}
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize: size * 0.34,
          },
        ]}
      >
        {getInitials(employee.name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: "#E8F2E5",
  },

  fallback: {
    backgroundColor: "#E8F2E5",
    alignItems: "center",
    justifyContent: "center",
  },

  initials: {
    fontFamily: fonts.bold,
    color: COLORS.primary,
  },
});
