import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts, fontSizes } from "@/utils/styles";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

interface DashboardStatCardProps {
  icon: IconName;
  value: string | number;
  label: string;
  iconColor?: string;
  backgroundColor?: string;
}

export function DashboardStatCard({
  icon,
  value,
  label,
  iconColor = COLORS.primary,
  backgroundColor = COLORS.white,
}: DashboardStatCardProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: `${iconColor}18`,
          },
        ]}
      >
        <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
      </View>

      <View style={styles.content}>
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>

        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 112,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    marginTop: 10,
  },

  value: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xlarge,
    color: COLORS.text,
  },

  label: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: fontSizes.small - 1,
    color: COLORS.Gray,
    lineHeight: 17,
  },
});
