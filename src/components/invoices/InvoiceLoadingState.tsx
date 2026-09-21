import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

export function InvoiceLoadingState() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={COLORS.primary} />

      <Text style={styles.text}>Chargement des factures...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
  },

  text: {
    marginTop: 12,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.Gray,
  },
});
