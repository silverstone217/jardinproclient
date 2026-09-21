import { Ionicons } from "@expo/vector-icons";

import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface InvoiceEmptyStateProps {
  hasFilters?: boolean;
}

export function InvoiceEmptyState({
  hasFilters = false,
}: InvoiceEmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Ionicons
          name={hasFilters ? "search-outline" : "receipt-outline"}
          size={28}
          color={COLORS.primary}
        />
      </View>

      <Text style={styles.title}>
        {hasFilters ? "Aucune facture trouvée" : "Aucune facture"}
      </Text>

      <Text style={styles.description}>
        {hasFilters
          ? "Aucune facture ne correspond à vos critères."
          : "Les factures de vos ventes apparaîtront ici."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 70,
    paddingHorizontal: 30,
  },

  icon: {
    width: 64,
    height: 64,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  title: {
    marginTop: 15,
    fontFamily: fonts.bold,
    fontSize: 15,
    color: COLORS.text,
    textAlign: "center",
  },

  description: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    color: COLORS.Gray,
    textAlign: "center",
  },
});
