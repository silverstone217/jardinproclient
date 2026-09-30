import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, fonts, fontSizes } from "@/utils/styles";

interface DashboardHeaderProps {
  userName: string;
  userImage?: string | null;
  onNotificationPress?: () => void;
}

export function DashboardHeader({
  userName,
  userImage,
  onNotificationPress,
}: DashboardHeaderProps) {
  const router = useRouter();

  const firstName = userName.trim().split(" ")[0] || "Utilisateur";

  const firstLetter = firstName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.greeting}>Bonjour, {firstName} 👋</Text>

        <Text style={styles.subtitle}>
          Prêt pour une nouvelle journée fruitée ?
        </Text>
      </View>

      <View style={styles.actions}>
        {/* <Pressable
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
          onPress={onNotificationPress}
        >
          <Ionicons
            name="notifications-outline"
            size={21}
            color={COLORS.text}
          />
        </Pressable> */}

        <Pressable
          style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}
          onPress={() => router.push("/settings/profile")}
        >
          {userImage ? (
            <Image
              source={{ uri: userImage }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.avatarText}>{firstLetter}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 18,
  },

  leftSection: {
    flex: 1,
    paddingRight: 16,
  },

  greeting: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xlarge,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    color: COLORS.Gray,
    lineHeight: 19,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.medium,
    color: COLORS.white,
  },

  pressed: {
    opacity: 0.7,
  },
});
