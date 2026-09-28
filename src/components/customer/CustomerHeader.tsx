import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface CustomerHeaderProps {
  title?: string;
  subtitle?: string;
}

export function CustomerHeader({
  title = "Clients",
  subtitle = "Consultez vos clients et leur historique",
}: CustomerHeaderProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        onPress={() => router.back()}
        hitSlop={8}
      >
        <Ionicons name="arrow-back" size={20} color={COLORS.text} />
      </Pressable>

      <View style={styles.iconContainer}>
        <Ionicons name="people-outline" size={21} color={COLORS.primary} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  iconContainer: {
    width: 42,
    height: 42,
    marginLeft: 10,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F1FB",
    borderWidth: 1,
    borderColor: "#DCE9F6",
  },

  content: {
    flex: 1,
    marginLeft: 11,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 19,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: COLORS.Gray,
  },

  pressed: {
    opacity: 0.55,
  },
});
