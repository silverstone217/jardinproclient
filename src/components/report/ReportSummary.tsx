// src/components/report/ReportSummary.tsx

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

export interface ReportSummaryItem {
  label: string;
  value: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color?: string;
}

interface ReportSummaryProps {
  items: ReportSummaryItem[];
}

export function ReportSummary({ items }: ReportSummaryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Résumé</Text>
        <Text style={styles.subtitle}>Vue d'ensemble du rapport</Text>
      </View>

      <View style={styles.itemsContainer}>
        {items.map((item, index) => (
          <View
            key={`${item.label}-${index}`}
            style={[styles.item, index < items.length - 1 && styles.itemBorder]}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: item.color
                    ? `${item.color}15`
                    : `${COLORS.primary}15`,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={21}
                color={item.color ?? COLORS.primary}
              />
            </View>

            <View style={styles.content}>
              <Text style={styles.label} numberOfLines={1}>
                {item.label}
              </Text>

              <Text style={styles.value} numberOfLines={1}>
                {item.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    overflow: "hidden",
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 12,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: COLORS.text,
    marginBottom: 3,
  },

  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: COLORS.Gray,
  },

  itemsContainer: {
    paddingHorizontal: 16,
  },

  item: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  label: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: COLORS.Gray,
    marginBottom: 3,
  },

  value: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: COLORS.text,
  },
});
