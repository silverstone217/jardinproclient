import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface PackagingEmptyStateProps {
  hasSearch: boolean;
  onAdd: () => void;
  onClearSearch?: () => void;
}

export function PackagingEmptyState({
  hasSearch,
  onAdd,
  onClearSearch,
}: PackagingEmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons
          name={hasSearch ? "magnify-close" : "bottle-soda-outline"}
          size={31}
          color={COLORS.primary}
        />
      </View>

      <Text style={styles.title}>
        {hasSearch ? "Aucun résultat" : "Aucun emballage"}
      </Text>

      <Text style={styles.description}>
        {hasSearch
          ? "Aucun emballage ne correspond à votre recherche."
          : "Commencez par ajouter votre premier emballage."}
      </Text>

      {hasSearch ? (
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.pressed,
          ]}
          onPress={onClearSearch}
        >
          <MaterialCommunityIcons
            name="close-circle-outline"
            size={17}
            color={COLORS.primary}
          />

          <Text style={styles.secondaryText}>Effacer la recherche</Text>
        </Pressable>
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
          onPress={onAdd}
        >
          <MaterialCommunityIcons name="plus" size={18} color={COLORS.white} />

          <Text style={styles.primaryText}>Ajouter un emballage</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 45,
  },

  iconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  title: {
    marginTop: 16,
    fontFamily: fonts.bold,
    fontSize: 15,
    color: COLORS.text,
    textAlign: "center",
  },

  description: {
    maxWidth: 290,
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    color: COLORS.Gray,
    textAlign: "center",
  },

  primaryButton: {
    minHeight: 43,
    marginTop: 18,
    paddingHorizontal: 16,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: COLORS.primary,
  },

  primaryText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.white,
  },

  secondaryButton: {
    minHeight: 40,
    marginTop: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#EAF2E7",
  },

  secondaryText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: COLORS.primary,
  },

  pressed: {
    opacity: 0.6,
  },
});
