// src/components/report/ReportHeader.tsx

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts, fontSizes } from "@/utils/styles";

interface ReportHeaderProps {
  title: string;
  subtitle: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function ReportHeader({
  title,
  subtitle,
  icon = "bar-chart-outline",
}: ReportHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>RAPPORTS</Text>

        <Text style={styles.title}>{title}</Text>

        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={22} color={COLORS.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  content: {
    flex: 1,
    paddingRight: 16,
  },

  eyebrow: {
    marginBottom: 4,
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: COLORS.primary,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxlarge,
    lineHeight: fontSizes.xxlarge * 1.2,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 17,
    color: COLORS.Gray,
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
});
