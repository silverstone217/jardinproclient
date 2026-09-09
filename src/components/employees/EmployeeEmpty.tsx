import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface EmployeeEmptyProps {
  searching: boolean;
  onClearSearch: () => void;
}

export default function EmployeeEmpty({
  searching,
  onClearSearch,
}: EmployeeEmptyProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={searching ? "search-outline" : "people-outline"}
          size={34}
          color={COLORS.primary}
        />
      </View>

      <Text style={styles.title}>
        {searching ? "Aucun résultat" : "Aucun employé"}
      </Text>

      <Text style={styles.description}>
        {searching
          ? "Aucun employé ne correspond à votre recherche."
          : "Les employés de votre boutique apparaîtront ici."}
      </Text>

      {searching && (
        <Pressable onPress={onClearSearch} style={styles.button}>
          <Text style={styles.buttonText}>Effacer la recherche</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
    paddingVertical: 55,
  },

  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#E8F2E5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: COLORS.text,
    textAlign: "center",
  },

  description: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.Gray,
    textAlign: "center",
    marginTop: 6,
  },

  button: {
    marginTop: 17,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#E8F2E5",
  },

  buttonText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.primary,
  },
});
