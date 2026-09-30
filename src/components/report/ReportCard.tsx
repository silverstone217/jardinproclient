// src/components/report/ReportCard.tsx

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface ReportCardProps {
  title: string;
  description?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  children: React.ReactNode;
}

export function ReportCard({
  title,
  description,
  icon,
  children,
}: ReportCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {icon ? (
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={icon}
                size={19}
                color={COLORS.primary}
              />
            </View>
          ) : null}

          <View style={styles.titleContent}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>

            {description ? (
              <Text style={styles.description} numberOfLines={2}>
                {description}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.content}>{children}</View>
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
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },

  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F6EF",
    marginRight: 11,
  },

  titleContent: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: COLORS.text,
  },

  description: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.Gray,
  },

  content: {
    padding: 16,
  },
});
